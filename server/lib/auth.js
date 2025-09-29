// server/lib/auth.js
import { prisma } from './prisma.js';

export async function upsertUserFromSupabase(payload) {
  const email = payload.email;
  if (!email) throw new Error('Supabase token missing email');
  const name =
    payload.user_metadata?.name ||
    payload.user_metadata?.full_name ||
    email;

  // No passwordHash here — Supabase holds the password
  return prisma.user.upsert({
    where: { email },
    update: { name },
    create: {
      email,
      name,
      // you can auto-approve or keep default status from your schema:
      // status: 'approved',
    },
    select: { id: true, email: true, name: true, role: true, status: true }
  });
}
