import { Queue, Worker } from "bullmq";
import { redis } from "../config/redis";

export const FOLLOW_UP_QUEUE = "follow-up-queue";

export const followUpQueue = new Queue(FOLLOW_UP_QUEUE, {
    connection: redis as any,
});

export const startFollowUpWorker = () => {
    const worker = new Worker(
        FOLLOW_UP_QUEUE,
        async (job) => {
            console.log(`Processing follow-up job ${job.id}`);
            const { leadId, message } = job.data;
            // TODO: Call WhatsApp service to send message
            console.log(`Sending "${message}" to lead ${leadId}`);
        },
        { connection: redis as any }
    );

    worker.on("completed", (job) => {
        console.log(`Follow-up job ${job.id} completed.`);
    });

    worker.on("failed", (job, err) => {
        console.error(`Follow-up job ${job?.id} failed:`, err);
    });

    console.log("👷 Follow-up queue worker started.");
};
