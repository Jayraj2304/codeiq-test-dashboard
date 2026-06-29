import { Request, Response, NextFunction } from 'express';
import { container, createToken } from '../core/container';
import { AUTH_SERVICE } from '../services/auth.service';
import { logger } from '../utils/logger';

export interface AuthMiddleware {
  authenticate(req: Request, res: Response, next: NextFunction): void;
  requireRole(...roles: string[]): (req: Request, res: Response, next: NextFunction) => void;
}

export const AUTH_MIDDLEWARE = createToken<AuthMiddleware>('AuthMiddleware');

export class JwtAuthMiddleware implements AuthMiddleware {
  authenticate(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    try {
      const authService = container.resolve(AUTH_SERVICE);
      const token = authHeader.split(' ')[1];
      const payload = authService.verifyToken(token);
      (req as any).user = payload;
      next();
    } catch {
      return res.status(401).json({ error: 'Invalid token' });
    }
  }

  requireRole(...roles: string[]) {
    return (req: Request, res: Response, next: NextFunction) => {
      const user = (req as any).user;
      if (!user || !roles.includes(user.role)) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }
      next();
    };
  }
}

container.registerFactory(AUTH_MIDDLEWARE, () => new JwtAuthMiddleware());
