import { GoogleGenAI, Type } from "@google/genai";
import { SUPPORTED_LANGUAGES } from "./constants";

export function getLanguageName(langCode: string): string {
  return SUPPORTED_LANGUAGES.find((l) => l.code === langCode)?.name || "English (US)";
}

const FALLBACK_MODELS = [
  "gemini-3-flash-preview",
  "gemini-3.5-flash-lite",
  "gemini-3.6-flash",
];

function isTransientCapacityError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return (
    msg.includes("503") ||
    msg.includes("429") ||
    msg.includes("UNAVAILABLE") ||
    msg.includes("RESOURCE_EXHAUSTED") ||
    msg.toLowerCase().includes("high demand")
  );
}

export function createGeminiClient(overrideKey?: string | null): GoogleGenAI {
  const apiKey =
    (overrideKey && overrideKey.trim()) ||
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    "";

  if (!apiKey) {
    throw new Error(
      "MISSING_API_KEY: No Gemini API key configured. Add GEMINI_API_KEY to .env or enter your API key in Settings."
    );
  }

  const ai = new GoogleGenAI({ apiKey });
  const origGenerate = ai.models.generateContent.bind(ai.models);
  const origStream = ai.models.generateContentStream.bind(ai.models);

  ai.models.generateContent = async (params) => {
    const candidates = Array.from(
      new Set([params.model, ...FALLBACK_MODELS])
    );
    let lastErr: unknown;
    for (const m of candidates) {
      try {
        return await origGenerate({ ...params, model: m });
      } catch (err) {
        lastErr = err;
        if (!isTransientCapacityError(err)) throw err;
      }
    }
    throw lastErr;
  };

  ai.models.generateContentStream = async (params) => {
    const candidates = Array.from(
      new Set([params.model, ...FALLBACK_MODELS])
    );
    let lastErr: unknown;
    for (const m of candidates) {
      try {
        return await origStream({ ...params, model: m });
      } catch (err) {
        lastErr = err;
        if (!isTransientCapacityError(err)) throw err;
      }
    }
    throw lastErr;
  };

  return ai;
}

export function resolveModelName(overrideModel?: string | null): string {
  const trimmed = overrideModel ? overrideModel.trim() : "";
  if (trimmed && trimmed !== "gemini-3.8-flash") {
    return trimmed;
  }
  return process.env.GEMINI_MODEL || "gemini-3-flash-preview";
}

export function buildTeachingSystemPrompt(params: {
  mode: string;
  level: string;
  languageCode: string;
  subject?: string;
}): string {
  const languageName = getLanguageName(params.languageCode);
  const subjectCtx = params.subject ? ` specializing in ${params.subject}` : "";

  const mathAndDiagramRules = `
FORMATTING RULES (CRITICAL):
- Format cleanly in GitHub-Flavored Markdown with clear headings (##, ###), bullet points, bold key terms, and tables where helpful.
- Use proper LaTeX for ALL mathematical notation: $...$ for inline math and $$...$$ on its own lines for block equations.
- For multi-line derivations, use \\begin{aligned} ... \\end{aligned} inside $$...$$.
- Where a concept benefits from a visual mental model, process flow, or hierarchy, include ONE clean \`\`\`mermaid\`\`\` diagram using \`flowchart TD\` or \`flowchart LR\` (always wrap node labels containing parentheses or special characters in double quotes, e.g. A["Force (N)"]).
- Write the ENTIRE response in ${languageName}, pitched precisely for a ${params.level}-level learner.`;

  switch (params.mode) {
    case "story":
      return `You are a master educator and captivating storyteller${subjectCtx}. Weave the core concepts of the user's topic or source material into an unforgettable, vivid narrative story that naturally teaches every underlying principle without losing scientific or academic accuracy. Conclude with a brief "Moral & Core Takeaways" section connecting the story back to formal concepts.${mathAndDiagramRules}`;

    case "solve":
      return `You are an elite professor and exam problem solver${subjectCtx}. Carefully inspect all problems in the provided text, PDF, or image. Solve EVERY problem step-by-step:
1. Restate the problem & given data clearly.
2. State the governing formulas or theorems.
3. Show complete, unskipped step-by-step algebraic/logical derivations.
4. Highlight the final answer clearly and add a quick sanity/unit check.${mathAndDiagramRules}`;

    case "cheatsheet":
      return `You are an academic revision architect${subjectCtx}. Extract and organize ALL essential formulas, laws, theorems, definitions, edge cases, and exam pitfalls into a high-yield, structured Cheat Sheet.${mathAndDiagramRules}`;

    case "lesson":
    default:
      return `You are "AshuTeacher", a world-class, inspiring professor${subjectCtx}. Deliver an engaging, crystal-clear blackboard lecture structured as:
1. **Big Picture Hook** — Why this matters in the real world.
2. **Core Concepts & Intuition** — Clear breakdown from first principles.
3. **Formal Framework / Equations / Visual Diagram** — Deep dive with worked examples.
4. **Common Misconceptions** — Pitfalls students often trip over.
5. **Quick Mastery Check** — 2–3 thought-provoking reflection questions.${mathAndDiagramRules}`;
  }
}

export const COURSE_SYLLABUS_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "Compelling course title." },
    subject: { type: Type.STRING, description: "Academic or professional subject category." },
    description: { type: Type.STRING, description: "2-sentence overview of what the learner will achieve." },
    modules: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING, description: "Unique module id like mod-1" },
          title: { type: Type.STRING, description: "Module title" },
          chapters: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING, description: "Unique chapter id like ch-1-1" },
                title: { type: Type.STRING, description: "Chapter title" },
                summary: { type: Type.STRING, description: "Short description of what this chapter covers" },
                estimatedMinutes: { type: Type.INTEGER, description: "Estimated study duration in minutes (10-30)" },
                keyTopics: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "3 to 5 key subtopics covered in this chapter",
                },
              },
              required: ["id", "title", "summary", "estimatedMinutes", "keyTopics"],
            },
          },
        },
        required: ["id", "title", "chapters"],
      },
    },
  },
  required: ["title", "subject", "description", "modules"],
};

export const QUIZ_JSON_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "Concise quiz title." },
    questions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING, description: "q1, q2, etc." },
          question: {
            type: Type.STRING,
            description: "Clear multiple-choice question text. Use $...$ LaTeX for any math.",
          },
          options: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Exactly 4 plausible answer choices. Use $...$ LaTeX for any math.",
          },
          correctIndex: {
            type: Type.INTEGER,
            description: "0-based index (0, 1, 2, or 3) of the correct option.",
          },
          explanation: {
            type: Type.STRING,
            description: "Clear step-by-step explanation of why the correct option is right and why distractors fail.",
          },
          difficulty: {
            type: Type.STRING,
            description: "Easy, Medium, or Hard",
          },
        },
        required: ["id", "question", "options", "correctIndex", "explanation", "difficulty"],
      },
    },
  },
  required: ["title", "questions"],
};

export const FLASHCARD_JSON_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "Title of the flashcard deck." },
    cards: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING, description: "card-1, card-2, etc." },
          front: { type: Type.STRING, description: "Concise prompt, concept, or formula prompt (supports $...$ LaTeX)." },
          back: { type: Type.STRING, description: "Clear answer, formula, or explanation (supports $...$ LaTeX)." },
          hint: { type: Type.STRING, description: "Short memory hook or hint." },
        },
        required: ["id", "front", "back", "hint"],
      },
    },
  },
  required: ["title", "cards"],
};
