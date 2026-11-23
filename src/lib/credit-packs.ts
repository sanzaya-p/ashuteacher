export const WELCOME_FREE_CREDITS = 30;

export const CREDIT_COSTS = {
  DOUBT: 1,
  ASSISTANT: 1,
  FLASHCARDS: 1,
  RESEARCH_MENTOR: 1,
  QUIZ: 2,
  LESSON: 2,
  RESEARCH_PROJECT: 3,
  SOLVE_PAPER: 4,
  COURSE: 4,
  PROGRAM: 4,
} as const;

export interface CreditPack {
  id: "starter" | "cram" | "scholar";
  name: string;
  badge?: string;
  credits: number;
  priceInr: number; // Display ₹
  amountPaise: number; // Razorpay subunits (INR * 100)
  priceUsd: number; // Display $
  amountCents: number; // USD subunits
  tagline: string;
  features: string[];
  gradient: string;
}

export interface WorldCurrencyConfig {
  code: string;
  name: string;
  symbol: string;
  flag: string;
  zeroDecimal?: boolean;
  prices: {
    starter: { display: string; subunits: number };
    cram: { display: string; subunits: number };
    scholar: { display: string; subunits: number };
  };
}

export const WORLD_CURRENCIES: WorldCurrencyConfig[] = [
  {
    code: "INR",
    name: "Indian Rupee",
    symbol: "₹",
    flag: "🇮🇳",
    prices: {
      starter: { display: "₹99", subunits: 9900 },
      cram: { display: "₹299", subunits: 29900 },
      scholar: { display: "₹699", subunits: 69900 },
    },
  },
  {
    code: "USD",
    name: "US Dollar (Global)",
    symbol: "$",
    flag: "🌎",
    prices: {
      starter: { display: "$2.99", subunits: 299 },
      cram: { display: "$7.99", subunits: 799 },
      scholar: { display: "$19.99", subunits: 1999 },
    },
  },
  {
    code: "EUR",
    name: "Euro",
    symbol: "€",
    flag: "🇪🇺",
    prices: {
      starter: { display: "€2.79", subunits: 279 },
      cram: { display: "€7.49", subunits: 749 },
      scholar: { display: "€18.49", subunits: 1849 },
    },
  },
  {
    code: "GBP",
    name: "British Pound",
    symbol: "£",
    flag: "🇬🇧",
    prices: {
      starter: { display: "£2.39", subunits: 239 },
      cram: { display: "£6.49", subunits: 649 },
      scholar: { display: "£15.99", subunits: 1599 },
    },
  },
  {
    code: "AED",
    name: "UAE Dirham",
    symbol: "AED ",
    flag: "🇦🇪",
    prices: {
      starter: { display: "AED 10.99", subunits: 1099 },
      cram: { display: "AED 29.00", subunits: 2900 },
      scholar: { display: "AED 73.00", subunits: 7300 },
    },
  },
  {
    code: "SAR",
    name: "Saudi Riyal",
    symbol: "SAR ",
    flag: "🇸🇦",
    prices: {
      starter: { display: "SAR 10.99", subunits: 1099 },
      cram: { display: "SAR 29.99", subunits: 2999 },
      scholar: { display: "SAR 74.99", subunits: 7499 },
    },
  },
  {
    code: "AUD",
    name: "Australian Dollar",
    symbol: "A$",
    flag: "🇦🇺",
    prices: {
      starter: { display: "A$4.49", subunits: 449 },
      cram: { display: "A$11.99", subunits: 1199 },
      scholar: { display: "A$29.99", subunits: 2999 },
    },
  },
  {
    code: "CAD",
    name: "Canadian Dollar",
    symbol: "C$",
    flag: "🇨🇦",
    prices: {
      starter: { display: "C$3.99", subunits: 399 },
      cram: { display: "C$10.99", subunits: 1099 },
      scholar: { display: "C$26.99", subunits: 2699 },
    },
  },
  {
    code: "SGD",
    name: "Singapore Dollar",
    symbol: "S$",
    flag: "🇸🇬",
    prices: {
      starter: { display: "S$3.99", subunits: 399 },
      cram: { display: "S$10.49", subunits: 1049 },
      scholar: { display: "S$26.49", subunits: 2649 },
    },
  },
  {
    code: "BRL",
    name: "Brazilian Real",
    symbol: "R$",
    flag: "🇧🇷",
    prices: {
      starter: { display: "R$ 14,90", subunits: 1490 },
      cram: { display: "R$ 39,90", subunits: 3990 },
      scholar: { display: "R$ 99,90", subunits: 9990 },
    },
  },
  {
    code: "MXN",
    name: "Mexican Peso",
    symbol: "MX$",
    flag: "🇲🇽",
    prices: {
      starter: { display: "MX$59", subunits: 5900 },
      cram: { display: "MX$159", subunits: 15900 },
      scholar: { display: "MX$399", subunits: 39900 },
    },
  },
  {
    code: "JPY",
    name: "Japanese Yen",
    symbol: "¥",
    flag: "🇯🇵",
    zeroDecimal: true,
    prices: {
      starter: { display: "¥450", subunits: 450 },
      cram: { display: "¥1,200", subunits: 1200 },
      scholar: { display: "¥2,980", subunits: 2980 },
    },
  },
  {
    code: "CNY",
    name: "Chinese Yuan",
    symbol: "¥",
    flag: "🇨🇳",
    prices: {
      starter: { display: "¥21.90", subunits: 2190 },
      cram: { display: "¥58.00", subunits: 5800 },
      scholar: { display: "¥145.00", subunits: 14500 },
    },
  },
  {
    code: "IDR",
    name: "Indonesian Rupiah",
    symbol: "Rp",
    flag: "🇮🇩",
    prices: {
      starter: { display: "Rp 45.000", subunits: 4500000 },
      cram: { display: "Rp 119.000", subunits: 11900000 },
      scholar: { display: "Rp 299.000", subunits: 29900000 },
    },
  },
  {
    code: "MYR",
    name: "Malaysian Ringgit",
    symbol: "RM",
    flag: "🇲🇾",
    prices: {
      starter: { display: "RM 12.90", subunits: 1290 },
      cram: { display: "RM 34.90", subunits: 3490 },
      scholar: { display: "RM 88.00", subunits: 8800 },
    },
  },
  {
    code: "PHP",
    name: "Philippine Peso",
    symbol: "₱",
    flag: "🇵🇭",
    prices: {
      starter: { display: "₱169", subunits: 16900 },
      cram: { display: "₱449", subunits: 44900 },
      scholar: { display: "₱1,149", subunits: 114900 },
    },
  },
  {
    code: "THB",
    name: "Thai Baht",
    symbol: "฿",
    flag: "🇹🇭",
    prices: {
      starter: { display: "฿99", subunits: 9900 },
      cram: { display: "฿269", subunits: 26900 },
      scholar: { display: "฿669", subunits: 66900 },
    },
  },
  {
    code: "NGN",
    name: "Nigerian Naira",
    symbol: "₦",
    flag: "🇳🇬",
    prices: {
      starter: { display: "₦4,500", subunits: 450000 },
      cram: { display: "₦12,000", subunits: 1200000 },
      scholar: { display: "₦29,900", subunits: 2990000 },
    },
  },
  {
    code: "ZAR",
    name: "South African Rand",
    symbol: "R",
    flag: "🇿🇦",
    prices: {
      starter: { display: "R 54", subunits: 5400 },
      cram: { display: "R 145", subunits: 14500 },
      scholar: { display: "R 359", subunits: 35900 },
    },
  },
  {
    code: "KES",
    name: "Kenyan Shilling",
    symbol: "KSh ",
    flag: "🇰🇪",
    prices: {
      starter: { display: "KSh 390", subunits: 39000 },
      cram: { display: "KSh 1,050", subunits: 105000 },
      scholar: { display: "KSh 2,590", subunits: 259000 },
    },
  },
  {
    code: "EGP",
    name: "Egyptian Pound",
    symbol: "E£",
    flag: "🇪🇬",
    prices: {
      starter: { display: "E£145", subunits: 14500 },
      cram: { display: "E£389", subunits: 38900 },
      scholar: { display: "E£975", subunits: 97500 },
    },
  },
  {
    code: "TRY",
    name: "Turkish Lira",
    symbol: "₺",
    flag: "🇹🇷",
    prices: {
      starter: { display: "₺99", subunits: 9900 },
      cram: { display: "₺269", subunits: 26900 },
      scholar: { display: "₺679", subunits: 67900 },
    },
  },
  {
    code: "CHF",
    name: "Swiss Franc",
    symbol: "CHF ",
    flag: "🇨🇭",
    prices: {
      starter: { display: "CHF 2.69", subunits: 269 },
      cram: { display: "CHF 7.19", subunits: 719 },
      scholar: { display: "CHF 17.99", subunits: 1799 },
    },
  },
  {
    code: "PLN",
    name: "Polish Złoty",
    symbol: "zł",
    flag: "🇵🇱",
    prices: {
      starter: { display: "11,99 zł", subunits: 1199 },
      cram: { display: "31,99 zł", subunits: 3199 },
      scholar: { display: "79,99 zł", subunits: 7999 },
    },
  },
  {
    code: "SEK",
    name: "Swedish Krona",
    symbol: "kr",
    flag: "🇸🇪",
    prices: {
      starter: { display: "32 kr", subunits: 3200 },
      cram: { display: "85 kr", subunits: 8500 },
      scholar: { display: "215 kr", subunits: 21500 },
    },
  },
  {
    code: "NOK",
    name: "Norwegian Krone",
    symbol: "kr",
    flag: "🇳🇴",
    prices: {
      starter: { display: "33 kr", subunits: 3300 },
      cram: { display: "88 kr", subunits: 8800 },
      scholar: { display: "219 kr", subunits: 21900 },
    },
  },
  {
    code: "DKK",
    name: "Danish Krone",
    symbol: "kr",
    flag: "🇩🇰",
    prices: {
      starter: { display: "21 kr", subunits: 2100 },
      cram: { display: "56 kr", subunits: 5600 },
      scholar: { display: "139 kr", subunits: 13900 },
    },
  },
  {
    code: "HKD",
    name: "Hong Kong Dollar",
    symbol: "HK$",
    flag: "🇭🇰",
    prices: {
      starter: { display: "HK$23", subunits: 2300 },
      cram: { display: "HK$62", subunits: 6200 },
      scholar: { display: "HK$155", subunits: 15500 },
    },
  },
  {
    code: "NZD",
    name: "New Zealand Dollar",
    symbol: "NZ$",
    flag: "🇳🇿",
    prices: {
      starter: { display: "NZ$4.99", subunits: 499 },
      cram: { display: "NZ$13.49", subunits: 1349 },
      scholar: { display: "NZ$33.99", subunits: 3399 },
    },
  },
  {
    code: "BDT",
    name: "Bangladeshi Taka",
    symbol: "৳",
    flag: "🇧🇩",
    prices: {
      starter: { display: "৳349", subunits: 34900 },
      cram: { display: "৳949", subunits: 94900 },
      scholar: { display: "৳2,390", subunits: 239000 },
    },
  },
  {
    code: "LKR",
    name: "Sri Lankan Rupee",
    symbol: "Rs ",
    flag: "🇱🇰",
    prices: {
      starter: { display: "Rs 890", subunits: 89000 },
      cram: { display: "Rs 2,390", subunits: 239000 },
      scholar: { display: "Rs 5,990", subunits: 599000 },
    },
  },
  {
    code: "NPR",
    name: "Nepalese Rupee",
    symbol: "रू ",
    flag: "🇳🇵",
    prices: {
      starter: { display: "रू 160", subunits: 16000 },
      cram: { display: "रू 480", subunits: 48000 },
      scholar: { display: "रू 1,120", subunits: 112000 },
    },
  },
  {
    code: "QAR",
    name: "Qatari Riyal",
    symbol: "QAR ",
    flag: "🇶🇦",
    prices: {
      starter: { display: "QAR 10.99", subunits: 1099 },
      cram: { display: "QAR 29.00", subunits: 2900 },
      scholar: { display: "QAR 73.00", subunits: 7300 },
    },
  },
  {
    code: "ILS",
    name: "Israeli Shekel",
    symbol: "₪",
    flag: "🇮🇱",
    prices: {
      starter: { display: "₪10.90", subunits: 1090 },
      cram: { display: "₪29.90", subunits: 2990 },
      scholar: { display: "₪74.90", subunits: 7490 },
    },
  },
  {
    code: "COP",
    name: "Colombian Peso",
    symbol: "COL$",
    flag: "🇨🇴",
    prices: {
      starter: { display: "COL$12.900", subunits: 1290000 },
      cram: { display: "COL$34.900", subunits: 3490000 },
      scholar: { display: "COL$86.900", subunits: 8690000 },
    },
  },
  {
    code: "PEN",
    name: "Peruvian Sol",
    symbol: "S/",
    flag: "🇵🇪",
    prices: {
      starter: { display: "S/ 10.90", subunits: 1090 },
      cram: { display: "S/ 29.90", subunits: 2990 },
      scholar: { display: "S/ 74.90", subunits: 7490 },
    },
  },
];

