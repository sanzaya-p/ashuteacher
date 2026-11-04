export interface SupportedLanguage {
  code: string;
  name: string;
  flag: string;
  group: "indian" | "international";
  /**
   * ONLY list fallback BCP-47 voice prefixes that use the EXACT SAME phonetic script
   * (e.g. Devanagari -> hi-IN, Bengali-Assamese -> bn-IN).
   * Never list cross-script fallbacks (e.g. Ol Chiki -> hi-IN), or browser TTS will
   * read only English words and silently skip all native script characters!
   */
  fallbackVoiceLangs?: string[];
  scriptFont?: string;
}

export const AI_TTS_VOICES = [
  { id: "ai:Kore", voiceName: "Kore", label: "✨ AI Neural — Kore (Warm Professor)" },
  { id: "ai:Puck", voiceName: "Puck", label: "✨ AI Neural — Puck (Clear Tutor)" },
  { id: "ai:Aoede", voiceName: "Aoede", label: "✨ AI Neural — Aoede (Storyteller)" },
] as const;

export const INDIAN_LANGUAGES: SupportedLanguage[] = [
  { code: "en-IN", name: "English (India)", flag: "🇮🇳", group: "indian", fallbackVoiceLangs: ["en-US", "en-GB"] },
  { code: "hi-IN", name: "Hindi (हिन्दी)", flag: "🇮🇳", group: "indian" },
  { code: "or-IN", name: "Odia (ଓଡ଼ିଆ)", flag: "🇮🇳", group: "indian", scriptFont: "'Noto Sans Oriya', sans-serif" },
  { code: "bn-IN", name: "Bengali (বাংলা)", flag: "🇮🇳", group: "indian", fallbackVoiceLangs: ["bn-BD"] },
  { code: "te-IN", name: "Telugu (తెలుగు)", flag: "🇮🇳", group: "indian" },
  { code: "mr-IN", name: "Marathi (मराठी)", flag: "🇮🇳", group: "indian", fallbackVoiceLangs: ["hi-IN"] },
  { code: "ta-IN", name: "Tamil (தமிழ்)", flag: "🇮🇳", group: "indian" },
  { code: "gu-IN", name: "Gujarati (ગુજરાતી)", flag: "🇮🇳", group: "indian" },
  { code: "ur-IN", name: "Urdu (اردو)", flag: "🇮🇳", group: "indian", fallbackVoiceLangs: ["ur-PK"] },
  { code: "kn-IN", name: "Kannada (ಕನ್ನಡ)", flag: "🇮🇳", group: "indian" },
  { code: "ml-IN", name: "Malayalam (മലയാളം)", flag: "🇮🇳", group: "indian" },
  { code: "pa-IN", name: "Punjabi (ਪੰਜਾਬੀ)", flag: "🇮🇳", group: "indian" },
  { code: "as-IN", name: "Assamese (অসমীয়া)", flag: "🇮🇳", group: "indian", fallbackVoiceLangs: ["bn-IN", "bn-BD"] },
  { code: "mai-IN", name: "Maithili (मैथिली)", flag: "🇮🇳", group: "indian", fallbackVoiceLangs: ["hi-IN"] },
  { code: "sa-IN", name: "Sanskrit (संस्कृतम्)", flag: "🇮🇳", group: "indian", fallbackVoiceLangs: ["hi-IN"] },
  { code: "ne-IN", name: "Nepali (नेपाली)", flag: "🇮🇳", group: "indian", fallbackVoiceLangs: ["ne-NP", "hi-IN"] },
  { code: "kok-IN", name: "Konkani (कोंकणी)", flag: "🇮🇳", group: "indian", fallbackVoiceLangs: ["mr-IN", "hi-IN"] },
  { code: "doi-IN", name: "Dogri (डोगरी)", flag: "🇮🇳", group: "indian", fallbackVoiceLangs: ["hi-IN"] },
  { code: "brx-IN", name: "Bodo (बड़ो)", flag: "🇮🇳", group: "indian", fallbackVoiceLangs: ["hi-IN"] },
  { code: "mni-IN", name: "Manipuri / Meitei (মৈতৈলোন্)", flag: "🇮🇳", group: "indian" },
  { code: "sat-IN", name: "Santali (ᱥᱟᱱᱛᱟᱲᱤ)", flag: "🇮🇳", group: "indian" },
  { code: "ks-IN", name: "Kashmiri (कश्मीरी / کٲشُر)", flag: "🇮🇳", group: "indian" },
  { code: "sd-IN", name: "Sindhi (सिन्धी / سنڌي)", flag: "🇮🇳", group: "indian" },
  { code: "bho-IN", name: "Bhojpuri (भोजपुरी)", flag: "🇮🇳", group: "indian", fallbackVoiceLangs: ["hi-IN"] },
  { code: "hinglish", name: "Hinglish (Hindi + English Mix)", flag: "🇮🇳", group: "indian", fallbackVoiceLangs: ["en-IN", "hi-IN"] },
];

