/**
 * Utility function to send a WhatsApp message using the Meta Cloud API.
 * 
 * @param phoneNumberId The specific business's WhatsApp phone number ID
 * @param accessToken The specific business's WhatsApp access token
 * @param to Phone number to send the message to (with country code, no + or spaces)
 * @param text The message content
 * @param buttons Max 3 buttons for Quick Replies
 * @param mediaUrl Optional image/video URL
 * @returns The response from the Meta API
 */
export async function sendWhatsAppMessage(
    phoneNumberId: string,
    accessToken: string,
    to: string,
    text: string,
    buttons?: string[],
    mediaUrl?: string
) {
    if (!phoneNumberId || !accessToken) {
        throw new Error("Missing WhatsApp credentials");
    }

    const url = `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`;

    let body: any = {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: to,
    };

    if (mediaUrl) {
        const isPdf = mediaUrl.toLowerCase().endsWith(".pdf");
        const type = isPdf ? "document" : "image";
        body.type = type;
        body[type] = {
            link: mediaUrl,
            caption: text,
            filename: isPdf ? "Catalog.pdf" : undefined
        };
    } else if (buttons && buttons.length > 0) {
        body.type = "interactive";
        body.interactive = {
            type: "button",
            body: { text: text },
            action: {
                buttons: buttons.slice(0, 3).map((btn, index) => ({
                    type: "reply",
                    reply: {
                        id: `btn_${index}`,
                        title: btn.substring(0, 20)
                    }
                }))
            }
        };
    } else {
        body.type = "text";
        body.text = {
            preview_url: true,
            body: text,
        };
    }

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
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

/**
 * Sends a high-end product card with image and CTA.
 */
export async function sendProductCard(
    phoneNumberId: string,
    accessToken: string,
    to: string,
    product: {
        name: string;
        price: number;
        description?: string;
        imageUrl?: string;
        ctaLabel?: string;
        ctaUrl?: string;
    }
) {
    const text = `🛍️ *${product.name}*\n💰 Price: ₹${product.price}\n\n${product.description || ""}`;
    
    // For now, we simulate a card using an image message with a caption
    // In a full implementation, we could use Catalog API or Template Carousels
    return await sendWhatsAppMessage(
        phoneNumberId, 
        accessToken, 
        to, 
        text, 
        [product.ctaLabel || "View Details"], 
        product.imageUrl
    );
}

/**
 * Sends multiple products (Simulated Carousel)
 */
export async function sendProductCarousel(
    phoneNumberId: string,
    accessToken: string,
    to: string,
    products: any[]
) {
    for (const product of products) {
        await sendProductCard(phoneNumberId, accessToken, to, product);
        // Small delay to ensure order
        await new Promise(resolve => setTimeout(resolve, 300));
    }
}
/**
 * Validates a phone number is in E.164-like format (digits only, 10-15 chars)
 * In a real app, use a library like libphonenumber-js
 */
export function validatePhoneNumber(phone: string): boolean {
    const cleanPhone = phone.replace(/\D/g, "");
    return cleanPhone.length >= 10 && cleanPhone.length <= 15;
}

/**
 * Sanitizes message content to prevent plain text injection issues
 */
export function sanitizeMessage(text: string): string {
    return text.replace(/[<>]/g, "").trim();
}
