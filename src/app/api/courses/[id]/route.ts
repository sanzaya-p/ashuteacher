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
    const course = await prisma.course.findFirst({
      where: { id, userId: user.id },
      include: {
        lessons: {
          orderBy: { createdAt: "desc" },
          select: { id: true, title: true, chapterId: true, createdAt: true },
        },
      },
    });
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }
    return NextResponse.json({ course });
  } catch (error) {
    return handleApiError(error, "Failed to load course");
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
    const { toggleChapterId } = body;

    const course = await prisma.course.findFirst({
      where: { id, userId: user.id },
    });
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    let completed: string[] = JSON.parse(course.completedChaptersJson || "[]");
    if (toggleChapterId) {
      if (completed.includes(toggleChapterId)) {
        completed = completed.filter((c) => c !== toggleChapterId);
      } else {
        completed.push(toggleChapterId);
      }
    }

    const modules = JSON.parse(course.modulesJson || "[]");
    const totalChapters = modules.reduce(
      (acc: number, m: { chapters?: unknown[] }) =>
        acc + (Array.isArray(m.chapters) ? m.chapters.length : 0),
      0
    );
    const progressPercent =
      totalChapters > 0
        ? Math.min(100, Math.round((completed.length / totalChapters) * 100))
        : 0;

    const updated = await prisma.course.update({
      where: { id },
      data: {
        completedChaptersJson: JSON.stringify(completed),
        progressPercent,
      },
    });

    return NextResponse.json({ course: updated });
  } catch (error) {
    return handleApiError(error, "Failed to update course");
  }
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuthUser();
    const { id } = await context.params;
    await prisma.course.deleteMany({ where: { id, userId: user.id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error, "Failed to delete course");
  }
}
