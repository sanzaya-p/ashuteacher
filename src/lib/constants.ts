export interface SupportedLanguage {
  code: string;
  name: string;
  flag: string;
  group: "indian" | "international";
  /**
   * Authentic native or parent derived script used on the blackboard by default
   * (e.g. Sambalpuri -> "Odia script (ଓଡ଼ିଆ ଲିପି)", Bhojpuri -> "Devanagari script (देवनागरी लिपि)").
   */
  nativeScript?: string;
  /**
   * Optional linguistic guidance so regional languages/dialects retain authentic grammar & idioms.
   */
  dialectHint?: string;
  /**
   * ONLY list fallback BCP-47 voice prefixes that use the EXACT SAME phonetic script
   * (e.g. Devanagari -> hi-IN, Odia -> or-IN, Bengali-Assamese -> bn-IN).
   * Never list cross-script fallbacks (e.g. Ol Chiki -> hi-IN), or browser TTS will
   * read only English words and silently skip all native script characters!
   */
  fallbackVoiceLangs?: string[];
  scriptFont?: string;
}

export const WRITING_SCRIPT_OPTIONS = [
  { id: "auto", label: "Auto: Native / Derived Script (Recommended)", voiceLangs: [] as string[] },
  { id: "odia", label: "Odia Script (ଓଡ଼ିଆ ଲିପି)", voiceLangs: ["or-IN"] },
  { id: "devanagari", label: "Devanagari Script (देवनागरी लिपि)", voiceLangs: ["hi-IN", "mr-IN"] },
  { id: "bengali", label: "Bengali-Assamese Script (বাংলা / অসমীয়া)", voiceLangs: ["bn-IN", "bn-BD"] },
  { id: "olchiki", label: "Ol Chiki Script (ᱚᱞ ᱪᱤᱠᱤ)", voiceLangs: [] as string[] },
  { id: "gurmukhi", label: "Gurmukhi Script (ਗੁਰਮੁਖੀ)", voiceLangs: ["pa-IN"] },
  { id: "gujarati", label: "Gujarati Script (ગુજરાતી)", voiceLangs: ["gu-IN"] },
  { id: "tamil", label: "Tamil Script (தமிழ்)", voiceLangs: ["ta-IN"] },
  { id: "telugu", label: "Telugu Script (తెలుగు)", voiceLangs: ["te-IN"] },
  { id: "kannada", label: "Kannada Script (ಕನ್ನಡ)", voiceLangs: ["kn-IN"] },
  { id: "malayalam", label: "Malayalam Script (മലയാളം)", voiceLangs: ["ml-IN"] },
  { id: "perso-arabic", label: "Perso-Arabic / Urdu Script (اردو / العربية)", voiceLangs: ["ur-IN", "ur-PK"] },
  { id: "roman", label: "Romanized / Phonetic (Latin ABC)", voiceLangs: ["en-IN", "en-US"] },
] as const;

export type WritingScriptMode = (typeof WRITING_SCRIPT_OPTIONS)[number]["id"];

export const AI_TTS_VOICES = [
  { id: "ai:Kore", voiceName: "Kore", label: "✨ AI Neural — Kore (Warm Professor)" },
  { id: "ai:Puck", voiceName: "Puck", label: "✨ AI Neural — Puck (Clear Tutor)" },
  { id: "ai:Aoede", voiceName: "Aoede", label: "✨ AI Neural — Aoede (Storyteller)" },
] as const;

