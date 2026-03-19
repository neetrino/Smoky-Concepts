#!/usr/bin/env node
/**
 * Runs prisma generate. For build (e.g. Vercel) sets dummy DATABASE_URL/DIRECT_URL
 * if missing so schema parsing succeeds; generated client is the same.
 * Runtime continues to use real env from the app.
 */
const { execSync } = require('child_process');

const DUMMY_URL = 'postgresql://build:build@localhost:5432/build';

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = DUMMY_URL;
}
if (!process.env.DIRECT_URL) {
  process.env.DIRECT_URL = process.env.DATABASE_URL;
}

execSync('npx prisma generate', { stdio: 'inherit' });
