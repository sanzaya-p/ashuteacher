import { NextRequest, NextResponse } from "next/server";
import { connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthUser } from "@/lib/auth";
import { handleApiError } from "@/lib/api-error";
import type { FlashcardItem } from "@/lib/constants";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  await connection();
  try {
    const user = await requireAuthUser();
    const { id } = await context.params;
    const flashcardSet = await prisma.flashcardSet.findFirst({
      where: { id, userId: user.id },
    });
    if (!flashcardSet) {
      return NextResponse.json({ error: "Deck not found" }, { status: 404 });
    }
    return NextResponse.json({ flashcardSet });
  } catch (error) {
    return handleApiError(error, "Failed to load deck");
  }
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuthUser();
    const { id } = await context.params;
    const existing = await prisma.flashcardSet.findFirst({
      where: { id, userId: user.id },
      select: { id: true },
    });
    if (!existing) {
      return NextResponse.json({ error: "Deck not found" }, { status: 404 });
    }

    const body = await req.json();
    const { cards } = body as { cards: FlashcardItem[] };

    const masteredCount = Array.isArray(cards)
      ? cards.filter((c) => c.status === "mastered").length
      : 0;

    const updated = await prisma.flashcardSet.update({
      where: { id },
      data: {
        cardsJson: JSON.stringify(cards || []),
        masteredCount,
      },
    });

    return NextResponse.json({ flashcardSet: updated });
  } catch (error) {
    return handleApiError(error, "Failed to update deck");
  }
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuthUser();
    const { id } = await context.params;
    await prisma.flashcardSet.deleteMany({ where: { id, userId: user.id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error, "Failed to delete deck");
  }
}
