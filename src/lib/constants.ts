export interface SupportedLanguage {
  code: string;
  name: string;
  flag: string;
  scriptFont?: string;
}

export const SUPPORTED_LANGUAGES: SupportedLanguage[] = [
  { code: "en-US", name: "English (US)", flag: "🇺🇸" },
  { code: "en-GB", name: "English (UK)", flag: "🇬🇧" },
  { code: "hi-IN", name: "Hindi", flag: "🇮🇳" },
  { code: "or-IN", name: "Odia", flag: "🇮🇳", scriptFont: "'Noto Sans Oriya', sans-serif" },
  { code: "es-ES", name: "Spanish", flag: "🇪🇸" },
  { code: "fr-FR", name: "French", flag: "🇫🇷" },
  { code: "de-DE", name: "German", flag: "🇩🇪" },
  { code: "it-IT", name: "Italian", flag: "🇮🇹" },
  { code: "pt-BR", name: "Portuguese", flag: "🇧🇷" },
  { code: "ja-JP", name: "Japanese", flag: "🇯🇵" },
  { code: "ko-KR", name: "Korean", flag: "🇰🇷" },
  { code: "zh-CN", name: "Chinese", flag: "🇨🇳" },
  { code: "ru-RU", name: "Russian", flag: "🇷🇺" },
  { code: "ar-SA", name: "Arabic", flag: "🇸🇦" },
];

export const STUDENT_LEVELS = [
  { id: "Beginner", label: "Beginner", desc: "Intuitive analogies & zero jargon" },
  { id: "Intermediate", label: "Intermediate", desc: "High school / undergrad core concepts" },
  { id: "Advanced", label: "Advanced", desc: "Rigorous derivations & deep theory" },
  { id: "Expert", label: "Expert", desc: "Graduate-level & research depth" },
] as const;

export const TEACHING_MODES = [
  {
    id: "lesson",
    label: "Teach Lesson",
    shortLabel: "Lesson",
    description: "Structured interactive lecture with examples, equations & diagrams",
    gradient: "from-cyan-500 to-blue-600",
  },
  {
    id: "story",
    label: "Tell a Story",
    shortLabel: "Story",
    description: "Immersive narrative weaving core concepts into an unforgettable story",
    gradient: "from-fuchsia-500 to-purple-600",
  },
  {
    id: "solve",
    label: "Solve Paper",
    shortLabel: "Solver",
    description: "Step-by-step exam & homework problem solver with full math proofs",
    gradient: "from-amber-500 to-orange-600",
  },
  {
    id: "cheatsheet",
    label: "Formula Cheat Sheet",
    shortLabel: "Cheat Sheet",
    description: "High-yield laws, equations, definitions & quick-revision sheet",
    gradient: "from-emerald-500 to-teal-600",
  },
] as const;

export const GEMINI_MODELS = [
  { id: "gemini-3-flash-preview", label: "Gemini 3 Flash Preview (Fast & Reliable — Default)" },
  { id: "gemini-3.5-flash-lite", label: "Gemini 3.5 Flash-Lite (Ultra-Fast & High Quota)" },
  { id: "gemini-3.6-flash", label: "Gemini 3.6 Flash (Stable General Purpose)" },
  { id: "gemini-3.8-flash", label: "Gemini 3.8 Flash (Multimodal — May Spike in Demand)" },
  { id: "gemini-4-argon", label: "Gemini 4 Argon (Flagship Deep STEM Reasoning — Paid Tier)" },
];

export const COURSE_GRADIENTS = [
  "from-cyan-500 to-blue-600",
  "from-violet-500 to-purple-600",
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-600",
  "from-rose-500 to-pink-600",
  "from-indigo-500 to-sky-600",
];

export interface CourseChapter {
  id: string;
  title: string;
  summary: string;
  estimatedMinutes: number;
  keyTopics: string[];
}

export interface CourseModule {
  id: string;
  title: string;
  chapters: CourseChapter[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  difficulty: "Easy" | "Medium" | "Hard";
}

export interface FlashcardItem {
  id: string;
  front: string;
  back: string;
  hint?: string;
  status: "new" | "learning" | "mastered";
}
