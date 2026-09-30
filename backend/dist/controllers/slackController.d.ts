import { Request, Response } from 'express';
export declare function slackOAuthStart(req: Request, res: Response): Promise<void>;
export declare function slackOAuthCallback(req: Request, res: Response): Promise<void>;
export declare function getSlackStatus(req: Request, res: Response): Promise<void>;
export declare function disconnectSlack(req: Request, res: Response): Promise<void>;
//# sourceMappingURL=slackController.d.ts.map