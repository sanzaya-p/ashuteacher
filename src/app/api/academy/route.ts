import { NextRequest, NextResponse } from "next/server";
import { connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, requireAuthUser } from "@/lib/auth";
import { CREDIT_COSTS, refundCredits, spendCredits } from "@/lib/credits";
import { handleApiError } from "@/lib/api-error";
import { COURSE_GRADIENTS } from "@/lib/constants";
import {
  buildLanguageDirective,
  createGeminiClient,
  PROGRAM_SYLLABUS_SCHEMA,
  resolveModelName,
} from "@/lib/gemini";

export async function GET() {
  await connection();
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ programs: [] });
    }
    const programs = await prisma.learningProgram.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
    });
    return NextResponse.json({ programs });
  } catch (error) {
    console.error("GET /api/academy error:", error);
    return NextResponse.json(
      { error: "Failed to load learning programs" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  let chargedUserId: string | null = null;
  try {
    const user = await requireAuthUser();
    const body = await req.json();

    // Fast 0-credit Enrollment/Pinning from the Dynamic Cascading Explorer!
    if (body.pinPaperSyllabus) {
      const {
        country = "India",
        domain = "UNIVERSITY",
        institution = "",
        programLabel = "",
        paperSyllabus,
        language = "en-US",
      } = body.pinPaperSyllabus;

      if (!paperSyllabus || !Array.isArray(paperSyllabus.units)) {
        return NextResponse.json(
          { error: "Invalid paper syllabus payload" },
          { status: 400 }
        );
      }

      const subjId = `paper-${Date.now()}`;
      const newSubject = {
        id: subjId,
        name: paperSyllabus.paperTitle || "Selected Paper",
        code: paperSyllabus.paperCode || "",
        units: paperSyllabus.units.map(
          (
            u: {
              id?: string;
              unitTitle: string;
              chapters: Array<{
                id?: string;
                chapterNumber: number;
                title: string;
                weightage?: string;
                estimatedMinutes?: number;
                summary: string;
                syllabusTopics: string[];
              }>;
            },
            uIdx: number
          ) => ({
            id: `${subjId}-u${uIdx + 1}`,
            title: u.unitTitle,
            chapters: (u.chapters || []).map((ch, cIdx) => {
              const chId = `${subjId}-u${uIdx + 1}-c${cIdx + 1}`;
              return {
                id: chId,
                chapterNumber: ch.chapterNumber || cIdx + 1,
                title: ch.title,
                weightage: ch.weightage || "",
                summary: ch.summary || "",
                expanded: true,
                topics: [
                  {
                    id: `${chId}-full`,
                    title: `Full Chapter ${ch.chapterNumber || cIdx + 1}: ${ch.title}`,
                    summary: Array.isArray(ch.syllabusTopics)
                      ? ch.syllabusTopics.join(" • ")
                      : ch.summary,
                    tag: "Full Chapter",
                    estimatedMinutes: ch.estimatedMinutes || 35,
                  },
                ],
              };
            }),
          })
        ),
      };

      // Check if user already has an enrolled program for this exact Institution + ProgramLabel so papers group cleanly (e.g. MCS-201 + MCS-211 under IGNOU MCA)
      const groupTitle = programLabel
        ? `${institution} — ${programLabel}`
        : `${institution} — ${paperSyllabus.paperTitle}`;

      const existing = programLabel
        ? await prisma.learningProgram.findFirst({
            where: {
              userId: user.id,
              country,
              boardOrBody: institution,
              gradeOrExam: programLabel,
            },
          })
        : null;

      if (existing) {
        const existingSubjects = JSON.parse(existing.subjectsJson || "[]");
        const alreadyIdx = existingSubjects.findIndex(
          (s: { name?: string }) =>
            String(s.name || "").toLowerCase() ===
            String(newSubject.name || "").toLowerCase()
        );
        if (alreadyIdx >= 0) {
          existingSubjects[alreadyIdx] = newSubject;
        } else {
          existingSubjects.push(newSubject);
        }
        const updated = await prisma.learningProgram.update({
          where: { id: existing.id },
          data: {
            subjectsJson: JSON.stringify(existingSubjects),
            language,
          },
        });
        return NextResponse.json({ program: updated, appended: true });
      }

      const count = await prisma.learningProgram.count({
        where: { userId: user.id },
      });
      const gradient = COURSE_GRADIENTS[count % COURSE_GRADIENTS.length];

      const created = await prisma.learningProgram.create({
        data: {
          userId: user.id,
          trackType:
            domain === "COMPETITIVE_EXAM" ? "COMPETITIVE_EXAM" : "CURRICULUM",
          country,
          boardOrBody: institution,
          gradeOrExam: programLabel || paperSyllabus.paperTitle,
          streamOrFocus: paperSyllabus.paperCode || "",
          pedagogyStage: paperSyllabus.pedagogyStage || "Advanced",
          language,
          title: groupTitle,
          overview: paperSyllabus.overview || "",
          examPatternJson: JSON.stringify(paperSyllabus.examPattern || {}),
          subjectsJson: JSON.stringify([newSubject]),
          completedTopicsJson: "[]",
          progressPercent: 0,
          coverGradient: gradient,
        },
      });

      return NextResponse.json({ program: created, appended: false });
    }

    const {
      trackType = "CURRICULUM", // CURRICULUM | COMPETITIVE_EXAM | SKILL_PATH
      country = "India",
      boardOrBody = "CBSE",
      gradeOrExam = "Class 12",
      streamOrFocus = "",
      selectedSubjects = [],
      pedagogyStage = "Intermediate",
      language = "en-US",
      targetDate = "",
      customSyllabusText = "",
      model: requestedModel,
    } = body;

    const headerKey =
      process.env.NODE_ENV !== "production" || user.isAdmin
        ? req.headers.get("x-gemini-api-key")
        : null;
    const ai = createGeminiClient(headerKey);
    const model = resolveModelName(requestedModel || user.preferredModel);

    const summaryLabel =
      trackType === "COMPETITIVE_EXAM"
        ? `${country} • ${gradeOrExam}`
        : `${country} • ${boardOrBody} • ${gradeOrExam}`;

    const { remainingCredits } = await spendCredits({
      userId: user.id,
      cost: CREDIT_COSTS.PROGRAM,
      description: `Enrolled Syllabus: ${summaryLabel.slice(0, 90)}`,
      metadata: { trackType, country, boardOrBody, gradeOrExam },
    });
    chargedUserId = user.id;

    const languageDirective = buildLanguageDirective(language);
    const subjectListStr =
      Array.isArray(selectedSubjects) && selectedSubjects.length > 0
        ? selectedSubjects.slice(0, 7).join(", ")
        : "";

    const prompt =
      trackType === "COMPETITIVE_EXAM"
        ? `Design the complete, authentic, official structured syllabus and exam roadmap for:
- Track: Competitive / Entrance / Licensing Examination
- Country / Region: ${country}
- Exam Name: ${gradeOrExam}
${boardOrBody ? `- Conducting Body: ${boardOrBody}` : ""}
${streamOrFocus ? `- Paper / Optional / Focus Area: ${streamOrFocus}` : ""}
${subjectListStr ? `- Specific Papers / Sections to Include: ${subjectListStr}` : "- Include all major official sections/subjects of this exam (3 to 5 subjects/papers)."}
${targetDate ? `- Target Exam Date: ${targetDate}` : ""}
- Learner Rigor Stage: ${pedagogyStage}

${
  customSyllabusText
    ? `OFFICIAL UPLOADED / PASTED SYLLABUS REFERENCE (Strictly structure units, chapters, and topics around this official syllabus):\n${String(customSyllabusText).slice(0, 28000)}\n`
    : ""
}
STRUCTURAL REQUIREMENTS:
1. Reflect the REAL official ${gradeOrExam} exam pattern (marking scheme, negative marking if any, duration, total marks, and high-yield strategy).
2. Organize into Subjects/Papers -> Official Units -> Official Chapters -> 2 to 4 initial high-yield sub-topics per chapter (learners can expand any chapter deeper on click).
3. Ensure every id ("subj-1", "unit-1-1", "ch-1-1-1", "top-1-1-1-1") is unique across the entire JSON.

${languageDirective}`
        : `Design the complete, authentic, official structured academic syllabus for:
- Track: ${trackType === "SKILL_PATH" ? "Structured Skill & Career Mastery" : "Official School / Board / University Curriculum"}
- Country / Region: ${country}
- Board / University / Curriculum Body: ${boardOrBody}
- Class / Grade / Degree Level: ${gradeOrExam}
${streamOrFocus ? `- Stream / Major: ${streamOrFocus}` : ""}
${
  subjectListStr
    ? `- Selected Subjects to Generate (Create a complete Subject tree for EACH of these): ${subjectListStr}`
    : "- Include the 3 to 5 core official subjects for this class/level."
}
- Pedagogy & Age Rigor Stage: ${pedagogyStage}

${
  customSyllabusText
    ? `OFFICIAL UPLOADED / PASTED SYLLABUS REFERENCE (Strictly mirror all units, chapters, and topics from this official document):\n${String(customSyllabusText).slice(0, 28000)}\n`
    : ""
}
STRUCTURAL REQUIREMENTS:
1. Mirror the REAL official ${boardOrBody} (${country}) ${gradeOrExam} syllabus units, chapter sequence, and approximate marks/weightage! (If ${pedagogyStage} is KG / Early Childhood, organize playfully into age-appropriate learning units and joyful discovery activities).
2. For each Subject, organize into Official Units -> Chapters -> 2 to 4 key sub-topics per chapter (learners can deep-expand any chapter later with 1 click).
3. Ensure every id ("subj-1", "unit-1-1", "ch-1-1-1", "top-1-1-1-1") is globally unique across the entire JSON.

${languageDirective}`;

    const res = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: PROGRAM_SYLLABUS_SCHEMA,
      },
    });

    const parsed = JSON.parse(res.text || "{}");
    const count = await prisma.learningProgram.count({
      where: { userId: user.id },
    });
    const gradient = COURSE_GRADIENTS[count % COURSE_GRADIENTS.length];

    const created = await prisma.learningProgram.create({
      data: {
        userId: user.id,
        trackType,
        country,
        boardOrBody,
        gradeOrExam,
        streamOrFocus,
        pedagogyStage,
        language,
        title: parsed.title || summaryLabel,
        overview: parsed.overview || "",
        examPatternJson: JSON.stringify(parsed.examPattern || {}),
        subjectsJson: JSON.stringify(parsed.subjects || []),
        completedTopicsJson: "[]",
        progressPercent: 0,
        targetDate: targetDate || null,
        coverGradient: gradient,
      },
    });

    await prisma.user
      .update({
        where: { id: user.id },
        data: { xpPoints: { increment: 40 } },
      })
      .catch(() => null);

    return NextResponse.json(
      { program: created, remainingCredits },
      {
        headers: {
          "X-Credits-Remaining": String(remainingCredits),
        },
      }
    );
  } catch (error) {
    if (chargedUserId) {
      await refundCredits({
        userId: chargedUserId,
        amount: CREDIT_COSTS.PROGRAM,
        description: "Auto-refund: Structured syllabus generation failed",
      });
    }
    return handleApiError(error);
  }
}
