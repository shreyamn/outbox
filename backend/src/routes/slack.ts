import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import {
  slackOAuthStart,
  slackOAuthCallback,
  getSlackStatus,
  disconnectSlack,
} from '../controllers/slackController';

const router = Router();

router.get('/connect', requireAuth, slackOAuthStart);
router.get('/callback', slackOAuthCallback); // No auth — Slack redirects here with state=userId
router.get('/status', requireAuth, getSlackStatus);
router.delete('/disconnect', requireAuth, disconnectSlack);

export default router;
