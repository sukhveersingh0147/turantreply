export const DEFAULT_AI_MODEL = process.env.AI_MODEL || "llama-3.1-8b-instant";
export const VISION_AI_MODEL = "llama-3.2-11b-vision-instant";

export const AI_CONFIG = {
    defaultModel: DEFAULT_AI_MODEL,
    visionModel: VISION_AI_MODEL,
    temperature: {
        balanced: 0.5,
        creative: 0.8,
        precise: 0,
    },
    maxTokens: {
        short: 150,
        medium: 300,
        long: 500,
    }
};
