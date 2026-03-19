#!/usr/bin/env node
/**
 * Runs prisma generate. For build (e.g. Vercel) sets dummy DATABASE_URL/DIRECT_URL
 * if missing so schema parsing succeeds; generated client is the same.
 * Runtime continues to use real env from the app.
 */
const { execSync } = require('child_process');
const path = require('path');

const DUMMY_URL = 'postgresql://build:build@localhost:5432/build';

/** True if value looks like a real PostgreSQL URL (needed for Prisma 7 getConfig validation). */
function isValidPostgresUrl(value) {
  if (!value || typeof value !== 'string') return false;
  const trimmed = value.trim();
  return trimmed.length > 0 && (trimmed.startsWith('postgresql://') || trimmed.startsWith('postgres://'));
}

if (!isValidPostgresUrl(process.env.DATABASE_URL)) {
  process.env.DATABASE_URL = DUMMY_URL;
}
if (!isValidPostgresUrl(process.env.DIRECT_URL)) {
  process.env.DIRECT_URL = process.env.DATABASE_URL;
}

const packageRoot = path.resolve(__dirname, '..');
process.chdir(packageRoot);

const fs = require('fs');
const prismaSchema = path.join(packageRoot, 'prisma', 'schema.prisma');
if (!fs.existsSync(prismaSchema)) {
  console.error('[db:generate] missing schema at', prismaSchema, 'cwd:', process.cwd());
  process.exit(1);
}

try {
  execSync('npx prisma generate', {
    encoding: 'utf8',
    env: { ...process.env, FORCE_COLOR: '1' },
  });
} catch (err) {
  if (err.stdout) process.stdout.write(err.stdout);
  if (err.stderr) process.stderr.write(err.stderr);
  console.error('[db:generate] exit code:', err.status);
  process.exit(err.status ?? 1);
}
