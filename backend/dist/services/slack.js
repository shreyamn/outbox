"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notifySlackRateLimit = notifySlackRateLimit;
exports.getSlackOAuthUrl = getSlackOAuthUrl;
exports.exchangeSlackCode = exchangeSlackCode;
const prisma_1 = require("../db/prisma");
const env_1 = require("../config/env");
async function getSlackConnection(userId) {
    return prisma_1.prisma.slackConnection.findUnique({ where: { userId } });
}
async function postToSlack(accessToken, channelId, message) {
    const res = await fetch('https://slack.com/api/chat.postMessage', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ channel: channelId, text: message.text }),
    });
    const data = await res.json();
    if (!data.ok) {
        console.warn('[Slack] Failed to post message:', data.error);
    }
}
async function notifySlackRateLimit(userId, resetAt, maxPerHour) {
    const conn = await getSlackConnection(userId);
    if (!conn || !conn.channelId)
        return;
    const resetStr = resetAt.toISOString();
    await postToSlack(conn.accessToken, conn.channelId, {
        text: `⚠️ *ReachInbox Rate Limit Reached*\n` +
            `Your hourly send limit of *${maxPerHour} emails* has been reached.\n` +
            `Emails will automatically resume after *${resetStr}*`,
    });
}
async function getSlackOAuthUrl(state) {
    const scopes = ['chat:write', 'channels:read', 'groups:read'];
    const params = new URLSearchParams({
        client_id: env_1.env.SLACK_CLIENT_ID ?? '',
        scope: scopes.join(','),
        redirect_uri: env_1.env.SLACK_REDIRECT_URI ?? '',
        state,
    });
    return `https://slack.com/oauth/v2/authorize?${params.toString()}`;
}
async function exchangeSlackCode(code) {
    const params = new URLSearchParams({
        client_id: env_1.env.SLACK_CLIENT_ID ?? '',
        client_secret: env_1.env.SLACK_CLIENT_SECRET ?? '',
        code,
        redirect_uri: env_1.env.SLACK_REDIRECT_URI ?? '',
    });
    const res = await fetch(`https://slack.com/api/oauth.v2.access?${params.toString()}`, {
        method: 'POST',
    });
    const data = await res.json();
    if (!data.ok || !data.access_token) {
        throw new Error(`Slack OAuth failed: ${data.error}`);
    }
    return {
        accessToken: data.access_token,
        teamId: data.team?.id ?? '',
        teamName: data.team?.name ?? '',
        channelId: data.incoming_webhook?.channel_id,
        channelName: data.incoming_webhook?.channel,
    };
}
//# sourceMappingURL=slack.js.map