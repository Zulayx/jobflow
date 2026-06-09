import { prisma } from "@/lib/prisma";
import {
  getAccessToken,
  listLinkedInApplicationEmails,
  fetchAndParseApplication,
} from "@/lib/gmail";

export interface SyncResult {
  scanned: number;
  imported: number;
}

// Scan a user's connected Gmail for LinkedIn "application sent" emails and
// create an Application for each one not already imported. Idempotent: deduped
// on the Gmail message id stored in Application.sourceId. Shared by the manual
// "Sync now" button and the daily cron job.
export async function syncUserApplications(
  userId: string,
  refreshToken: string
): Promise<SyncResult> {
  const accessToken = await getAccessToken(refreshToken);
  const messages = await listLinkedInApplicationEmails(accessToken);

  const existing = await prisma.application.findMany({
    where: { userId, source: "linkedin-email", sourceId: { not: null } },
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
        userId,
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
    where: { id: userId },
    data: { lastGmailSync: new Date() },
  });

  return { scanned: messages.length, imported };
}
