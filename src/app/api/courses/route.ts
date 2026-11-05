import { NextRequest, NextResponse } from "next/server";
import { connection } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  buildLanguageDirective,
  COURSE_SYLLABUS_SCHEMA,
  createGeminiClient,
  getLanguageName,
  resolveModelName,
} from "@/lib/gemini";
import { COURSE_GRADIENTS } from "@/lib/constants";
import { getCurrentUser, requireAuthUser } from "@/lib/auth";
import { CREDIT_COSTS, refundCredits, spendCredits } from "@/lib/credits";
import { handleApiError } from "@/lib/api-error";

export async function GET() {
  await connection();
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ courses: [] });

    const courses = await prisma.course.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
      include: {
        _count: { select: { lessons: true } },
      },
    });
    return NextResponse.json({ courses });
  } catch (error) {
    console.error("Courses GET error:", error);
    return NextResponse.json({ error: "Failed to load courses" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  let chargedUserId: string | null = null;
  try {
    const user = await requireAuthUser();
    const body = await req.json();
    const {
      goal,
      subject = "",
      level = "Intermediate",
      language = "en-US",
      moduleCount = 4,
      model: requestedModel,
    } = body;

    if (!goal || typeof goal !== "string") {
      return NextResponse.json(
        { error: "Course topic or learning goal is required" },
        { status: 400 }
      );
    }

    const headerKey =
      process.env.NODE_ENV !== "production" || user.isAdmin
        ? req.headers.get("x-gemini-api-key")
        : null;
    const ai = createGeminiClient(headerKey);
    const model = resolveModelName(requestedModel || user.preferredModel);
    const languageName = getLanguageName(language);
    const languageDirective = buildLanguageDirective(language);

    const { remainingCredits } = await spendCredits({
      userId: user.id,
      cost: CREDIT_COSTS.COURSE,
      description: `Course Syllabus: ${goal.slice(0, 80)}`,
    });
    chargedUserId = user.id;

    const response = await ai.models.generateContent({
      model,
      contents: `Design a structured, progressive ${moduleCount}-module course curriculum (with 3–4 chapters per module) for a ${level}-level learner in ${languageName}.
Learning Goal / Topic: "${goal}"${subject ? `\nSubject Area: ${subject}` : ""}
Ensure module IDs are mod-1, mod-2... and chapter IDs are unique like ch-1-1, ch-1-2, etc.

${languageDirective}`,
      config: {
        responseMimeType: "application/json",
        responseJsonSchema: COURSE_SYLLABUS_SCHEMA,
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    const count = await prisma.course.count({ where: { userId: user.id } });
    const coverGradient = COURSE_GRADIENTS[count % COURSE_GRADIENTS.length];

    const created = await prisma.course.create({
      data: {
        userId: user.id,
        title: parsed.title || goal,
        subject: parsed.subject || subject || "General",
        description: parsed.description || `Structured learning path for ${goal}`,
        level,
        language,
        coverGradient,
        modulesJson: JSON.stringify(parsed.modules || []),
        completedChaptersJson: "[]",
        progressPercent: 0,
      },
    });

    await prisma.user
      .update({
        where: { id: user.id },
        data: { xpPoints: { increment: 30 } },
      })
      .catch(() => null);

    return NextResponse.json({ course: created, remainingCredits });
  } catch (error) {
    if (chargedUserId) {
      await refundCredits({
        userId: chargedUserId,
        amount: CREDIT_COSTS.COURSE,
        description: "Automatic refund after failed course generation",
      });
    }
    return handleApiError(error, "Failed to create course");
  }
}
