import { prisma } from "./prisma";

export const WELCOME_FREE_CREDITS = 10;

export const CREDIT_COSTS = {
  DOUBT: 1,
  ASSISTANT: 1,
  FLASHCARDS: 1,
  QUIZ: 2,
  LESSON: 2,
  SOLVE_PAPER: 4,
  COURSE: 4,
} as const;

export interface CreditPack {
  id: string;
  name: string;
  badge?: string;
  credits: number;
  priceInr: number;        // Display ₹
  amountPaise: number;     // Razorpay subunits (INR * 100)
  priceUsd: number;        // Display $
  amountCents: number;     // USD subunits
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
      "All 14+ Languages & Raise-Hand Voice Q&A",
      "Priority Model Selection (Gemini 3.8 Flash)",
    ],
    gradient: "from-emerald-500 to-teal-600",
  },
];

export function getCreditPackById(packId: string): CreditPack | undefined {
  return CREDIT_PACKS.find((p) => p.id === packId);
}

/**
 * Atomically checks balance and deducts credits, writing an audit ledger entry.
 * Throws Error("INSUFFICIENT_CREDITS") if user doesn't have enough credits.
 */
export async function spendCredits(params: {
  userId: string;
  cost: number;
  description: string;
  metadata?: Record<string, unknown>;
}): Promise<{ remainingCredits: number }> {
  const { userId, cost, description, metadata = {} } = params;

  return prisma.$transaction(async (tx) => {
    const updatedCount = await tx.user.updateMany({
      where: {
        id: userId,
        creditsBalance: { gte: cost },
      },
      data: {
        creditsBalance: { decrement: cost },
      },
    });

    if (updatedCount.count === 0) {
      throw new Error(
        `INSUFFICIENT_CREDITS: This action requires ${cost} credits. Please top up your Study Wallet.`
      );
    }

    const updatedUser = await tx.user.findUniqueOrThrow({
      where: { id: userId },
      select: { creditsBalance: true },
    });

    await tx.creditTransaction.create({
      data: {
        userId,
        amount: -cost,
        balanceAfter: updatedUser.creditsBalance,
        type: "SPEND",
        description,
        metadataJson: JSON.stringify(metadata),
      },
    });

    return { remainingCredits: updatedUser.creditsBalance };
  });
}

/**
 * Refunds credits automatically if an upstream AI call fails after deduction.
 */
export async function refundCredits(params: {
  userId: string;
  amount: number;
  description: string;
}) {
  const { userId, amount, description } = params;
  if (amount <= 0) return;

  await prisma
    .$transaction(async (tx) => {
      const updated = await tx.user.update({
        where: { id: userId },
        data: { creditsBalance: { increment: amount } },
        select: { creditsBalance: true },
      });

      await tx.creditTransaction.create({
        data: {
          userId,
          amount,
          balanceAfter: updated.creditsBalance,
          type: "REFUND",
          description,
        },
      });
    })
    .catch((err) => console.error("Failed to refund credits:", err));
}

/**
 * Credits a user's wallet after verified payment or welcome bonus.
 */
export async function grantCredits(params: {
  userId: string;
  amount: number;
  type: "WELCOME_BONUS" | "PURCHASE";
  description: string;
  planTier?: string;
  metadata?: Record<string, unknown>;
}): Promise<{ newBalance: number }> {
  const { userId, amount, type, description, planTier, metadata = {} } = params;

  return prisma.$transaction(async (tx) => {
    const updated = await tx.user.update({
      where: { id: userId },
      data: {
        creditsBalance: { increment: amount },
        ...(planTier ? { planTier } : {}),
      },
      select: { creditsBalance: true },
    });

    await tx.creditTransaction.create({
      data: {
        userId,
        amount,
        balanceAfter: updated.creditsBalance,
        type,
        description,
        metadataJson: JSON.stringify(metadata),
      },
    });

    return { newBalance: updated.creditsBalance };
  });
}
