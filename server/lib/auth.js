import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from './prisma.js';

export async function createUserWithPassword({ email, name, password }) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new Error('User already exists');
  if (!password || password.length < 6) throw new Error('Password must be at least 6 characters');
  const passwordHash = await bcrypt.hash(password, 12);
  return prisma.user.create({ data: { email, name: name || email, passwordHash } });
}

export async function verifyPasswordLogin({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.passwordHash) return null;
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return null;
  return { id: user.id, email: user.email, name: user.name, role: user.role, status: user.status };
}

export function signToken(payload, secret) {
  return jwt.sign(payload, secret, { expiresIn: '7d' });
}

export async function upsertUserFromClaims({ email, name }) {
  if (!email) throw new Error('OIDC token missing email');
  return prisma.user.upsert({
    where: { email },
    update: { name },
    create: { email, name },
    select: { id: true, email: true, name: true, role: true, status: true }
  });
}
