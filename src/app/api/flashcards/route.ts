import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { connection } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  buildLanguageDirective,
  createGeminiClient,
  FLASHCARD_JSON_SCHEMA,
  getLanguageName,
  resolveModelName,
} from "@/lib/gemini";
import { getCurrentUser, requireAuthUser } from "@/lib/auth";
import { CREDIT_COSTS, refundCredits, spendCredits } from "@/lib/credits";
import { handleApiError } from "@/lib/api-error";

function buildFlashcardCacheKey(params: {
  topic: string;
  count: number;
  level: string;
  language: string;
}): string {
  const norm = (v: string) => v.trim().toLowerCase().replace(/\s+/g, " ");
  const raw = `flashcards:v1|${norm(params.topic)}|${params.count}|${norm(params.level)}|${norm(params.language)}`;
  return `flashcards:${crypto.createHash("sha256").update(raw).digest("hex")}`;
}

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
    const cleanTopic = String(topic || "").trim();
    const isCacheable = Boolean(
      cleanTopic.length >= 3 &&
        !String(sourceContent || "").trim() &&
        !lessonId &&
        req.headers.get("x-no-cache") !== "1"
    );

    const cacheKey = isCacheable
      ? buildFlashcardCacheKey({ topic: cleanTopic, count, level, language })
      : "";

    let cachedDeck: {
      title?: string;
      cards?: Array<{ id: string; front: string; back: string; hint: string; status: string }>;
    } | null = null;

    if (isCacheable) {
      const [cachedRow, existingUserDeck] = await Promise.all([
        prisma.catalogCache
          .findUnique({ where: { cacheKey } })
          .catch(() => null),
        prisma.flashcardSet
          .findFirst({
            where: {
              userId: user.id,
              topic: cleanTopic,
              language,
            },
            select: { id: true },
          })
          .catch(() => null),
      ]);

      if (cachedRow && !existingUserDeck) {
        try {
          const parsedCache = JSON.parse(cachedRow.payloadJson);
          if (
            Array.isArray(parsedCache?.cards) &&
            parsedCache.cards.length >= 3
          ) {
            cachedDeck = parsedCache;
          }
        } catch {
          cachedDeck = null;
        }
      }
    }

    const headerKey =
      process.env.NODE_ENV !== "production" || user.isAdmin
        ? req.headers.get("x-gemini-api-key")
        : null;
    const ai = cachedDeck ? null : createGeminiClient(headerKey);
    const model = resolveModelName(requestedModel || user.preferredModel);

    const { remainingCredits } = await spendCredits({
      userId: user.id,
      cost: CREDIT_COSTS.FLASHCARDS,
      description: `Flashcards (${count}): ${(cleanTopic || "Custom").slice(0, 60)}`,
      metadata: { cached: Boolean(cachedDeck) },
    });
    chargedUserId = user.id;

    if (cachedDeck && Array.isArray(cachedDeck.cards)) {
      const freshCards = cachedDeck.cards.map((c, idx) => ({
        id: c.id || `card-${idx + 1}`,
        front: c.front,
        back: c.back,
        hint: c.hint || "",
        status: "new",
      }));

      const created = await prisma.flashcardSet.create({
        data: {
          userId: user.id,
          title: cachedDeck.title || `${cleanTopic || "Study"} Flashcards`,
          topic: cleanTopic || "Custom Deck",
          language,
          cardsJson: JSON.stringify(freshCards),
          totalCards: freshCards.length,
          masteredCount: 0,
          lessonId: null,
        },
      });
      return NextResponse.json({
        flashcardSet: created,
        remainingCredits,
        cached: true,
      });
    }

    const languageName = getLanguageName(language);
    const languageDirective = buildLanguageDirective(language);

    const response = await ai!.models.generateContent({
      model,
      contents: `Create ${count} high-retention active-recall flashcards in ${languageName} for a ${level}-level student.
Topic: ${cleanTopic || "Study Material"}
${sourceContent ? `\nSource Material:\n${String(sourceContent).slice(0, 28000)}` : ""}
Use $...$ LaTeX for mathematical expressions where needed.

${languageDirective}`,
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
    const deckTitle = parsed.title || `${cleanTopic || "Study"} Flashcards`;

    if (isCacheable && cacheKey && cards.length >= 3) {
      await prisma.catalogCache
        .upsert({
          where: { cacheKey },
          create: {
            cacheKey,
            nodeType: "FLASHCARDS",
            payloadJson: JSON.stringify({ title: deckTitle, cards }),
          },
          update: {
            payloadJson: JSON.stringify({ title: deckTitle, cards }),
          },
        })
        .catch(() => null);
    }

    const created = await prisma.flashcardSet.create({
      data: {
        userId: user.id,
        title: deckTitle,
        topic: cleanTopic || "Custom Deck",
        language,
        cardsJson: JSON.stringify(cards),
        totalCards: cards.length,
        masteredCount: 0,
        lessonId: lessonId || null,
      },
    });

    return NextResponse.json({
      flashcardSet: created,
      remainingCredits,
      cached: false,
    });
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
