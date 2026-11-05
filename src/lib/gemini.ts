import { GoogleGenAI, Type } from "@google/genai";
import { SUPPORTED_LANGUAGES, parseLanguageAndScript } from "./constants";

export function getLanguageName(langCode: string): string {
  const parsed = parseLanguageAndScript(langCode);
  const rawBase = parsed.baseCode;
  if (!rawBase) return "English (US)";
  if (rawBase.startsWith("custom:")) {
    return parsed.languageName || "English";
  }
  const matched = SUPPORTED_LANGUAGES.find(
    (l) => l.code.toLowerCase() === rawBase.toLowerCase()
  );
  if (matched) return matched.name;
  try {
    const dn = new Intl.DisplayNames(["en"], { type: "language" });
    const resolved = dn.of(rawBase);
    if (resolved) return resolved;
  } catch {
    // Ignore invalid BCP-47 tags and pass raw string through
  }
  return parsed.languageName;
}

export function buildLanguageDirective(langCode: string): string {
  const parsed = parseLanguageAndScript(langCode);
  const langName = getLanguageName(langCode);
  const isExplicitRoman =
    parsed.baseCode === "hinglish" || parsed.scriptMode === "roman";

  if (isExplicitRoman) {
    return `LANGUAGE & SCRIPT DIRECTIVE (CRITICAL):
- Language: Teach in natural, conversational ${langName}.
- Writing Script: Write in clean Romanized Latin script (phonetic ${langName} in English letters) as requested by the learner.`;
  }

  return `LANGUAGE & WRITING SCRIPT DIRECTIVE (CRITICAL — STRICTLY ENFORCE):
- Spoken Language / Dialect: Teach ENTIRELY in authentic ${langName} (including all section headings, explanations, analogies, and questions).${
    parsed.dialectHint ? `\n- Regional Dialect Authenticity: ${parsed.dialectHint}` : ""
  }
- Mandatory Writing Script: Write ALL prose, headings, and explanations in ${parsed.effectiveScriptLabel}.
- STRICT SCRIPT PURITY & ANTI-ROMANIZATION RULE: If the target script is non-Latin (such as Odia ଓଡ଼ିଆ, Devanagari देवनागरी, Bengali বাংলা, Ol Chiki ᱚᱞ ᱪᱤᱠᱤ, Tamil, Telugu, Kannada, Malayalam, Gujarati, Gurmukhi, Urdu/Arabic, CJK, Cyrillic, etc.), NEVER write sentences in Romanized English letters/transliteration (for example, NEVER write "Aji aame padhma" in Latin letters when teaching in Sambalpuri/Odia — write "ଆଜି ଆମେ ପଢ଼୍ମା" in Odia script!), and NEVER mix stray words from another Indian script (for example, never drop a Devanagari word like "कलम" inside an Odia-script sentence). Only mathematical LaTeX ($x$, $\\frac{dy}{dx}$), code syntax, and brief English technical terms in parentheses (e.g., ଅବକଳନ (Differentiation)) may use Latin letters.`;
}

const FALLBACK_MODELS = [
  "gemini-3-flash-preview",
  "gemini-3.5-flash-lite",
  "gemini-3.6-flash",
];

const BURST_BACKOFF_BASE_MS = [700, 1650];
let keyRotationCursor = 0;

function isTransientCapacityError(err: unknown): boolean {
  const msg = (err instanceof Error ? err.message : String(err)).toLowerCase();
  return (
    msg.includes("503") ||
    msg.includes("429") ||
    msg.includes("unavailable") ||
    msg.includes("resource_exhausted") ||
    msg.includes("rate limit") ||
    msg.includes("too many requests") ||
    msg.includes("quota") ||
    msg.includes("high demand") ||
    msg.includes("overloaded")
  );
}

function sleepWithJitter(baseMs: number): Promise<void> {
  const jitter = Math.floor(Math.random() * 450);
  return new Promise((resolve) => setTimeout(resolve, baseMs + jitter));
}

export function resolveGeminiKeyPool(overrideKey?: string | null): string[] {
  if (overrideKey && overrideKey.trim()) {
    return [overrideKey.trim()];
  }
  const rawPool = [
    ...(process.env.GEMINI_API_KEYS || "").split(/[,;\s]+/),
    process.env.GEMINI_API_KEY || "",
    process.env.GOOGLE_API_KEY || "",
  ]
    .map((k) => k.trim())
    .filter(Boolean);

  return Array.from(new Set(rawPool));
}

