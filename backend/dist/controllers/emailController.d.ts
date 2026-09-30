import { Request, Response } from 'express';
import multer from 'multer';
export declare const upload: multer.Multer;
export declare function scheduleEmails(req: Request, res: Response): Promise<void>;
export declare function parseEmailsCsv(req: Request, res: Response): Promise<void>;
export declare function getScheduledEmails(req: Request, res: Response): Promise<void>;
export declare function getSentEmails(req: Request, res: Response): Promise<void>;
export declare function cancelEmailJob(req: Request, res: Response): Promise<void>;
//# sourceMappingURL=emailController.d.ts.map