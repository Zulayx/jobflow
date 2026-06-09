import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { syncUserApplications } from "@/lib/syncApplications";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Daily Vercel Cron job: sync every user who has connected Gmail.
// Vercel automatically sends "Authorization: Bearer ${CRON_SECRET}" when the
// CRON_SECRET env var is set, which we verify here so the endpoint can't be
// triggered by the public.
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const users = await prisma.user.findMany({
    where: { gmailRefreshToken: { not: null } },
    select: { id: true, gmailRefreshToken: true },
  });

  let totalImported = 0;
  const results: { userId: string; imported?: number; error?: string }[] = [];

  for (const user of users) {
    try {
      const { imported } = await syncUserApplications(user.id, user.gmailRefreshToken!);
      totalImported += imported;
      results.push({ userId: user.id, imported });
    } catch (e) {
      // One user's expired token shouldn't abort the whole run.
      results.push({ userId: user.id, error: e instanceof Error ? e.message : "failed" });
    }
  }

  return NextResponse.json({ success: true, users: users.length, totalImported, results });
}
