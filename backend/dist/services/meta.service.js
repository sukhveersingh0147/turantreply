"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetaService = void 0;
const axios_1 = __importDefault(require("axios"));
const prisma_1 = require("../config/prisma");
class MetaService {
    static FB_APP_ID = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID;
    static FB_APP_SECRET = process.env.FACEBOOK_APP_SECRET;
    /**
     * Exchange a short-lived access token for a long-lived one.
     */
    static async getLongLivedToken(shortLivedToken) {
        try {
            const url = `https://graph.facebook.com/v19.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${this.FB_APP_ID}&client_secret=${this.FB_APP_SECRET}&fb_exchange_token=${shortLivedToken}`;
            const response = await axios_1.default.get(url);
            return response.data.access_token;
        }
        catch (error) {
            console.error("[MetaService] Error exchanging token:", error);
            throw new Error("Failed to exchange Meta token");
        }
    }
    /**
     * Store WhatsApp Account details after successful signup.
     */
    static async connectWhatsApp(userId, businessId, wabaId, phoneNumberId, accessToken) {
        return await prisma_1.prisma.whatsAppAccount.upsert({
            where: { userId },
            update: {
                businessId,
                waba_id: wabaId,
                phone_number_id: phoneNumberId,
                access_token: accessToken,
                connected_at: new Date(),
            },
            create: {
                userId,
                businessId,
                waba_id: wabaId,
                phone_number_id: phoneNumberId,
                access_token: accessToken,
            },
        });
    }
    /**
     * Automatically register a webhook for the business.
     */
    static async registerWebhook(wabaId, accessToken) {
        try {
            const url = `https://graph.facebook.com/v19.0/${wabaId}/subscriptions`;
            await axios_1.default.post(url, {
                object: "whatsapp_business_account",
                callback_url: `${process.env.BACKEND_URL}/api/webhook`,
                verify_token: process.env.WHATSAPP_VERIFY_TOKEN,
                fields: ["messages"],
            }, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
        }
        catch (error) {
            console.error("[MetaService] Error registering webhook:", error);
            // Non-blocking but should be logged
        }
    }
}
exports.MetaService = MetaService;
