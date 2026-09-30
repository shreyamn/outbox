import { Request, Response } from 'express';
import { prisma } from '../db/prisma';
import { getSlackOAuthUrl, exchangeSlackCode } from '../services/slack';
import { env } from '../config/env';

export async function slackOAuthStart(req: Request, res: Response): Promise<void> {
  const state = req.jwtUser!.userId; // use userId as CSRF state
  const url = await getSlackOAuthUrl(state);
  res.redirect(url);
}

export async function slackOAuthCallback(req: Request, res: Response): Promise<void> {
  const { code, state, error } = req.query;

  if (error || !code || !state) {
    res.redirect(`${env.FRONTEND_URL}/dashboard?slack_error=access_denied`);
    return;
  }

  try {
    const data = await exchangeSlackCode(code as string);

    await prisma.slackConnection.upsert({
      where: { userId: state as string },
      update: {
        accessToken: data.accessToken,
        teamId: data.teamId,
        teamName: data.teamName,
        channelId: data.channelId ?? null,
        channelName: data.channelName ?? null,
      },
      create: {
        userId: state as string,
        accessToken: data.accessToken,
        teamId: data.teamId,
        teamName: data.teamName,
        channelId: data.channelId ?? null,
        channelName: data.channelName ?? null,
      },
    });

    res.redirect(`${env.FRONTEND_URL}/dashboard?slack_connected=1`);
  } catch (err) {
    console.error('[Slack callback]', err);
    res.redirect(`${env.FRONTEND_URL}/dashboard?slack_error=oauth_failed`);
  }
}

export async function getSlackStatus(req: Request, res: Response): Promise<void> {
  const conn = await prisma.slackConnection.findUnique({
    where: { userId: req.jwtUser!.userId },
    select: { teamName: true, channelName: true, createdAt: true },
  });
  res.json({ connected: !!conn, ...(conn ?? {}) });
}

export async function disconnectSlack(req: Request, res: Response): Promise<void> {
  await prisma.slackConnection.deleteMany({ where: { userId: req.jwtUser!.userId } });
  res.json({ message: 'Slack disconnected' });
}
