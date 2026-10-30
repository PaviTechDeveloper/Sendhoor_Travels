import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';

const SESSION_MS = 12 * 60 * 60 * 1000;
const sessions = new Map<string, number>();

function digest(value: string) {
  return createHash('sha256').update(value).digest();
}

// Compare hashes so the check takes the same time whatever the password length.
function passwordMatches(input: string) {
  const expected = process.env.ADMIN_PASSWORD ?? '';
  return expected.length > 0 && timingSafeEqual(digest(input), digest(expected));
}

export function login(password: string): string | null {
  if (!passwordMatches(password)) return null;

  const token = randomBytes(32).toString('hex');
  sessions.set(token, Date.now() + SESSION_MS);
  return token;
}

export function requireOwner(req: Request, res: Response, next: NextFunction) {
  const token = req.get('authorization')?.replace(/^Bearer /, '') ?? '';
  const expiresAt = sessions.get(token);

  if (!expiresAt || expiresAt < Date.now()) {
    sessions.delete(token);
    res.status(401).json({ ok: false, message: 'Please sign in again.' });
    return;
  }
  next();
}
