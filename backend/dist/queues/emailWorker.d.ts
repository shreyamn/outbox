import { Worker } from 'bullmq';
interface EmailJobPayload {
    emailJobId: string;
}
export declare function startWorker(): Worker<EmailJobPayload>;
export {};
//# sourceMappingURL=emailWorker.d.ts.map