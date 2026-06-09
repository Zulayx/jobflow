import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

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

    const urlParts = jobUrl.split("/");
    const jobIdIndex = urlParts.findIndex(part => part === "jobs") + 1;
    const jobId = jobIdIndex > 0 ? urlParts[jobIdIndex] : null;

    let company = "LinkedIn Job";
    let position = "Job Position";
    let location = "";

    const titleMatch = jobUrl.match(/jobs\/[^/]+\/(\d+)/);
    if (titleMatch) {
      const extractedTitle = decodeURIComponent(titleMatch[0])
        .replace("/jobs/", "")
        .replace(/\/\d+/, "")
        .replace(/-/g, " ");
      if (extractedTitle) {
        position = extractedTitle
          .split(" ")
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");
      }
    }

    const companyMatch = jobUrl.match(/\/company\/([^\/?]+)/);
    if (companyMatch) {
      company = decodeURIComponent(companyMatch[1])
        .replace(/-/g, " ")
        .split(" ")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    }

    const locationMatch = jobUrl.match(/location=([^&]+)/);
    if (locationMatch) {
      location = decodeURIComponent(locationMatch[1]);
    }

    const application = await prisma.application.create({
      data: {
        userId: user.id,
        company,
        position,
        status: "applied",
        jobUrl,
        location: location || "Remote",
        timeline: {
          create: {
            status: "applied",
            note: "Imported from LinkedIn",
          },
        },
      },
      include: {
        timeline: true,
      },
    });

    return NextResponse.json({
      success: true,
      id: application.id,
      company: application.company,
      position: application.position,
      location: application.location,
    });
  } catch (error) {
    console.error("LinkedIn import error:", error);
    return NextResponse.json({ error: "Failed to import job" }, { status: 500 });
  }
}