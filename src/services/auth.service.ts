import { Request, Response, NextFunction } from 'express';
import { container, createToken } from '../core/container';
import { logger } from '../utils/logger';

export interface AuthService {
  hashPassword(password: string): Promise<string>;
  comparePasswords(plain: string, hashed: string): Promise<boolean>;
  generateToken(payload: Record<string, unknown>): string;
  verifyToken(token: string): Record<string, unknown>;
}

export const AUTH_SERVICE = createToken<AuthService>('AuthService');

export class JwtAuthService implements AuthService {
  private jwt: typeof import('jsonwebtoken');
  private bcrypt: typeof import('bcryptjs');
  private secret: string;

  constructor() {
    this.jwt = require('jsonwebtoken');
    this.bcrypt = require('bcryptjs');
    this.secret = process.env.JWT_SECRET || 'dev-secret';
  }

  async hashPassword(password: string): Promise<string> {
    return this.bcrypt.hash(password, 12);
  }

  async comparePasswords(plain: string, hashed: string): Promise<boolean> {
    return this.bcrypt.compare(plain, hashed);
  }

  generateToken(payload: Record<string, unknown>): string {
    return this.jwt.sign(payload, this.secret, { expiresIn: '7d' });
  }

  verifyToken(token: string): Record<string, unknown> {
    try {
      return this.jwt.verify(token, this.secret) as Record<string, unknown>;
    } catch {
      throw new Error('Invalid token');
    }
  }
}

container.registerFactory(AUTH_SERVICE, () => new JwtAuthService());
