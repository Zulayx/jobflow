interface AIProvider {
  name: string;
  apiKey: string;
  baseUrl: string;
  model: string;
}

export const AI_PROVIDERS = {
  opencodeZen: {
    name: "Opencode Zen",
    baseUrl: process.env.OPENCODE_ZEN_API_URL || "https://api.opencode.ai/v1",
    model: "gpt-4o-mini",
  },
  nvidia: {
    name: "NVIDIA NIMs",
    baseUrl: "https://integrate.api.nvidia.com/v1",
    model: "meta/llama-3.1-8b-instruct",
  },
} as const;

export interface AIModel {
  id: string;
  name: string;
  description: string;
  strengths: string[];
  contextLength: string;
  isFast?: boolean;
  isFree?: boolean;
  icon: string;
  category: string;
}

export const NVIDIA_FREE_MODELS: AIModel[] = [
  // ── Reasoning & Writing ──────────────────────────────────────
  {
    id: "nvidia/llama-3.1-nemotron-70b-instruct",
    name: "Nemotron 70B",
    description: "NVIDIA fine-tuned Llama — top reasoning & writing",
    strengths: ["Reasoning", "Complex Writing", "Analysis", "Resume Tailoring"],
    contextLength: "128K",
    icon: "🎯",
    category: "Reasoning & Writing",
  },
  {
    id: "nvidia/nemotron-4-340b-instruct",
    name: "Nemotron-4 340B",
    description: "NVIDIA's frontier model for chat & synthetic data",
    strengths: ["Reasoning", "Chat", "Synthetic Data", "Analysis"],
    contextLength: "4K",
    icon: "🚀",
    category: "Reasoning & Writing",
  },
  {
    id: "mistralai/mixtral-8x22b-instruct-v0.1",
    name: "Mixtral 8x22B",
    description: "High-performance sparse mixture of experts",
    strengths: ["Reasoning", "Coding", "Multilingual", "Technical Writing"],
    contextLength: "64K",
    icon: "💻",
    category: "Reasoning & Writing",
  },
  {
    id: "mistralai/mistral-large-2-instruct",
    name: "Mistral Large 2",
    description: "Frontier-level multilingual reasoning",
    strengths: ["Reasoning", "Multilingual", "Analysis", "Code", "STEM"],
    contextLength: "128K",
    icon: "🌍",
    category: "Reasoning & Writing",
  },
  // ── Meta Llama ───────────────────────────────────────────────
  {
    id: "meta/llama-3.1-405b-instruct",
    name: "Llama 3.1 405B",
    description: "Meta's largest open-source model",
    strengths: ["Reasoning", "Complex Writing", "Analysis", "Research", "STEM"],
    contextLength: "128K",
    icon: "🧠",
    category: "Meta Llama",
  },
  {
    id: "meta/llama-3.1-70b-instruct",
    name: "Llama 3.1 70B",
    description: "Highly capable model for complex tasks",
    strengths: ["General Purpose", "Content Generation", "Coding", "Analysis"],
    contextLength: "128K",
    icon: "⚡",
    category: "Meta Llama",
  },
  {
    id: "meta/llama-3.1-8b-instruct",
    name: "Llama 3.1 8B",
    description: "Fast & efficient — great starting point",
    strengths: ["Speed", "Efficiency", "General Tasks", "Summarization"],
    contextLength: "128K",
    isFast: true,
    icon: "⚡",
    category: "Meta Llama",
  },
  {
    id: "meta/llama-3.2-90b-vision-instruct",
    name: "Llama 3.2 Vision 90B",
    description: "State-of-the-art multimodal from Meta",
    strengths: ["Vision", "Multimodal", "Image Understanding", "Analysis"],
    contextLength: "128K",
    icon: "👁️",
    category: "Meta Llama",
  },
  {
    id: "meta/llama-3.2-11b-vision-instruct",
    name: "Llama 3.2 Vision 11B",
    description: "Lighter multimodal Llama",
    strengths: ["Vision", "Speed", "Image Understanding", "Multimodal"],
    contextLength: "128K",
    isFast: true,
    icon: "👁️",
    category: "Meta Llama",
  },
  // ── Google ───────────────────────────────────────────────────
  {
    id: "google/gemma-2-27b-it",
    name: "Gemma 2 27B",
    description: "Google's efficient state-of-the-art",
    strengths: ["Efficiency", "Reasoning", "Code Completion", "Research"],
    contextLength: "8K",
    icon: "🔬",
    category: "Google",
  },
  {
    id: "google/gemma-2-9b-it",
    name: "Gemma 2 9B",
    description: "Smaller, faster Gemma 2",
    strengths: ["Speed", "Efficiency", "General Tasks", "Quick Responses"],
    contextLength: "8K",
    isFast: true,
    icon: "🚀",
    category: "Google",
  },
  // ── Mistral ──────────────────────────────────────────────────
  {
    id: "mistralai/mixtral-8x7b-instruct-v0.1",
    name: "Mixtral 8x7B",
    description: "Quality sparse MoE — good for drafts",
    strengths: ["Coding", "Reasoning", "Technical Writing", "STEM"],
    contextLength: "32K",
    icon: "💻",
    category: "Mistral",
  },
  {
    id: "mistralai/mistral-7b-instruct-v0.3",
    name: "Mistral 7B",
    description: "Compact, fast instruction-following",
    strengths: ["Speed", "Efficiency", "Cover Letters", "Quick Edits"],
    contextLength: "32K",
    isFast: true,
    icon: "⚡",
    category: "Mistral",
  },
  // ── Microsoft ────────────────────────────────────────────────
  {
    id: "microsoft/phi-3-mini-128k-instruct",
    name: "Phi-3 Mini 128K",
    description: "Small but capable — great for quick tasks",
    strengths: ["Speed", "Efficiency", "Summarization", "Quick Tasks"],
    contextLength: "128K",
    isFast: true,
    icon: "⚡",
    category: "Microsoft",
  },
  {
    id: "microsoft/phi-3-medium-128k-instruct",
    name: "Phi-3 Medium 128K",
    description: "Balanced quality & speed from Microsoft",
    strengths: ["Reasoning", "Coding", "Analysis", "Long Context"],
    contextLength: "128K",
    icon: "🔬",
    category: "Microsoft",
  },
];

