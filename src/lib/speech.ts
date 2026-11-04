/**
 * Converts LaTeX math expressions into natural spoken English/text
 * so the browser SpeechSynthesis engine reads formulas clearly.
 */
export function latexToSpeech(latex: string): string {
  let text = ` ${latex} `;
  text = text.replace(/\\begin\{aligned\}|\\end\{aligned\}/g, " ");
  text = text.replace(/\\\\/g, ", ");
  text = text.replace(/&/g, " ");
  text = text.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, " $1 over $2 ");
  text = text.replace(/\\lim_\{([^}]+)\s*\\to\s*([^}]+)\}/g, " the limit as $1 approaches $2 of ");
  text = text.replace(/\\frac\{d\}\{d([^}]+)\}/g, " the derivative with respect to $1 of ");
  text = text.replace(/\\sqrt\{([^}]+)\}/g, " the square root of $1 ");
  text = text.replace(/([a-zA-Z0-9]+)\^2([^a-zA-Z0-9])/g, "$1 squared$2");
  text = text.replace(/([a-zA-Z0-9]+)\^3([^a-zA-Z0-9])/g, "$1 cubed$2");
  text = text.replace(/([a-zA-Z0-9]+)\^\{([^}]+)\}/g, "$1 to the power of $2");
  text = text.replace(/([a-zA-Z0-9]+)\^([0-9.]+)/g, "$1 to the power of $2");
  text = text.replace(/_\{([^}]+)\}/g, " sub $1 ");

  const replacements: Record<string, string> = {
    "\\sin": "sine",
    "\\cos": "cosine",
    "\\tan": "tangent",
    "\\log": "log",
    "\\ln": "natural log",
    "\\to": "approaches",
    "\\rightarrow": "implies",
    "\\Rightarrow": "implies",
    "\\infty": "infinity",
    "\\times": "times",
    "\\cdot": "times",
    "\\pm": "plus or minus",
    "\\neq": "is not equal to",
    "\\approx": "is approximately",
    "\\geq": "is greater than or equal to",
    "\\leq": "is less than or equal to",
    "\\alpha": "alpha",
    "\\beta": "beta",
    "\\gamma": "gamma",
    "\\delta": "delta",
    "\\Delta": "delta",
    "\\lambda": "lambda",
    "\\omega": "omega",
    "\\Omega": "omega",
    "\\pi": "pi",
    "\\theta": "theta",
    "\\sigma": "sigma",
    "\\mu": "mu",
    "\\sum": "the sum of",
    "\\int": "the integral of",
    "\\partial": "partial",
    "=": " equals ",
    "+": " plus ",
  };

  for (const [key, value] of Object.entries(replacements)) {
    const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    text = text.replace(new RegExp(escaped, "g"), ` ${value} `);
  }

  text = text.replace(/\{|\}|\\/g, " ");
  text = text.replace(/\s+/g, " ").trim();
  return text;
}

/**
 * Strips markdown & converts inline/block LaTeX into clean spoken narration text,
 * returning paragraphs/sentences suitable for SpeechSynthesis tracking.
 */
export function markdownToSpeechSegments(markdown: string): string[] {
  if (!markdown) return [];

  // Skip mermaid diagrams and raw code blocks cleanly so non-English narration stays natural
  let cleaned = markdown.replace(/```mermaid[\s\S]*?```/g, "\n\n");
  cleaned = cleaned.replace(/```[\w-]*\n([\s\S]*?)```/g, "\n\n");
  // Convert block math
  cleaned = cleaned.replace(/\$\$([\s\S]*?)\$\$/g, (_, math) => ` ${latexToSpeech(math)}. `);
  // Convert inline math
  cleaned = cleaned.replace(/\$([^$\n]+)\$/g, (_, math) => ` ${latexToSpeech(math)} `);
  // Strip markdown formatting symbols
  cleaned = cleaned
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/^\s*[-*+]\s+/gm, "")
    .replace(/^\s*\d+\.\s+/gm, "")
    .replace(/\|/g, " ");

  return cleaned
    .split(/\n{2,}|(?<=[.!?।॥᱾᱿۔။།።。！？؟])\s*/)
    .map((s) => s.replace(/\s+/g, " ").trim())
    .filter((s) => s.length > 1);
}