export const INTERNATIONAL_LANGUAGES: SupportedLanguage[] = [
  { code: "en-US", name: "English (US)", flag: "🇺🇸", group: "international" },
  { code: "en-GB", name: "English (UK)", flag: "🇬🇧", group: "international" },
  { code: "es-ES", name: "Spanish (Español)", flag: "🇪🇸", group: "international" },
  { code: "fr-FR", name: "French (Français)", flag: "🇫🇷", group: "international" },
  { code: "de-DE", name: "German (Deutsch)", flag: "🇩🇪", group: "international" },
  { code: "ar-SA", name: "Arabic (العربية)", flag: "🇸🇦", group: "international" },
  { code: "zh-CN", name: "Chinese Simplified (简体中文)", flag: "🇨🇳", group: "international" },
  { code: "zh-TW", name: "Chinese Traditional (繁體中文)", flag: "🇹🇼", group: "international" },
  { code: "ja-JP", name: "Japanese (日本語)", flag: "🇯🇵", group: "international" },
  { code: "ko-KR", name: "Korean (한국어)", flag: "🇰🇷", group: "international" },
  { code: "pt-BR", name: "Portuguese (Português)", flag: "🇧🇷", group: "international" },
  { code: "ru-RU", name: "Russian (Русский)", flag: "🇷🇺", group: "international" },
  { code: "it-IT", name: "Italian (Italiano)", flag: "🇮🇹", group: "international" },
  { code: "id-ID", name: "Indonesian (Bahasa Indonesia)", flag: "🇮🇩", group: "international" },
  { code: "vi-VN", name: "Vietnamese (Tiếng Việt)", flag: "🇻🇳", group: "international" },
  { code: "tr-TR", name: "Turkish (Türkçe)", flag: "🇹🇷", group: "international" },
  { code: "th-TH", name: "Thai (ไทย)", flag: "🇹🇭", group: "international" },
  { code: "fa-IR", name: "Persian / Farsi (فارسی)", flag: "🇮🇷", group: "international" },
  { code: "nl-NL", name: "Dutch (Nederlands)", flag: "🇳🇱", group: "international" },
  { code: "pl-PL", name: "Polish (Polski)", flag: "🇵🇱", group: "international" },
  { code: "uk-UA", name: "Ukrainian (Українська)", flag: "🇺🇦", group: "international" },
  { code: "ms-MY", name: "Malay (Bahasa Melayu)", flag: "🇲🇾", group: "international" },
  { code: "fil-PH", name: "Filipino / Tagalog", flag: "🇵🇭", group: "international" },
  { code: "sw-KE", name: "Swahili (Kiswahili)", flag: "🇰🇪", group: "international" },
  { code: "el-GR", name: "Greek (Ελληνικά)", flag: "🇬🇷", group: "international" },
  { code: "he-IL", name: "Hebrew (עברית)", flag: "🇮🇱", group: "international" },
  { code: "sv-SE", name: "Swedish (Svenska)", flag: "🇸🇪", group: "international" },
  { code: "no-NO", name: "Norwegian (Norsk)", flag: "🇳🇴", group: "international" },
  { code: "da-DK", name: "Danish (Dansk)", flag: "🇩🇰", group: "international" },
  { code: "fi-FI", name: "Finnish (Suomi)", flag: "🇫🇮", group: "international" },
  { code: "cs-CZ", name: "Czech (Čeština)", flag: "🇨🇿", group: "international" },
  { code: "ro-RO", name: "Romanian (Română)", flag: "🇷🇴", group: "international" },
  { code: "hu-HU", name: "Hungarian (Magyar)", flag: "🇭🇺", group: "international" },
  { code: "bg-BG", name: "Bulgarian (Български)", flag: "🇧🇬", group: "international" },
  { code: "sr-RS", name: "Serbian (Српски)", flag: "🇷🇸", group: "international" },
  { code: "hr-HR", name: "Croatian (Hrvatski)", flag: "🇭🇷", group: "international" },
  { code: "sk-SK", name: "Slovak (Slovenčina)", flag: "🇸🇰", group: "international" },
  { code: "sl-SI", name: "Slovenian (Slovenščina)", flag: "🇸🇮", group: "international" },
  { code: "lt-LT", name: "Lithuanian (Lietuvių)", flag: "🇱🇹", group: "international" },
  { code: "lv-LV", name: "Latvian (Latviešu)", flag: "🇱🇻", group: "international" },
  { code: "et-EE", name: "Estonian (Eesti)", flag: "🇪🇪", group: "international" },
  { code: "ca-ES", name: "Catalan (Català)", flag: "🇪🇸", group: "international" },
  { code: "bn-BD", name: "Bengali (Bangladesh)", flag: "🇧🇩", group: "international" },
  { code: "si-LK", name: "Sinhala (සිංහල)", flag: "🇱🇰", group: "international" },
  { code: "my-MM", name: "Burmese / Myanmar (မြန်မာ)", flag: "🇲🇲", group: "international" },
  { code: "km-KH", name: "Khmer (ខ្មែរ)", flag: "🇰🇭", group: "international" },
  { code: "lo-LA", name: "Lao (ລາວ)", flag: "🇱🇦", group: "international" },
  { code: "dz-BT", name: "Dzongkha (Bhutan)", flag: "🇧🇹", group: "international" },
  { code: "ps-AF", name: "Pashto (پښتو)", flag: "🇦🇫", group: "international" },
  { code: "uz-UZ", name: "Uzbek (Oʻzbek)", flag: "🇺🇿", group: "international" },
  { code: "kk-KZ", name: "Kazakh (Қазақша)", flag: "🇰🇿", group: "international" },
  { code: "az-AZ", name: "Azerbaijani (Azərbaycan)", flag: "🇦🇿", group: "international" },
  { code: "ka-GE", name: "Georgian (ქართული)", flag: "🇬🇪", group: "international" },
  { code: "hy-AM", name: "Armenian (Հայերեն)", flag: "🇦🇲", group: "international" },
  { code: "am-ET", name: "Amharic (አማርኛ)", flag: "🇪🇹", group: "international" },
  { code: "yo-NG", name: "Yoruba", flag: "🇳🇬", group: "international" },
  { code: "ha-NG", name: "Hausa", flag: "🇳🇬", group: "international" },
  { code: "ig-NG", name: "Igbo", flag: "🇳🇬", group: "international" },
  { code: "zu-ZA", name: "Zulu (isiZulu)", flag: "🇿🇦", group: "international" },
  { code: "af-ZA", name: "Afrikaans", flag: "🇿🇦", group: "international" },
];

