import { NextRequest, NextResponse } from "next/server";
import { connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { createGeminiClient, resolveModelName } from "@/lib/gemini";
import { getCurrentUser } from "@/lib/auth";
import * as fs from "fs/promises";
import * as path from "path";

export async function GET() {
  await connection();
  try {
    const user = await getCurrentUser();
    const envKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "";
    const isAdminOrDev = Boolean(user?.isAdmin || process.env.NODE_ENV !== "production");

    return NextResponse.json({
      authenticated: Boolean(user),
      hasServerKey: Boolean(envKey.trim()),
      maskedServerKey:
        isAdminOrDev && envKey.trim()
          ? `${envKey.slice(0, 4)}••••••••${envKey.slice(-4)}`
          : null,
      canConfigureServerKey: isAdminOrDev,
      defaultModel: resolveModelName(user?.preferredModel),
      profile: user
        ? {
            id: user.id,
            email: user.email,
            name: user.name,
            avatarUrl: user.avatarUrl,
            role: user.role,
            isAdmin: user.isAdmin,
            preferredLang: user.preferredLang,
            preferredLevel: user.preferredLevel,
            preferredModel: user.preferredModel,
            creditsBalance: user.creditsBalance,
            xpPoints: user.xpPoints,
            streakDays: user.streakDays,
            planTier: user.planTier,
          }
        : null,
    });
  } catch (error) {
    console.error("Settings GET error:", error);
    return NextResponse.json({ error: "Failed to load settings" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const isAdminOrDev = Boolean(user?.isAdmin || process.env.NODE_ENV !== "production");
    const body = await req.json();
    const {
      name,
      role,
      preferredLang,
      preferredLevel,
      preferredModel,
      saveServerApiKey,
      testApiKey,
    } = body;

    if (testApiKey) {
      if (!isAdminOrDev) {
        return NextResponse.json({ error: "Admin access required" }, { status: 403 });
      }
      const headerKey = req.headers.get("x-gemini-api-key");
      const keyToTest =
        (typeof saveServerApiKey === "string" && saveServerApiKey.trim()) || headerKey;
      const ai = createGeminiClient(keyToTest);
      const model = resolveModelName(preferredModel);
      const res = await ai.models.generateContent({
        model,
        contents: "Reply with the single word READY.",
      });
      return NextResponse.json({
        ok: true,
        reply: res.text?.trim() || "READY",
        model,
      });
    }

    if (typeof saveServerApiKey === "string" && saveServerApiKey.trim() && isAdminOrDev) {
      const trimmedKey = saveServerApiKey.trim();
      process.env.GEMINI_API_KEY = trimmedKey;
      try {
        const envPath = path.join(process.cwd(), ".env");
        let envContent = "";
        try {
          envContent = await fs.readFile(envPath, "utf-8");
        } catch {
          envContent = 'DATABASE_URL="file:./dev.db"\n';
        }
        if (/^GEMINI_API_KEY=/m.test(envContent)) {
          envContent = envContent.replace(
            /^GEMINI_API_KEY=.*$/m,
            `GEMINI_API_KEY="${trimmedKey}"`
          );
        } else {
          envContent += `\nGEMINI_API_KEY="${trimmedKey}"\n`;
        }
        await fs.writeFile(envPath, envContent, "utf-8");
      } catch (fsErr) {
        console.warn("Could not write .env file:", fsErr);
      }
    }

    let updated = user;
    if (user) {
      updated = await prisma.user.update({
        where: { id: user.id },
        data: {
          ...(name !== undefined ? { name: String(name).trim() || "Scholar" } : {}),
          ...(role !== undefined ? { role: String(role) } : {}),
          ...(preferredLang !== undefined ? { preferredLang: String(preferredLang) } : {}),
          ...(preferredLevel !== undefined ? { preferredLevel: String(preferredLevel) } : {}),
          ...(preferredModel !== undefined ? { preferredModel: String(preferredModel) } : {}),
        },
      });
    }

    const envKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "";
    return NextResponse.json({
      ok: true,
      hasServerKey: Boolean(envKey.trim()),
      maskedServerKey:
        isAdminOrDev && envKey.trim()
          ? `${envKey.slice(0, 4)}••••••••${envKey.slice(-4)}`
          : null,
      profile: updated,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update settings";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
