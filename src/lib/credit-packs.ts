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
  id: string;
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
