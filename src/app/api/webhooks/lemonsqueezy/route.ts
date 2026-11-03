import { NextRequest, NextResponse } from "next/server";
import * as crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { getCreditPackById } from "@/lib/credits";

export async function POST(req: NextRequest) {
  try {
    const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET?.trim();
    if (!secret) {
      return NextResponse.json({ error: "Webhook secret missing" }, { status: 400 });
    }

    const rawBody = await req.text();
    const signature = req.headers.get("x-signature") || "";

    const expected = crypto
      .createHmac("sha256", secret)
      .update(rawBody)
      .digest("hex");

    const sigBuf = Buffer.from(signature);
    const expBuf = Buffer.from(expected);
    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    const eventName = payload?.meta?.event_name;
    const customData = payload?.meta?.custom_data || {};
    const orderId = String(payload?.data?.id || "");

    if (eventName === "order_created" && customData.user_id && customData.pack_id && orderId) {
      const pack = getCreditPackById(String(customData.pack_id));
      if (pack) {
        await prisma.$transaction(async (tx) => {
          const existing = await tx.paymentOrder.findUnique({
            where: { externalOrderId: `ls_${orderId}` },
          });
          if (existing) return;

          await tx.paymentOrder.create({
            data: {
              userId: String(customData.user_id),
              provider: "lemonsqueezy",
              externalOrderId: `ls_${orderId}`,
              packId: pack.id,
              creditsAmount: pack.credits,
              amountSubunits: pack.amountCents,
              currency: "USD",
              status: "PAID",
            },
          });

          const updatedUser = await tx.user.update({
            where: { id: String(customData.user_id) },
            data: {
              creditsBalance: { increment: pack.credits },
              planTier: pack.name,
            },
            select: { creditsBalance: true },
          });

          await tx.creditTransaction.create({
            data: {
              userId: String(customData.user_id),
              amount: pack.credits,
              balanceAfter: updatedUser.creditsBalance,
              type: "PURCHASE",
              description: `Purchased ${pack.name} (+${pack.credits} Credits via Global Checkout)`,
              metadataJson: JSON.stringify({ orderId }),
            },
          });
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("LemonSqueezy webhook error:", error);
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}
