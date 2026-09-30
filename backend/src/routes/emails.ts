import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import {
  upload,
  scheduleEmails,
  parseEmailsCsv,
  getScheduledEmails,
  getSentEmails,
  cancelEmailJob,
} from '../controllers/emailController';

const router = Router();

router.use(requireAuth);

// Schedule new emails via CSV upload
router.post('/schedule', upload.single('csv'), scheduleEmails);

// Parse CSV without scheduling (preview)
router.post('/parse-csv', upload.single('csv'), parseEmailsCsv);

// Get scheduled emails
router.get('/scheduled', getScheduledEmails);

// Get sent/failed emails
router.get('/sent', getSentEmails);

// Cancel a scheduled email
router.delete('/:id', cancelEmailJob);

export default router;
