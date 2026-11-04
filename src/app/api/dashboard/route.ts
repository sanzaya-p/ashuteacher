import { NextResponse } from "next/server";
import { connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  await connection();
  try {
    const user = await getCurrentUser();
    const hasServerKey = Boolean(
      (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "").trim()
    );

    if (!user) {
      return NextResponse.json({
        authenticated: false,
        hasServerKey,
        canConfigureServerKey: process.env.NODE_ENV !== "production",
        profile: null,
        stats: {
          totalLessons: 0,
          totalCourses: 0,
          quizAttemptsCount: 0,
          avgQuizAccuracy: 0,
          flashcardsMastered: 0,
        },
        recentLessons: [],
        courses: [],
      });
    }

    const [
      totalLessons,
      totalCourses,
      recentLessons,
      courses,
      quizAttempts,
      flashcardSets,
    ] = await Promise.all([
      prisma.lesson.count({ where: { userId: user.id, NOT: { content: "" } } }),
      prisma.course.count({ where: { userId: user.id } }),
      prisma.lesson.findMany({
        where: { userId: user.id, NOT: { content: "" } },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          title: true,
          subject: true,
          mode: true,
          level: true,
          language: true,
          isFavorite: true,
          createdAt: true,
        },
      }),
      prisma.course.findMany({
        where: { userId: user.id },
        orderBy: { updatedAt: "desc" },
        take: 4,
      }),
      prisma.quizAttempt.findMany({
        where: { quiz: { userId: user.id } },
        orderBy: { createdAt: "desc" },
        take: 30,
      }),
      prisma.flashcardSet.findMany({
        where: { userId: user.id },
        select: { masteredCount: true, totalCards: true },
      }),
    ]);

    const totalScored = quizAttempts.reduce((acc, a) => acc + a.score, 0);
    const totalPossible = quizAttempts.reduce((acc, a) => acc + a.total, 0);
    const avgQuizAccuracy =
      totalPossible > 0 ? Math.round((totalScored / totalPossible) * 100) : 0;

    const flashcardsMastered = flashcardSets.reduce(
      (acc, f) => acc + f.masteredCount,
      0
    );

    return NextResponse.json({
      authenticated: true,
      canConfigureServerKey:
        process.env.NODE_ENV !== "production" || Boolean(user.isAdmin),
      profile: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        creditsBalance: user.creditsBalance,
        xpPoints: user.xpPoints,
        streakDays: user.streakDays,
        preferredLang: user.preferredLang,
        preferredLevel: user.preferredLevel,
        planTier: user.planTier,
      },
      hasServerKey,
      stats: {
        totalLessons,
        totalCourses,
        quizAttemptsCount: quizAttempts.length,
        avgQuizAccuracy,
        flashcardsMastered,
      },
      recentLessons,
      courses,
    });
  } catch (error) {
    console.error("Dashboard GET error:", error);
    return NextResponse.json({ error: "Failed to load dashboard" }, { status: 500 });
  }
}
