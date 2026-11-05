import { NextRequest, NextResponse } from "next/server";
import { connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthUser } from "@/lib/auth";
import { handleApiError } from "@/lib/api-error";
import {
  buildLanguageDirective,
  CHAPTER_EXPANSION_SCHEMA,
  createGeminiClient,
  resolveModelName,
} from "@/lib/gemini";
import type { ProgramSubject } from "@/lib/global-catalog";

export function countAllTopicsInSubjects(subjects: ProgramSubject[]): number {
  let total = 0;
  for (const s of subjects) {
    for (const u of s.units || []) {
      for (const ch of u.chapters || []) {
        total += Array.isArray(ch.topics) ? ch.topics.length : 0;
      }
    }
  }
  return total;
}

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  await connection();
  try {
    const user = await requireAuthUser();
    const { id } = await context.params;
    const program = await prisma.learningProgram.findFirst({
      where: { id, userId: user.id },
    });
    if (!program) {
      return NextResponse.json({ error: "Program not found" }, { status: 404 });
    }
    return NextResponse.json({ program });
  } catch (error) {
    return handleApiError(error);
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

    const program = await prisma.learningProgram.findFirst({
      where: { id, userId: user.id },
    });
    if (!program) {
      return NextResponse.json({ error: "Program not found" }, { status: 404 });
    }

    const subjects: ProgramSubject[] = JSON.parse(program.subjectsJson || "[]");
    const completed: string[] = JSON.parse(program.completedTopicsJson || "[]");

    // Action 1: Toggle sub-topic completion
    if (body.toggleTopicId) {
      const tid = String(body.toggleTopicId);
      const idx = completed.indexOf(tid);
      if (idx >= 0) {
        completed.splice(idx, 1);
      } else {
        completed.push(tid);
      }
      const totalTopics = countAllTopicsInSubjects(subjects);
      const progressPercent =
        totalTopics > 0
          ? Math.min(100, Math.round((completed.length / totalTopics) * 100))
          : 0;

      const updated = await prisma.learningProgram.update({
        where: { id: program.id },
        data: {
          completedTopicsJson: JSON.stringify(completed),
          progressPercent,
        },
      });
      return NextResponse.json({ program: updated });
    }

    // Action 2: Progressive On-Demand Deep Chapter Expansion (0 credits!)
    if (body.expandChapter) {
      const { subjectId, unitId, chapterId } = body.expandChapter;
      const subj = subjects.find((s) => s.id === subjectId);
      const unit = subj?.units?.find((u) => u.id === unitId);
      const chapter = unit?.chapters?.find((c) => c.id === chapterId);

      if (!subj || !unit || !chapter) {
        return NextResponse.json(
          { error: "Subject/Unit/Chapter not found" },
          { status: 404 }
        );
      }

      const headerKey =
        process.env.NODE_ENV !== "production" || user.isAdmin
          ? req.headers.get("x-gemini-api-key")
          : null;
      const ai = createGeminiClient(headerKey);
      const model = resolveModelName(user.preferredModel);
      const languageDirective = buildLanguageDirective(program.language);

      const prompt = `Break down the following chapter into a complete, granular, ordered micro-syllabus (7 to 10 specific sub-topics covering every concept, theorem/derivation, numerical problem type, and exam essential):
- Program: ${program.title} (${program.country} • ${program.boardOrBody} • ${program.gradeOrExam})
- Subject: ${subj.name}
- Unit: ${unit.title}
- Chapter ${chapter.chapterNumber}: ${chapter.title} (${chapter.summary})
- Learner Level: ${program.pedagogyStage}

Prefix every topic id with "${chapter.id}-exp-" (e.g. "${chapter.id}-exp-1", "${chapter.id}-exp-2") so ids remain globally unique.

${languageDirective}`;

      const res = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: CHAPTER_EXPANSION_SCHEMA,
        },
      });

      const parsed = JSON.parse(res.text || '{"topics":[]}');
      if (Array.isArray(parsed.topics) && parsed.topics.length > 0) {
        chapter.topics = parsed.topics.map(
          (
            t: {
              id?: string;
              title: string;
              summary: string;
              tag?: string;
              estimatedMinutes?: number;
            },
            i: number
          ) => ({
            id: t.id || `${chapter.id}-exp-${i + 1}`,
            title: t.title,
            summary: t.summary,
            tag: t.tag || "Core",
            estimatedMinutes: t.estimatedMinutes || 20,
          })
        );
        chapter.expanded = true;
      }

      const totalTopics = countAllTopicsInSubjects(subjects);
      const validTopicIds = new Set<string>();
      for (const s of subjects) {
        for (const u of s.units || []) {
          for (const ch of u.chapters || []) {
            for (const top of ch.topics || []) {
              validTopicIds.add(top.id);
            }
          }
        }
      }
      const cleanedCompleted = completed.filter((cid) => validTopicIds.has(cid));
      const progressPercent =
        totalTopics > 0
          ? Math.min(100, Math.round((cleanedCompleted.length / totalTopics) * 100))
          : 0;

      const updated = await prisma.learningProgram.update({
        where: { id: program.id },
        data: {
          subjectsJson: JSON.stringify(subjects),
          completedTopicsJson: JSON.stringify(cleanedCompleted),
          progressPercent,
        },
      });

      return NextResponse.json({ program: updated });
    }

    return NextResponse.json({ program });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuthUser();
    const { id } = await context.params;
    await prisma.learningProgram.deleteMany({
      where: { id, userId: user.id },
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
