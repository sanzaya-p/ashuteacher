import { NextRequest, NextResponse } from "next/server";
import { connection } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  clearSessionCookie,
  getCurrentUser,
  hashPassword,
  setSessionCookie,
  verifyPassword,
} from "@/lib/auth";
import { WELCOME_FREE_CREDITS } from "@/lib/credits";

function sanitizeUser(u: {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  role: string;
  isAdmin: boolean;
  preferredLang: string;
  preferredLevel: string;
  preferredModel: string;
  creditsBalance: number;
  xpPoints: number;
  streakDays: number;
  planTier: string;
}) {
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    avatarUrl: u.avatarUrl,
    role: u.role,
    isAdmin: u.isAdmin,
    preferredLang: u.preferredLang,
    preferredLevel: u.preferredLevel,
    preferredModel: u.preferredModel,
    creditsBalance: u.creditsBalance,
    xpPoints: u.xpPoints,
    streakDays: u.streakDays,
    planTier: u.planTier,
  };
}

export async function GET() {
  await connection();
  try {
    const user = await getCurrentUser();
    const googleOAuthEnabled = Boolean(
      process.env.GOOGLE_CLIENT_ID?.trim() &&
        process.env.GOOGLE_CLIENT_SECRET?.trim()
    );
    return NextResponse.json({
      authenticated: Boolean(user),
      user: user ? sanitizeUser(user) : null,
      googleOAuthEnabled,
      isDevMode: process.env.NODE_ENV !== "production",
    });
  } catch (error) {
    console.error("Session GET error:", error);
    return NextResponse.json({ authenticated: false, user: null });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { mode = "login", email, password, name } = body;
    const today = new Date().toISOString().slice(0, 10);

    // Instant Demo Login (Strictly disabled in production!)
    if (mode === "demo") {
      if (process.env.NODE_ENV === "production") {
        return NextResponse.json(
          { error: "Demo login is disabled in production." },
          { status: 403 }
        );
      }

      const demoEmail = "founder@ashuteacher.local";
      let demoUser = await prisma.user.findUnique({
        where: { email: demoEmail },
      });

      if (!demoUser) {
        demoUser = await prisma.$transaction(async (tx) => {
          const created = await tx.user.create({
            data: {
              email: demoEmail,
              name: "Founder Scholar",
              isAdmin: true,
              creditsBalance: WELCOME_FREE_CREDITS,
              lastActiveDate: today,
            },
          });
          await tx.creditTransaction.create({
            data: {
              userId: created.id,
              amount: WELCOME_FREE_CREDITS,
              balanceAfter: WELCOME_FREE_CREDITS,
              type: "WELCOME_BONUS",
              description: "Welcome Free Trial Credits (10 Credits)",
            },
          });
          return created;
        });
      }

      await setSessionCookie(demoUser.id);
      return NextResponse.json({ ok: true, user: sanitizeUser(demoUser) });
    }

    const normalizedEmail = String(email || "")
      .trim()
      .toLowerCase();
    if (!normalizedEmail || !normalizedEmail.includes("@")) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    const rawPassword = String(password || "");
    if (rawPassword.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters." },
        { status: 400 }
      );
    }

    if (mode === "signup") {
      const existing = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      });
      if (existing) {
        return NextResponse.json(
          { error: "An account with this email already exists. Please sign in." },
          { status: 409 }
        );
      }

      const totalUsers = await prisma.user.count();
      const displayName =
        String(name || "").trim() || normalizedEmail.split("@")[0];

      const createdUser = await prisma.$transaction(async (tx) => {
        const u = await tx.user.create({
          data: {
            email: normalizedEmail,
            name: displayName,
            passwordHash: hashPassword(rawPassword),
            isAdmin: totalUsers === 0, // First user is workspace admin
            creditsBalance: WELCOME_FREE_CREDITS,
            lastActiveDate: today,
          },
        });

        await tx.creditTransaction.create({
          data: {
            userId: u.id,
            amount: WELCOME_FREE_CREDITS,
            balanceAfter: WELCOME_FREE_CREDITS,
            type: "WELCOME_BONUS",
            description: `Welcome Bonus (+${WELCOME_FREE_CREDITS} Free Credits)`,
          },
        });

        return u;
      });

      await setSessionCookie(createdUser.id);
      return NextResponse.json({ ok: true, user: sanitizeUser(createdUser) });
    }

    // Standard Email + Password Sign In
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
    if (!user || !user.passwordHash || !verifyPassword(rawPassword, user.passwordHash)) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    await setSessionCookie(user.id);
    return NextResponse.json({ ok: true, user: sanitizeUser(user) });
  } catch (error) {
    console.error("Auth POST error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  await clearSessionCookie();
  return NextResponse.json({ ok: true });
}