export function createGeminiClient(overrideKey?: string | null): GoogleGenAI {
  const keyPool = resolveGeminiKeyPool(overrideKey);

  if (keyPool.length === 0) {
    throw new Error(
      "MISSING_API_KEY: No Gemini API key configured. Add GEMINI_API_KEY to .env or enter your API key in Settings."
    );
  }

  const startIdx = keyRotationCursor++ % keyPool.length;
  const orderedKeys = [
    ...keyPool.slice(startIdx),
    ...keyPool.slice(0, startIdx),
  ];

  const sdkClients = orderedKeys.map((apiKey) => {
    const client = new GoogleGenAI({ apiKey });
    return {
      generate: client.models.generateContent.bind(client.models),
      stream: client.models.generateContentStream.bind(client.models),
      instance: client,
    };
  });

  const primaryAi = sdkClients[0].instance;

  primaryAi.models.generateContent = async (params) => {
    const candidates = Array.from(
      new Set([params.model, ...FALLBACK_MODELS])
    );
    let lastErr: unknown;

    for (let wave = 0; wave <= BURST_BACKOFF_BASE_MS.length; wave++) {
      if (wave > 0) {
        await sleepWithJitter(BURST_BACKOFF_BASE_MS[wave - 1]);
      }
      for (const sdk of sdkClients) {
        for (const m of candidates) {
          try {
            return await sdk.generate({ ...params, model: m });
          } catch (err) {
            lastErr = err;
            if (!isTransientCapacityError(err)) throw err;
          }
        }
      }
    }
    throw lastErr;
  };

  primaryAi.models.generateContentStream = async (params) => {
    const candidates = Array.from(
      new Set([params.model, ...FALLBACK_MODELS])
    );
    let lastErr: unknown;

    for (let wave = 0; wave <= BURST_BACKOFF_BASE_MS.length; wave++) {
      if (wave > 0) {
        await sleepWithJitter(BURST_BACKOFF_BASE_MS[wave - 1]);
      }
      for (const sdk of sdkClients) {
        for (const m of candidates) {
          try {
            return await sdk.stream({ ...params, model: m });
          } catch (err) {
            lastErr = err;
            if (!isTransientCapacityError(err)) throw err;
          }
        }
      }
    }
    throw lastErr;
  };

  return primaryAi;
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
  curriculumContext?: string;
  fullChapter?: boolean;
}): string {
  const languageDirective = buildLanguageDirective(params.languageCode);
  const subjectCtx = params.subject ? ` specializing in ${params.subject}` : "";
  const syllabusLine = params.curriculumContext
    ? `\n- CURRICULUM / EXAM ALIGNMENT: Align terminology, depth, examples, and exam tips strictly to: **${params.curriculumContext}**.`
    : "";
  const fullChapterLine = params.fullChapter
    ? `\n- FULL-CHAPTER MASTER LECTURE REQUIREMENT (CRITICAL): You are teaching an ENTIRE official syllabus chapter in one complete session! Cover EVERY single syllabus sub-topic provided in the prompt systematically section-by-section with thorough explanations, formal definitions, complete derivations/algorithms/proofs, worked numericals/examples, and end-of-chapter exam practice questions. Never skip or gloss over sub-topics!`
    : "";

  let pedagogyGuidance = `- Pitch explanations precisely for a ${params.level}-level learner.`;
  if (params.level.includes("KG") || params.level.includes("Early")) {
    pedagogyGuidance = `- PEDAGOGY (KG / EARLY CHILDHOOD WONDER MODE, AGES 4–7): Speak like the warmest, most joyful kindergarten teacher! Use very short, musical sentences, playful sound words, friendly animals/toys/stars analogies, rhymes, and interactive "Can you clap/count with me?" prompts. Avoid intimidating jargon or dense algebra.`;
  } else if (params.level.includes("Primary") || params.level.includes("Middle")) {
    pedagogyGuidance = `- PEDAGOGY (SCHOOL GRADES 3–8): Use vivid real-life curiosity hooks, step-by-step visual reasoning, simple hands-on home experiments, and encouraging school-friendly examples.`;
  } else if (params.level === "Intermediate") {
    pedagogyGuidance = `- PEDAGOGY (BOARD & HIGH SCHOOL RIGOR): Cover official definitions, step-by-step derivations, worked numerical/conceptual problems, and high-scoring board-exam presentation tips.`;
  } else if (params.level === "Advanced") {
    pedagogyGuidance = `- PEDAGOGY (UNIVERSITY & COMPETITIVE EXAM DEPTH): Include rigorous mathematical derivations, subtle conceptual traps, multi-concept problem solving, and high-speed competitive exam insights.`;
  } else if (params.level === "Expert") {
    pedagogyGuidance = `- PEDAGOGY (DOCTORAL / MIT RESEARCH RIGOR): Teach from first principles with formal mathematical precision, proofs/derivations, complexity or physical bounds, state-of-the-art trade-offs, and open research frontiers—zero hand-waving.`;
  }

  const mathAndDiagramRules = `
FORMATTING RULES (CRITICAL):
- Format cleanly in GitHub-Flavored Markdown with clear headings (##, ###), bullet points, bold key terms, and tables where helpful. Translate all section headings naturally into the target language and script!
- Use proper LaTeX for ALL mathematical notation: $...$ for inline math and $$...$$ on its own lines for block equations.
- For multi-line derivations, use \\begin{aligned} ... \\end{aligned} inside $$...$$.
- Where a concept benefits from a visual mental model, process flow, or hierarchy, include ONE clean \`\`\`mermaid\`\`\` diagram using \`flowchart TD\` or \`flowchart LR\` (always wrap node labels containing parentheses or special characters in double quotes, e.g. A["Force (N)"]).
${pedagogyGuidance}${syllabusLine}${fullChapterLine}

${languageDirective}`;

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

export const DISCOVERY_OPTIONS_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    items: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Official boards, universities, exams, or subjects matching the query.",
    },
  },
  required: ["items"],
};

