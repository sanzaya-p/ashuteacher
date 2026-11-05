import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  buildLanguageDirective,
  createGeminiClient,
  resolveModelName,
} from "@/lib/gemini";
import { requireAuthUser } from "@/lib/auth";
import { CREDIT_COSTS, refundCredits, spendCredits } from "@/lib/credits";
import { handleApiError } from "@/lib/api-error";

export async function POST(req: NextRequest) {
  let chargedUserId: string | null = null;
  try {
    const user = await requireAuthUser();
    const body = await req.json();
    const {
      lessonId,
      question,
      lessonContext = "",
      topic = "Current Lesson",
      language = "en-US",
      level = "Intermediate",
      history = [],
      model: requestedModel,
    } = body;

    if (!question || typeof question !== "string") {
      return NextResponse.json({ error: "Question is required" }, { status: 400 });
    }

    const headerKey =
      process.env.NODE_ENV !== "production" || user.isAdmin
        ? req.headers.get("x-gemini-api-key")
        : null;
    const ai = createGeminiClient(headerKey);
    const model = resolveModelName(requestedModel || user.preferredModel);
    const languageDirective = buildLanguageDirective(language);

    const { remainingCredits } = await spendCredits({
      userId: user.id,
      cost: CREDIT_COSTS.DOUBT,
      description: `Raise Hand Q&A: ${question.slice(0, 60)}`,
    });
    chargedUserId = user.id;

    if (lessonId) {
      const ownsLesson = await prisma.lesson.findFirst({
        where: { id: lessonId, userId: user.id },
        select: { id: true },
      });
      if (ownsLesson) {
        await prisma.doubtMessage.create({
          data: { lessonId, role: "user", content: question },
        });
      }
    }

    const systemInstruction = `You are "AshuTeacher", a patient, encouraging, and crystal-clear tutor answering a student's live "Raised Hand" question during a lesson on "${topic}".
Student Level: ${level}.
Formatting: Use concise Markdown and proper LaTeX ($...$ for inline math, $$...$$ for block equations). Address their exact confusion directly with an intuitive analogy or worked mini-example.

${languageDirective}

Current Blackboard Lesson Context:
${String(lessonContext).slice(0, 24000)}`;

    const contents = [
      ...history.slice(-8).map((m: { role: string; content: string }) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      })),
      { role: "user", parts: [{ text: question }] },
    ];

    const responseStream = await ai.models.generateContentStream({
      model,
      contents,
      config: { systemInstruction },
    });

    const encoder = new TextEncoder();
    let assistantReply = "";

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of responseStream) {
            const text = chunk.text || "";
            if (text) {
              assistantReply += text;
              controller.enqueue(encoder.encode(text));
            }
          }

          if (lessonId && assistantReply) {
            await prisma.doubtMessage
              .create({
                data: { lessonId, role: "assistant", content: assistantReply },
              })
              .catch(() => null);
          }
          controller.close();
        } catch (err) {
          if (!assistantReply) {
            await refundCredits({
              userId: user.id,
              amount: CREDIT_COSTS.DOUBT,
              description: "Refund for interrupted Q&A",
            });
          }
          controller.error(err);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "X-Credits-Remaining": String(remainingCredits),
      },
    });
  } catch (error) {
    if (chargedUserId) {
      await refundCredits({
        userId: chargedUserId,
        amount: CREDIT_COSTS.DOUBT,
        description: "Automatic refund after failed Q&A",
      });
    }
    return handleApiError(error, "Failed to answer doubt");
  }
}
