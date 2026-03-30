"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redis = exports.getRedisConnection = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
// Use environment variable, fallback to local default for development
const REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";
/**
 * GLOBAL SINGLETON PATTERN
 * Prevents duplicate connections during backend reloads.
 */
const globalForRedis = globalThis;
/**
 * Get or create a Redis connection lazily.
 * This prevents immediate connection attempts on import.
 */
const getRedisConnection = () => {
    if (!globalForRedis.redisInstance) {
        globalForRedis.redisInstance = new ioredis_1.default(REDIS_URL, {
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
        globalForRedis.redisInstance.on("error", (error) => {
            if (error.code === 'ECONNREFUSED' || error.message?.includes("Connection is closed")) {
                return; // PURE SILENCE
            }
            console.warn("[BACKEND_REDIS_ERROR]", error.message);
        });
        globalForRedis.redisInstance.on("connect", () => {
            console.log("✅ Backend successfully connected to Redis.");
        });
    }
    return globalForRedis.redisInstance;
};
exports.getRedisConnection = getRedisConnection;
// For backward compatibility while we refactor queues
exports.redis = (0, exports.getRedisConnection)();
