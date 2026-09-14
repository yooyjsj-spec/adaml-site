import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx server/src/seed.ts',
  },
  datasource: {
    url: process.env.DATABASE_URL ?? 'postgresql://smd:smd_dev_password@localhost:15432/smd_lab?schema=public',
  },
});