export const OPENCODE_ZEN_MODELS: AIModel[] = [
  {
    id: "gpt-4o-mini",
    name: "GPT-4o Mini",
    description: "Fast & affordable all-rounder",
    strengths: ["Speed", "Cost-effective", "Resume Parsing", "Quick Edits"],
    contextLength: "128K",
    isFast: true,
    isFree: true,
    icon: "⚡",
    category: "Free Models",
  },
  {
    id: "gpt-4o",
    name: "GPT-4o",
    description: "Most capable for complex tasks",
    strengths: ["Complex Writing", "Reasoning", "Analysis", "Premium Quality"],
    contextLength: "128K",
    icon: "🎯",
    category: "Premium",
  },
  {
    id: "gpt-4o-mini-reasoner",
    name: "GPT-4o Mini Reasoner",
    description: "Enhanced reasoning capabilities",
    strengths: ["Deep Reasoning", "Problem Solving", "Complex Analysis", "Strategy"],
    contextLength: "128K",
    isFree: true,
    icon: "🧠",
    category: "Free Models",
  },
  {
    id: "o1-mini",
    name: "o1 Mini",
    description: "Advanced reasoning for coding",
    strengths: ["Coding", "Reasoning", "Technical Problems", "STEM"],
    contextLength: "128K",
    icon: "💻",
    category: "Premium",
  },
  {
    id: "claude-3.5-haiku",
    name: "Claude 3.5 Haiku",
    description: "Fast, precise, Anthropic quality",
    strengths: ["Speed", "Precision", "Code", "Quick Responses"],
    contextLength: "200K",
    isFree: true,
    icon: "⚡",
    category: "Free Models",
  },
  {
    id: "claude-3.5-sonnet",
    name: "Claude 3.5 Sonnet",
    description: "Balanced intelligence & speed",
    strengths: ["Analysis", "Writing", "Reasoning", "Long Context"],
    contextLength: "200K",
    icon: "🎯",
    category: "Premium",
  },
  {
    id: "gemini-1.5-flash",
    name: "Gemini 1.5 Flash",
    description: "Google's speed champion",
    strengths: ["Speed", "Multimodal", "Large Context", "Quick Tasks"],
    contextLength: "1M",
    isFree: true,
    icon: "⚡",
    category: "Free Models",
  },
  {
    id: "gemini-1.5-pro",
    name: "Gemini 1.5 Pro",
    description: "Massive context, top reasoning",
    strengths: ["1M Context", "Analysis", "Research", "Long Documents"],
    contextLength: "1M",
    icon: "🔬",
    category: "Premium",
  },
];

export type ProviderType = keyof typeof AI_PROVIDERS;

export async function callAI(
  provider: AIProvider,
  messages: Array<{ role: string; content: string }>,
  modelOverride?: string
) {
  const model = modelOverride || provider.model;

  const response = await fetch(`${provider.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${provider.apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.7,
      max_tokens: 4096,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`AI API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

export async function tailorResume(
  jobDescription: string,
  resumeData: string,
  provider: ProviderType,
  apiKey: string,
  modelId?: string
) {
  const selectedProvider = {
    ...AI_PROVIDERS[provider],
    apiKey,
  };

  const systemPrompt = `You are a professional resume writer. IMPORTANT RULES:
1. ONLY use information that exists in the provided resume - NEVER invent or assume experience
2. ONLY use real job titles, company names, dates, and achievements from the resume
3. Rewrite bullet points to better match job description keywords while keeping facts accurate
4. Keep all descriptions truthful - do not exaggerate or change accomplishments
5. Use natural, human-sounding language - vary sentence structure, avoid repetitive patterns

Output ONLY valid JSON:
{
  "matchScore": number (0-100),
  "analysis": {
    "strengths": string[] (from resume),
    "missingKeywords": string[] (from job description missing in resume),
    "gaps": string[] (genuine gaps between resume and job requirements)
  },
  "tailoredBullets": string[] (rewritten bullets that stay TRUE to original resume),
  "suggestions": string[] (only factual suggestions based on resume),
  "atsTips": string[],
  "summary": string
}`;

  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: `## Job Description:\n${jobDescription}\n\n## My Resume (ONLY use facts from this):\n${resumeData}\n\nTailor the resume to match the job while staying 100% truthful to the original resume data.` },
  ];

  return callAI(selectedProvider, messages, modelId);
}