export const PROGRAM_SYLLABUS_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "Official structured program title." },
    overview: {
      type: Type.STRING,
      description: "2-3 sentence executive summary of the curriculum or competitive exam roadmap.",
    },
    examPattern: {
      type: Type.OBJECT,
      properties: {
        duration: { type: Type.STRING, description: "Exam duration or academic term span" },
        totalMarks: { type: Type.STRING, description: "Total marks / grading scale" },
        markingScheme: { type: Type.STRING, description: "Marking scheme, weightage, or negative marking rules" },
        sectionsSummary: { type: Type.STRING, description: "Breakdown of papers, sections, or theory/practical split" },
        keyStrategy: { type: Type.STRING, description: "High-impact preparation strategy for top scores" },
      },
      required: ["duration", "totalMarks", "markingScheme", "sectionsSummary", "keyStrategy"],
    },
    subjects: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING, description: "Unique subject id e.g. subj-1" },
          name: { type: Type.STRING, description: "Official Subject or Paper name" },
          code: { type: Type.STRING, description: "Official subject/paper code if applicable, else short tag" },
          units: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING, description: "Unique unit id e.g. unit-1-1" },
                title: { type: Type.STRING, description: "Official Unit or Section name" },
                chapters: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING, description: "Unique chapter id e.g. ch-1-1-1" },
                      chapterNumber: { type: Type.INTEGER, description: "1-based chapter number" },
                      title: { type: Type.STRING, description: "Official chapter title" },
                      weightage: { type: Type.STRING, description: "Approx marks/weightage or priority e.g. '8 Marks' or 'High-Yield'" },
                      summary: { type: Type.STRING, description: "1-sentence scope of this chapter" },
                      topics: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            id: { type: Type.STRING, description: "Unique topic id e.g. top-1-1-1-1" },
                            title: { type: Type.STRING, description: "Specific syllabus sub-topic title" },
                            summary: { type: Type.STRING, description: "Short learning outcome" },
                            tag: { type: Type.STRING, description: "Core | High-Yield | Derivation | Numerical | Practical" },
                            estimatedMinutes: { type: Type.INTEGER, description: "Study minutes (10-35)" },
                          },
                          required: ["id", "title", "summary", "tag", "estimatedMinutes"],
                        },
                      },
                    },
                    required: ["id", "chapterNumber", "title", "weightage", "summary", "topics"],
                  },
                },
              },
              required: ["id", "title", "chapters"],
            },
          },
        },
        required: ["id", "name", "code", "units"],
      },
    },
  },
  required: ["title", "overview", "examPattern", "subjects"],
};

export const CHAPTER_EXPANSION_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    topics: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING, description: "Unique micro-topic id" },
          title: { type: Type.STRING, description: "Granular official syllabus micro-topic" },
          summary: { type: Type.STRING, description: "Exact concepts, formulas, or skills to master" },
          tag: { type: Type.STRING, description: "Core | High-Yield | Derivation | Numerical | Proof | Activity" },
          estimatedMinutes: { type: Type.INTEGER, description: "Minutes (10-30)" },
        },
        required: ["id", "title", "summary", "tag", "estimatedMinutes"],
      },
    },
  },
  required: ["topics"],
};

