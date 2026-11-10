import { prisma } from "./prisma";
export {
  WELCOME_FREE_CREDITS,
  CREDIT_COSTS,
  CREDIT_PACKS,
  getCreditPackById,
  type CreditPack,
} from "./credit-packs";

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

export const REFERRER_BONUS_CREDITS = 10;
export const REFEREE_EXTRA_CREDITS = 5;
export const MAX_REWARDED_REFERRALS = 20;

export async function rewardClassmateReferral(
  newUserId: string,
  rawRefCode?: string | null
) {
  const refId = String(rawRefCode || "").trim();
  if (!refId || refId === newUserId || refId.length > 64) return null;

  try {
    const referrer = await prisma.user.findUnique({
      where: { id: refId },
      select: { id: true, name: true, referralBonusCount: true },
    });
    if (!referrer || referrer.id === newUserId) return null;

    return await prisma.$transaction(async (tx) => {
      const updatedNewUser = await tx.user.update({
        where: { id: newUserId },
        data: {
          referredById: referrer.id,
          creditsBalance: { increment: REFEREE_EXTRA_CREDITS },
        },
      });

      await tx.creditTransaction.create({
        data: {
          userId: newUserId,
          amount: REFEREE_EXTRA_CREDITS,
          balanceAfter: updatedNewUser.creditsBalance,
          type: "REFERRAL_BONUS",
          description: `Classmate Invite Bonus (+${REFEREE_EXTRA_CREDITS} Extra Free Credits)`,
        },
      });

      if (referrer.referralBonusCount < MAX_REWARDED_REFERRALS) {
        const updatedReferrer = await tx.user.update({
          where: { id: referrer.id },
          data: {
            creditsBalance: { increment: REFERRER_BONUS_CREDITS },
            referralBonusCount: { increment: 1 },
          },
          select: { creditsBalance: true },
        });

        await tx.creditTransaction.create({
          data: {
            userId: referrer.id,
            amount: REFERRER_BONUS_CREDITS,
            balanceAfter: updatedReferrer.creditsBalance,
            type: "REFERRAL_BONUS",
            description: `Classmate Joined via Your Invite (+${REFERRER_BONUS_CREDITS} Free Credits)`,
            metadataJson: JSON.stringify({ invitedUserId: newUserId }),
          },
        });
      }

      return updatedNewUser;
    });
  } catch (err) {
    console.error("Referral bonus error:", err);
    return null;
  }
}