export async function generateCoverLetter(
  jobDescription: string,
  resumeData: string,
  companyName: string,
  position: string,
  provider: ProviderType,
  apiKey: string,
  modelId?: string
) {
  const selectedProvider = {
    ...AI_PROVIDERS[provider],
    apiKey,
  };

  const systemPrompt = `You are an expert cover letter writer. CRITICAL RULES:
1. ONLY reference experiences and skills that EXIST in the provided resume
2. Do NOT invent any accomplishments, projects, or experiences
3. Use conversational, human language - like you're actually speaking to someone
4. Vary your sentence structure and word choice - don't sound robotic
5. Keep it personal and genuine - write as if talking to a hiring manager over coffee
6. Do NOT use generic phrases like "I am excited to apply" - find authentic reasons

Generate a cover letter that sounds authentically human. Format as a proper letter.
Do NOT use placeholders like [Company Name] - use the actual information provided.
Do NOT invent specific metrics or numbers unless they are in the resume.`;

  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: `## Target Company: ${companyName}\n## Target Position: ${position}\n\n## Job Description:\n${jobDescription}\n\n## My Resume (ONLY use facts from this):\n${resumeData}\n\nGenerate a genuine, human-sounding cover letter based ONLY on the actual resume content.` },
  ];

  return callAI(selectedProvider, messages, modelId);
}

export async function answerApplicationQuestion(
  question: string,
  resumeData: string,
  provider: ProviderType,
  apiKey: string,
  modelId?: string
) {
  const selectedProvider = {
    ...AI_PROVIDERS[provider],
    apiKey,
  };

  const systemPrompt = `You are helping someone answer job application questions. CRITICAL:
1. ONLY use experiences from the provided resume - NEVER fabricate examples
2. If the resume doesn't have a relevant example, say so honestly: "I haven't faced this specifically, but..."
3. Use FIRST PERSON, conversational language - like you're talking, not writing an essay
4. Vary sentence length and structure - short sentences, long sentences, different openings
5. Sound like a real person in a conversation, not an AI bot
6. Include small, authentic details that show real experience
7. Avoid: "In conclusion", "As an AI", "I am writing to", "Furthermore", "Moreover"
8. Use active voice and specific examples from actual work experience
9. Keep answers concise but meaningful

IMPORTANT: If you cannot find relevant experience in the resume for a question, admit it naturally rather than making something up.

Output your answer as a JSON:
{
  "answer": "the conversational, human-sounding answer (not in quotes in the JSON, just the string value)",
  "tone": "conversational",
  "basedOn": "brief note on which resume experience this is based on (or 'none - answered generally')"
}`;

  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: `## Question to answer:\n${question}\n\n## My Resume:\n${resumeData}\n\nAnswer this question in a natural, human way using only your actual experience from the resume above.` },
  ];

  return callAI(selectedProvider, messages, modelId);
}

export async function analyzeJobDescription(
  jobDescription: string,
  provider: ProviderType,
  apiKey: string,
  modelId?: string
) {
  const selectedProvider = {
    ...AI_PROVIDERS[provider],
    apiKey,
  };

  const systemPrompt = `You are an expert job market analyst. Analyze job descriptions to help candidates prepare better.

Respond ONLY with valid JSON:
{
  "overview": string,
  "keyRequirements": {
    "mustHave": string[],
    "niceToHave": string[]
  },
  "skillsAnalysis": {
    "technical": string[],
    "soft": string[],
    "domain": string[]
  },
  "redFlags": string[],
  "salaryIndicators": string[],
  "companyCulture": string[],
  "preparationTips": string[],
  "interviewQuestions": string[]
}`;

  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: `Analyze this job description:\n\n${jobDescription}` },
  ];

  return callAI(selectedProvider, messages, modelId);
}

export async function interviewPrep(
  jobDescription: string,
  resumeData: string,
  provider: ProviderType,
  apiKey: string,
  modelId?: string
) {
  const selectedProvider = {
    ...AI_PROVIDERS[provider],
    apiKey,
  };

  const systemPrompt = `You are an expert interview coach. Based on job description and resume, provide preparation.

Respond ONLY with valid JSON:
{
  "likelyQuestions": string[],
  "goodAnswers": {
    "behavioral": string[],
    "technical": string[],
    "situational": string[]
  },
  "questionsToAsk": string[],
  "commonPitfalls": string[],
  "preparationChecklist": string[]
}

Sound human in sample answers - conversational, specific, not robotic.`;

  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: `## Job Description:\n${jobDescription}\n\n## My Resume:\n${resumeData}\n\nGenerate interview prep.` },
  ];

  return callAI(selectedProvider, messages, modelId);
}