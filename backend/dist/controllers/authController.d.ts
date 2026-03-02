import { Request, Response } from 'express';
import { AuthRequest } from '../types';
export declare const signup: (req: Request, res: Response) => Promise<any>;
export declare const login: (req: Request, res: Response) => Promise<any>;
export declare const getProfile: (req: AuthRequest, res: Response) => Promise<any>;
//# sourceMappingURL=authController.d.ts.map