"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EMAIL_INDEX = exports.esClient = void 0;
exports.ensureEmailIndex = ensureEmailIndex;
exports.indexEmailJob = indexEmailJob;
exports.updateEmailJobStatus = updateEmailJobStatus;
exports.searchEmailJobs = searchEmailJobs;
const elasticsearch_1 = require("@elastic/elasticsearch");
const env_1 = require("../config/env");
exports.esClient = new elasticsearch_1.Client({ node: env_1.env.ELASTICSEARCH_URL });
exports.EMAIL_INDEX = 'email_jobs';
async function ensureEmailIndex() {
    try {
        const exists = await exports.esClient.indices.exists({ index: exports.EMAIL_INDEX });
        if (!exists) {
            await exports.esClient.indices.create({
                index: exports.EMAIL_INDEX,
                mappings: {
                    properties: {
                        jobId: { type: 'keyword' },
                        userId: { type: 'keyword' },
                        toEmail: { type: 'keyword' },
                        subject: { type: 'text', fields: { keyword: { type: 'keyword', ignore_above: 256 } } },
                        status: { type: 'keyword' },
                        scheduledAt: { type: 'date' },
                        sentAt: { type: 'date' },
                    },
                },
            });
            console.log(`✅ Elasticsearch index "${exports.EMAIL_INDEX}" created`);
        }
    }
    catch (err) {
        console.warn('⚠️  Elasticsearch not available — search will be degraded:', err.message);
    }
}
async function indexEmailJob(doc) {
    try {
        await exports.esClient.index({
            index: exports.EMAIL_INDEX,
            id: doc.jobId,
            document: doc,
        });
    }
    catch {
        // Non-fatal — PG is source of truth
    }
}
async function updateEmailJobStatus(jobId, status, sentAt) {
    try {
        await exports.esClient.update({
            index: exports.EMAIL_INDEX,
            id: jobId,
            doc: { status, ...(sentAt ? { sentAt } : {}) },
        });
    }
    catch {
        // Non-fatal
    }
}
async function searchEmailJobs(userId, query) {
    try {
        const res = await exports.esClient.search({
            index: exports.EMAIL_INDEX,
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
        return res.hits.hits.map((h) => h._source.jobId);
    }
    catch {
        return [];
    }
}
//# sourceMappingURL=elasticsearch.js.map