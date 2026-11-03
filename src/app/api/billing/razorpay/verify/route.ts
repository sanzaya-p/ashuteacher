import { NextRequest, NextResponse } from "next/server";
import * as crypto from "crypto";
import { requireAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCreditPackById } from "@/lib/credits";

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuthUser();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: "Missing Razorpay verification fields" },
        { status: 400 }
      );
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();
    if (!keySecret) {
      return NextResponse.json(
        { error: "Razorpay secret not configured" },
        { status: 500 }
      );
    }

    const expectedSig = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const sigBuf = Buffer.from(String(razorpay_signature));
    const expBuf = Buffer.from(expectedSig);
    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      return NextResponse.json(
        { error: "Invalid Razorpay payment signature" },
        { status: 400 }
      );
    }

    // Idempotent fulfillment inside transaction
    const result = await prisma.$transaction(async (tx) => {
      const order = await tx.paymentOrder.findUnique({
        where: { externalOrderId: String(razorpay_order_id) },
      });

      if (!order || order.userId !== user.id) {
        throw new Error("Order not found for user");
      }

      if (order.status === "PAID") {
        const current = await tx.user.findUniqueOrThrow({
          where: { id: user.id },
          select: { creditsBalance: true },
        });
        return { creditsBalance: current.creditsBalance, alreadyFulfilled: true };
      }

      const pack = getCreditPackById(order.packId);
      await tx.paymentOrder.update({
        where: { id: order.id },
        data: {
          status: "PAID",
          externalPaymentId: String(razorpay_payment_id),
        },
      });

      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: {
          creditsBalance: { increment: order.creditsAmount },
          planTier: pack?.name || "Pro Scholar",
        },
        select: { creditsBalance: true },
      });

      await tx.creditTransaction.create({
        data: {
          userId: user.id,
          amount: order.creditsAmount,
          balanceAfter: updatedUser.creditsBalance,
          type: "PURCHASE",
          description: `Purchased ${pack?.name || "Credit Pack"} (+${order.creditsAmount} Credits via Razorpay)`,
          metadataJson: JSON.stringify({
            orderId: razorpay_order_id,
            paymentId: razorpay_payment_id,
          }),
        },
      });

      return { creditsBalance: updatedUser.creditsBalance, alreadyFulfilled: false };
    });

    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Payment verification failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
