import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { tailorResume, generateCoverLetter, analyzeJobDescription, answerApplicationQuestion, AI_PROVIDERS } from "@/lib/ai";
import { resolveJobInput, isUrl } from "@/lib/jobScraper";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, nvidiaApiKey: true, opencodeZenApiKey: true },
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
      ? (user.nvidiaApiKey || process.env.NVIDIA_API_KEY)
      : (user.opencodeZenApiKey || process.env.OPENCODE_ZEN_API_KEY);

    if (!apiKey) {
      const providerName = AI_PROVIDERS[provider as keyof typeof AI_PROVIDERS].name;
      return NextResponse.json(
        { error: `API key not configured for ${providerName}. Go to Settings → AI Integration to add your key.` },
        { status: 400 }
      );
    }

    const resume = await prisma.resume.findUnique({
      where: { userId: user.id },
    });

    const resumeData = resume?.data || "No resume on file";

    // If the user pasted a URL (e.g. a LinkedIn job link) instead of the
    // description text, fetch and extract the real posting first so the model
    // analyzes the job, not the link.
    let resolvedJobDescription = jobDescription;
    if (jobDescription && isUrl(jobDescription)) {
      try {
        const resolved = await resolveJobInput(jobDescription);
        resolvedJobDescription = resolved.text;
      } catch (e) {
        return NextResponse.json(
          { error: e instanceof Error ? e.message : "Could not read the job URL" },
          { status: 422 }
        );
      }
    }

    let result: string;

    switch (action) {
      case "tailor":
        if (!resolvedJobDescription) {
          return NextResponse.json({ error: "Job description required" }, { status: 400 });
        }
        result = await tailorResume(resolvedJobDescription, resumeData, provider, apiKey, modelId);
        break;

      case "cover-letter":
        if (!companyName || !position || !resolvedJobDescription) {
          return NextResponse.json({ error: "Company name, position, and job description required" }, { status: 400 });
        }
        result = await generateCoverLetter(resolvedJobDescription, resumeData, companyName, position, provider, apiKey, modelId);
        break;

      case "analyze":
        if (!resolvedJobDescription) {
          return NextResponse.json({ error: "Job description required" }, { status: 400 });
        }
        result = await analyzeJobDescription(resolvedJobDescription, provider, apiKey, modelId);
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