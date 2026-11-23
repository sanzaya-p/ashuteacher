import { NextRequest, NextResponse } from "next/server";
import { requireAuthUser } from "@/lib/auth";
import { getCreditPackById, getPackPriceForCurrency } from "@/lib/credits";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuthUser();
    const body = await req.json();
    const { packId, currency: requestedCurrency } = body;
    const pack = getCreditPackById(String(packId || ""));
    if (!pack) {
      return NextResponse.json({ error: "Invalid credit pack" }, { status: 400 });
    }

    const keyId =
      process.env.RAZORPAY_KEY_ID?.trim() ||
      process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID?.trim();
    const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();

    if (!keyId || !keySecret) {
      return NextResponse.json(
        { error: "Razorpay keys are not configured on the server." },
        { status: 400 }
      );
    }

    const primaryQuote = getPackPriceForCurrency(
      pack.id,
      String(requestedCurrency || "INR")
    );
    let orderCurrency = primaryQuote.currency;
    let orderAmountSubunits = primaryQuote.subunits;

    const authHeader = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
    const createRzpOrder = async (curr: string, subunits: number) =>
      fetch("https://api.razorpay.com/v1/orders", {
        method: "POST",
        headers: {
          Authorization: `Basic ${authHeader}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: subunits,
          currency: curr,
          receipt: `ashu_${user.id.slice(-8)}_${Date.now()}`,
          notes: {
            userId: user.id,
            packId: pack.id,
            credits: String(pack.credits),
            currency: curr,
          },
        }),
      });

    let rzpRes = await createRzpOrder(orderCurrency, orderAmountSubunits);

    // Fallback chain: Requested Currency -> USD -> INR so no world student is ever blocked
    if (!rzpRes.ok && orderCurrency !== "USD" && orderCurrency !== "INR") {
      const usdQuote = getPackPriceForCurrency(pack.id, "USD");
      orderCurrency = "USD";
      orderAmountSubunits = usdQuote.subunits;
      rzpRes = await createRzpOrder(orderCurrency, orderAmountSubunits);
    }
    if (!rzpRes.ok && orderCurrency !== "INR") {
      orderCurrency = "INR";
      orderAmountSubunits = pack.amountPaise;
      rzpRes = await createRzpOrder(orderCurrency, orderAmountSubunits);
    }

    const rzpOrder = await rzpRes.json();
    if (!rzpRes.ok || !rzpOrder.id) {
      throw new Error(
        rzpOrder?.error?.description || "Failed to create Razorpay order"
      );
    }

    await prisma.paymentOrder.create({
      data: {
        userId: user.id,
        provider: "razorpay",
        externalOrderId: rzpOrder.id,
        packId: pack.id,
        creditsAmount: pack.credits,
        amountSubunits: orderAmountSubunits,
        currency: orderCurrency,
        status: "CREATED",
      },
    });

    return NextResponse.json({
      orderId: rzpOrder.id,
      amount: orderAmountSubunits,
      currency: orderCurrency,
      keyId,
      packName: pack.name,
      userEmail: user.email,
      userName: user.name,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Order creation failed";
    const status = msg.includes("AUTH_REQUIRED") ? 403 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
