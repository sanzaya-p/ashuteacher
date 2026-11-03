import { NextRequest, NextResponse } from "next/server";
import { connection } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  createGeminiClient,
  FLASHCARD_JSON_SCHEMA,
  getLanguageName,
  resolveModelName,
} from "@/lib/gemini";
import { getCurrentUser, requireAuthUser } from "@/lib/auth";
import { CREDIT_COSTS, refundCredits, spendCredits } from "@/lib/credits";
import { handleApiError } from "@/lib/api-error";

export async function GET() {
  await connection();
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ flashcardSets: [] });

    const sets = await prisma.flashcardSet.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
    });
    return NextResponse.json({ flashcardSets: sets });
  } catch (error) {
    console.error("Flashcards GET error:", error);
    return NextResponse.json({ error: "Failed to load flashcards" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  let chargedUserId: string | null = null;
  try {
    const user = await requireAuthUser();
    const body = await req.json();
    const {
      topic,
      sourceContent = "",
      cardCount = 12,
      language = "en-US",
      level = "Intermediate",
      lessonId,
      model: requestedModel,
    } = body;

    if (!topic && !sourceContent) {
      return NextResponse.json(
        { error: "Topic or source content is required" },
        { status: 400 }
      );
    }

    const count = Math.max(5, Math.min(Number(cardCount) || 12, 30));
    const headerKey =
      process.env.NODE_ENV !== "production" || user.isAdmin
        ? req.headers.get("x-gemini-api-key")
        : null;
    const ai = createGeminiClient(headerKey);
    const model = resolveModelName(requestedModel || user.preferredModel);
    const languageName = getLanguageName(language);

    const { remainingCredits } = await spendCredits({
      userId: user.id,
      cost: CREDIT_COSTS.FLASHCARDS,
      description: `Flashcards (${count}): ${(topic || "Custom").slice(0, 60)}`,
    });
    chargedUserId = user.id;

    const response = await ai.models.generateContent({
      model,
      contents: `Create ${count} high-retention active-recall flashcards in ${languageName} for a ${level}-level student.
Topic: ${topic || "Study Material"}
${sourceContent ? `\nSource Material:\n${String(sourceContent).slice(0, 28000)}` : ""}
Use $...$ LaTeX for mathematical expressions where needed.`,
      config: {
        responseMimeType: "application/json",
        responseJsonSchema: FLASHCARD_JSON_SCHEMA,
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    const cards = (Array.isArray(parsed.cards) ? parsed.cards : []).map(
      (c: { id?: string; front: string; back: string; hint?: string }, idx: number) => ({
        id: c.id || `card-${idx + 1}`,
        front: c.front,
        back: c.back,
        hint: c.hint || "",
        status: "new",
      })
    );

    const created = await prisma.flashcardSet.create({
      data: {
        userId: user.id,
        title: parsed.title || `${topic || "Study"} Flashcards`,
        topic: topic || "Custom Deck",
        language,
        cardsJson: JSON.stringify(cards),
        totalCards: cards.length,
        masteredCount: 0,
        lessonId: lessonId || null,
      },
    });

    return NextResponse.json({ flashcardSet: created, remainingCredits });
  } catch (error) {
    if (chargedUserId) {
      await refundCredits({
        userId: chargedUserId,
        amount: CREDIT_COSTS.FLASHCARDS,
        description: "Automatic refund after failed flashcard generation",
      });
    }
    return handleApiError(error, "Failed to generate flashcards");
  }
}
