export declare function notifySlackRateLimit(userId: string, resetAt: Date, maxPerHour: number): Promise<void>;
export declare function getSlackOAuthUrl(state: string): Promise<string>;
export declare function exchangeSlackCode(code: string): Promise<{
    accessToken: string;
    teamId: string;
    teamName: string;
    channelId?: string;
    channelName?: string;
}>;
//# sourceMappingURL=slack.d.ts.map