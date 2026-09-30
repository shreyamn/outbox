import { Router } from 'express';
import { googleAuth, googleCallback, getMe } from '../controllers/authController';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.get('/google', googleAuth);
router.get('/google/callback', googleCallback);
router.get('/me', requireAuth, getMe);

export default router;
