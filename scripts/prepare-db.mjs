import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const schemaPath = path.join(process.cwd(), "prisma", "schema.prisma");
const dbUrl = (process.env.DATABASE_URL || "").trim();
const isPostgres =
  dbUrl.startsWith("postgres://") || dbUrl.startsWith("postgresql://");

let schema = fs.readFileSync(schemaPath, "utf8");

if (isPostgres && schema.includes('provider = "sqlite"')) {
  console.log(
    "[prepare-db] Detected PostgreSQL DATABASE_URL -> switching Prisma provider to postgresql"
  );
  schema = schema.replace('provider = "sqlite"', 'provider = "postgresql"');
  fs.writeFileSync(schemaPath, schema, "utf8");
}

console.log("[prepare-db] Running prisma generate...");
execSync("npx prisma generate", { stdio: "inherit" });

if (isPostgres) {
  // For Neon -pooler URLs, use direct endpoint for DDL sync
  const directUrl = dbUrl
    .replace("-pooler.", ".")
    .replace(/[?&]pgbouncer=true/g, "")
    .replace(/[?&]channel_binding=require/g, "");
  console.log("[prepare-db] Syncing PostgreSQL schema with prisma db push...");
  execSync("npx prisma db push --skip-generate", {
    stdio: "inherit",
    env: { ...process.env, DATABASE_URL: directUrl },
  });
}
