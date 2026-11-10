import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { isFounderAdminEmail, setSessionCookie } from "@/lib/auth";
import { WELCOME_FREE_CREDITS, rewardClassmateReferral } from "@/lib/credits";

export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url);
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL?.trim() || origin;
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  const cookieStore = await cookies();
  const savedState = cookieStore.get("oauth_google_state")?.value;
  cookieStore.delete("oauth_google_state");

  if (!code || !state || !savedState || state !== savedState) {
    return NextResponse.redirect(`${baseUrl}/?authError=invalid_oauth_state`);
  }

  const clientId = process.env.GOOGLE_CLIENT_ID?.trim() || "";
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim() || "";
  const redirectUri = `${baseUrl}/api/auth/google/callback`;

  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok || !tokenData.access_token) {
      throw new Error("Failed to exchange Google OAuth code");
    }

    const profileRes = await fetch(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      }
    );
    const profile = await profileRes.json();
    if (!profile.email) {
      throw new Error("Google account did not provide an email");
    }

    const email = String(profile.email).toLowerCase();
    const today = new Date().toISOString().slice(0, 10);

    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await prisma.$transaction(async (tx) => {
        const created = await tx.user.create({
          data: {
            email,
            name: profile.name || email.split("@")[0],
            avatarUrl: profile.picture || null,
            googleId: profile.sub || null,
            isAdmin: isFounderAdminEmail(email),
            creditsBalance: WELCOME_FREE_CREDITS,
            lastActiveDate: today,
          },
        });

        await tx.creditTransaction.create({
          data: {
            userId: created.id,
            amount: WELCOME_FREE_CREDITS,
            balanceAfter: WELCOME_FREE_CREDITS,
            type: "WELCOME_BONUS",
            description: `Google Sign-Up Bonus (+${WELCOME_FREE_CREDITS} Free Credits)`,
          },
        });
        return created;
      });

      const refCookie = cookieStore.get("ashu_ref")?.value;
      if (refCookie) {
        const rewarded = await rewardClassmateReferral(user.id, refCookie);
        if (rewarded) user = rewarded;
      }
    } else if (!user.googleId && profile.sub) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          googleId: profile.sub,
          avatarUrl: user.avatarUrl || profile.picture || null,
        },
      });
    }

    await setSessionCookie(user.id);
    return NextResponse.redirect(`${baseUrl}/`);
  } catch (error) {
    console.error("Google OAuth callback error:", error);
    return NextResponse.redirect(`${baseUrl}/?authError=google_callback_failed`);
  }
}
