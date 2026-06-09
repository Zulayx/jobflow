import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { tailorResume, generateCoverLetter, analyzeJobDescription, answerApplicationQuestion, AI_PROVIDERS } from "@/lib/ai";

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

    const { action, jobDescription, companyName, position, provider, modelId, question } = await request.json() as {
      action: string;
      jobDescription?: string;
      companyName?: string;
      position?: string;
      provider: "opencodeZen" | "nvidia";
      modelId?: string;
      question?: string;
    };

    const apiKey = provider === "nvidia"
      ? process.env.NVIDIA_API_KEY
      : process.env.OPENCODE_ZEN_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: `API key not configured for ${AI_PROVIDERS[provider as keyof typeof AI_PROVIDERS].name}` },
        { status: 400 }
      );
    }

    const resume = await prisma.resume.findUnique({
      where: { userId: user.id },
    });

    const resumeData = resume?.data || "No resume on file";

    let result: string;

    switch (action) {
      case "tailor":
        if (!jobDescription) {
          return NextResponse.json({ error: "Job description required" }, { status: 400 });
        }
        result = await tailorResume(jobDescription, resumeData, provider, apiKey, modelId);
        break;

      case "cover-letter":
        if (!companyName || !position || !jobDescription) {
          return NextResponse.json({ error: "Company name, position, and job description required" }, { status: 400 });
        }
        result = await generateCoverLetter(jobDescription, resumeData, companyName, position, provider, apiKey, modelId);
        break;

      case "analyze":
        if (!jobDescription) {
          return NextResponse.json({ error: "Job description required" }, { status: 400 });
        }
        result = await analyzeJobDescription(jobDescription, provider, apiKey, modelId);
        break;

      case "answer-question":
        if (!question) {
          return NextResponse.json({ error: "Question required" }, { status: 400 });
        }
        result = await answerApplicationQuestion(question, resumeData, provider, apiKey, modelId);
        break;

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("AI API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "AI request failed" },
      { status: 500 }
    );
  }
}