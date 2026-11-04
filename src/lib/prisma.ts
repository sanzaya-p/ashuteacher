import fs from "node:fs";
import zlib from "node:zlib";
import { PrismaClient } from "@prisma/client";
import { EMPTY_SQLITE_GZ_B64 } from "./sqlite-bootstrap";

const dbUrl = (process.env.DATABASE_URL || "").trim();
if (dbUrl.startsWith("file:/tmp/")) {
  const filePath = dbUrl.replace(/^file:/, "");
  try {
    if (!fs.existsSync(filePath) || fs.statSync(filePath).size === 0) {
      const raw = zlib.gunzipSync(Buffer.from(EMPTY_SQLITE_GZ_B64, "base64"));
      fs.writeFileSync(filePath, raw);
    }
  } catch (err) {
    console.warn("[prisma] Could not bootstrap /tmp SQLite DB:", err);
  }
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
