import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { looksLikeErrorPage } from "@/lib/jobScraper";

export const dynamic = "force-dynamic";

async function scrapeLinkedInJob(jobUrl: string): Promise<{
  company: string;
  position: string;
  location: string;
  jobDescription: string;
}> {
  const jinaUrl = `https://r.jina.ai/${jobUrl}`;
  const headers: Record<string, string> = { Accept: "text/plain", "X-No-Cache": "true" };
  if (process.env.JINA_API_KEY) headers.Authorization = `Bearer ${process.env.JINA_API_KEY}`;
  const response = await fetch(jinaUrl, {
    headers,
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) throw new Error("Jina fetch failed");

  const text = await response.text();

  // Never store a rate-limit / sign-in wall as if it were a job description.
  if (looksLikeErrorPage(text)) throw new Error("Page blocked (rate limit or sign-in wall)");

  // Extract title — first H1 or "Title: ..." line
  let position = "Job Position";
  const titleMatch = text.match(/^#\s+(.+)$/m) || text.match(/Title:\s*(.+)/i);
  if (titleMatch) position = titleMatch[1].trim().replace(/\s*\|.*$/, "").trim();

  // Extract company
  let company = "LinkedIn Job";
  const companyMatch =
    text.match(/Company(?:\s+name)?:\s*(.+)/i) ||
    text.match(/at\s+([A-Z][^\n·|]+?)(?:\s*[·|]|\n)/);
  if (companyMatch) company = companyMatch[1].trim();

  // Extract location
  let location = "";
  const locationMatch = text.match(/Location:\s*(.+)/i);
  if (locationMatch) location = locationMatch[1].trim();

  // Extract job description block — look for common section headers
  let jobDescription = "";
  const descMatch =
    text.match(/(?:About the (?:job|role)|Job description|Description|Responsibilities|What you.ll do)[:\s]*\n([\s\S]{200,})/i);
  if (descMatch) {
    // Take up to ~4000 chars to keep DB size reasonable
    jobDescription = descMatch[1].slice(0, 4000).trim();
  } else {
    // Fallback: strip the header (first ~10 lines) and take the bulk of the text
    const lines = text.split("\n");
    const bodyStart = lines.findIndex((l, i) => i > 5 && l.trim().length > 50);
    if (bodyStart > -1) {
      jobDescription = lines.slice(bodyStart).join("\n").slice(0, 4000).trim();
    }
  }

  return { company, position, location, jobDescription };
}

function fallbackParseUrl(jobUrl: string) {
  let company = "LinkedIn Job";
  let position = "Job Position";
  let location = "";

  const titleMatch = jobUrl.match(/jobs\/[^/]+\/(\d+)/);
  if (titleMatch) {
    const extracted = decodeURIComponent(titleMatch[0])
      .replace("/jobs/", "")
      .replace(/\/\d+/, "")
      .replace(/-/g, " ");
    if (extracted) {
      position = extracted
        .split(" ")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
    }
  }
  const companyMatch = jobUrl.match(/\/company\/([^/?]+)/);
  if (companyMatch) {
    company = decodeURIComponent(companyMatch[1])
      .replace(/-/g, " ")
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  }
  const locationMatch = jobUrl.match(/location=([^&]+)/);
  if (locationMatch) location = decodeURIComponent(locationMatch[1]);

  return { company, position, location, jobDescription: "" };
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const jobUrl = searchParams.get("url");

    if (!jobUrl || !jobUrl.includes("linkedin.com/jobs")) {
      return NextResponse.json({ error: "Invalid LinkedIn job URL" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Try scraping via Jina.ai, fall back to URL parsing if it fails
    let scraped;
    try {
      scraped = await scrapeLinkedInJob(jobUrl);
    } catch {
      scraped = fallbackParseUrl(jobUrl);
    }

    const { company, position, location, jobDescription } = scraped;

    const application = await prisma.application.create({
      data: {
        userId: user.id,
        company,
        position,
        status: "applied",
        jobUrl,
        location: location || "Remote",
        jobDescription: jobDescription || null,
        timeline: {
          create: {
            status: "applied",
            note: "Imported from LinkedIn",
          },
        },
      },
      include: { timeline: true },
    });

    return NextResponse.json({
      success: true,
      id: application.id,
      company: application.company,
      position: application.position,
      location: application.location,
      jobDescription: application.jobDescription,
      scraped: !!jobDescription,
    });
  } catch (error) {
    console.error("LinkedIn import error:", error);
    return NextResponse.json({ error: "Failed to import job" }, { status: 500 });
  }
}
