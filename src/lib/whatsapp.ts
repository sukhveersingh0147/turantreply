/**
 * Utility function to send a WhatsApp message using the Meta Cloud API.
 * 
 * @param phoneNumberId The specific business's WhatsApp phone number ID
 * @param accessToken The specific business's WhatsApp access token
 * @param to Phone number to send the message to (with country code, no + or spaces)
 * @param text The message content
 * @returns The response from the Meta API
 */
export async function sendWhatsAppMessage(
    phoneNumberId: string,
    accessToken: string,
    to: string,
    text: string
) {
    if (!phoneNumberId || !accessToken) {
        throw new Error("Missing WhatsApp credentials");
    }

    const url = `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`;

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                messaging_product: "whatsapp",
                recipient_type: "individual",
                to: to,
                type: "text",
                text: {
                    preview_url: true,
                    body: text,
                },
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("WhatsApp API Error:", data.error);
            throw new Error(data.error?.message || "Failed to send WhatsApp message");
        }

        return data;
    } catch (error) {
        console.error("Error in sendWhatsAppMessage:", error);
        throw error;
    }
}
