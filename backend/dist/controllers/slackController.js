"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.slackOAuthStart = slackOAuthStart;
exports.slackOAuthCallback = slackOAuthCallback;
exports.getSlackStatus = getSlackStatus;
exports.disconnectSlack = disconnectSlack;
const prisma_1 = require("../db/prisma");
const slack_1 = require("../services/slack");
const env_1 = require("../config/env");
async function slackOAuthStart(req, res) {
    const state = req.jwtUser.userId; // use userId as CSRF state
    const url = await (0, slack_1.getSlackOAuthUrl)(state);
    res.redirect(url);
}
async function slackOAuthCallback(req, res) {
    const { code, state, error } = req.query;
    if (error || !code || !state) {
        res.redirect(`${env_1.env.FRONTEND_URL}/dashboard?slack_error=access_denied`);
        return;
    }
    try {
        const data = await (0, slack_1.exchangeSlackCode)(code);
        await prisma_1.prisma.slackConnection.upsert({
            where: { userId: state },
            update: {
                accessToken: data.accessToken,
                teamId: data.teamId,
                teamName: data.teamName,
                channelId: data.channelId ?? null,
                channelName: data.channelName ?? null,
            },
            create: {
                userId: state,
                accessToken: data.accessToken,
                teamId: data.teamId,
                teamName: data.teamName,
                channelId: data.channelId ?? null,
                channelName: data.channelName ?? null,
            },
        });
        res.redirect(`${env_1.env.FRONTEND_URL}/dashboard?slack_connected=1`);
    }
    catch (err) {
        console.error('[Slack callback]', err);
        res.redirect(`${env_1.env.FRONTEND_URL}/dashboard?slack_error=oauth_failed`);
    }
}
async function getSlackStatus(req, res) {
    const conn = await prisma_1.prisma.slackConnection.findUnique({
        where: { userId: req.jwtUser.userId },
        select: { teamName: true, channelName: true, createdAt: true },
    });
    res.json({ connected: !!conn, ...(conn ?? {}) });
}
async function disconnectSlack(req, res) {
    await prisma_1.prisma.slackConnection.deleteMany({ where: { userId: req.jwtUser.userId } });
    res.json({ message: 'Slack disconnected' });
}
//# sourceMappingURL=slackController.js.map