"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.googleCallback = exports.googleAuth = void 0;
exports.getMe = getMe;
const passport_1 = __importDefault(require("passport"));
const auth_1 = require("../middleware/auth");
const env_1 = require("../config/env");
exports.googleAuth = passport_1.default.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
});
exports.googleCallback = [
    passport_1.default.authenticate('google', { session: false, failureRedirect: `${env_1.env.FRONTEND_URL}/login?error=auth_failed` }),
    (req, res) => {
        const user = req.user;
        const token = (0, auth_1.signToken)({ userId: user.id, email: user.email });
        // Redirect to frontend with token
        res.redirect(`${env_1.env.FRONTEND_URL}/auth/callback?token=${token}`);
    },
];
function getMe(req, res) {
    res.json({ user: req.jwtUser });
}
//# sourceMappingURL=authController.js.map