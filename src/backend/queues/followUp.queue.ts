import { Queue, Worker } from "bullmq";
import { getRedisConnection } from "../config/redis";

export const FOLLOW_UP_QUEUE = "follow-up-queue";

/**
 * GLOBAL SINGLETON PATTERN
 * Prevents multiple instances in the backend service.
 */
const globalForFollowUp = globalThis as unknown as {
    followUpQueue: Queue | undefined;
    followUpWorker: Worker | undefined;
};

/**
 * Get the follow-up queue lazily.
 */
export const getFollowUpQueue = (): Queue => {
    if (!globalForFollowUp.followUpQueue) {
        globalForFollowUp.followUpQueue = new Queue(FOLLOW_UP_QUEUE, {
            connection: getRedisConnection() as any,
        });

        // Silent Error Listener
        globalForFollowUp.followUpQueue.on("error", (err) => {
            if (err.message?.includes("ECONNREFUSED") || err.message?.includes("Connection is closed")) return;
        });
    }
    return globalForFollowUp.followUpQueue;
};

/**
 * Start the follow-up worker lazily.
 */
export const startFollowUpWorker = () => {
    if (globalForFollowUp.followUpWorker) return;

    globalForFollowUp.followUpWorker = new Worker(
        FOLLOW_UP_QUEUE,
        async (job) => {
            console.log(`Processing follow-up job ${job.id}`);
            const { leadId, message } = job.data;
            // TODO: Call WhatsApp service to send message
            console.log(`Sending "${message}" to lead ${leadId}`);
        },
        { 
            connection: getRedisConnection() as any,
            autorun: true
        }
    );

    // Silent Error Listener
    globalForFollowUp.followUpWorker.on("error", (err) => {
        if (err.message?.includes("ECONNREFUSED") || err.message?.includes("Connection is closed")) return;
    });

    globalForFollowUp.followUpWorker.on("completed", (job) => {
        console.log(`Follow-up job ${job.id} completed.`);
    });

    globalForFollowUp.followUpWorker.on("failed", (job, err) => {
        console.error(`Follow-up job ${job?.id} failed:`, err.message);
    });

    console.log("👷 Follow-up queue worker started (Singleton).");
};
