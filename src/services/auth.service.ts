import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '../models/types';
import { logger } from '../utils/logger';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const SALT_ROUNDS = 12;

export class AuthService {
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
  }

  async comparePasswords(plain: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(plain, hashed);
  }

  generateToken(user: Pick<User, 'id' | 'email' | 'role'>): string {
    return jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
  }

  verifyToken(token: string): jwt.JwtPayload {
    try {
      return jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;
    } catch (error) {
      logger.error('Token verification failed', error);
      throw new Error('Invalid token');
    }
  }
}

export const authService = new AuthService();
