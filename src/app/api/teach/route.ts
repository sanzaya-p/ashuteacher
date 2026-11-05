import crypto from "node:crypto";
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

function normalizeKeyPart(val: unknown): string {
  return String(val || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function buildLessonCacheKey(params: {
  mode: string;
  level: string;
  language: string;
  curriculumContext: string;
  subject: string;
  topic: string;
  fullChapter: boolean;
  chapterOutline: string;
}): string {
  const raw = [
    "v1",
    normalizeKeyPart(params.mode),
    normalizeKeyPart(params.level),
    normalizeKeyPart(params.language),
    normalizeKeyPart(params.curriculumContext),
    normalizeKeyPart(params.subject),
    normalizeKeyPart(params.topic),
    params.fullChapter ? "full" : "std",
    normalizeKeyPart(params.chapterOutline),
  ].join("|");
  return crypto.createHash("sha256").update(raw).digest("hex");
}

async function recordLessonProgressAndXp(params: {
  userId: string;
  courseId?: string | null;
  chapterId?: string | null;
  programId?: string | null;
  programTopicId?: string | null;
}) {
  const { userId, courseId, chapterId, programId, programTopicId } = params;

  await prisma.user
    .update({
      where: { id: userId },
      data: { xpPoints: { increment: 25 } },
    })
    .catch(() => null);

  if (courseId && chapterId) {
    const course = await prisma.course
      .findFirst({
        where: { id: courseId, userId },
      })
      .catch(() => null);
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
            ? Math.min(100, Math.round((completed.length / totalChapters) * 100))
            : 0;
        await prisma.course
          .update({
            where: { id: courseId },
            data: {
              completedChaptersJson: JSON.stringify(completed),
              progressPercent,
            },
          })
          .catch(() => null);
      }
    }
  }

  if (programId && programTopicId) {
    const program = await prisma.learningProgram
      .findFirst({
        where: { id: programId, userId },
      })
      .catch(() => null);
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
        await prisma.learningProgram
          .update({
            where: { id: programId },
            data: {
              completedTopicsJson: JSON.stringify(completedTopics),
              progressPercent,
            },
          })
          .catch(() => null);
      }
    }
  }
}

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
      fullChapter = false,
      chapterOutline = "",
      model: requestedModel,
      attachment,
    } = body;

    if (!topic && !sourceContent && !attachment?.base64Data) {
      return NextResponse.json(
        { error: "Please provide a topic, text content, or file attachment." },
        { status: 400 }
      );
    }

    const effectiveTitle = (topic || "Untitled Session").slice(0, 140);
    const model = resolveModelName(requestedModel || user.preferredModel);
    const cost =
      mode === "solve" ? CREDIT_COSTS.SOLVE_PAPER : CREDIT_COSTS.LESSON;

    const isCacheable = Boolean(
      !attachment?.base64Data &&
        !String(sourceContent || "").trim() &&
        mode !== "solve" &&
        effectiveTitle.trim().length >= 3 &&
        req.headers.get("x-no-cache") !== "1"
    );

    const lessonCacheKey = isCacheable
      ? buildLessonCacheKey({
          mode,
          level,
          language,
          curriculumContext: String(curriculumContext || ""),
          subject: String(subject || "General"),
          topic: effectiveTitle,
          fullChapter: Boolean(fullChapter),
          chapterOutline: String(chapterOutline || ""),
        })
      : "";

    const cachedEntry = isCacheable
      ? await prisma.lessonCache
          .findUnique({ where: { cacheKey: lessonCacheKey } })
          .catch(() => null)
      : null;

    const isCacheHit = Boolean(
      cachedEntry && cachedEntry.content && cachedEntry.content.trim().length >= 100
    );

    const headerKey =
      process.env.NODE_ENV !== "production" || user.isAdmin
        ? req.headers.get("x-gemini-api-key")
        : null;
    const ai = isCacheHit ? null : createGeminiClient(headerKey);

    // Deduct Study Credits atomically (strictly enforced on both cache hits and misses)
    const { remainingCredits } = await spendCredits({
      userId: user.id,
      cost,
      description: `${mode === "solve" ? "Solved Paper" : "Lesson"}: ${effectiveTitle}`,
      metadata: { mode, model, cached: isCacheHit },
    });
    chargedUserId = user.id;
    chargedAmount = cost;

    // Zero-API-Call Global Cache Hit Path (<50ms delivery, 0 Gemini quota consumed)
    if (isCacheHit && cachedEntry) {
      const cachedText = cachedEntry.content;
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
          content: cachedText,
          courseId: courseId || null,
          chapterId: chapterId || null,
          programId: programId || null,
          programTopicId: programTopicId || null,
        },
      });

      await prisma.lessonCache
        .update({
          where: { id: cachedEntry.id },
          data: { hitCount: { increment: 1 } },
        })
        .catch(() => null);

      await recordLessonProgressAndXp({
        userId: user.id,
        courseId,
        chapterId,
        programId,
        programTopicId,
      });

      const encoder = new TextEncoder();
      const hitStream = new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode(cachedText));
          controller.close();
        },
      });

      return new Response(hitStream, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "no-cache, no-transform",
          "X-Lesson-Id": createdLesson.id,
          "X-Credits-Remaining": String(remainingCredits),
          "X-Cache": "HIT",
        },
      });
    }

    const systemInstruction = buildTeachingSystemPrompt({
      mode,
      level,
      languageCode: language,
      subject,
      curriculumContext: curriculumContext ? String(curriculumContext) : undefined,
      fullChapter: Boolean(fullChapter),
    });

    const chapterSyllabusBlock =
      fullChapter && chapterOutline
        ? `\nCOMPLETE OFFICIAL CHAPTER SYLLABUS TOPICS TO TEACH IN FULL (Teach EVERY topic below thoroughly in sequence in this single master lecture — do not skip any):\n${String(
            chapterOutline
          )}\n`
        : "";

    let userPrompt = "";
    if (mode === "solve") {
      userPrompt = `Solve all questions/problems thoroughly (and work through representative exam/university problems for every sub-topic if teaching a chapter) from the material below.\nTopic/Title: ${effectiveTitle}${chapterSyllabusBlock}\n\n${
        sourceContent
          ? `Extracted Text:\n${sourceContent}`
          : chapterOutline
          ? "Generate and solve step-by-step university/exam-grade numericals & questions covering every topic in the chapter syllabus above."
          : "Inspect the attached document/image carefully."
      }`;
    } else if (mode === "story") {
      userPrompt = `Create an unforgettable educational story teaching the ${
        fullChapter ? "ENTIRE chapter and all its syllabus concepts" : "topic"
      }:\nTopic: ${effectiveTitle}${
        subject ? ` (${subject})` : ""
      }${chapterSyllabusBlock}\n\n${
        sourceContent ? `Reference Material:\n${sourceContent}` : ""
      }`;
    } else if (mode === "cheatsheet") {
      userPrompt = `Create a comprehensive, structured Formula & Principle Cheat Sheet covering ${
        fullChapter ? "every single topic of this entire chapter" : "this topic"
      }:\nTopic: ${effectiveTitle}${
        subject ? ` (${subject})` : ""
      }${chapterSyllabusBlock}\n\n${
        sourceContent ? `Source Material:\n${sourceContent}` : ""
      }`;
    } else {
      userPrompt = `Teach an engaging, comprehensive ${
        fullChapter
          ? "END-TO-END FULL-CHAPTER blackboard lecture covering every sub-topic of"
          : "blackboard lesson on"
      }:\nTopic: ${effectiveTitle}${
        subject ? `\nSubject / Paper: ${subject}` : ""
      }${chapterSyllabusBlock}\n\n${
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

    const responseStream = await ai!.models.generateContentStream({
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

          if (isCacheable && lessonCacheKey && fullContent.trim().length >= 120) {
            await prisma.lessonCache
              .upsert({
                where: { cacheKey: lessonCacheKey },
                create: {
                  cacheKey: lessonCacheKey,
                  subject: String(subject || "General"),
                  topic: effectiveTitle,
                  mode,
                  level,
                  language,
                  content: fullContent,
                  hitCount: 1,
                },
                update: {
                  content: fullContent,
                },
              })
              .catch(() => null);
          }

          await recordLessonProgressAndXp({
            userId: user.id,
            courseId,
            chapterId,
            programId,
            programTopicId,
          });

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
        "X-Cache": "MISS",
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
