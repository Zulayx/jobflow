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
    model: "nvidia/llama-3.1-nemotron-ultra-instruct",
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
  {
    id: "nvidia/llama-3.1-405b-instruct",
    name: "Llama 3.1 405B",
    description: "Meta's largest & most powerful open-source model",
    strengths: ["Reasoning", "Complex Writing", "Analysis", "Research", "STEM"],
    contextLength: "128K",
    icon: "🧠",
    category: "Text Generation",
  },
  {
    id: "nvidia/nemotron-4-340b-instruct",
    name: "Nemotron-4 340B",
    description: "NVIDIA's frontier model for chat & reasoning",
    strengths: ["Reasoning", "Chat", "Synthetic Data", "Analysis"],
    contextLength: "4K",
    icon: "🚀",
    category: "Text Generation",
  },
  {
    id: "nvidia/llama-3.1-nemotron-ultra-instruct",
    name: "Nemotron Ultra",
    description: "Top-tier reasoning & complex writing",
    strengths: ["Reasoning", "Complex Writing", "Analysis", "Resume Tailoring"],
    contextLength: "128K",
    icon: "🎯",
    category: "Reasoning & Coding",
  },
  {
    id: "nvidia/llama-3.1-70b-instruct",
    name: "Llama 3.1 70B",
    description: "Highly capable model for complex tasks",
    strengths: ["General Purpose", "Content Generation", "Coding", "Analysis"],
    contextLength: "128K",
    icon: "⚡",
    category: "Text Generation",
  },
  {
    id: "nvidia/mixtral-8x22b-instruct-v0.1",
    name: "Mixtral 8x22B",
    description: "High-performance sparse mixture of experts",
    strengths: ["Reasoning", "Coding", "Multilingual", "Technical Writing"],
    contextLength: "64K",
    icon: "💻",
    category: "Reasoning & Coding",
  },
  {
    id: "nvidia/mixtral-8x7b-instruct-v0.1",
    name: "Mixtral 8x7B",
    description: "Quality sparse mixture of experts",
    strengths: ["Coding", "Reasoning", "Technical Writing", "STEM"],
    contextLength: "32K",
    icon: "💻",
    category: "Reasoning & Coding",
  },
  {
    id: "nvidia/code-llama-70b-instruct",
    name: "Code Llama 70B",
    description: "Specialized code generation model",
    strengths: ["Code Generation", "Coding", "Debugging", "Technical"],
    contextLength: "16K",
    icon: "🔢",
    category: "Code Generation",
  },
  {
    id: "nvidia/mistral-large-2",
    name: "Mistral Large 2",
    description: "Frontier-level multilingual reasoning",
    strengths: ["Reasoning", "Multilingual", "Analysis", "Code", "STEM"],
    contextLength: "128K",
    icon: "🌍",
    category: "Reasoning & Coding",
  },
  {
    id: "nvidia/llama-3.2-90b-vision-instruct",
    name: "Llama 3.2 Vision 90B",
    description: "State-of-the-art multimodal from Meta",
    strengths: ["Vision", "Multimodal", "Image Understanding", "Analysis"],
    contextLength: "128K",
    icon: "👁️",
    category: "Vision (VLM)",
  },
  {
    id: "nvidia/phi-3-vision-128k-instruct",
    name: "Phi-3 Vision",
    description: "Fast vision-language model",
    strengths: ["Vision", "Image Understanding", "Quick Tasks", "Multimodal"],
    contextLength: "128K",
    icon: "👁️",
    category: "Vision (VLM)",
  },
  {
    id: "nvidia/gemma-2-27b-it",
    name: "Gemma 2 27B",
    description: "Google's lightweight & efficient state-of-the-art",
    strengths: ["Efficiency", "Reasoning", "Code Completion", "Research"],
    contextLength: "8K",
    icon: "🔬",
    category: "Small & Fast",
  },
  {
    id: "nvidia/gemma-2-9b-it",
    name: "Gemma 2 9B",
    description: "Smaller, faster Gemma 2",
    strengths: ["Speed", "Efficiency", "General Tasks", "Quick Responses"],
    contextLength: "8K",
    isFast: true,
    icon: "🚀",
    category: "Small & Fast",
  },
  {
    id: "nvidia/llama-3.1-8b-instruct",
    name: "Llama 3.1 8B",
    description: "Fast & efficient for general tasks",
    strengths: ["Speed", "Efficiency", "General Tasks", "Summarization"],
    contextLength: "128K",
    isFast: true,
    icon: "⚡",
    category: "Small & Fast",
  },
  {
    id: "nvidia/mistral-nemo-mini-instruct",
    name: "Mistral Nemo Mini",
    description: "Fast inference, great for drafts",
    strengths: ["Fast Drafts", "Cover Letters", "Quick Edits", "Speed"],
    contextLength: "128K",
    isFast: true,
    icon: "⚡",
    category: "Small & Fast",
  },
  {
    id: "nvidia/nv-embed-qa",
    name: "NV-Embed-QA",
    description: "NVIDIA's embedding model for RAG",
    strengths: ["RAG", "Embeddings", "Search", "Document Retrieval"],
    contextLength: "4K",
    icon: "🔍",
    category: "Embeddings & RAG",
  },
  {
    id: "nvidia/kimi-k2.6-instruct",
    name: "Kimi K 2.6",
    description: "Moonshot AI's multilingual reasoning powerhouse",
    strengths: ["Reasoning", "Long Context", "Multilingual", "Analysis", "Chinese"],
    contextLength: "128K",
    icon: "🌙",
    category: "Reasoning & Coding",
  },
  {
    id: "nvidia/kimi-1.5-k2.6-instruct",
    name: "Kimi 1.5 K 2.6",
    description: "Enhanced Kimi with improved context understanding",
    strengths: ["Long Context", "Reasoning", "Multilingual", "Research"],
    contextLength: "256K",
    icon: "🌙",
    category: "Reasoning & Coding",
  },
  {
    id: "nvidia/step-3.7-flash",
    name: "Step 3.7 Flash",
    description: "Stepfun AI sparse MoE multimodal reasoning",
    strengths: ["Enterprise", "Agentic", "Coding", "Multimodal"],
    contextLength: "128K",
    icon: "⚡",
    category: "Reasoning & Coding",
  },
  {
    id: "nvidia/deepseek-v4-flash",
    name: "DeepSeek V4 Flash",
    description: "284B MoE model with 1M context for fast coding and agents",
    strengths: ["Coding", "Agents", "Long Context", "Reasoning"],
    contextLength: "1M",
    icon: "🧠",
    category: "Reasoning & Coding",
  },
  {
    id: "nvidia/deepseek-v4-pro",
    name: "DeepSeek V4 Pro",
    description: "Efficient MoE architecture for coding tasks",
    strengths: ["Coding", "Reasoning", "Long Context", "MoE"],
    contextLength: "1M",
    icon: "💻",
    category: "Reasoning & Coding",
  },
  {
    id: "nvidia/glm-5.1",
    name: "GLM-5.1",
    description: "Z.ai flagship LLM for agentic workflows, coding, long-horizon reasoning",
    strengths: ["Agentic", "Coding", "Long-horizon", "Reasoning"],
    contextLength: "128K",
    icon: "🎯",
    category: "Reasoning & Coding",
  },
  {
    id: "nvidia/gemma-4-31b-it",
    name: "Gemma 4 31B",
    description: "Google Dense 31B model for frontier reasoning",
    strengths: ["Reasoning", "Coding", "Agentic", "Fine-tuning"],
    contextLength: "128K",
    icon: "🔬",
    category: "Text Generation",
  },
  {
    id: "nvidia/mistral-small-4-119b-2603",
    name: "Mistral Small 4 119B",
    description: "Hybrid MoE for instruct, reasoning, coding with 256K context",
    strengths: ["Coding", "Reasoning", "Multimodal", "Long Context"],
    contextLength: "256K",
    icon: "💻",
    category: "Reasoning & Coding",
  },
  {
    id: "nvidia/qwen3.5-122b-a10b",
    name: "Qwen 3.5 122B",
    description: "122B MoE LLM (10B active) for coding, reasoning, multimodal",
    strengths: ["Coding", "Reasoning", "Multimodal", "Agent-ready"],
    contextLength: "128K",
    icon: "🌟",
    category: "Qwen Series",
  },
  {
    id: "nvidia/qwen3.5-397b-a17b",
    name: "Qwen 3.5 397B",
    description: "400B MoE with advanced vision, chat, RAG, agentic",
    strengths: ["Vision", "Agentic", "RAG", "Multimodal"],
    contextLength: "128K",
    icon: "🌟",
    category: "Qwen Series",
  },
  {
    id: "nvidia/step-3.5-flash",
    name: "Step 3.5 Flash",
    description: "200B open-source reasoning engine",
    strengths: ["Agentic", "Reasoning", "Sparse MoE"],
    contextLength: "128K",
    icon: "🚀",
    category: "Reasoning & Coding",
  },
  {
    id: "nvidia/minimax-m2.7",
    name: "MiniMax M2.7",
    description: "230B text-to-text AI for coding, reasoning, office tasks",
    strengths: ["Coding", "Reasoning", "Office Tasks"],
    contextLength: "128K",
    icon: "⚡",
    category: "Text Generation",
  },
  {
    id: "nvidia/mistral-medium-3.5-128b",
    name: "Mistral Medium 3.5 128B",
    description: "High performing model for text generation, coding, agentic",
    strengths: ["Coding", "Agentic", "Text Generation"],
    contextLength: "128K",
    icon: "💻",
    category: "Text Generation",
  },
  {
    id: "nvidia/cosmos3-nano",
    name: "Cosmos 3 Nano",
    description: "Physics-aware video generation from text/image",
    strengths: ["Video Generation", "Physical AI", "Autonomous"],
    contextLength: "N/A",
    icon: "🎬",
    category: "Video Generation",
  },
  {
    id: "nvidia/cosmos3-nano-reasoner",
    name: "Cosmos 3 Nano Reasoner",
    description: "VLM for understanding physical world with structured reasoning",
    strengths: ["Video Understanding", "Reasoning", "Physical AI"],
    contextLength: "N/A",
    icon: "🔍",
    category: "Vision (VLM)",
  },
  {
    id: "nvidia/cosmos-reason2-8b",
    name: "Cosmos Reason2 8B",
    description: "Vision language model for understanding physical world",
    strengths: ["Video Understanding", "Reasoning", "Physical AI"],
    contextLength: "N/A",
    icon: "🔍",
    category: "Vision (VLM)",
  },
  {
    id: "nvidia/nemotron-3-nano-30b-a3b",
    name: "Nemotron 3 Nano 30B",
    description: "Open MoE with 1M context, coding, reasoning, tool calling",
    strengths: ["Coding", "Reasoning", "Tool Calling", "1M Context"],
    contextLength: "1M",
    icon: "🧠",
    category: "Reasoning & Coding",
  },
  {
    id: "nvidia/nemotron-3-nano-30b-a3b-reasoning",
    name: "Nemotron 3 Nano 30B Reasoning",
    description: "Omni-modal reasoning model for images, video, speech, text",
    strengths: ["Multimodal", "Reasoning", "Speech", "Vision"],
    contextLength: "128K",
    icon: "🔮",
    category: "Multimodal",
  },
  {
    id: "nvidia/nemotron-3-super-120b-a12b",
    name: "Nemotron 3 Super 120B",
    description: "Hybrid Mamba-Transformer MoE with 1M context for agentic reasoning",
    strengths: ["Agentic", "Coding", "Planning", "Tool Calling"],
    contextLength: "1M",
    icon: "🎯",
    category: "Agentic",
  },
  {
    id: "nvidia/nemotron-3-ultra-550b-a55b",
    name: "Nemotron 3 Ultra 550B",
    description: "Open hybrid Mamba-Transformer MoE for agentic reasoning",
    strengths: ["Agentic", "Reasoning", "Coding", "Planning"],
    contextLength: "1M",
    icon: "🧠",
    category: "Agentic",
  },
  {
    id: "nvidia/llama-nemotron-embed-1b-v2",
    name: "Llama Nemotron Embed 1B",
    description: "Multilingual embedding for long-document QA, 26 languages",
    strengths: ["Embedding", "QA", "Multilingual", "Retrieval"],
    contextLength: "N/A",
    icon: "🔍",
    category: "Embeddings & RAG",
  },
  {
    id: "nvidia/llama-nemotron-embed-vl-1b-v2",
    name: "Llama Nemotron Embed VL 1B",
    description: "Multimodal QA with text and image representations",
    strengths: ["Multimodal", "Embedding", "QA", "Retrieval"],
    contextLength: "N/A",
    icon: "🔍",
    category: "Embeddings & RAG",
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