import { spawn } from 'node:child_process';

const isWindows = process.platform === 'win32';
const npmCmd = isWindows ? 'npm.cmd' : 'npm';
const npxCmd = isWindows ? 'npx.cmd' : 'npx';

const localDatabaseUrl =
  process.env.DATABASE_URL ??
  'postgresql://smd:smd_dev_password@localhost:15432/smd_lab?schema=public';

const env = {
  ...process.env,
  DATABASE_URL: localDatabaseUrl,
  PUBLIC_ORIGIN: process.env.PUBLIC_ORIGIN ?? 'http://localhost:5173',
  API_HOST: process.env.API_HOST ?? '0.0.0.0',
  API_PORT: process.env.API_PORT ?? '4000',
  UPLOAD_DIR: process.env.UPLOAD_DIR ?? './uploads',
  UPLOAD_PUBLIC_PATH: process.env.UPLOAD_PUBLIC_PATH ?? '/uploads',
  ADMIN_CRYPTO_KEY: process.env.ADMIN_CRYPTO_KEY ?? 'change-me-in-production',
  COOKIE_SECURE: process.env.COOKIE_SECURE ?? 'false',
};

const run = (command, args, options = {}) =>
  new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: isWindows,
      env,
      ...options,
    });
    child.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} ${args.join(' ')} exited with code ${code}`));
    });
    child.on('error', reject);
  });

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const runMigrationsWithRetry = async () => {
  const attempts = 20;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      await run(npxCmd, ['prisma', 'migrate', 'deploy']);
      return;
    } catch (error) {
      if (attempt === attempts) throw error;
      console.log(`PostgreSQL 준비 대기 중... (${attempt}/${attempts})`);
      await delay(2000);
    }
  }
};

const startLongRunning = (name, command, args) => {
  const child = spawn(command, args, {
    stdio: 'inherit',
    shell: isWindows,
    env,
  });
  child.on('exit', (code) => {
    console.log(`${name} exited with code ${code ?? 'unknown'}`);
    shutdown(code ?? 1);
  });
  child.on('error', (error) => {
    console.error(`${name} failed to start`, error);
    shutdown(1);
  });
  return child;
};

let frontend;
let api;
let shuttingDown = false;

const shutdown = (code = 0) => {
  if (shuttingDown) return;
  shuttingDown = true;
  frontend?.kill();
  api?.kill();
  process.exit(code);
};

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));

console.log('Starting PostgreSQL with Docker Compose...');
await run('docker', ['compose', 'up', '-d', 'postgres']);

console.log('Generating Prisma Client...');
await run(npxCmd, ['prisma', 'generate']);

console.log('Applying database migrations...');
await runMigrationsWithRetry();

console.log('Seeding initial CMS data...');
await run(npmCmd, ['run', 'seed']);

console.log('Starting frontend and API dev servers...');
frontend = startLongRunning('frontend', npmCmd, ['run', 'dev', '--', '--host', '0.0.0.0']);
api = startLongRunning('api', npmCmd, ['run', 'dev:api']);
