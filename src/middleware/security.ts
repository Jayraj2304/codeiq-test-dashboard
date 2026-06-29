import { Request, Response, NextFunction } from 'express';
import { sanitizeInput } from '../utils/validators';

export function securityHeaders(req: Request, res: Response, next: NextFunction) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
}

export function sanitizeBody(req: Request, _res: Response, next: NextFunction) {
  if (req.body && typeof req.body === 'object') {
    for (const key of Object.keys(req.body)) {
      if (typeof req.body[key] === 'string') {
        req.body[key] = sanitizeInput(req.body[key]);
      }
    }
  }
  next();
}

export function preventSqlInjection(req: Request, _res: Response, next: NextFunction) {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|FETCH|DECLARE|TRUNCATE)\b)/i,
    /(--|;|\/\*|\*\/|xp_|sp_)/i,
    /(' OR '1'='1|' OR 1=1)/i,
  ];

  const checkValue = (value: string): boolean => {
    return sqlPatterns.some((pattern) => pattern.test(value));
  };

  const checkObject = (obj: Record<string, unknown>): boolean => {
    for (const value of Object.values(obj)) {
      if (typeof value === 'string' && checkValue(value)) return true;
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        if (checkObject(value as Record<string, unknown>)) return true;
      }
    }
    return false;
  };

  if (req.query && typeof req.query === 'object' && checkObject(req.query as Record<string, unknown>)) {
    return _res.status(400).json({ error: 'Invalid input detected' });
  }

  if (req.body && typeof req.body === 'object' && checkObject(req.body)) {
    return _res.status(400).json({ error: 'Invalid input detected' });
  }

  next();
}
