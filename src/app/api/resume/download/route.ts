import { NextResponse } from "next/server";
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
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const resume = await prisma.resume.findUnique({
      where: { userId: user.id },
    });

    if (!resume?.data) {
      return NextResponse.json({ error: "No resume file found" }, { status: 404 });
    }

    const buffer = Buffer.from(resume.data, "base64");

    const fileName = resume.fileName || "resume.pdf";

    const isPdf = fileName.toLowerCase().endsWith(".pdf");
    const contentType = isPdf ? "application/pdf" : "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Length": buffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("Resume download error:", error);
    return NextResponse.json({ error: "Failed to download resume" }, { status: 500 });
  }
}
