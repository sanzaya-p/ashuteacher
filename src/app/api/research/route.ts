import { NextRequest, NextResponse } from "next/server";
import { connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, requireAuthUser } from "@/lib/auth";
import { CREDIT_COSTS, refundCredits, spendCredits } from "@/lib/credits";
import { handleApiError } from "@/lib/api-error";
import {
  buildLanguageDirective,
  createGeminiClient,
  RESEARCH_BLUEPRINT_SCHEMA,
  resolveModelName,
} from "@/lib/gemini";

export async function GET() {
  await connection();
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ projects: [] });
    }
    const projects = await prisma.researchProject.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
    });
    return NextResponse.json({ projects });
  } catch (error) {
    console.error("GET /api/research error:", error);
    return NextResponse.json(
      { error: "Failed to load research projects" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  let chargedUserId: string | null = null;
  try {
    const user = await requireAuthUser();
    const body = await req.json();
    const {
      tier = "Undergraduate / B.Tech Capstone",
      domain = "Artificial Intelligence, LLMs & Computer Science",
      ideaOrTopic = "",
      language = "en-US",
      model: requestedModel,
    } = body;

    if (!String(ideaOrTopic).trim()) {
      return NextResponse.json(
        { error: "Please describe your project idea, thesis topic, or research question." },
        { status: 400 }
      );
    }

    const headerKey =
      process.env.NODE_ENV !== "production" || user.isAdmin
        ? req.headers.get("x-gemini-api-key")
        : null;
    const ai = createGeminiClient(headerKey);
    const model = resolveModelName(requestedModel || user.preferredModel);

    const { remainingCredits } = await spendCredits({
      userId: user.id,
      cost: CREDIT_COSTS.RESEARCH_PROJECT,
      description: `Research Blueprint: ${String(ideaOrTopic).slice(0, 90)}`,
      metadata: { tier, domain },
    });
    chargedUserId = user.id;

    const languageDirective = buildLanguageDirective(language);

    const prompt = `You are a world-class Principal Investigator and Academic Advisor (spanning school science mentorship through MIT / Doctoral research labs).
Design a complete, rigorous **6-Stage Structured Project & Research Blueprint** for:
- Academic / Research Tier: ${tier}
- Field / Domain: ${domain}
- Learner's Idea / Research Direction: "${String(ideaOrTopic).trim()}"

Calibrate complexity precisely to "${tier}":
- If School Science Project: focus on clear scientific hypothesis, safe & exciting working model/experiment, observation tables, visual poster, and viva readiness.
- If Undergraduate / B.Tech Capstone: focus on problem scoping, tech stack & system architecture, dataset/hardware setup, implementation sprints, benchmarking, and capstone report.
- If Master's Thesis or PhD / MIT-Level Frontier Research: focus on open research gap formulation, formal mathematical/theoretical framing, SOTA baseline comparison, ablation studies, reproducibility, IEEE/ACM/Nature-grade paper structure, and rigorous committee defense questions.

Create exactly 6 progressive stages ("stage-1" through "stage-6"):
1. Problem Formulation, Scope & Novelty Gap
2. Literature Survey & Prerequisite Mastery
3. Methodology, System Architecture / Theoretical Formulation
4. Experimental Setup, Implementation & Evaluation Metrics
5. Thesis / Paper / Report Writing & Visualization
6. Viva Voce / Peer-Review / Committee Defense Preparation

${languageDirective}`;

    const res = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: RESEARCH_BLUEPRINT_SCHEMA,
      },
    });

    const parsed = JSON.parse(res.text || "{}");

    const created = await prisma.researchProject.create({
      data: {
        userId: user.id,
        title: parsed.title || String(ideaOrTopic).trim().slice(0, 120),
        tier,
        domain,
        language,
        problemStatement: String(ideaOrTopic).trim(),
        blueprintJson: JSON.stringify({
          abstractDraft: parsed.abstractDraft || "",
          noveltyHypothesis: parsed.noveltyHypothesis || "",
          prerequisiteTopics: parsed.prerequisiteTopics || [],
          stages: parsed.stages || [],
          sampleVivaQuestions: parsed.sampleVivaQuestions || [],
        }),
        completedStagesJson: "[]",
        stageNotesJson: "{}",
        vivaHistoryJson: "[]",
        progressPercent: 0,
      },
    });

    await prisma.user
      .update({
        where: { id: user.id },
        data: { xpPoints: { increment: 45 } },
      })
      .catch(() => null);

    return NextResponse.json(
      { project: created, remainingCredits },
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
        amount: CREDIT_COSTS.RESEARCH_PROJECT,
        description: "Auto-refund: Research blueprint generation failed",
      });
    }
    return handleApiError(error);
  }
}