export const SUPPORTED_LANGUAGES: SupportedLanguage[] = [
  ...INDIAN_LANGUAGES,
  ...INTERNATIONAL_LANGUAGES,
];

/**
 * Returns browser SpeechSynthesisVoice[] that can genuinely pronounce the target language's script.
 * Returns [] when no compatible native/same-script browser voice is installed on the user's device
 * (e.g., Santali Ol Chiki `sat-IN`, Manipuri `mni-IN`, Custom dialects, or Odia on desktop Chrome).
 */
export function findBrowserVoicesForLanguage<T extends { lang: string }>(
  voices: T[],
  languageCode: string
): T[] {
  if (!voices.length || languageCode.startsWith("custom:")) {
    return [];
  }
  const langEntry = SUPPORTED_LANGUAGES.find((l) => l.code === languageCode);
  const baseLang = languageCode.split("-")[0];
  const candidates = Array.from(
    new Set(
      [
        languageCode,
        baseLang,
        ...(langEntry?.fallbackVoiceLangs || []),
      ]
        .filter((c) => c && c !== "hinglish")
        .map((c) => c.replace(/_/g, "-").toLowerCase())
    )
  );

  for (const candidate of candidates) {
    const matched = voices.filter((v) => {
      const norm = (v.lang || "").replace(/_/g, "-").toLowerCase();
      return norm === candidate || norm.startsWith(`${candidate}-`);
    });
    if (matched.length > 0) return matched;
  }
  return [];
}

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
