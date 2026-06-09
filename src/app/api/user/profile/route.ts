import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        name: true,
        email: true,
        linkedinProfile: true,
        apiKeysUpdatedAt: true,
        // Return masked indicators only — never send raw keys to the client
        nvidiaApiKey: true,
        opencodeZenApiKey: true,
      },
    });

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    return NextResponse.json({
      ...user,
      hasNvidiaKey: !!user.nvidiaApiKey,
      hasOpencodeZenKey: !!user.opencodeZenApiKey,
      // Mask the actual keys — client only needs to know if they exist
      nvidiaApiKey: undefined,
      opencodeZenApiKey: undefined,
    });
  } catch (error) {
    console.error("Profile fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, nvidiaApiKey, opencodeZenApiKey, clearNvidiaKey, clearOpencodeZenKey } = body;

    const updateData: Record<string, unknown> = {};

    if (name !== undefined) {
      if (!name || typeof name !== "string" || name.trim().length === 0) {
        return NextResponse.json({ error: "Name is required" }, { status: 400 });
      }
      updateData.name = name.trim();
    }

    if (clearNvidiaKey) {
      updateData.nvidiaApiKey = null;
    } else if (nvidiaApiKey !== undefined) {
      updateData.nvidiaApiKey = nvidiaApiKey.trim() || null;
    }

    if (clearOpencodeZenKey) {
      updateData.opencodeZenApiKey = null;
    } else if (opencodeZenApiKey !== undefined) {
      updateData.opencodeZenApiKey = opencodeZenApiKey.trim() || null;
    }

    if (nvidiaApiKey !== undefined || opencodeZenApiKey !== undefined || clearNvidiaKey || clearOpencodeZenKey) {
      updateData.apiKeysUpdatedAt = new Date();
    }

    const user = await prisma.user.update({
      where: { email: session.user.email },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        apiKeysUpdatedAt: true,
        nvidiaApiKey: true,
        opencodeZenApiKey: true,
      },
    });

    return NextResponse.json({
      ...user,
      hasNvidiaKey: !!user.nvidiaApiKey,
      hasOpencodeZenKey: !!user.opencodeZenApiKey,
      nvidiaApiKey: undefined,
      opencodeZenApiKey: undefined,
    });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
