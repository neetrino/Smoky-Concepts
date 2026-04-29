#!/usr/bin/env node
/**
 * Loads repo .env files (same order as apps/web/scripts/run-migrations.js),
 * sets DIRECT_URL from DATABASE_URL if missing, then runs prisma migrate deploy.
 * Does not run prisma generate — safe while Next.js dev holds the query engine DLL on Windows.
 */
const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");

const root = path.join(__dirname, "..");
const dbPath = path.join(root, "packages", "db");

const envPaths = [
  path.join(root, ".env.local"),
  path.join(root, ".env"),
  path.join(root, "apps", "web", ".env.local"),
  path.join(root, "apps", "web", ".env"),
];
for (const p of envPaths) {
  if (!fs.existsSync(p)) continue;
  const content = fs.readFileSync(p, "utf8");
  for (const line of content.split("\n")) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (match && process.env[match[1]] === undefined) {
      const value = match[2].replace(/^["']|["']$/g, "").trim();
      process.env[match[1]] = value;
    }
  }
}

if (!process.env.DIRECT_URL && process.env.DATABASE_URL) {
  process.env.DIRECT_URL = process.env.DATABASE_URL;
}

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set. Add it to .env or .env.local at repo root or apps/web.");
  process.exit(1);
}

const mode = process.argv[2] === "push" ? "push" : "deploy";

if (mode === "push") {
  console.log("Running prisma db push (packages/db) — syncs schema when migrate history is missing (P3005)...");
  execSync("npx prisma@5.22.0 db push --skip-generate", {
    cwd: dbPath,
    stdio: "inherit",
    env: process.env,
  });
} else {
  console.log("Running prisma migrate deploy (packages/db)...");
  execSync("npx prisma@5.22.0 migrate deploy", {
    cwd: dbPath,
    stdio: "inherit",
    env: process.env,
  });
}
