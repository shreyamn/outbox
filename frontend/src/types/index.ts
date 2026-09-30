// Shared TypeScript types for the frontend

export type EmailStatus = 'SCHEDULED' | 'PROCESSING' | 'SENT' | 'FAILED';

export interface User {
  userId: string;
  email: string;
}

export interface EmailJob {
  id: string;
  toEmail: string;
  toName?: string;
  subject: string;
  status: EmailStatus;
  scheduledAt: string;
  sentAt?: string;
  failReason?: string;
  messageId?: string;
  retryCount?: number;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  jobs: T[];
  total: number;
  page: number;
  limit: number;
}

export interface SlackStatus {
  connected: boolean;
  teamName?: string;
  channelName?: string;
}

export interface ComposeFormData {
  subject: string;
  body: string;
  csv: File | null;
  startTime: string;
  delayBetweenMs: number;
  maxPerHour: number;
}
