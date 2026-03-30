"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsAppService = void 0;
const axios_1 = __importDefault(require("axios"));
class WhatsAppService {
    token;
    phoneNumberId;
    constructor(token, phoneNumberId) {
        this.token = token;
        this.phoneNumberId = phoneNumberId;
    }
    async sendTextMessage(to, message) {
        try {
            const url = `https://graph.facebook.com/v19.0/${this.phoneNumberId}/messages`;
            const payload = {
                messaging_product: "whatsapp",
                recipient_type: "individual",
                to: to,
                type: "text",
                text: { preview_url: false, body: message },
            };
            const response = await axios_1.default.post(url, payload, {
                headers: {
                    Authorization: `Bearer ${this.token}`,
                    "Content-Type": "application/json",
                },
            });
            return response.data;
        }
        catch (error) {
            console.error("Error sending WhatsApp message:", error);
            throw error;
        }
    }
    async markMessageAsRead(messageId) {
        try {
            const url = `https://graph.facebook.com/v19.0/${this.phoneNumberId}/messages`;
            const payload = {
                messaging_product: "whatsapp",
                status: "read",
                message_id: messageId,
            };
            const response = await axios_1.default.post(url, payload, {
                headers: {
                    Authorization: `Bearer ${this.token}`,
                    "Content-Type": "application/json",
                },
            });
            return response.data;
        }
        catch (error) {
            console.error("Error marking WhatsApp message as read:", error);
            throw error;
        }
    }
}
exports.WhatsAppService = WhatsAppService;
