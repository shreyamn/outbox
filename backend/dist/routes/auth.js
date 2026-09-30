"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/google', authController_1.googleAuth);
router.get('/google/callback', authController_1.googleCallback);
router.get('/me', auth_1.requireAuth, authController_1.getMe);
exports.default = router;
//# sourceMappingURL=auth.js.map