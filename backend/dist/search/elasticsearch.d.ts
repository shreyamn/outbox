import { Client } from '@elastic/elasticsearch';
export declare const esClient: Client;
export declare const EMAIL_INDEX = "email_jobs";
export declare function ensureEmailIndex(): Promise<void>;
export declare function indexEmailJob(doc: {
    jobId: string;
    userId: string;
    toEmail: string;
    subject: string;
    status: string;
    scheduledAt: Date;
    sentAt?: Date | null;
}): Promise<void>;
export declare function updateEmailJobStatus(jobId: string, status: string, sentAt?: Date | null): Promise<void>;
export declare function searchEmailJobs(userId: string, query: string): Promise<string[]>;
//# sourceMappingURL=elasticsearch.d.ts.map