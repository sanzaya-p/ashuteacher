import { NextRequest, NextResponse } from "next/server";
import { connection } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  await connection();
  try {
    const { id } = await context.params;
    if (!id || id.length > 64) {
      return NextResponse.json({ error: "Invalid challenge link" }, { status: 400 });
    }

    const quiz = await prisma.quiz.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        topic: true,
        level: true,
        language: true,
        questionsJson: true,
        totalQuestions: true,
        bestScore: true,
        userId: true,
        user: {
          select: { name: true },
        },
      },
    });

    if (!quiz) {
      return NextResponse.json({ error: "Quiz challenge not found" }, { status: 404 });
    }

    let questions: unknown[] = [];
    try {
      const parsed = JSON.parse(quiz.questionsJson || "[]");
      if (Array.isArray(parsed)) questions = parsed;
    } catch {
      questions = [];
    }

    if (questions.length === 0) {
      return NextResponse.json({ error: "Quiz has no questions" }, { status: 404 });
    }

    const creatorFirstName = (quiz.user?.name || "A Classmate")
      .trim()
      .split(/\s+/)[0];

    return NextResponse.json({
      quiz: {
        id: quiz.id,
        title: quiz.title,
        topic: quiz.topic,
        level: quiz.level,
        language: quiz.language,
        totalQuestions: questions.length,
        bestScore: quiz.bestScore,
        questions,
        creatorId: quiz.userId,
        creatorFirstName,
      },
    });
  } catch (error) {
    console.error("Challenge quiz GET error:", error);
    return NextResponse.json(
      { error: "Failed to load quiz challenge" },
      { status: 500 }
    );
  }
}
