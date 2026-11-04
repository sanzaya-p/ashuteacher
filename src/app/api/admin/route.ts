import { NextRequest, NextResponse } from "next/server";
import { connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthUser } from "@/lib/auth";
import { handleApiError } from "@/lib/api-error";

const OWNER_EMAILS = new Set(["sanzaya@msn.com", "spatel@ignou.ac.in"]);

async function requireAdmin() {
  const user = await requireAuthUser();
  const isOwnerEmail = OWNER_EMAILS.has(user.email.toLowerCase());
  if (!user.isAdmin && !isOwnerEmail) {
    throw new Error("FORBIDDEN: Founder Admin access required.");
  }
  if (!user.isAdmin && isOwnerEmail) {
    await prisma.user.update({
      where: { id: user.id },
      data: { isAdmin: true },
    });
  }
  return user;
}

export async function GET() {
  await connection();
  try {
    await requireAdmin();

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [
      users,
      paymentOrders,
      recentTransactions,
      totalLessons,
      totalCourses,
      totalQuizzes,
      totalFlashcards,
      recentSignupsCount,
    ] = await Promise.all([
      prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        take: 250,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isAdmin: true,
          planTier: true,
          creditsBalance: true,
          xpPoints: true,
          streakDays: true,
          preferredLang: true,
          createdAt: true,
          _count: {
            select: {
              lessons: true,
              courses: true,
              quizzes: true,
              flashcardSets: true,
              paymentOrders: true,
            },
          },
        },
      }),
      prisma.paymentOrder.findMany({
        orderBy: { createdAt: "desc" },
        take: 200,
        include: {
          user: {
            select: { name: true, email: true },
          },
        },
      }),
      prisma.creditTransaction.findMany({
        orderBy: { createdAt: "desc" },
        take: 150,
        include: {
          user: {
            select: { name: true, email: true },
          },
        },
      }),
      prisma.lesson.count(),
      prisma.course.count(),
      prisma.quiz.count(),
      prisma.flashcardSet.count(),
      prisma.user.count({
        where: { createdAt: { gte: sevenDaysAgo } },
      }),
    ]);

    const totalUsers = await prisma.user.count();

    const paidOrders = paymentOrders.filter((o) => o.status === "PAID");
    const revenuePaiseInr = paidOrders
      .filter((o) => o.currency.toUpperCase() === "INR")
      .reduce((acc, o) => acc + o.amountSubunits, 0);
    const revenueCentsUsd = paidOrders
      .filter((o) => o.currency.toUpperCase() === "USD")
      .reduce((acc, o) => acc + o.amountSubunits, 0);

    const creditsPurchasedTotal = paidOrders.reduce(
      (acc, o) => acc + o.creditsAmount,
      0
    );

    return NextResponse.json({
      stats: {
        totalUsers,
        recentSignupsCount,
        paidOrdersCount: paidOrders.length,
        totalOrdersCount: paymentOrders.length,
        revenueInr: revenuePaiseInr / 100,
        revenueUsd: revenueCentsUsd / 100,
        creditsPurchasedTotal,
        totalLessons,
        totalCourses,
        totalQuizzes,
        totalFlashcards,
      },
      users,
      paymentOrders,
      recentTransactions,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed";
    if (msg.startsWith("FORBIDDEN:")) {
      return NextResponse.json({ error: msg }, { status: 403 });
    }
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    const body = await req.json();
    const targetUserId = String(body?.userId || "").trim();
    const deltaCredits = Number(body?.credits || 0);
    const reason =
      String(body?.reason || "").trim() ||
      `Bonus credits granted by Admin (${admin.email})`;

    if (!targetUserId || !Number.isInteger(deltaCredits) || deltaCredits === 0) {
      return NextResponse.json(
        { error: "Provide a valid userId and non-zero integer credits amount." },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const target = await tx.user.findUnique({ where: { id: targetUserId } });
      if (!target) {
        throw new Error("Target user not found.");
      }

      const nextBalance = Math.max(0, target.creditsBalance + deltaCredits);
      const actualDelta = nextBalance - target.creditsBalance;

      const updated = await tx.user.update({
        where: { id: targetUserId },
        data: { creditsBalance: nextBalance },
        select: { id: true, email: true, creditsBalance: true },
      });

      await tx.creditTransaction.create({
        data: {
          userId: targetUserId,
          amount: actualDelta,
          balanceAfter: updated.creditsBalance,
          type: "ADMIN_GRANT",
          description: reason,
          metadataJson: JSON.stringify({ grantedBy: admin.email }),
        },
      });

      return updated;
    });

    return NextResponse.json({ ok: true, user: result });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed";
    if (msg.startsWith("FORBIDDEN:")) {
      return NextResponse.json({ error: msg }, { status: 403 });
    }
    return handleApiError(err);
  }
}
