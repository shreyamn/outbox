import { Request, Response, NextFunction } from 'express';
export interface JwtPayload {
    userId: string;
    email: string;
}
declare module 'express-serve-static-core' {
    interface Request {
        jwtUser?: JwtPayload;
    }
}
export declare function requireAuth(req: Request, res: Response, next: NextFunction): void;
export declare function signToken(payload: JwtPayload): string;
//# sourceMappingURL=auth.d.ts.map