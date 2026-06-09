import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Connection status for the Settings UI.
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { gmailRefreshToken: true, gmailEmail: true, lastGmailSync: true },
  });

  return NextResponse.json({
    connected: !!user?.gmailRefreshToken,
    gmailEmail: user?.gmailEmail || null,
    lastGmailSync: user?.lastGmailSync || null,
    configured: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
  });
}

// Disconnect Gmail.
export async function DELETE() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await prisma.user.update({
    where: { email: session.user.email },
    data: { gmailRefreshToken: null, gmailEmail: null },
  });

  return NextResponse.json({ success: true });
}
