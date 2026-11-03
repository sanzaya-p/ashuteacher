import { NextRequest, NextResponse } from "next/server";
import { connection } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  createGeminiClient,
  getLanguageName,
  QUIZ_JSON_SCHEMA,
  resolveModelName,
} from "@/lib/gemini";
import { getCurrentUser, requireAuthUser } from "@/lib/auth";
import { CREDIT_COSTS, refundCredits, spendCredits } from "@/lib/credits";
import { handleApiError } from "@/lib/api-error";

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
    const headerKey =
      process.env.NODE_ENV !== "production" || user.isAdmin
        ? req.headers.get("x-gemini-api-key")
        : null;
    const ai = createGeminiClient(headerKey);
    const model = resolveModelName(requestedModel || user.preferredModel);
    const languageName = getLanguageName(language);

    const { remainingCredits } = await spendCredits({
      userId: user.id,
      cost: CREDIT_COSTS.QUIZ,
      description: `Quiz (${count} Qs): ${(topic || "Custom").slice(0, 60)}`,
    });
    chargedUserId = user.id;

    const response = await ai.models.generateContent({
      model,
      contents: `Generate an engaging, rigorous ${count}-question multiple-choice quiz in ${languageName} for a ${level}-level student.
Topic: ${topic || "Provided Study Material"}
${sourceContent ? `\nSource Material:\n${String(sourceContent).slice(0, 28000)}` : ""}

Requirements:
- Each question MUST have exactly 4 distinct options and a 0-based correctIndex (0, 1, 2, or 3).
- Use $...$ inline LaTeX for all mathematical formulas, variables, or equations.
- Provide a thorough, educational step-by-step explanation for every question.`,
      config: {
        responseMimeType: "application/json",
        responseJsonSchema: QUIZ_JSON_SCHEMA,
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    const questions = Array.isArray(parsed.questions) ? parsed.questions : [];

    const created = await prisma.quiz.create({
      data: {
        userId: user.id,
        title: parsed.title || `${topic || "Practice"} Quiz`,
        topic: topic || "Custom Material",
        language,
        level,
        questionsJson: JSON.stringify(questions),
        totalQuestions: questions.length,
        lessonId: lessonId || null,
      },
    });

    return NextResponse.json({ quiz: created, remainingCredits });
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
