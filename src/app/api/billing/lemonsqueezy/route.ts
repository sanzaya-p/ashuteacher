import { NextRequest, NextResponse } from "next/server";
import { requireAuthUser } from "@/lib/auth";
import { getCreditPackById } from "@/lib/credits";

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuthUser();
    const { packId } = await req.json();
    const pack = getCreditPackById(String(packId || ""));
    if (!pack) {
      return NextResponse.json({ error: "Invalid credit pack" }, { status: 400 });
    }

    const urlMap: Record<string, string | undefined> = {
      starter: process.env.LEMONSQUEEZY_STARTER_URL?.trim(),
      cram: process.env.LEMONSQUEEZY_CRAM_URL?.trim(),
      scholar: process.env.LEMONSQUEEZY_SCHOLAR_URL?.trim(),
    };

    const baseCheckoutUrl = urlMap[pack.id];
    if (!baseCheckoutUrl) {
      return NextResponse.json(
        {
          error:
            "Global checkout URL is not configured yet in environment variables.",
        },
        { status: 400 }
      );
    }

    const checkoutUrl = new URL(baseCheckoutUrl);
    checkoutUrl.searchParams.set("checkout[email]", user.email);
    checkoutUrl.searchParams.set("checkout[name]", user.name);
    checkoutUrl.searchParams.set("checkout[custom][user_id]", user.id);
    checkoutUrl.searchParams.set("checkout[custom][pack_id]", pack.id);

    return NextResponse.json({ checkoutUrl: checkoutUrl.toString() });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Checkout failed";
    const status = msg.includes("AUTH_REQUIRED") ? 403 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
