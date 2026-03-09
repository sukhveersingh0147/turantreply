import Redis from "ioredis";

// Use environment variable, fallback to local default for development
const REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";

const redis = new Redis(REDIS_URL, {
    maxRetriesPerRequest: null,
    reconnectOnError(err) {
        console.error("Redis reconnection error:", err);
        return true;
    },
});

redis.on("error", (error) => {
    console.error("Redis connection error:", error);
});

redis.on("connect", () => {
    console.log("✅ Successfully connected to Redis.");
});

export { redis };