export function getWorldCurrency(code?: string): WorldCurrencyConfig {
  const clean = String(code || "INR").trim().toUpperCase();
  return (
    WORLD_CURRENCIES.find((c) => c.code === clean) ||
    WORLD_CURRENCIES.find((c) => c.code === "USD")!
  );
}

export function getPackPriceForCurrency(
  packId: string,
  currencyCode?: string
): { currency: string; display: string; subunits: number } {
  const cfg = getWorldCurrency(currencyCode);
  const key = (
    packId === "cram" || packId === "scholar" ? packId : "starter"
  ) as "starter" | "cram" | "scholar";
  return {
    currency: cfg.code,
    display: cfg.prices[key].display,
    subunits: cfg.prices[key].subunits,
  };
}

export function detectDefaultCurrencyCode(timeZone?: string): string {
  const tz = String(timeZone || "").trim();
  if (!tz || tz === "Asia/Kolkata" || tz === "Asia/Calcutta") return "INR";
  if (tz === "Asia/Dhaka") return "BDT";
  if (tz === "Asia/Colombo") return "LKR";
  if (tz === "Asia/Kathmandu" || tz === "Asia/Katmandu") return "NPR";
  if (tz === "Asia/Dubai" || tz === "Asia/Muscat") return "AED";
  if (tz === "Asia/Riyadh" || tz === "Asia/Kuwait") return "SAR";
  if (tz === "Asia/Qatar") return "QAR";
  if (tz === "Asia/Jerusalem") return "ILS";
  if (tz === "Asia/Singapore") return "SGD";
  if (tz === "Asia/Kuala_Lumpur") return "MYR";
  if (tz.startsWith("Asia/Jakarta") || tz.startsWith("Asia/Makassar")) return "IDR";
  if (tz === "Asia/Manila") return "PHP";
  if (tz === "Asia/Bangkok") return "THB";
  if (tz === "Asia/Tokyo") return "JPY";
  if (tz === "Asia/Shanghai" || tz === "Asia/Chongqing") return "CNY";
  if (tz === "Asia/Hong_Kong") return "HKD";
  if (tz === "Europe/London") return "GBP";
  if (tz === "Europe/Zurich") return "CHF";
  if (tz === "Europe/Warsaw") return "PLN";
  if (tz === "Europe/Stockholm") return "SEK";
  if (tz === "Europe/Oslo") return "NOK";
  if (tz === "Europe/Copenhagen") return "DKK";
  if (tz === "Europe/Istanbul") return "TRY";
  if (tz.startsWith("Europe/")) return "EUR";
  if (tz.startsWith("Australia/")) return "AUD";
  if (tz.startsWith("Pacific/Auckland")) return "NZD";
  if (
    tz.startsWith("America/Sao_Paulo") ||
    tz.startsWith("America/Fortaleza") ||
    tz.startsWith("America/Recife")
  )
    return "BRL";
  if (tz.startsWith("America/Mexico_City") || tz.startsWith("America/Monterrey"))
    return "MXN";
  if (tz === "America/Bogota") return "COP";
  if (tz === "America/Lima") return "PEN";
  if (
    tz.startsWith("America/Toronto") ||
    tz.startsWith("America/Vancouver") ||
    tz.startsWith("America/Montreal")
  )
    return "CAD";
  if (tz === "Africa/Lagos") return "NGN";
  if (tz === "Africa/Johannesburg") return "ZAR";
  if (tz === "Africa/Nairobi") return "KES";
  if (tz === "Africa/Cairo") return "EGP";
  return "USD";
}

