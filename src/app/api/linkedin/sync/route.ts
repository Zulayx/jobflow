import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  getAccessToken,
  listLinkedInApplicationEmails,
  fetchAndParseApplication,
} from "@/lib/gmail";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Scans the connected Gmail for LinkedIn "application sent" emails and creates
// an Application for each one not already imported. Idempotent: re-running only
// adds new ones (deduped on the Gmail message id stored in sourceId).
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

    const accessToken = await getAccessToken(user.gmailRefreshToken);
    const messages = await listLinkedInApplicationEmails(accessToken);

    // Which message ids have we already imported?
    const existing = await prisma.application.findMany({
      where: { userId: user.id, source: "linkedin-email", sourceId: { not: null } },
      select: { sourceId: true },
    });
    const seen = new Set(existing.map((e) => e.sourceId));

    let imported = 0;
    for (const meta of messages) {
      if (seen.has(meta.id)) continue;
      const parsed = await fetchAndParseApplication(accessToken, meta.id);
      if (!parsed) continue;

      await prisma.application.create({
        data: {
          userId: user.id,
          company: parsed.company,
          position: parsed.position,
          status: "applied",
          source: "linkedin-email",
          sourceId: parsed.messageId,
          notes: `Auto-imported from LinkedIn email · ${parsed.appliedAt.toLocaleDateString()}`,
          createdAt: parsed.appliedAt,
          timeline: {
            create: {
              status: "applied",
              note: "Imported from LinkedIn application email",
              createdAt: parsed.appliedAt,
            },
          },
        },
      });
      seen.add(meta.id);
      imported++;
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastGmailSync: new Date() },
    });

    return NextResponse.json({
      success: true,
      scanned: messages.length,
      imported,
    });
  } catch (error) {
    console.error("LinkedIn sync error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Sync failed" },
      { status: 500 }
    );
  }
}
