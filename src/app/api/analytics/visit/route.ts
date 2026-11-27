import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  hasSuspiciousBotHeaders,
  isLikelyBotUserAgent,
} from "@/lib/bot-filter";

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

function isExternalPlatformRef(code: string): boolean {
  if (!code) return false;
  return /\.[a-z]{2,}$/i.test(code) || /^(producthunt|hackernews|indiehackers|reddit|github|twitter|linkedin|devhunt|peerpush|saashub|alternativeto)$/i.test(code);
}

export async function POST(req: NextRequest) {
  try {
    const ua = req.headers.get("user-agent") || "";
    if (isLikelyBotUserAgent(ua) || hasSuspiciousBotHeaders(req.headers)) {
      return NextResponse.json({ ok: true, skipped: "bot" });
    }

    const body = await req.json().catch(() => ({}));

    // Require client-side human interaction proof (pointer/scroll/key/touch + real viewport)
    const vw = Number(body?.vw || 0);
    const vh = Number(body?.vh || 0);
    if (body?.human !== true || vw < 100 || vh < 100) {
      return NextResponse.json({ ok: true, skipped: "noninteractive" });
    }

    const path = String(body?.path || "/").slice(0, 160);
    // Never count admin console visits as external user traffic
    if (path.startsWith("/admin")) {
      return NextResponse.json({ ok: true, skipped: "admin" });
    }

    const rawReferrer = String(body?.referrer || "");
    const utmSource = String(body?.utmSource || "")
      .trim()
      .toLowerCase()
      .slice(0, 60);
    const rawRefCode = String(body?.refCode || "").trim().slice(0, 64);
    const externalRef = isExternalPlatformRef(rawRefCode) ? rawRefCode.toLowerCase() : "";
    const classmateRefCode = externalRef ? "" : rawRefCode;

    const ownHost = req.headers.get("host") || "ashuteacher.vercel.app";
    let referrerHost = extractCleanReferrerHost(rawReferrer, ownHost);
    if (referrerHost === "internal" && !utmSource && !rawRefCode) {
      return NextResponse.json({ ok: true, skipped: true });
    }
    if (referrerHost === "internal") {
      referrerHost = utmSource || externalRef || (classmateRefCode ? "classmate-referral" : "direct");
    } else if (referrerHost === "direct" && (utmSource || externalRef)) {
      referrerHost = utmSource || externalRef;
    } else if (referrerHost === "direct" && classmateRefCode) {
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
    const dayStamp = new Date().toISOString().slice(0, 10);
    const visitorHash = crypto
      .createHash("sha256")
      .update(`ashu-visit-v1|${dayStamp}|${forwardedFor}|${ua || "ua"}`)
      .digest("hex")
      .slice(0, 24);

    // Server-side deduplication & burst-scraper protection
    const now = Date.now();
    const thirtyMinAgo = new Date(now - 30 * 60 * 1000);
    const tenMinAgo = new Date(now - 10 * 60 * 1000);
    const oneDayAgo = new Date(now - 24 * 60 * 60 * 1000);

    const [recentSamePath, recent10mCount, recent24hCount] = await Promise.all([
      prisma.siteVisit
        .findFirst({
          where: { visitorHash, path, createdAt: { gte: thirtyMinAgo } },
          select: { id: true },
        })
        .catch(() => null),
      prisma.siteVisit
        .count({
          where: { visitorHash, createdAt: { gte: tenMinAgo } },
        })
        .catch(() => 0),
      prisma.siteVisit
        .count({
          where: { visitorHash, createdAt: { gte: oneDayAgo } },
        })
        .catch(() => 0),
    ]);

    if (recentSamePath) {
      return NextResponse.json({ ok: true, skipped: "dedup" });
    }

    // Drop burst crawlers / stateless pollers and purge their recent burst rows
    if (recent10mCount >= 6 || recent24hCount >= 12) {
      await prisma.siteVisit
        .deleteMany({
          where: { visitorHash, createdAt: { gte: tenMinAgo } },
        })
        .catch(() => null);
      return NextResponse.json({ ok: true, skipped: "rate_limited" });
    }

    await prisma.siteVisit
      .create({
        data: {
          visitorHash,
          path,
          referrerHost,
          utmSource,
          country,
          refUserId: classmateRefCode || null,
        },
      })
      .catch(() => null);

    const res = NextResponse.json({ ok: true });
    if (classmateRefCode) {
      res.cookies.set("ashu_ref", classmateRefCode, {
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
