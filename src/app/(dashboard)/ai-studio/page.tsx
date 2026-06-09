"use client";

import { useState, useEffect } from "react";
import { Resume } from "@/types";
import { NVIDIA_FREE_MODELS, OPENCODE_ZEN_MODELS, AIModel } from "@/lib/ai";

type TabType = "tailor" | "cover" | "analyze" | "questions";

function ModelCard({ model, isSelected, onSelect }: { model: AIModel; isSelected: boolean; onSelect: () => void }) {
  return (
    <button
      onClick={onSelect}
      className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
        isSelected
          ? "border-accent-primary bg-accent-primary/10"
          : "border-glass-border hover:border-glass-border/80"
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">{model.icon}</span>
          <div>
            <span className="font-semibold">{model.name}</span>
            <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-white/5 text-text-tertiary">
              {model.category}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {model.isFast && (
            <span className="px-2 py-0.5 text-xs rounded-full bg-accent-tertiary/20 text-accent-tertiary">
              Fast
            </span>
          )}
        </div>
      </div>
      <p className="text-sm text-text-secondary mb-3">{model.description}</p>
      <div className="flex flex-wrap gap-1">
        {model.strengths.slice(0, 4).map((strength) => (
          <span
            key={strength}
            className="px-2 py-0.5 text-xs rounded-full bg-white/5 text-text-tertiary"
          >
            {strength}
          </span>
        ))}
      </div>
      <div className="mt-2 text-xs text-text-tertiary">
        Context: {model.contextLength}
      </div>
    </button>
  );
}

