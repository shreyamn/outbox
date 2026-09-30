import api from './api';
import type { EmailJob, PaginatedResponse } from '../types';

export async function getScheduledEmails(page = 1, limit = 20): Promise<PaginatedResponse<EmailJob>> {
  const { data } = await api.get('/emails/scheduled', { params: { page, limit } });
  return data;
}

export async function getSentEmails(page = 1, limit = 20): Promise<PaginatedResponse<EmailJob>> {
  const { data } = await api.get('/emails/sent', { params: { page, limit } });
  return data;
}

export async function scheduleEmails(formData: FormData): Promise<{ count: number; jobIds: string[] }> {
  const { data } = await api.post('/emails/schedule', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function parseCsvPreview(file: File): Promise<{ count: number; preview: Array<{ email: string; name?: string }> }> {
  const fd = new FormData();
  fd.append('csv', file);
  const { data } = await api.post('/emails/parse-csv', fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function cancelEmailJob(id: string): Promise<void> {
  await api.delete(`/emails/${id}`);
}

export async function getSlackStatus(): Promise<{ connected: boolean; teamName?: string; channelName?: string }> {
  const { data } = await api.get('/slack/status');
  return data;
}

export async function disconnectSlack(): Promise<void> {
  await api.delete('/slack/disconnect');
}
