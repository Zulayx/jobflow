import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { buildConsentUrl } from "@/lib/gmail";

export const dynamic = "force-dynamic";

// Kicks off the Google OAuth consent flow for Gmail read-only access.
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return NextResponse.json(
      { error: "Gmail integration is not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET." },
      { status: 503 }
    );
  }

  // Carry the user's email as state so the callback knows who to attach to.
  const state = Buffer.from(session.user.email).toString("base64url");
  return NextResponse.redirect(buildConsentUrl(state));
}
