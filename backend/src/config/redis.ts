import Redis from "ioredis";

// Use environment variable, fallback to local default for development
const REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";

/**
 * GLOBAL SINGLETON PATTERN
 * Prevents duplicate connections during backend reloads.
 */
const globalForRedis = globalThis as unknown as {
    redisInstance: Redis | undefined;
};

/**
 * Get or create a Redis connection lazily.
 * This prevents immediate connection attempts on import.
 */
export const getRedisConnection = (): Redis => {
    if (!globalForRedis.redisInstance) {
        globalForRedis.redisInstance = new Redis(REDIS_URL, {
            maxRetriesPerRequest: null,
            lazyConnect: true,
            enableOfflineQueue: false,
            reconnectOnError(err) {
                return true; // Silent reconnection
            },
            retryStrategy(times) {
                // Stay quiet
                return Math.min(times * 1000, 15000);
            }
        });

        // SILENCE THE NOISE: Pervasive error catching
        globalForRedis.redisInstance.on("error", (error: any) => {
            if (error.code === 'ECONNREFUSED' || error.message?.includes("Connection is closed")) {
                return; // PURE SILENCE
            }
            console.warn("[BACKEND_REDIS_ERROR]", error.message);
        });

        globalForRedis.redisInstance.on("connect", () => {
            console.log("✅ Backend successfully connected to Redis.");
        });
    }

    return globalForRedis.redisInstance!;
};

// For backward compatibility while we refactor queues
export const redis = getRedisConnection();
