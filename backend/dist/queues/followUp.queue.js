"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startFollowUpWorker = exports.getFollowUpQueue = exports.FOLLOW_UP_QUEUE = void 0;
const bullmq_1 = require("bullmq");
const redis_1 = require("../config/redis");
exports.FOLLOW_UP_QUEUE = "follow-up-queue";
/**
 * GLOBAL SINGLETON PATTERN
 * Prevents multiple instances in the backend service.
 */
const globalForFollowUp = globalThis;
/**
 * Get the follow-up queue lazily.
 */
const getFollowUpQueue = () => {
    if (!globalForFollowUp.followUpQueue) {
        globalForFollowUp.followUpQueue = new bullmq_1.Queue(exports.FOLLOW_UP_QUEUE, {
            connection: (0, redis_1.getRedisConnection)(),
        });
        // Silent Error Listener
        globalForFollowUp.followUpQueue.on("error", (err) => {
            if (err.message?.includes("ECONNREFUSED") || err.message?.includes("Connection is closed"))
                return;
        });
    }
    return globalForFollowUp.followUpQueue;
};
exports.getFollowUpQueue = getFollowUpQueue;
/**
 * Start the follow-up worker lazily.
 */
const startFollowUpWorker = () => {
    if (globalForFollowUp.followUpWorker)
        return;
    globalForFollowUp.followUpWorker = new bullmq_1.Worker(exports.FOLLOW_UP_QUEUE, async (job) => {
        console.log(`Processing follow-up job ${job.id}`);
        const { leadId, message } = job.data;
        // TODO: Call WhatsApp service to send message
        console.log(`Sending "${message}" to lead ${leadId}`);
    }, {
        connection: (0, redis_1.getRedisConnection)(),
        autorun: true
    });
    // Silent Error Listener
    globalForFollowUp.followUpWorker.on("error", (err) => {
        if (err.message?.includes("ECONNREFUSED") || err.message?.includes("Connection is closed"))
            return;
    });
    globalForFollowUp.followUpWorker.on("completed", (job) => {
        console.log(`Follow-up job ${job.id} completed.`);
    });
    globalForFollowUp.followUpWorker.on("failed", (job, err) => {
        console.error(`Follow-up job ${job?.id} failed:`, err.message);
    });
    console.log("👷 Follow-up queue worker started (Singleton).");
};
exports.startFollowUpWorker = startFollowUpWorker;
