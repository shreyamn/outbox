import { Request, Response } from 'express';
import passport from 'passport';
import { signToken } from '../middleware/auth';
import { env } from '../config/env';
import type { User as PrismaUser } from '@prisma/client';

export const googleAuth = passport.authenticate('google', {
  scope: ['profile', 'email'],
  session: false,
});

export const googleCallback = [
  passport.authenticate('google', { session: false, failureRedirect: `${env.FRONTEND_URL}/login?error=auth_failed` }),
  (req: Request, res: Response): void => {
    const user = req.user as PrismaUser;
    const token = signToken({ userId: user.id, email: user.email });
    // Redirect to frontend with token
    res.redirect(`${env.FRONTEND_URL}/auth/callback?token=${token}`);
  },
];

export function getMe(req: Request, res: Response): void {
  res.json({ user: req.jwtUser });
}
