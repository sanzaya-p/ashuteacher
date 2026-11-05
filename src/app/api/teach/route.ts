import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  buildTeachingSystemPrompt,
  createGeminiClient,
  resolveModelName,
} from "@/lib/gemini";
import { requireAuthUser } from "@/lib/auth";
import { CREDIT_COSTS, refundCredits, spendCredits } from "@/lib/credits";
import { handleApiError } from "@/lib/api-error";
import { countAllTopicsInSubjects } from "@/app/api/academy/[id]/route";

export async function POST(req: NextRequest) {
  let chargedUserId: string | null = null;
  let chargedAmount = 0;

  try {
    const user = await requireAuthUser();
    const body = await req.json();
    const {
      topic,
      subject = "General",
      mode = "lesson",
      sourceType = "topic",
      sourceContent = "",
      language = "en-US",
      level = "Intermediate",
      courseId,
      chapterId,
      programId,
      programTopicId,
      curriculumContext = "",
      model: requestedModel,
      attachment,
    } = body;

    if (!topic && !sourceContent && !attachment?.base64Data) {
      return NextResponse.json(
        { error: "Please provide a topic, text content, or file attachment." },
        { status: 400 }
      );
    }

    const headerKey =
      process.env.NODE_ENV !== "production" || user.isAdmin
        ? req.headers.get("x-gemini-api-key")
        : null;
    const ai = createGeminiClient(headerKey);
    const model = resolveModelName(requestedModel || user.preferredModel);

    // Deduct credits atomically
    const cost =
      mode === "solve" ? CREDIT_COSTS.SOLVE_PAPER : CREDIT_COSTS.LESSON;
    const effectiveTitle = (topic || "Untitled Session").slice(0, 140);

    const { remainingCredits } = await spendCredits({
      userId: user.id,
      cost,
      description: `${mode === "solve" ? "Solved Paper" : "Lesson"}: ${effectiveTitle}`,
      metadata: { mode, model },
    });
    chargedUserId = user.id;
    chargedAmount = cost;

    const systemInstruction = buildTeachingSystemPrompt({
      mode,
      level,
      languageCode: language,
      subject,
      curriculumContext: curriculumContext ? String(curriculumContext) : undefined,
    });

    let userPrompt = "";
    if (mode === "solve") {
      userPrompt = `Solve all questions/problems thoroughly from the material below.\nTopic/Title: ${effectiveTitle}\n\n${
        sourceContent
          ? `Extracted Text:\n${sourceContent}`
          : "Inspect the attached document/image carefully."
      }`;
    } else if (mode === "story") {
      userPrompt = `Create an unforgettable educational story teaching:\nTopic: ${effectiveTitle}${
        subject ? ` (${subject})` : ""
      }\n\n${sourceContent ? `Reference Material:\n${sourceContent}` : ""}`;
    } else if (mode === "cheatsheet") {
      userPrompt = `Create a comprehensive, structured Formula & Principle Cheat Sheet for:\nTopic: ${effectiveTitle}${
        subject ? ` (${subject})` : ""
      }\n\n${sourceContent ? `Source Material:\n${sourceContent}` : ""}`;
    } else {
      userPrompt = `Teach an engaging, comprehensive blackboard lesson on:\nTopic: ${effectiveTitle}${
        subject ? `\nSubject: ${subject}` : ""
      }\n\n${
        sourceContent
          ? `Base your lesson thoroughly on this source material (expanding and clarifying concepts where helpful):\n\n${sourceContent}`
          : ""
      }`;
    }

    const parts: Array<
      { text: string } | { inlineData: { mimeType: string; data: string } }
    > = [{ text: userPrompt }];

    if (attachment?.base64Data && attachment?.mimeType) {
      parts.push({
        inlineData: {
          mimeType: attachment.mimeType,
          data: attachment.base64Data,
        },
      });
    }

    const createdLesson = await prisma.lesson.create({
      data: {
        userId: user.id,
        title: effectiveTitle,
        subject: subject || "General",
        topic: effectiveTitle,
        mode,
        sourceType,
        sourceContent: (sourceContent || topic || "").slice(0, 50000),
        language,
        level,
        content: "",
        courseId: courseId || null,
        chapterId: chapterId || null,
        programId: programId || null,
        programTopicId: programTopicId || null,
      },
    });

    const responseStream = await ai.models.generateContentStream({
      model,
      contents: [{ role: "user", parts }],
      config: { systemInstruction },
    });

    const encoder = new TextEncoder();
    let fullContent = "";

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of responseStream) {
            const text = chunk.text || "";
            if (text) {
              fullContent += text;
              controller.enqueue(encoder.encode(text));
            }
          }

          await prisma.lesson.update({
            where: { id: createdLesson.id },
            data: { content: fullContent },
          });

          await prisma.user
            .update({
              where: { id: user.id },
              data: { xpPoints: { increment: 25 } },
            })
            .catch(() => null);

          if (courseId && chapterId) {
            const course = await prisma.course.findFirst({
              where: { id: courseId, userId: user.id },
            });
            if (course) {
              const completed: string[] = JSON.parse(
                course.completedChaptersJson || "[]"
              );
              if (!completed.includes(chapterId)) {
                completed.push(chapterId);
                const modules = JSON.parse(course.modulesJson || "[]");
                const totalChapters = modules.reduce(
                  (acc: number, m: { chapters?: unknown[] }) =>
                    acc + (Array.isArray(m.chapters) ? m.chapters.length : 0),
                  0
                );
                const progressPercent =
                  totalChapters > 0
                    ? Math.min(
                        100,
                        Math.round((completed.length / totalChapters) * 100)
                      )
                    : 0;
                await prisma.course.update({
                  where: { id: courseId },
                  data: {
                    completedChaptersJson: JSON.stringify(completed),
                    progressPercent,
                  },
                });
              }
            }
          }

          if (programId && programTopicId) {
            const program = await prisma.learningProgram.findFirst({
              where: { id: programId, userId: user.id },
            });
            if (program) {
              const completedTopics: string[] = JSON.parse(
                program.completedTopicsJson || "[]"
              );
              if (!completedTopics.includes(programTopicId)) {
                completedTopics.push(programTopicId);
                const subjects = JSON.parse(program.subjectsJson || "[]");
                const totalTopics = countAllTopicsInSubjects(subjects);
                const progressPercent =
                  totalTopics > 0
                    ? Math.min(
                        100,
                        Math.round((completedTopics.length / totalTopics) * 100)
                      )
                    : 0;
                await prisma.learningProgram.update({
                  where: { id: programId },
                  data: {
                    completedTopicsJson: JSON.stringify(completedTopics),
                    progressPercent,
                  },
                });
              }
            }
          }

          controller.close();
        } catch (streamErr) {
          console.error("Streaming error:", streamErr);
          if (!fullContent) {
            await refundCredits({
              userId: user.id,
              amount: cost,
              description: `Refund for interrupted ${mode} session`,
            });
          } else {
            await prisma.lesson
              .update({
                where: { id: createdLesson.id },
                data: { content: fullContent },
              })
              .catch(() => null);
          }
          controller.error(streamErr);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "X-Lesson-Id": createdLesson.id,
        "X-Credits-Remaining": String(remainingCredits),
      },
    });
  } catch (error) {
    if (chargedUserId && chargedAmount > 0) {
      await refundCredits({
        userId: chargedUserId,
        amount: chargedAmount,
        description: "Automatic refund after failed AI request",
      });
    }
    return handleApiError(error, "Failed to generate lesson");
  }
}
