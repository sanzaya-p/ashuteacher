import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function extractCleanReferrerHost(rawReferrer: string, ownHost: string): string {
  const trimmed = String(rawReferrer || "").trim();
  if (!trimmed) return "direct";
  try {
    const url = new URL(trimmed);
    const host = url.hostname.replace(/^www\./i, "").toLowerCase();
    if (!host || host === ownHost.replace(/^www\./i, "").toLowerCase() || host.includes("localhost")) {
      return "internal";
    }
    return host.slice(0, 80);
  } catch {
    return "direct";
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const path = String(body?.path || "/").slice(0, 160);
    const rawReferrer = String(body?.referrer || "");
    const utmSource = String(body?.utmSource || "")
      .trim()
      .toLowerCase()
      .slice(0, 60);
    const refCode = String(body?.refCode || "").trim().slice(0, 64);

    const ownHost = req.headers.get("host") || "ashuteacher.vercel.app";
    let referrerHost = extractCleanReferrerHost(rawReferrer, ownHost);
    if (referrerHost === "internal" && !utmSource && !refCode) {
      return NextResponse.json({ ok: true, skipped: true });
    }
    if (referrerHost === "internal") {
      referrerHost = utmSource || (refCode ? "classmate-referral" : "direct");
    } else if (referrerHost === "direct" && utmSource) {
      referrerHost = utmSource;
    } else if (referrerHost === "direct" && refCode) {
      referrerHost = "classmate-referral";
    }

    const country = (
      req.headers.get("x-vercel-ip-country") ||
      req.headers.get("cf-ipcountry") ||
      "GLOBAL"
    )
      .toUpperCase()
      .slice(0, 12);

    const forwardedFor = (req.headers.get("x-forwarded-for") || "anon").split(",")[0].trim();
    const ua = req.headers.get("user-agent") || "ua";
    const dayStamp = new Date().toISOString().slice(0, 10);
    const visitorHash = crypto
      .createHash("sha256")
      .update(`ashu-visit-v1|${dayStamp}|${forwardedFor}|${ua}`)
      .digest("hex")
      .slice(0, 24);

    await prisma.siteVisit
      .create({
        data: {
          visitorHash,
          path,
          referrerHost,
          utmSource,
          country,
          refUserId: refCode || null,
        },
      })
      .catch(() => null);

    const res = NextResponse.json({ ok: true });
    if (refCode) {
      res.cookies.set("ashu_ref", refCode, {
        httpOnly: false,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
      });
    }
    return res;
  } catch {
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
