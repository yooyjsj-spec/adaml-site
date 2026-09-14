import { prisma } from './prisma.js';
import { createAdminSchema } from './schemas.js';
import { hashPassword } from './security.js';

const getArg = (name: string) => {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 ? process.argv[index + 1] : undefined;
};

const main = async () => {
  const input = createAdminSchema.parse({
    username: getArg('username') ?? process.env.ADMIN_USERNAME,
    password: getArg('password') ?? process.env.ADMIN_PASSWORD,
  });

  const passwordHash = await hashPassword(input.password);
  const admin = await prisma.user.upsert({
    where: { username: input.username },
    update: { passwordHash, role: 'ADMIN' },
    create: {
      username: input.username,
      passwordHash,
      role: 'ADMIN',
      emailVerified: true,
    },
  });

  console.log(`Admin user ready: ${admin.username}`);
  console.log('Log in from the public site bubble button and complete TOTP setup.');
};

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
