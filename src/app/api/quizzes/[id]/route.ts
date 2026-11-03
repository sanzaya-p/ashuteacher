import { NextRequest, NextResponse } from "next/server";
import { connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthUser } from "@/lib/auth";
import { handleApiError } from "@/lib/api-error";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  await connection();
  try {
    const user = await requireAuthUser();
    const { id } = await context.params;
    const quiz = await prisma.quiz.findFirst({
      where: { id, userId: user.id },
      include: { attempts: { orderBy: { createdAt: "desc" } } },
    });
    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }
    return NextResponse.json({ quiz });
  } catch (error) {
    return handleApiError(error, "Failed to load quiz");
  }
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuthUser();
    const { id } = await context.params;
    const body = await req.json();
    const { score, total, answers = {}, timeTakenSec = 0 } = body;

    const quiz = await prisma.quiz.findFirst({
      where: { id, userId: user.id },
    });
    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    const numericScore = Number(score) || 0;
    const numericTotal = Number(total) || quiz.totalQuestions;

    const attempt = await prisma.quizAttempt.create({
      data: {
        quizId: id,
        score: numericScore,
        total: numericTotal,
        answersJson: JSON.stringify(answers),
        timeTakenSec: Number(timeTakenSec) || 0,
      },
    });

    const updatedQuiz = await prisma.quiz.update({
      where: { id },
      data: {
        attemptsCount: { increment: 1 },
        bestScore: Math.max(quiz.bestScore, numericScore),
      },
    });

    await prisma.user
      .update({
        where: { id: user.id },
        data: { xpPoints: { increment: 15 + numericScore * 5 } },
      })
      .catch(() => null);

    return NextResponse.json({ attempt, quiz: updatedQuiz });
  } catch (error) {
    return handleApiError(error, "Failed to record attempt");
  }
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuthUser();
    const { id } = await context.params;
    await prisma.quiz.deleteMany({ where: { id, userId: user.id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error, "Failed to delete quiz");
  }
}