function ModelDropdown({ models, selectedModel, onSelect, onClose }: {
  models: AIModel[];
  selectedModel: string;
  onSelect: (id: string) => void;
  onClose: () => void;
}) {
  const categories = Array.from(new Set(models.map(m => m.category)));

  return (
    <div className="absolute z-10 mt-2 w-full max-h-96 overflow-y-auto bg-bg-secondary rounded-xl border border-glass-border shadow-2xl">
      {categories.map(category => (
        <div key={category}>
          <div className="px-4 py-2 text-xs font-semibold text-accent-primary bg-glass-border/50 sticky top-0">
            {category}
          </div>
          <div className="p-2 space-y-2">
            {models.filter(m => m.category === category).map(model => (
              <button
                key={model.id}
                onClick={() => onSelect(model.id)}
                className={`w-full text-left p-3 rounded-lg transition-all flex items-center gap-3 ${
                  model.id === selectedModel
                    ? "bg-accent-primary/20 border border-accent-primary"
                    : "hover:bg-white/5 border border-transparent"
                }`}
              >
                <span className="text-lg">{model.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{model.name}</div>
                  <div className="text-xs text-text-tertiary truncate">{model.description}</div>
                </div>
                {model.isFast && (
                  <span className="px-1.5 py-0.5 text-xs rounded bg-accent-tertiary/20 text-accent-tertiary">
                    Fast
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

type Application = {
  id: string;
  company: string;
  position: string;
  jobUrl?: string | null;
  jobDescription?: string | null;
  notes?: string | null;
};

export default function AIStudioPage() {
  const [activeTab, setActiveTab] = useState<TabType>("tailor");
  const [jobDescription, setJobDescription] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [position, setPosition] = useState("");
  const [question, setQuestion] = useState("");
  const [aiResult, setAiResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [resume, setResume] = useState<Resume | null>(null);
  const [provider, setProvider] = useState<"opencodeZen" | "nvidia">("nvidia");
  const [selectedModel, setSelectedModel] = useState("nvidia/llama-3.3-nemotron-super-49b-v1");
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [showAppDropdown, setShowAppDropdown] = useState(false);

  useEffect(() => {
    fetchResume();
    fetchApplications();
  }, []);

  useEffect(() => {
    if (provider === "nvidia") {
      setSelectedModel("nvidia/llama-3.3-nemotron-super-49b-v1");
    } else {
      setSelectedModel("gpt-4o-mini");
    }
  }, [provider]);

  const fetchResume = async () => {
    try {
      const response = await fetch("/api/resume");
      if (response.ok) {
        const data = await response.json();
        setResume(data);
      }
    } catch (error) {
      console.error("Failed to fetch resume:", error);
    }
  };

  const fetchApplications = async () => {
    try {
      const response = await fetch("/api/applications");
      if (response.ok) {
        const data = await response.json();
        setApplications(data);
      }
    } catch (error) {
      console.error("Failed to fetch applications:", error);
    }
  };

  const handleSelectApplication = (app: Application) => {
    setSelectedApplication(app);
    setCompanyName(app.company);
    setPosition(app.position);
    if (app.jobDescription) setJobDescription(app.jobDescription);
    else if (app.notes) setJobDescription(app.notes);
    setShowAppDropdown(false);
  };

  const handleClearApplication = () => {
    setSelectedApplication(null);
    setCompanyName("");
    setPosition("");
    setJobDescription("");
  };

  const handleAIRequest = async () => {
    if (activeTab === "questions") {
      if (!question) {
        setError("Please enter a question to answer");
        return;
      }
    } else if (!jobDescription && !selectedApplication) {
      setError("Please enter a job description or select an imported job");
      return;
    }

    if (activeTab === "cover" && (!companyName || !position)) {
      setError("Please enter company name and position for cover letter");
      return;
    }

    setIsLoading(true);
    setError("");
    setAiResult("");
    setShowModelDropdown(false);

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: activeTab === "tailor" ? "tailor" : activeTab === "cover" ? "cover-letter" : activeTab === "analyze" ? "analyze" : "answer-question",
          jobDescription: activeTab !== "questions"
            ? (jobDescription || (selectedApplication ? `Role: ${selectedApplication.position} at ${selectedApplication.company}${selectedApplication.jobUrl ? `\nJob URL: ${selectedApplication.jobUrl}` : ""}` : undefined))
            : undefined,
          companyName: activeTab === "cover" ? companyName : undefined,
          position: activeTab === "cover" ? position : undefined,
          question: activeTab === "questions" ? question : undefined,
          provider,
          modelId: selectedModel,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "AI request failed");
      } else {
        setAiResult(data.data);
      }
    } catch (err) {
      setError("Failed to get AI response. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: "tailor" as const, label: "Resume Tailor", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
    { id: "cover" as const, label: "Cover Letter", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
    { id: "analyze" as const, label: "Analyze JD", icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" },
    { id: "questions" as const, label: "Answer Questions", icon: "M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 1.343-1.343 4-3 4-3 .77-1.162 2-2.03 2-3.772a9.823 9.823 0 00-2.09-5.063M12 15V5m0 0l-4 4m4-4l4 4" },
  ];

  const currentModels = provider === "nvidia" ? NVIDIA_FREE_MODELS : OPENCODE_ZEN_MODELS;
  const selectedModelData = currentModels.find((m) => m.id === selectedModel);

  const getModelCounts = () => {
    if (provider === "nvidia") {
      return {
        total: NVIDIA_FREE_MODELS.length,
        categories: Array.from(new Set(NVIDIA_FREE_MODELS.map(m => m.category))).length
      };
    }
    const freeCount = OPENCODE_ZEN_MODELS.filter(m => m.isFree).length;
    return { total: OPENCODE_ZEN_MODELS.length, free: freeCount };
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">AI Studio</h1>
        <p className="text-text-secondary">
          {provider === "nvidia" ? (
            <>Powered by <span className="text-accent-tertiary font-semibold">NVIDIA NIMs</span> - {getModelCounts().total} models across {getModelCounts().categories} categories</>
          ) : (
            <>Powered by <span className="text-accent-secondary font-semibold">Opencode Zen</span> - {getModelCounts().total} models ({getModelCounts().free} Free)</>
          )}
        </p>
      </div>

      <div className="glass-card p-1.5 inline-flex mb-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setAiResult("");
              setError("");
            }}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
              activeTab === tab.id
                ? "bg-accent-gradient text-white"
                : "text-text-secondary hover:text-white"
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
            </svg>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold mb-4">
              {activeTab === "tailor" && "Job Description"}
              {activeTab === "cover" && "Job Details"}
              {activeTab === "analyze" && "Paste Job Description"}
              {activeTab === "questions" && "Application Question"}
            </h3>

            {resume && (
              <div className="mb-4 p-4 rounded-xl bg-success/10 border border-success/20">
                <div className="flex items-center gap-2 text-success text-sm mb-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Resume on file
                </div>
                <div className="text-text-secondary text-sm">
                  {resume.fileName || "Custom resume data saved"}
                </div>
              </div>
            )}

            {applications.length > 0 && activeTab !== "questions" && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Use Imported Job (optional)</label>
                {selectedApplication ? (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-accent-primary/10 border border-accent-primary/30">
                    <div className="min-w-0">
                      <div className="font-medium text-sm truncate">{selectedApplication.position}</div>
                      <div className="text-xs text-text-secondary truncate">{selectedApplication.company}</div>
                    </div>
                    <button
                      onClick={handleClearApplication}
                      className="ml-3 text-text-tertiary hover:text-white transition-colors flex-shrink-0"
                      title="Clear selection"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowAppDropdown(!showAppDropdown)}
                      className="w-full input-field flex items-center justify-between text-left"
                    >
                      <span className="text-text-tertiary">Select from your applications...</span>
                      <svg
                        className={`w-4 h-4 flex-shrink-0 transition-transform ${showAppDropdown ? "rotate-180" : ""}`}
                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {showAppDropdown && (
                      <div className="absolute z-10 mt-1 w-full max-h-56 overflow-y-auto bg-bg-secondary rounded-xl border border-glass-border shadow-2xl">
                        {applications.map((app) => (
                          <button
                            key={app.id}
                            onClick={() => handleSelectApplication(app)}
                            className="w-full text-left px-4 py-3 hover:bg-white/5 transition-colors border-b border-glass-border/40 last:border-0"
                          >
                            <div className="font-medium text-sm">{app.position}</div>
                            <div className="text-xs text-text-secondary">{app.company}</div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">AI Provider</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setProvider("nvidia")}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    provider === "nvidia"
                      ? "border-accent-tertiary bg-accent-tertiary/10"
                      : "border-glass-border hover:border-glass-border/80"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-3 h-3 rounded-full bg-accent-tertiary" />
                    <span className="font-semibold">NVIDIA NIMs</span>
                  </div>
                  <div className="text-xs text-text-secondary">{NVIDIA_FREE_MODELS.length} Models</div>
                </button>
                <button
                  type="button"
                  onClick={() => setProvider("opencodeZen")}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    provider === "opencodeZen"
                      ? "border-accent-secondary bg-accent-secondary/10"
                      : "border-glass-border hover:border-glass-border/80"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-3 h-3 rounded-full bg-accent-secondary" />
                    <span className="font-semibold">Opencode Zen</span>
                  </div>
                  <div className="text-xs text-text-secondary">8 Models (4 Free)</div>
                </button>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                {provider === "nvidia" ? "NVIDIA Model" : "Opencode Zen Model"}
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowModelDropdown(!showModelDropdown)}
                  className="w-full input-field flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{selectedModelData?.icon}</span>
                    <div className="text-left">
                      <div className="font-medium">{selectedModelData?.name}</div>
                      <div className="text-xs text-text-tertiary">
                        {selectedModelData?.category} • {selectedModelData?.contextLength}
                      </div>
                    </div>
                  </div>
                  <svg
                    className={`w-5 h-5 transition-transform ${showModelDropdown ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showModelDropdown && (
                  <ModelDropdown
                    models={currentModels}
                    selectedModel={selectedModel}
                    onSelect={(id) => {
                      setSelectedModel(id);
                      setShowModelDropdown(false);
                    }}
                    onClose={() => setShowModelDropdown(false)}
                  />
                )}
              </div>

              {selectedModelData && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {selectedModelData.strengths.map((strength) => (
                    <span
                      key={strength}
                      className="px-2 py-1 text-xs rounded-full bg-accent-primary/20 text-accent-primary"
                    >
                      {strength}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {activeTab === "cover" && (
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Company Name</label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="input-field"
                    placeholder="Company name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Position</label>
                  <input
                    type="text"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    className="input-field"
                    placeholder="Job title"
                  />
                </div>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                {activeTab === "questions" && "Application Question"}
                {activeTab !== "questions" && (
                  <>
                    {activeTab === "tailor" && "Job Description"}
                    {activeTab === "cover" && "Job Description"}
                    {activeTab === "analyze" && "Job Description"}
                    {selectedApplication && (
                      <span className="ml-1 text-xs font-normal text-text-tertiary">(optional — imported job selected)</span>
                    )}
                  </>
                )}
              </label>
              {activeTab === "questions" ? (
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="input-field min-h-[200px] resize-none"
                  placeholder="How do you prioritize tasks? Describe a challenging situation at work and how you handled it..."
                />
              ) : (
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="input-field min-h-[200px] resize-none"
                  placeholder={selectedApplication
                    ? `Optional: paste the full job description to improve AI accuracy...\n\nRole: ${selectedApplication.position} at ${selectedApplication.company}`
                    : activeTab === "tailor"
                    ? "Paste the job description here to get resume tailoring suggestions..."
                    : activeTab === "cover"
                    ? "Paste the job description here to generate a personalized cover letter..."
                    : "Paste the job description to analyze requirements, skills, and company culture..."}
                />
              )}
            </div>

            {error && (
              <div className="mb-4 p-4 rounded-xl bg-error/10 border border-error/20 text-error text-sm">
                {error}
              </div>
            )}

            <button
              onClick={handleAIRequest}
              disabled={isLoading || (activeTab === "questions" ? !question : (!jobDescription && !selectedApplication))}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Processing with {selectedModelData?.name}...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  {activeTab === "tailor" && "Tailor My Resume"}
                  {activeTab === "cover" && "Generate Cover Letter"}
                  {activeTab === "analyze" && "Analyze Job Description"}
                  {activeTab === "questions" && "Get Answer"}
                </>
              )}
            </button>
          </div>

          <div className="glass-card p-6">
            <h4 className="font-semibold mb-3">Model Categories</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {provider === "nvidia" ? (
                <>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-white/5">
                    <span className="text-lg">🎯</span>
                    <span>NVIDIA Nemotron</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-white/5">
                    <span className="text-lg">🦙</span>
                    <span>Meta Llama</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-white/5">
                    <span className="text-lg">💻</span>
                    <span>Mistral</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-white/5">
                    <span className="text-lg">🔥</span>
                    <span>DeepSeek</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-white/5">
                    <span className="text-lg">🌟</span>
                    <span>Qwen</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-white/5">
                    <span className="text-lg">🌙</span>
                    <span>Moonshot / Kimi</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-white/5">
                    <span className="text-lg">🔬</span>
                    <span>Google & Microsoft</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-success/10 text-success">
                    <span>⚡</span>
                    <span>Free Models</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-white/5">
                    <span>🎯</span>
                    <span>Premium</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-card p-6 min-h-[500px]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">AI Output</h3>
                {aiResult && selectedModelData && (
                  <div className="flex items-center gap-2 mt-1">
                    <span>{selectedModelData.icon}</span>
                    <p className="text-xs text-text-tertiary">
                      {selectedModelData.name} • {selectedModelData.contextLength} context
                    </p>
                  </div>
                )}
              </div>
              {aiResult && (
                <button
                  onClick={() => navigator.clipboard.writeText(aiResult)}
                  className="btn-secondary text-sm px-3 py-1.5 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy
                </button>
              )}
            </div>

            {!aiResult ? (
              <div className="h-[400px] flex items-center justify-center text-text-tertiary">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-2xl bg-accent-primary/20 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-accent-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <p className="mb-2">Select a model and enter a job description</p>
                  <p className="text-xs">
                    {currentModels.length} models available from {provider === "nvidia" ? "NVIDIA NIMs" : "Opencode Zen"}
                  </p>
                </div>
              </div>
            ) : (
              <div className="prose prose-invert max-w-none">
                <div className="whitespace-pre-wrap text-text-secondary leading-relaxed">
                  {aiResult}
                </div>
              </div>
            )}
          </div>

          {activeTab === "cover" && aiResult && (
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold mb-4">Download as PDF</h3>
              <p className="text-text-secondary text-sm mb-4">
                Download your generated cover letter as a professional PDF document.
              </p>
              <button className="btn-primary w-full flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download PDF
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}