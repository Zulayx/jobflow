import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { syncUserApplications } from "@/lib/syncApplications";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Manual "Sync now" — scans the signed-in user's Gmail for LinkedIn
// application emails and imports any new ones.
export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, gmailRefreshToken: true },
    });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    if (!user.gmailRefreshToken) {
      return NextResponse.json(
        { error: "Gmail not connected. Connect Gmail in Settings first." },
        { status: 400 }
      );
    }

    const result = await syncUserApplications(user.id, user.gmailRefreshToken);
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error("LinkedIn sync error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Sync failed" },
      { status: 500 }
    );
  }
}
