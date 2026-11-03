import { NextResponse } from "next/server";
import { connection } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { CREDIT_COSTS, CREDIT_PACKS } from "@/lib/credits";
import { prisma } from "@/lib/prisma";

export async function GET() {
  await connection();
  try {
    const user = await getCurrentUser();
    const razorpayKeyId =
      process.env.RAZORPAY_KEY_ID?.trim() ||
      process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID?.trim() ||
      "";
    const razorpayEnabled = Boolean(
      razorpayKeyId && process.env.RAZORPAY_KEY_SECRET?.trim()
    );
    const lemonSqueezyEnabled = Boolean(
      process.env.LEMONSQUEEZY_STARTER_URL?.trim() ||
        process.env.LEMONSQUEEZY_CRAM_URL?.trim() ||
        process.env.LEMONSQUEEZY_SCHOLAR_URL?.trim()
    );
    const sandboxEnabled = process.env.NODE_ENV !== "production";

    const transactions = user
      ? await prisma.creditTransaction.findMany({
          where: { userId: user.id },
          orderBy: { createdAt: "desc" },
          take: 25,
        })
      : [];

    return NextResponse.json({
      authenticated: Boolean(user),
      creditsBalance: user?.creditsBalance ?? 0,
      planTier: user?.planTier ?? "Guest",
      packs: CREDIT_PACKS,
      costs: CREDIT_COSTS,
      transactions,
      gateways: {
        razorpayEnabled,
        razorpayKeyId: razorpayEnabled ? razorpayKeyId : null,
        lemonSqueezyEnabled,
        sandboxEnabled,
      },
    });
  } catch (error) {
    console.error("Wallet GET error:", error);
    return NextResponse.json({ error: "Failed to load wallet" }, { status: 500 });
  }
}
