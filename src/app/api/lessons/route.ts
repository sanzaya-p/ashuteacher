import { NextRequest, NextResponse } from "next/server";
import { connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  await connection();
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ lessons: [] });
    }

    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim() || "";
    const mode = searchParams.get("mode")?.trim() || "";
    const favoriteOnly = searchParams.get("favorite") === "true";

    const lessons = await prisma.lesson.findMany({
      where: {
        userId: user.id,
        ...(mode && mode !== "all" ? { mode } : {}),
        ...(favoriteOnly ? { isFavorite: true } : {}),
        ...(q
          ? {
              OR: [
                { title: { contains: q } },
                { subject: { contains: q } },
                { topic: { contains: q } },
                { content: { contains: q } },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: "desc" },
      take: 100,
      select: {
        id: true,
        title: true,
        subject: true,
        topic: true,
        mode: true,
        sourceType: true,
        language: true,
        level: true,
        isFavorite: true,
        courseId: true,
        chapterId: true,
        createdAt: true,
        updatedAt: true,
        content: true,
        _count: {
          select: { messages: true, quizzes: true },
        },
      },
    });

    return NextResponse.json({
      lessons: lessons.map((l) => ({
        ...l,
        excerpt: l.content.replace(/[#*`$>]/g, "").slice(0, 180),
      })),
    });
  } catch (error) {
    console.error("Lessons GET error:", error);
    return NextResponse.json({ error: "Failed to load lessons" }, { status: 500 });
  }
}
