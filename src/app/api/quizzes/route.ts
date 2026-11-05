import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { connection } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  buildLanguageDirective,
  createGeminiClient,
  getLanguageName,
  QUIZ_JSON_SCHEMA,
  resolveModelName,
} from "@/lib/gemini";
import { getCurrentUser, requireAuthUser } from "@/lib/auth";
import { CREDIT_COSTS, refundCredits, spendCredits } from "@/lib/credits";
import { handleApiError } from "@/lib/api-error";

function buildQuizCacheKey(params: {
  topic: string;
  count: number;
  level: string;
  language: string;
}): string {
  const norm = (v: string) => v.trim().toLowerCase().replace(/\s+/g, " ");
  const raw = `quiz:v1|${norm(params.topic)}|${params.count}|${norm(params.level)}|${norm(params.language)}`;
  return `quiz:${crypto.createHash("sha256").update(raw).digest("hex")}`;
}

export async function GET() {
  await connection();
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ quizzes: [] });

    const quizzes = await prisma.quiz.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        attempts: { orderBy: { createdAt: "desc" }, take: 3 },
      },
    });
    return NextResponse.json({ quizzes });
  } catch (error) {
    console.error("Quizzes GET error:", error);
    return NextResponse.json({ error: "Failed to load quizzes" }, { status: 500 });
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
      questionCount = 10,
      level = "Intermediate",
      language = "en-US",
      lessonId,
      model: requestedModel,
    } = body;

    if (!topic && !sourceContent) {
      return NextResponse.json(
        { error: "Topic or source material is required to generate a quiz." },
        { status: 400 }
      );
    }

    const count = Math.max(3, Math.min(Number(questionCount) || 10, 25));
    const cleanTopic = String(topic || "").trim();
    const isCacheable = Boolean(
      cleanTopic.length >= 3 &&
        !String(sourceContent || "").trim() &&
        !lessonId &&
        req.headers.get("x-no-cache") !== "1"
    );

    const cacheKey = isCacheable
      ? buildQuizCacheKey({ topic: cleanTopic, count, level, language })
      : "";

    let cachedPayload: { title?: string; questions?: unknown[] } | null = null;
    if (isCacheable) {
      const [cachedRow, existingUserQuiz] = await Promise.all([
        prisma.catalogCache
          .findUnique({ where: { cacheKey } })
          .catch(() => null),
        prisma.quiz
          .findFirst({
            where: {
              userId: user.id,
              topic: cleanTopic,
              level,
              language,
            },
            select: { id: true },
          })
          .catch(() => null),
      ]);

      // Serve from global cache if another learner generated it AND this learner hasn't already taken it
      if (cachedRow && !existingUserQuiz) {
        try {
          const parsedCache = JSON.parse(cachedRow.payloadJson);
          if (
            Array.isArray(parsedCache?.questions) &&
            parsedCache.questions.length >= 3
          ) {
            cachedPayload = parsedCache;
          }
        } catch {
          cachedPayload = null;
        }
      }
    }

    const headerKey =
      process.env.NODE_ENV !== "production" || user.isAdmin
        ? req.headers.get("x-gemini-api-key")
        : null;
    const ai = cachedPayload ? null : createGeminiClient(headerKey);
    const model = resolveModelName(requestedModel || user.preferredModel);

    const { remainingCredits } = await spendCredits({
      userId: user.id,
      cost: CREDIT_COSTS.QUIZ,
      description: `Quiz (${count} Qs): ${(cleanTopic || "Custom").slice(0, 60)}`,
      metadata: { cached: Boolean(cachedPayload) },
    });
    chargedUserId = user.id;

    if (cachedPayload && Array.isArray(cachedPayload.questions)) {
      const created = await prisma.quiz.create({
        data: {
          userId: user.id,
          title: cachedPayload.title || `${cleanTopic || "Practice"} Quiz`,
          topic: cleanTopic || "Custom Material",
          language,
          level,
          questionsJson: JSON.stringify(cachedPayload.questions),
          totalQuestions: cachedPayload.questions.length,
          lessonId: null,
        },
      });
      return NextResponse.json({
        quiz: created,
        remainingCredits,
        cached: true,
      });
    }

    const languageName = getLanguageName(language);
    const languageDirective = buildLanguageDirective(language);

    const response = await ai!.models.generateContent({
      model,
      contents: `Generate an engaging, rigorous ${count}-question multiple-choice quiz in ${languageName} for a ${level}-level student.
Topic: ${cleanTopic || "Provided Study Material"}
${sourceContent ? `\nSource Material:\n${String(sourceContent).slice(0, 28000)}` : ""}

Requirements:
- Each question MUST have exactly 4 distinct options and a 0-based correctIndex (0, 1, 2, or 3).
- Use $...$ inline LaTeX for all mathematical formulas, variables, or equations.
- Provide a thorough, educational step-by-step explanation for every question.

${languageDirective}`,
      config: {
        responseMimeType: "application/json",
        responseJsonSchema: QUIZ_JSON_SCHEMA,
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    const questions = Array.isArray(parsed.questions) ? parsed.questions : [];
    const quizTitle = parsed.title || `${cleanTopic || "Practice"} Quiz`;

    if (isCacheable && cacheKey && questions.length >= 3) {
      await prisma.catalogCache
        .upsert({
          where: { cacheKey },
          create: {
            cacheKey,
            nodeType: "QUIZ",
            payloadJson: JSON.stringify({ title: quizTitle, questions }),
          },
          update: {
            payloadJson: JSON.stringify({ title: quizTitle, questions }),
          },
        })
        .catch(() => null);
    }

    const created = await prisma.quiz.create({
      data: {
        userId: user.id,
        title: quizTitle,
        topic: cleanTopic || "Custom Material",
        language,
        level,
        questionsJson: JSON.stringify(questions),
        totalQuestions: questions.length,
        lessonId: lessonId || null,
      },
    });

    return NextResponse.json({ quiz: created, remainingCredits, cached: false });
  } catch (error) {
    if (chargedUserId) {
      await refundCredits({
        userId: chargedUserId,
        amount: CREDIT_COSTS.QUIZ,
        description: "Automatic refund after failed quiz generation",
      });
    }
    return handleApiError(error, "Failed to generate quiz");
  }
}
