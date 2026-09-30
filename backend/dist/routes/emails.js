"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const emailController_1 = require("../controllers/emailController");
const router = (0, express_1.Router)();
router.use(auth_1.requireAuth);
// Schedule new emails via CSV upload
router.post('/schedule', emailController_1.upload.single('csv'), emailController_1.scheduleEmails);
// Parse CSV without scheduling (preview)
router.post('/parse-csv', emailController_1.upload.single('csv'), emailController_1.parseEmailsCsv);
// Get scheduled emails
router.get('/scheduled', emailController_1.getScheduledEmails);
// Get sent/failed emails
router.get('/sent', emailController_1.getSentEmails);
// Cancel a scheduled email
router.delete('/:id', emailController_1.cancelEmailJob);
exports.default = router;
//# sourceMappingURL=emails.js.map