export const CREDIT_PACKS: CreditPack[] = [
  {
    id: "starter",
    name: "Starter Pack",
    credits: 50,
    priceInr: 99,
    amountPaise: 9900,
    priceUsd: 2.99,
    amountCents: 299,
    tagline: "Perfect for weekly homework & quick revision",
    features: [
      "50 Study Credits (Never expire)",
      "Up to 25 Interactive Blackboard Lessons",
      "Or 12 Full Exam Papers Solved Step-by-Step",
      "Multilingual Voice Narration & PDF Export",
    ],
    gradient: "from-cyan-500 to-blue-600",
  },
  {
    id: "cram",
    name: "Exam Cram Pack",
    badge: "MOST POPULAR",
    credits: 200,
    priceInr: 299,
    amountPaise: 29900,
    priceUsd: 7.99,
    amountCents: 799,
    tagline: "Best for board exams, JEE/NEET, AP & midterms",
    features: [
      "200 Study Credits (25% bonus value)",
      "Up to 100 Lessons or Quizzes",
      "Up to 50 Scanned Exam Papers Solved",
      "Full Course Syllabus Builder + 3D Flashcards",
    ],
    gradient: "from-violet-500 to-purple-600",
  },
  {
    id: "scholar",
    name: "Scholar Semester Pack",
    badge: "BEST VALUE",
    credits: 600,
    priceInr: 699,
    amountPaise: 69900,
    priceUsd: 19.99,
    amountCents: 1999,
    tagline: "Complete semester mastery for power learners",
    features: [
      "600 Study Credits (Lowest cost per credit)",
      "Up to 300 Lessons or 150 Exam Papers",
      "All 85+ Indian & World Languages + Voice Q&A",
      "Priority Model Selection (Gemini 3 Flash)",
    ],
    gradient: "from-emerald-500 to-teal-600",
  },
];

export function getCreditPackById(packId: string): CreditPack | undefined {
  return CREDIT_PACKS.find((p) => p.id === packId);
}
