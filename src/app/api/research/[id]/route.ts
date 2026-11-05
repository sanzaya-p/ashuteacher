import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthUser } from "@/lib/auth";
import { CREDIT_COSTS, refundCredits, spendCredits } from "@/lib/credits";
import { handleApiError } from "@/lib/api-error";
import {
  buildLanguageDirective,
  createGeminiClient,
  resolveModelName,
} from "@/lib/gemini";
import type { ResearchBlueprint } from "@/lib/global-catalog";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  let chargedUserId: string | null = null;
  try {
    const user = await requireAuthUser();
    const { id } = await context.params;
    const body = await req.json();

    const project = await prisma.researchProject.findFirst({
      where: { id, userId: user.id },
    });
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const blueprint: ResearchBlueprint = JSON.parse(project.blueprintJson || "{}");
    const completed: string[] = JSON.parse(project.completedStagesJson || "[]");
    const stageNotes: Record<string, string> = JSON.parse(
      project.stageNotesJson || "{}"
    );
    const vivaHistory: Array<{ role: "examiner" | "candidate"; content: string }> =
      JSON.parse(project.vivaHistoryJson || "[]");

    // 1. Toggle milestone completion (0 credits)
    if (body.toggleStageId) {
      const sid = String(body.toggleStageId);
      const idx = completed.indexOf(sid);
      if (idx >= 0) completed.splice(idx, 1);
      else completed.push(sid);

      const total = Array.isArray(blueprint.stages) ? blueprint.stages.length : 6;
      const progressPercent =
        total > 0 ? Math.min(100, Math.round((completed.length / total) * 100)) : 0;

      const updated = await prisma.researchProject.update({
        where: { id: project.id },
        data: {
          completedStagesJson: JSON.stringify(completed),
          progressPercent,
        },
      });
      return NextResponse.json({ project: updated });
    }

    // 2. Save user draft/notes for a stage (0 credits)
    if (body.saveStageNote) {
      const { stageId, content } = body.saveStageNote;
      stageNotes[String(stageId)] = String(content ?? "");
      const updated = await prisma.researchProject.update({
        where: { id: project.id },
        data: { stageNotesJson: JSON.stringify(stageNotes) },
      });
      return NextResponse.json({ project: updated });
    }

    // 3. AI Principal Investigator Mentor for a specific stage (1 credit)
    if (body.mentorStageId) {
      const stageId = String(body.mentorStageId);
      const customPrompt = String(body.customPrompt || "").trim();
      const stage = (blueprint.stages || []).find((s) => s.id === stageId);
      if (!stage) {
        return NextResponse.json({ error: "Stage not found" }, { status: 404 });
      }

      const headerKey =
        process.env.NODE_ENV !== "production" || user.isAdmin
          ? req.headers.get("x-gemini-api-key")
          : null;
      const ai = createGeminiClient(headerKey);
      const model = resolveModelName(user.preferredModel);

      const { remainingCredits } = await spendCredits({
        userId: user.id,
        cost: CREDIT_COSTS.RESEARCH_MENTOR,
        description: `Research Mentor (${stage.title}): ${project.title.slice(0, 60)}`,
      });
      chargedUserId = user.id;

      const languageDirective = buildLanguageDirective(project.language);
      const existingDraft = stageNotes[stageId] || "";

      const prompt = `You are a senior Principal Investigator and Research Architect advising on:
- Project Title: ${project.title}
- Tier: ${project.tier}
- Domain: ${project.domain}
- Core Problem: ${project.problemStatement}
- Current Stage (${stage.stageNumber}/6): **${stage.title}** — ${stage.objective}
- Deliverables Expected: ${stage.deliverables.join("; ")}
${existingDraft ? `\nResearcher's Current Notes:\n${existingDraft}\n` : ""}
${customPrompt ? `\nSpecific Request from Researcher: "${customPrompt}"\n` : ""}

Write a comprehensive, actionable, publication/submission-grade technical guide & draft for this exact stage:
- Include concrete architecture/methodology (with a clean \`\`\`mermaid\`\`\` diagram using \`flowchart TD\` where helpful, quoting node labels with parentheses), mathematical formulations in $...$ / $$...$$ LaTeX where relevant, concrete datasets/tools/protocols, and a step-by-step execution checklist.

${languageDirective}`;

      const res = await ai.models.generateContent({
        model,
        contents: prompt,
      });

      const generated = (res.text || "").trim();
      stageNotes[stageId] = existingDraft
        ? `${existingDraft}\n\n---\n\n${generated}`
        : generated;

      const updated = await prisma.researchProject.update({
        where: { id: project.id },
        data: { stageNotesJson: JSON.stringify(stageNotes) },
      });

      return NextResponse.json(
        { project: updated, remainingCredits },
        { headers: { "X-Credits-Remaining": String(remainingCredits) } }
      );
    }

    // 4. Interactive Viva / Thesis Committee Defense Simulator (1 credit)
    if (body.vivaAction) {
      const candidateAnswer = String(body.candidateAnswer || "").trim();
      const resetViva = Boolean(body.resetViva);

      const headerKey =
        process.env.NODE_ENV !== "production" || user.isAdmin
          ? req.headers.get("x-gemini-api-key")
          : null;
      const ai = createGeminiClient(headerKey);
      const model = resolveModelName(user.preferredModel);

      const { remainingCredits } = await spendCredits({
        userId: user.id,
        cost: CREDIT_COSTS.RESEARCH_MENTOR,
        description: `Viva Defense Simulator: ${project.title.slice(0, 70)}`,
      });
      chargedUserId = user.id;

      const nextHistory = resetViva ? [] : [...vivaHistory];
      if (candidateAnswer && !resetViva) {
        nextHistory.push({ role: "candidate", content: candidateAnswer });
      }

      const languageDirective = buildLanguageDirective(project.language);
      const historyTranscript = nextHistory
        .map((m) => `${m.role === "examiner" ? "Examiner" : "Candidate"}: ${m.content}`)
        .join("\n\n");

      const prompt = `You are chairing the official Viva Voce / Thesis Defense Committee for:
- Title: ${project.title}
- Tier: ${project.tier} (${project.domain})
- Hypothesis / Novelty: ${blueprint.noveltyHypothesis}
- Abstract: ${blueprint.abstractDraft}

${
  nextHistory.length === 0
    ? `Welcome the candidate warmly, state your role as Committee Chair calibrated to "${project.tier}", and ask your FIRST sharp, insightful defense question testing their core problem motivation or methodology.`
    : `Defense Transcript So Far:\n${historyTranscript}\n\nEvaluate the Candidate's latest answer honestly and constructively (score out of 10, highlight what was strong, point out any missing rigor/edge-case, show the ideal crisp defense phrasing if needed), and then pose the NEXT probing Viva/Defense question!`
}

${languageDirective}`;

      const res = await ai.models.generateContent({
        model,
        contents: prompt,
      });

      nextHistory.push({
        role: "examiner",
        content: (res.text || "").trim(),
      });

      const updated = await prisma.researchProject.update({
        where: { id: project.id },
        data: { vivaHistoryJson: JSON.stringify(nextHistory) },
      });

      return NextResponse.json(
        { project: updated, remainingCredits },
        { headers: { "X-Credits-Remaining": String(remainingCredits) } }
      );
    }

    return NextResponse.json({ project });
  } catch (error) {
    if (chargedUserId) {
      await refundCredits({
        userId: chargedUserId,
        amount: CREDIT_COSTS.RESEARCH_MENTOR,
        description: "Auto-refund: Research mentor/viva failed",
      });
    }
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
    await prisma.researchProject.deleteMany({
      where: { id, userId: user.id },
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
