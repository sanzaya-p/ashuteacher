import { NextRequest, NextResponse } from "next/server";
import * as crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { getCreditPackById } from "@/lib/credits";

export async function POST(req: NextRequest) {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET?.trim();
    if (!webhookSecret) {
      return NextResponse.json({ error: "Webhook secret missing" }, { status: 400 });
    }

    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature") || "";

    const expected = crypto
      .createHmac("sha256", webhookSecret)
      .update(rawBody)
      .digest("hex");

    const sigBuf = Buffer.from(signature);
    const expBuf = Buffer.from(expected);
    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(rawBody);
    if (event.event === "order.paid" || event.event === "payment.captured") {
      const paymentEntity = event.payload?.payment?.entity;
      const orderId = paymentEntity?.order_id;
      const paymentId = paymentEntity?.id;

      if (orderId) {
        await prisma.$transaction(async (tx) => {
          const order = await tx.paymentOrder.findUnique({
            where: { externalOrderId: String(orderId) },
          });
          if (!order || order.status === "PAID") return;

          const pack = getCreditPackById(order.packId);
          await tx.paymentOrder.update({
            where: { id: order.id },
            data: {
              status: "PAID",
              externalPaymentId: paymentId ? String(paymentId) : null,
            },
          });

          const updatedUser = await tx.user.update({
            where: { id: order.userId },
            data: {
              creditsBalance: { increment: order.creditsAmount },
              planTier: pack?.name || "Pro Scholar",
            },
            select: { creditsBalance: true },
          });

          await tx.creditTransaction.create({
            data: {
              userId: order.userId,
              amount: order.creditsAmount,
              balanceAfter: updatedUser.creditsBalance,
              type: "PURCHASE",
              description: `Razorpay Webhook Fulfillment (+${order.creditsAmount} Credits)`,
              metadataJson: JSON.stringify({ orderId, paymentId }),
            },
          });
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Razorpay webhook error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
