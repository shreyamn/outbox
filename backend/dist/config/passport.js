"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.configurePassport = configurePassport;
const passport_1 = __importDefault(require("passport"));
const passport_google_oauth20_1 = require("passport-google-oauth20");
const prisma_1 = require("../db/prisma");
const env_1 = require("./env");
function configurePassport() {
    passport_1.default.use(new passport_google_oauth20_1.Strategy({
        clientID: env_1.env.GOOGLE_CLIENT_ID,
        clientSecret: env_1.env.GOOGLE_CLIENT_SECRET,
        callbackURL: env_1.env.GOOGLE_CALLBACK_URL,
    }, async (_accessToken, _refreshToken, profile, done) => {
        try {
            const email = profile.emails?.[0]?.value ?? '';
            const name = profile.displayName ?? email;
            const avatarUrl = profile.photos?.[0]?.value;
            const user = await prisma_1.prisma.user.upsert({
                where: { googleId: profile.id },
                update: { email, name, avatarUrl },
                create: {
                    googleId: profile.id,
                    email,
                    name,
                    avatarUrl,
                },
            });
            done(null, user);
        }
        catch (err) {
            done(err);
        }
    }));
    passport_1.default.serializeUser((user, done) => done(null, user));
    passport_1.default.deserializeUser((user, done) => done(null, user));
}
//# sourceMappingURL=passport.js.map