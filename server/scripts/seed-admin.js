import 'dotenv/config';
import { prisma } from '../lib/prisma.js';
import bcrypt from 'bcryptjs';

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL || 'admin@example.com';
  const password = process.env.SEED_ADMIN_PASSWORD || 'changeme123';
  const name = 'Admin';

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log('Admin already exists');
    process.exit(0);
  }
  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.create({ data: { email, name, passwordHash, role: 'admin', status: 'approved' } });
  console.log('Admin created:', email);
}

main().finally(() => prisma.$disconnect());
