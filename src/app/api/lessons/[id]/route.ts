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
    const lesson = await prisma.lesson.findFirst({
      where: { id, userId: user.id },
      include: {
        messages: { orderBy: { createdAt: "asc" } },
        quizzes: {
          orderBy: { createdAt: "desc" },
          select: { id: true, title: true, bestScore: true, totalQuestions: true },
        },
        flashcardSets: {
          orderBy: { createdAt: "desc" },
          select: { id: true, title: true, masteredCount: true, totalCards: true },
        },
      },
    });

    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }
    return NextResponse.json({ lesson });
  } catch (error) {
    return handleApiError(error, "Failed to load lesson");
  }
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuthUser();
    const { id } = await context.params;
    const body = await req.json();
    const { isFavorite, notes, title } = body;

    const existing = await prisma.lesson.findFirst({
      where: { id, userId: user.id },
      select: { id: true },
    });
    if (!existing) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    const updated = await prisma.lesson.update({
      where: { id },
      data: {
        ...(typeof isFavorite === "boolean" ? { isFavorite } : {}),
        ...(typeof notes === "string" ? { notes } : {}),
        ...(typeof title === "string" && title.trim() ? { title: title.trim() } : {}),
      },
    });

    return NextResponse.json({ lesson: updated });
  } catch (error) {
    return handleApiError(error, "Failed to update lesson");
  }
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuthUser();
    const { id } = await context.params;
    await prisma.lesson.deleteMany({ where: { id, userId: user.id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error, "Failed to delete lesson");
  }
}
