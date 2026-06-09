import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const application = await prisma.application.findFirst({
      where: { id: params.id, userId: user.id },
      include: { timeline: { orderBy: { createdAt: "desc" } } },
    });

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: application.id,
      company: application.company,
      position: application.position,
      status: application.status,
      jobUrl: application.jobUrl,
      location: application.location,
      salary: application.salary,
      notes: application.notes,
      tags: application.tags,
      questions: application.notes ? JSON.parse(application.notes).questions || [] : [],
    });
  } catch (error) {
    console.error("Get application error:", error);
    return NextResponse.json({ error: "Failed to fetch application" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const existing = await prisma.application.findFirst({
      where: { id: params.id, userId: user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    const body = await request.json();
    const { questions, ...updateData } = body;

    let notes = existing.notes;
    if (questions !== undefined) {
      const existingNotes = existing.notes ? JSON.parse(existing.notes) : {};
      existingNotes.questions = questions;
      notes = JSON.stringify(existingNotes);
    }

    const application = await prisma.application.update({
      where: { id: params.id },
      data: {
        ...updateData,
        notes,
      },
      include: { timeline: { orderBy: { createdAt: "desc" } } },
    });

    return NextResponse.json(application);
  } catch (error) {
    console.error("Update application error:", error);
    return NextResponse.json({ error: "Failed to update application" }, { status: 500 });
  }
}