export const INDIAN_LANGUAGES: SupportedLanguage[] = [
  { code: "en-IN", name: "English (India)", flag: "🇮🇳", group: "indian", nativeScript: "English Latin alphabet", fallbackVoiceLangs: ["en-US", "en-GB"] },
  { code: "hi-IN", name: "Hindi (हिन्दी)", flag: "🇮🇳", group: "indian", nativeScript: "Devanagari script (देवनागरी लिपि)" },
  { code: "or-IN", name: "Odia (ଓଡ଼ିଆ)", flag: "🇮🇳", group: "indian", nativeScript: "Odia script (ଓଡ଼ିଆ ଲିପି)", scriptFont: "'Noto Sans Oriya', sans-serif" },
  {
    code: "spv-IN",
    name: "Sambalpuri / Kosali (ସମ୍ବଲପୁରୀ)",
    flag: "🇮🇳",
    group: "indian",
    nativeScript: "Odia script (ଓଡ଼ିଆ ଲିପି)",
    dialectHint:
      "Use authentic Western Odisha Sambalpuri/Kosali spoken grammar, vocabulary, and verb forms (e.g., କର୍ମା, ପଢ଼୍ମା, ଶିଖ୍ମା, ଜାନ୍ବା, ଅଛେ, ଗୁଟେ, ଇଟା, କେନ୍ତା, ତୁମର/ଆମର) written strictly in Odia script (ଓଡ଼ିଆ ଲିପି).",
    fallbackVoiceLangs: ["or-IN"],
    scriptFont: "'Noto Sans Oriya', sans-serif",
  },
  { code: "bn-IN", name: "Bengali (বাংলা)", flag: "🇮🇳", group: "indian", nativeScript: "Bengali script (বাংলা লিপি)", fallbackVoiceLangs: ["bn-BD"] },
  { code: "te-IN", name: "Telugu (తెలుగు)", flag: "🇮🇳", group: "indian", nativeScript: "Telugu script (తెలుగు లిపి)" },
  { code: "mr-IN", name: "Marathi (मराठी)", flag: "🇮🇳", group: "indian", nativeScript: "Devanagari script (देवनागरी लिपि)", fallbackVoiceLangs: ["hi-IN"] },
  { code: "ta-IN", name: "Tamil (தமிழ்)", flag: "🇮🇳", group: "indian", nativeScript: "Tamil script (தமிழ் எழுத்து)" },
  { code: "gu-IN", name: "Gujarati (ગુજરાતી)", flag: "🇮🇳", group: "indian", nativeScript: "Gujarati script (ગુજરાતી લિપિ)" },
  { code: "ur-IN", name: "Urdu (اردو)", flag: "🇮🇳", group: "indian", nativeScript: "Urdu Perso-Arabic Nastaliq script (اردو)", fallbackVoiceLangs: ["ur-PK"] },
  { code: "kn-IN", name: "Kannada (ಕನ್ನಡ)", flag: "🇮🇳", group: "indian", nativeScript: "Kannada script (ಕನ್ನಡ ಲಿಪಿ)" },
  { code: "ml-IN", name: "Malayalam (മലയാളം)", flag: "🇮🇳", group: "indian", nativeScript: "Malayalam script (മലയാളലിപി)" },
  { code: "pa-IN", name: "Punjabi (ਪੰਜਾਬੀ)", flag: "🇮🇳", group: "indian", nativeScript: "Gurmukhi script (ਗੁਰਮੁਖੀ)" },
  { code: "as-IN", name: "Assamese (অসমীয়া)", flag: "🇮🇳", group: "indian", nativeScript: "Assamese script (অসমীয়া লিপি)", fallbackVoiceLangs: ["bn-IN", "bn-BD"] },
  { code: "mai-IN", name: "Maithili (मैथिली)", flag: "🇮🇳", group: "indian", nativeScript: "Devanagari script (देवनागरी लिपि)", fallbackVoiceLangs: ["hi-IN"] },
  { code: "sa-IN", name: "Sanskrit (संस्कृतम्)", flag: "🇮🇳", group: "indian", nativeScript: "Devanagari script (देवनागरी लिपि)", fallbackVoiceLangs: ["hi-IN"] },
  { code: "ne-IN", name: "Nepali (नेपाली)", flag: "🇮🇳", group: "indian", nativeScript: "Devanagari script (देवनागरी लिपि)", fallbackVoiceLangs: ["ne-NP", "hi-IN"] },
  { code: "kok-IN", name: "Konkani (कोंकणी)", flag: "🇮🇳", group: "indian", nativeScript: "Devanagari script (देवनागरी लिपि)", fallbackVoiceLangs: ["mr-IN", "hi-IN"] },
  { code: "doi-IN", name: "Dogri (डोगरी)", flag: "🇮🇳", group: "indian", nativeScript: "Devanagari script (देवनागरी लिपि)", fallbackVoiceLangs: ["hi-IN"] },
  { code: "brx-IN", name: "Bodo (बड़ो)", flag: "🇮🇳", group: "indian", nativeScript: "Devanagari script (देवनागरी लिपि)", fallbackVoiceLangs: ["hi-IN"] },
  { code: "mni-IN", name: "Manipuri / Meitei (মৈতৈলোন্)", flag: "🇮🇳", group: "indian", nativeScript: "Bengali-Manipuri script (মৈতৈলোন্) or Meitei Mayek (ꯃꯤꯇꯩ ꯃꯌꯦꯛ)" },
  { code: "sat-IN", name: "Santali (ᱥᱟᱱᱛᱟᱲᱤ)", flag: "🇮🇳", group: "indian", nativeScript: "Ol Chiki script (ᱚᱞ ᱪᱤᱠᱤ)" },
  { code: "ks-IN", name: "Kashmiri (कश्मीरी / کٲشُر)", flag: "🇮🇳", group: "indian", nativeScript: "Perso-Arabic (کٲشُر) or Devanagari (कश्मीरी) script" },
  { code: "sd-IN", name: "Sindhi (सिन्धी / سنڌي)", flag: "🇮🇳", group: "indian", nativeScript: "Devanagari (सिन्धी) or Perso-Arabic (سنڌي) script" },
  { code: "bho-IN", name: "Bhojpuri (भोजपुरी)", flag: "🇮🇳", group: "indian", nativeScript: "Devanagari script (देवनागरी लिपि)", fallbackVoiceLangs: ["hi-IN"] },
  { code: "hne-IN", name: "Chhattisgarhi (छत्तीसगढ़ी)", flag: "🇮🇳", group: "indian", nativeScript: "Devanagari script (देवनागरी लिपि)", fallbackVoiceLangs: ["hi-IN"] },
  { code: "raj-IN", name: "Rajasthani / Marwari (राजस्थानी)", flag: "🇮🇳", group: "indian", nativeScript: "Devanagari script (देवनागरी लिपि)", fallbackVoiceLangs: ["hi-IN"] },
  { code: "bgc-IN", name: "Haryanvi (हरियाणवी)", flag: "🇮🇳", group: "indian", nativeScript: "Devanagari script (देवनागरी लिपि)", fallbackVoiceLangs: ["hi-IN"] },
  { code: "awa-IN", name: "Awadhi (अवधी)", flag: "🇮🇳", group: "indian", nativeScript: "Devanagari script (देवनागरी लिपि)", fallbackVoiceLangs: ["hi-IN"] },
  { code: "mag-IN", name: "Magahi (मगही)", flag: "🇮🇳", group: "indian", nativeScript: "Devanagari script (देवनागरी लिपि)", fallbackVoiceLangs: ["hi-IN"] },
  { code: "gbm-IN", name: "Garhwali / Kumaoni (गढ़वाली)", flag: "🇮🇳", group: "indian", nativeScript: "Devanagari script (देवनागरी लिपि)", fallbackVoiceLangs: ["hi-IN"] },
  { code: "tcy-IN", name: "Tulu (ತುಳು)", flag: "🇮🇳", group: "indian", nativeScript: "Kannada script (ಕನ್ನಡ ಲಿಪಿ)", fallbackVoiceLangs: ["kn-IN"] },
  { code: "lus-IN", name: "Mizo (Mizo ṭawng)", flag: "🇮🇳", group: "indian", nativeScript: "Mizo Roman alphabet" },
  { code: "kha-IN", name: "Khasi (Ka Ktien Khasi)", flag: "🇮🇳", group: "indian", nativeScript: "Khasi Roman alphabet" },
  { code: "hinglish", name: "Hinglish (Hindi + English Roman Mix)", flag: "🇮🇳", group: "indian", nativeScript: "Romanized Latin script (conversational Hinglish)", fallbackVoiceLangs: ["en-IN", "hi-IN"] },
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

interface InferredDialectMeta {
  nativeScript: string;
  voiceLangs: string[];
  dialectHint?: string;
}

export function inferCustomDialectMeta(rawName: string): InferredDialectMeta {
  const lower = rawName.toLowerCase();

  if (
    /sambalpuri|kosali|kosli|desia|koraputia|baleswari|ganjamia|sundargadi|kalahandia|odia|oriya/.test(
      lower
    )
  ) {
    return {
      nativeScript: "Odia script (ଓଡ଼ିଆ ଲିପି)",
      voiceLangs: ["or-IN"],
      dialectHint:
        "Use authentic Western/regional Odisha dialect vocabulary, idioms, and verb endings (e.g., କର୍ମା, ପଢ଼୍ମା, ଶିଖ୍ମା, ଜାନ୍ବା, ଅଛେ, ଗୁଟେ, ଇଟା, କେନ୍ତା) written strictly in Odia script (ଓଡ଼ିଆ ଲିପି).",
    };
  }

  if (
    /bhojpuri|maithili|magahi|angika|bajjika|awadhi|braj|bundeli|bagheli|chhattisgarhi|rajasthani|marwari|mewari|dhundhari|harauti|mewati|malvi|nimadi|haryanvi|garhwali|kumaoni|jaunsari|pahari|kangri|mandeali|kullui|sadri|nagpuri|khortha|kurmali|panchpargania|halbi|gondi|bhili|ahirani|khandeshi|varhadi/.test(
      lower
    )
  ) {
    return {
      nativeScript: "Devanagari script (देवनागरी लिपि)",
      voiceLangs: ["hi-IN", "mr-IN"],
    };
  }

  if (/tulu|kodava|coorgi|beary|havyaka|kundapura|badaga/.test(lower)) {
    return {
      nativeScript: "Kannada script (ಕನ್ನಡ ಲಿಪಿ)",
      voiceLangs: ["kn-IN"],
    };
  }

  if (/sylheti|chittagonian|rajbanshi|kamatapuri|chakma|bishnupriya|goalpariya/.test(lower)) {
    return {
      nativeScript: "Bengali-Assamese script (বাংলা / অসমীয়া লিপি)",
      voiceLangs: ["bn-IN", "bn-BD"],
    };
  }

  if (/saraiki|seraiki|hindko|pothwari|shahmukhi|balochi|brahui/.test(lower)) {
    return {
      nativeScript: "Perso-Arabic / Urdu script (اردو)",
      voiceLangs: ["ur-IN", "ur-PK"],
    };
  }

  if (/mizo|khasi|garo|nagamese|kokborok|ao|angami|sumi|lotha|tangkhul/.test(lower)) {
    return {
      nativeScript: "Native Roman / Latin orthography of the language",
      voiceLangs: [],
    };
  }

  return {
    nativeScript:
      "its authentic native writing system or the script of its parent/regional literary language (NEVER Romanized English transliteration unless Latin is the official native alphabet of that language)",
    voiceLangs: [],
  };
}

export interface ParsedLanguageSelection {
  baseCode: string;
  scriptMode: WritingScriptMode;
  languageName: string;
  effectiveScriptLabel: string;
  dialectHint?: string;
  voiceLangCandidates: string[];
}

export function encodeLanguageAndScript(
  baseCode: string,
  scriptMode: WritingScriptMode
): string {
  const cleanBase = (baseCode || "en-US").split("|script=")[0].trim() || "en-US";
  if (!scriptMode || scriptMode === "auto") {
    return cleanBase;
  }
  return `${cleanBase}|script=${scriptMode}`;
}

export function parseLanguageAndScript(rawCode: string): ParsedLanguageSelection {
  const raw = (rawCode || "en-US").trim();
  const [basePart, scriptPart] = raw.split("|script=");
  const baseCode = (basePart || "en-US").trim();
  const validScriptOption = WRITING_SCRIPT_OPTIONS.find(
    (opt) => opt.id === scriptPart
  );
  const scriptMode: WritingScriptMode = validScriptOption ? validScriptOption.id : "auto";

  let languageName = baseCode;
  let defaultScriptLabel =
    "the authentic native writing system or parent regional script traditionally used for this language";
  let dialectHint: string | undefined;
  let defaultVoiceCandidates: string[] = [];

  if (baseCode.startsWith("custom:")) {
    const customName = baseCode.slice("custom:".length).trim() || "English";
    languageName = customName;
    const inferred = inferCustomDialectMeta(customName);
    defaultScriptLabel = inferred.nativeScript;
    dialectHint = inferred.dialectHint;
    defaultVoiceCandidates = inferred.voiceLangs;
  } else {
    const matched = SUPPORTED_LANGUAGES.find(
      (l) => l.code.toLowerCase() === baseCode.toLowerCase()
    );
    if (matched) {
      languageName = matched.name;
      if (matched.nativeScript) {
        defaultScriptLabel = matched.nativeScript;
      }
      dialectHint = matched.dialectHint;
      defaultVoiceCandidates = [
        matched.code,
        matched.code.split("-")[0],
        ...(matched.fallbackVoiceLangs || []),
      ];
    } else {
      defaultVoiceCandidates = [baseCode, baseCode.split("-")[0]];
    }
  }

  let effectiveScriptLabel = defaultScriptLabel;
  let voiceLangCandidates = defaultVoiceCandidates;

  if (scriptMode !== "auto" && validScriptOption) {
    effectiveScriptLabel = validScriptOption.label;
    voiceLangCandidates = [...validScriptOption.voiceLangs];
  }

  return {
    baseCode,
    scriptMode,
    languageName,
    effectiveScriptLabel,
    dialectHint,
    voiceLangCandidates: Array.from(
      new Set(
        voiceLangCandidates
          .filter((c) => c && c !== "hinglish" && !c.startsWith("spv"))
          .map((c) => c.replace(/_/g, "-").toLowerCase())
      )
    ),
  };
}

/**
 * Returns browser SpeechSynthesisVoice[] that can genuinely pronounce the target language's written script.
 * Returns [] when no compatible native/same-script browser voice is installed on the user's device.
 */
export function findBrowserVoicesForLanguage<T extends { lang: string }>(
  voices: T[],
  languageCode: string
): T[] {
  if (!voices.length) return [];
  const parsed = parseLanguageAndScript(languageCode);
  if (!parsed.voiceLangCandidates.length) return [];

  for (const candidate of parsed.voiceLangCandidates) {
    const matched = voices.filter((v) => {
      const norm = (v.lang || "").replace(/_/g, "-").toLowerCase();
      return norm === candidate || norm.startsWith(`${candidate}-`);
    });
    if (matched.length > 0) return matched;
  }
  return [];
}

export const STUDENT_LEVELS = [
  { id: "KG & Early Wonder", label: "KG / Early Child", desc: "Playful stories, rhymes, simple words & curiosity (Ages 4–7)" },
  { id: "Primary & Middle School", label: "School (Classes 3–8)", desc: "Clear foundations, fun visual analogies & activity examples" },
  { id: "Beginner", label: "Beginner", desc: "Intuitive analogies & zero jargon" },
  { id: "Intermediate", label: "High School / Board (9–12)", desc: "Board-aligned concepts, NCERT/IB/AP rigor & worked problems" },
  { id: "Advanced", label: "University & Competitive", desc: "Rigorous derivations, JEE/GRE/GATE/MCAT depth & edge cases" },
  { id: "Expert", label: "Doctoral / MIT Researcher", desc: "First-principles proofs, state-of-the-art theory & research rigor" },
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
