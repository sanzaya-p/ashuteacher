import { NextRequest, NextResponse } from "next/server";
import { requireAuthUser } from "@/lib/auth";
import { getCreditPackById, grantCredits } from "@/lib/credits";
import { prisma } from "@/lib/prisma";

/**
 * Local Dev / Sandbox Checkout endpoint so you can test credit top-ups locally
 * before adding live Razorpay or Lemon Squeezy credentials.
 * Strictly disabled when NODE_ENV === "production".
 */
export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "Sandbox purchases are disabled in production." },
      { status: 403 }
    );
  }

  try {
    const user = await requireAuthUser();
    const { packId } = await req.json();
    const pack = getCreditPackById(String(packId || ""));
    if (!pack) {
      return NextResponse.json({ error: "Invalid pack" }, { status: 400 });
    }

    const sandboxOrderId = `sandbox_${Date.now()}_${Math.random()
      .toString(36)
      .slice(2, 7)}`;

    await prisma.paymentOrder.create({
      data: {
        userId: user.id,
        provider: "sandbox",
        externalOrderId: sandboxOrderId,
        packId: pack.id,
        creditsAmount: pack.credits,
        amountSubunits: pack.amountPaise,
        currency: "INR",
        status: "PAID",
      },
    });

    const { newBalance } = await grantCredits({
      userId: user.id,
      amount: pack.credits,
      type: "PURCHASE",
      planTier: pack.name,
      description: `Sandbox Test Top-Up: ${pack.name} (+${pack.credits} Credits)`,
      metadata: { sandboxOrderId, packId: pack.id },
    });

    return NextResponse.json({
      ok: true,
      creditsBalance: newBalance,
      packName: pack.name,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Sandbox top-up failed";
    const status = msg.includes("AUTH_REQUIRED") ? 403 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
