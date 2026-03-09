import axios from "axios";

export class WhatsAppService {
    private token: string;
    private phoneNumberId: string;

    constructor(token: string, phoneNumberId: string) {
        this.token = token;
        this.phoneNumberId = phoneNumberId;
    }

    async sendTextMessage(to: string, message: string) {
        try {
            const url = `https://graph.facebook.com/v19.0/${this.phoneNumberId}/messages`;
            const payload = {
                messaging_product: "whatsapp",
                recipient_type: "individual",
                to: to,
                type: "text",
                text: { preview_url: false, body: message },
            };

            const response = await axios.post(url, payload, {
                headers: {
                    Authorization: `Bearer ${this.token}`,
                    "Content-Type": "application/json",
                },
            });

            return response.data;
        } catch (error) {
            console.error("Error sending WhatsApp message:", error);
            throw error;
        }
    }

    async markMessageAsRead(messageId: string) {
        try {
            const url = `https://graph.facebook.com/v19.0/${this.phoneNumberId}/messages`;
            const payload = {
                messaging_product: "whatsapp",
                status: "read",
                message_id: messageId,
            };

            const response = await axios.post(url, payload, {
                headers: {
                    Authorization: `Bearer ${this.token}`,
                    "Content-Type": "application/json",
                },
            });

            return response.data;
        } catch (error) {
            console.error("Error marking WhatsApp message as read:", error);
            throw error;
        }
    }
}
