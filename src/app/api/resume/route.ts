import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";

export const dynamic = "force-dynamic";
import { join } from "path";

export async function GET() {
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

    const resume = await prisma.resume.findUnique({
      where: { userId: user.id },
    });

    return NextResponse.json(resume || null);
  } catch (error) {
    console.error("Get resume error:", error);
    return NextResponse.json({ error: "Failed to fetch resume" }, { status: 500 });
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

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const data = formData.get("data") as string | null;

    if (!file && !data) {
      return NextResponse.json({ error: "No file or data provided" }, { status: 400 });
    }

    let filePath: string | null = null;
    let fileName: string | null = null;

    if (file) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const uploadDir = join(process.cwd(), "public", "uploads", user.id);
      await mkdir(uploadDir, { recursive: true });

      fileName = file.name;
      filePath = `/uploads/${user.id}/${file.name}`;

      await writeFile(join(uploadDir, file.name), buffer);
    }

    const resume = await prisma.resume.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        fileName,
        filePath,
        data,
      },
      update: {
        fileName,
        filePath,
        data,
      },
    });

    return NextResponse.json(resume);
  } catch (error) {
    console.error("Upload resume error:", error);
    return NextResponse.json({ error: "Failed to upload resume" }, { status: 500 });
  }
}