import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { exchangeCodeForTokens, emailFromIdToken } from "@/lib/gmail";

export const dynamic = "force-dynamic";

// Google redirects here after consent. Exchange the code for a refresh token
// and store it against the user, then return to Settings.
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  const settingsUrl = new URL("/settings", process.env.NEXTAUTH_URL || request.url);

  if (error || !code || !state) {
    settingsUrl.searchParams.set("gmail", "error");
    return NextResponse.redirect(settingsUrl);
  }

  try {
    const userEmail = Buffer.from(state, "base64url").toString("utf8");
    const tokens = await exchangeCodeForTokens(code);

    if (!tokens.refresh_token) {
      // Google only returns a refresh token on first consent; prompt=consent
      // in the consent URL forces it, but guard just in case.
      settingsUrl.searchParams.set("gmail", "norefresh");
      return NextResponse.redirect(settingsUrl);
    }

    const gmailEmail = emailFromIdToken(tokens.id_token);

    await prisma.user.update({
      where: { email: userEmail },
      data: {
        gmailRefreshToken: tokens.refresh_token,
        gmailEmail: gmailEmail || undefined,
      },
    });

    settingsUrl.searchParams.set("gmail", "connected");
    return NextResponse.redirect(settingsUrl);
  } catch (e) {
    console.error("Gmail callback error:", e);
    settingsUrl.searchParams.set("gmail", "error");
    return NextResponse.redirect(settingsUrl);
  }
}
