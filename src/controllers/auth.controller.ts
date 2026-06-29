import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { authService } from '../services/auth.service';
import { logger } from '../utils/logger';

const registerSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(100),
  password: z.string().min(8).max(128),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const data = registerSchema.parse(req.body);
      const hashedPassword = await authService.hashPassword(data.password);
      const user = {
        id: crypto.randomUUID(),
        ...data,
        password: hashedPassword,
        role: 'member' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const token = authService.generateToken(user);
      res.status(201).json({ user: { id: user.id, email: user.email, name: user.name }, token });
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const data = loginSchema.parse(req.body);
      logger.info(`Login attempt for: ${data.email}`);
      res.json({ token: 'mock-token', message: 'Login successful' });
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req: Request, res: Response) {
    res.json({ user: (req as any).user });
  }
}

export const authController = new AuthController();
