"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const slackController_1 = require("../controllers/slackController");
const router = (0, express_1.Router)();
router.get('/connect', auth_1.requireAuth, slackController_1.slackOAuthStart);
router.get('/callback', slackController_1.slackOAuthCallback); // No auth — Slack redirects here with state=userId
router.get('/status', auth_1.requireAuth, slackController_1.getSlackStatus);
router.delete('/disconnect', auth_1.requireAuth, slackController_1.disconnectSlack);
exports.default = router;
//# sourceMappingURL=slack.js.map