export const RESEARCH_BLUEPRINT_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "Refined academic/project title." },
    abstractDraft: {
      type: Type.STRING,
      description: "Crisp 4-5 sentence project/research abstract framing problem, method, and expected impact.",
    },
    noveltyHypothesis: {
      type: Type.STRING,
      description: "Clear research hypothesis, engineering novelty, or scientific value proposition.",
    },
    prerequisiteTopics: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "4 to 6 foundational topics/math/tools the learner can click to learn on the Voice Blackboard.",
    },
    stages: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING, description: "stage-1 through stage-6" },
          stageNumber: { type: Type.INTEGER, description: "1 to 6" },
          title: { type: Type.STRING, description: "Milestone title" },
          objective: { type: Type.STRING, description: "What must be achieved in this stage" },
          deliverables: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Concrete artifacts/outputs to produce",
          },
          guidingQuestions: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Key technical/scientific questions to answer",
          },
          suggestedMethods: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Recommended algorithms, tools, datasets, lab methods, or frameworks",
          },
        },
        required: [
          "id",
          "stageNumber",
          "title",
          "objective",
          "deliverables",
          "guidingQuestions",
          "suggestedMethods",
        ],
      },
    },
    sampleVivaQuestions: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "5 sharp defense/viva questions an examiner, professor, or MIT reviewer would ask.",
    },
  },
  required: [
    "title",
    "abstractDraft",
    "noveltyHypothesis",
    "prerequisiteTopics",
    "stages",
    "sampleVivaQuestions",
  ],
};

export const TREE_CHILDREN_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    stepLabel: {
      type: Type.STRING,
      description: "Clear UI label for this dropdown box (e.g. 'Qualification Level', 'Degree / Programme', 'Course / Paper Code', 'Exam Stage', 'Official Paper').",
    },
    placeholder: {
      type: Type.STRING,
      description: "Short placeholder e.g. 'Select a programme...'",
    },
    isPaperLevel: {
      type: Type.BOOLEAN,
      description: "TRUE only when the items in this list are individual teachable Subjects, Courses (like MCS-201), or Exam Papers (like GS Paper II) whose next step is displaying Chapters!",
    },
    items: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING, description: "Clean unique identifier" },
          code: { type: Type.STRING, description: "Official course/paper code if applicable (e.g. 'MCS-201', '042', 'GS-II'), else empty string" },
          label: { type: Type.STRING, description: "Official name (include code if applicable, e.g. 'MCS-201: Programming in C and Python')" },
          badge: { type: Type.STRING, description: "Short helpful tag e.g. 'Sem 1', 'Core', 'Optional', '100 Marks'" },
        },
        required: ["id", "code", "label", "badge"],
      },
    },
  },
  required: ["stepLabel", "placeholder", "isPaperLevel", "items"],
};

export const PAPER_SYLLABUS_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    paperTitle: { type: Type.STRING, description: "Official full title of the selected Course, Subject, or Exam Paper." },
    paperCode: { type: Type.STRING, description: "Official code (e.g. 'MCS-211', '042', 'GS-II') or short tag." },
    overview: { type: Type.STRING, description: "2-sentence overview of this paper's official scope and objectives." },
    pedagogyStage: {
      type: Type.STRING,
      description: "One of: 'KG & Early Wonder' | 'Primary & Middle School' | 'Intermediate' | 'Advanced' | 'Expert'",
    },
    examPattern: {
      type: Type.OBJECT,
      properties: {
        duration: { type: Type.STRING },
        totalMarks: { type: Type.STRING },
        markingScheme: { type: Type.STRING },
        sectionsSummary: { type: Type.STRING },
        keyStrategy: { type: Type.STRING },
      },
      required: ["duration", "totalMarks", "markingScheme", "sectionsSummary", "keyStrategy"],
    },
    units: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING, description: "block-1, unit-2, etc." },
          unitTitle: { type: Type.STRING, description: "Official Block, Module, or Section title (e.g. 'Block 1: Algorithm Design Techniques')" },
          chapters: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING, description: "ch-1, ch-2, etc." },
                chapterNumber: { type: Type.INTEGER, description: "Sequential chapter/unit number (1, 2, 3...)" },
                title: { type: Type.STRING, description: "Official Chapter / Unit title" },
                weightage: { type: Type.STRING, description: "Weightage or priority e.g. 'Block 1 • High-Yield' or '12 Marks'" },
                estimatedMinutes: { type: Type.INTEGER, description: "Full chapter study duration in minutes (25-60)" },
                summary: { type: Type.STRING, description: "1-sentence summary of the chapter" },
                syllabusTopics: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "Complete list of 4 to 8 official syllabus topics covered inside this chapter",
                },
              },
              required: [
                "id",
                "chapterNumber",
                "title",
                "weightage",
                "estimatedMinutes",
                "summary",
                "syllabusTopics",
              ],
            },
          },
        },
        required: ["id", "unitTitle", "chapters"],
      },
    },
  },
  required: ["paperTitle", "paperCode", "overview", "pedagogyStage", "examPattern", "units"],
};
