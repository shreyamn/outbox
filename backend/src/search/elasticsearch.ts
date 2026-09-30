import { Client } from '@elastic/elasticsearch';
import { env } from '../config/env';

export const esClient = new Client({ node: env.ELASTICSEARCH_URL });

export const EMAIL_INDEX = 'email_jobs';

export async function ensureEmailIndex(): Promise<void> {
  try {
    const exists = await esClient.indices.exists({ index: EMAIL_INDEX });
    if (!exists) {
      await esClient.indices.create({
        index: EMAIL_INDEX,
        mappings: {
          properties: {
            jobId:       { type: 'keyword' },
            userId:      { type: 'keyword' },
            toEmail:     { type: 'keyword' },
            subject:     { type: 'text', fields: { keyword: { type: 'keyword', ignore_above: 256 } } },
            status:      { type: 'keyword' },
            scheduledAt: { type: 'date' },
            sentAt:      { type: 'date' },
          },
        },
      });
      console.log(`✅ Elasticsearch index "${EMAIL_INDEX}" created`);
    }
  } catch (err) {
    console.warn('⚠️  Elasticsearch not available — search will be degraded:', (err as Error).message);
  }
}

export async function indexEmailJob(doc: {
  jobId: string;
  userId: string;
  toEmail: string;
  subject: string;
  status: string;
  scheduledAt: Date;
  sentAt?: Date | null;
}): Promise<void> {
  try {
    await esClient.index({
      index: EMAIL_INDEX,
      id: doc.jobId,
      document: doc,
    });
  } catch {
    // Non-fatal — PG is source of truth
  }
}

export async function updateEmailJobStatus(
  jobId: string,
  status: string,
  sentAt?: Date | null
): Promise<void> {
  try {
    await esClient.update({
      index: EMAIL_INDEX,
      id: jobId,
      doc: { status, ...(sentAt ? { sentAt } : {}) },
    });
  } catch {
    // Non-fatal
  }
}

export async function searchEmailJobs(
  userId: string,
  query: string
): Promise<string[]> {
  try {
    const res = await esClient.search({
      index: EMAIL_INDEX,
      query: {
        bool: {
          must: [
            { term: { userId } },
            {
              multi_match: {
                query,
                fields: ['toEmail', 'subject'],
              },
            },
          ],
        },
      },
      _source: ['jobId'],
      size: 50,
    });
    return res.hits.hits.map((h) => (h._source as { jobId: string }).jobId);
  } catch {
    return [];
  }
}
