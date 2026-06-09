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

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      linkedinConnected: !!(user as { linkedinId?: string }).linkedinId,
      linkedinProfile: (user as { linkedinProfile?: string }).linkedinProfile || null,
    });
  } catch (error) {
    console.error("Get LinkedIn info error:", error);
    return NextResponse.json({ error: "Failed to fetch LinkedIn info" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
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

    const { linkedinProfile } = await request.json();

    if (!linkedinProfile && typeof linkedinProfile !== "string") {
      return NextResponse.json({ error: "LinkedIn profile URL required" }, { status: 400 });
    }

    const urlPattern = /^https?:\/\/(www\.)?linkedin\.com\/.*$/i;
    if (linkedinProfile && !urlPattern.test(linkedinProfile)) {
      return NextResponse.json({ error: "Invalid LinkedIn URL" }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        linkedinProfile: linkedinProfile || null,
      } as Record<string, unknown>,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update LinkedIn error:", error);
    return NextResponse.json({ error: "Failed to update LinkedIn" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
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

    await prisma.user.update({
      where: { id: user.id },
      data: {
        linkedinId: null,
        linkedinProfile: null,
      } as Record<string, unknown>,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete LinkedIn error:", error);
    return NextResponse.json({ error: "Failed to disconnect LinkedIn" }, { status: 500 });
  }
}