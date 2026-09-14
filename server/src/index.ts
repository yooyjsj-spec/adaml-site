import { buildApp } from './app.js';
import { env } from './env.js';
import { backfillMissingJournalCovers } from './journalCover.js';
import { prisma } from './prisma.js';
import { hashPassword } from './security.js';

const bootstrapAdmin = async () => {
  const username = process.env.ADMIN_USERNAME?.trim();
  const password = process.env.ADMIN_PASSWORD;
  if (!username || !password) return;
  if (password.length < 12) {
    console.warn('ADMIN_PASSWORD is shorter than 12 characters; skipping admin bootstrap.');
    return;
  }

  const passwordHash = await hashPassword(password);
  await prisma.user.upsert({
    where: { username },
    update: { passwordHash, role: 'ADMIN', emailVerified: true },
    create: { username, passwordHash, role: 'ADMIN', emailVerified: true },
  });
  console.log(`Admin user synced from env: ${username}`);
};

const start = async () => {
  const app = await buildApp();
  try {
    await bootstrapAdmin();
    await app.listen({ host: env.host, port: env.port });
    void backfillMissingJournalCovers().catch((error) => {
      app.log.error(error, 'Journal cover backfill failed');
    });
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
};

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

start();
