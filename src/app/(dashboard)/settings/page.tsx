"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { signOut } from "next-auth/react";

export default function SettingsPage() {
  const { data: session } = useSession();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeData, setResumeData] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const [opencodeZenKey, setOpencodeZenKey] = useState("");
  const [nvidiaKey, setNvidiaKey] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [linkedinProfile, setLinkedinProfile] = useState("");
  const [linkedinLoading, setLinkedinLoading] = useState(false);
  const [linkedinSuccess, setLinkedinSuccess] = useState(false);
  const [linkedinError, setLinkedinError] = useState("");

  useEffect(() => {
    setOpencodeZenKey(localStorage.getItem("opencode_zen_key") || "");
    setNvidiaKey(localStorage.getItem("nvidia_key") || "");
    fetchLinkedinProfile();
  }, []);

  const fetchLinkedinProfile = async () => {
    try {
      const response = await fetch("/api/linkedin");
      if (response.ok) {
        const data = await response.json();
        if (data.linkedinProfile) {
          setLinkedinProfile(data.linkedinProfile);
        }
      }
    } catch (error) {
      console.error("Failed to fetch LinkedIn info:", error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type === "application/pdf" || file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
        setResumeFile(file);
        setUploadError("");
      } else {
        setUploadError("Please upload a PDF or DOCX file");
      }
    }
  };

  const handleUpload = async () => {
    if (!resumeFile) return;

    setIsUploading(true);
    setUploadError("");
    setUploadSuccess(false);

    try {
      const formData = new FormData();
      formData.append("file", resumeFile);
      if (resumeData) formData.append("data", resumeData);

      const response = await fetch("/api/resume", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        setUploadSuccess(true);
        setResumeFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
      } else {
        const data = await response.json();
        setUploadError(data.error || "Upload failed");
      }
    } catch (error) {
      setUploadError("Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveAPIKeys = () => {
    localStorage.setItem("opencode_zen_key", opencodeZenKey);
    localStorage.setItem("nvidia_key", nvidiaKey);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleSaveLinkedin = async () => {
    setLinkedinLoading(true);
    setLinkedinError("");
    setLinkedinSuccess(false);

    try {
      const response = await fetch("/api/linkedin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ linkedinProfile }),
      });

      if (response.ok) {
        setLinkedinSuccess(true);
        setTimeout(() => setLinkedinSuccess(false), 3000);
      } else {
        const data = await response.json();
        setLinkedinError(data.error || "Failed to save LinkedIn profile");
      }
    } catch (error) {
      setLinkedinError("Failed to save LinkedIn profile");
    } finally {
      setLinkedinLoading(false);
    }
  };

  const handleImportLinkedInJob = async () => {
    const jobUrl = prompt("Paste the LinkedIn job URL:");
    if (!jobUrl) return;

    if (!jobUrl.includes("linkedin.com/jobs")) {
      alert("Please enter a valid LinkedIn job URL");
      return;
    }

    try {
      const response = await fetch(`/api/linkedin/import?url=${encodeURIComponent(jobUrl)}`);
      if (response.ok) {
        const data = await response.json();
        alert(`Job imported!\n\nCompany: ${data.company}\nPosition: ${data.position}\n\nNote: You can now edit this in Applications.`);
      } else {
        alert("Failed to import job. Please check the URL and try again.");
      }
    } catch (error) {
      alert("Failed to import job. Please try again.");
    }
  };

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-text-secondary">Manage your profile, resume, and integrations</p>
      </div>

      <div className="space-y-8">
        <div className="glass-card p-6">
          <h2 className="text-xl font-semibold mb-6">Profile</h2>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-accent-gradient flex items-center justify-center text-white text-2xl font-bold">
              {session?.user?.name?.[0]?.toUpperCase() || session?.user?.email?.[0]?.toUpperCase() || "U"}
            </div>
            <div>
              <div className="font-semibold text-lg">{session?.user?.name || session?.user?.email?.split("@")[0] || "User"}</div>
              <div className="text-text-secondary">{session?.user?.email}</div>
            </div>
          </div>
          <ProfileEditForm userName={session?.user?.name} userEmail={session?.user?.email} />
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold">LinkedIn Integration</h2>
              <p className="text-text-secondary text-sm mt-1">
                Connect your LinkedIn profile and import jobs
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-[#0A66C2]/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-[#0A66C2]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Your LinkedIn Profile URL</label>
              <div className="flex gap-3">
                <input
                  type="url"
                  value={linkedinProfile}
                  onChange={(e) => setLinkedinProfile(e.target.value)}
                  className="input-field flex-1"
                  placeholder="https://www.linkedin.com/in/your-profile"
                />
                <button
                  onClick={handleSaveLinkedin}
                  disabled={linkedinLoading}
                  className="btn-primary whitespace-nowrap"
                >
                  {linkedinLoading ? "Saving..." : "Save"}
                </button>
              </div>
              <p className="text-xs text-text-tertiary mt-2">
                Enter your LinkedIn profile URL to easily share it with recruiters
              </p>
            </div>

            {linkedinSuccess && (
              <div className="p-4 rounded-xl bg-success/10 border border-success/20 text-success text-sm flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                LinkedIn profile saved!
              </div>
            )}

            {linkedinError && (
              <div className="p-4 rounded-xl bg-error/10 border border-error/20 text-error text-sm">
                {linkedinError}
              </div>
            )}

            <div className="pt-4 border-t border-glass-border">
              <button
                onClick={handleImportLinkedInJob}
                className="btn-secondary w-full flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                Import Job from LinkedIn
              </button>
              <p className="text-xs text-text-tertiary mt-2 text-center">
                Paste a LinkedIn job URL to quickly add a job application
              </p>
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <h2 className="text-xl font-semibold mb-6">Resume</h2>
          <p className="text-text-secondary mb-6">
            Upload your resume to enable AI-powered tailoring and cover letter generation.
          </p>

          <div
            className="border-2 border-dashed border-glass-border rounded-xl p-8 text-center mb-6 hover:border-accent-primary/50 transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="w-12 h-12 rounded-xl bg-accent-primary/20 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-accent-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            {resumeFile ? (
              <div>
                <div className="font-medium">{resumeFile.name}</div>
                <div className="text-sm text-text-secondary">{(resumeFile.size / 1024 / 1024).toFixed(2)} MB</div>
              </div>
            ) : (
              <div>
                <div className="font-medium">Drop your resume here or click to browse</div>
                <div className="text-sm text-text-secondary">PDF or DOCX, max 10MB</div>
              </div>
            )}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Resume Content (optional)</label>
            <p className="text-xs text-text-tertiary mb-2">
              Paste your resume text for better AI parsing accuracy
            </p>
            <textarea
              value={resumeData}
              onChange={(e) => setResumeData(e.target.value)}
              className="input-field min-h-[150px] resize-none"
              placeholder="Paste the text content of your resume here for better AI analysis..."
            />
          </div>

          {uploadError && (
            <div className="mb-4 p-4 rounded-xl bg-error/10 border border-error/20 text-error text-sm">
              {uploadError}
            </div>
          )}

          {uploadSuccess && (
            <div className="mb-4 p-4 rounded-xl bg-success/10 border border-success/20 text-success text-sm flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Resume uploaded successfully!
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={!resumeFile || isUploading}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {isUploading ? (
              <>
                <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Uploading...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Upload Resume
              </>
            )}
          </button>
        </div>

        <div className="glass-card p-6">
          <h2 className="text-xl font-semibold mb-6">AI Integration</h2>
          <p className="text-text-secondary mb-6">
            Configure your AI API keys for resume tailoring and cover letter generation.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">NVIDIA API Key</label>
              <p className="text-xs text-text-tertiary mb-2">
                Get your free API key from{" "}
                <a
                  href="https://console.nvidia.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent-primary hover:underline"
                >
                  NVIDIA GPU Cloud
                </a>{" "}
                for Llama 3.1 NIM access
              </p>
              <input
                type="password"
                value={nvidiaKey}
                onChange={(e) => setNvidiaKey(e.target.value)}
                className="input-field"
                placeholder="nvapi-..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Opencode Zen API Key</label>
              <p className="text-xs text-text-tertiary mb-2">
                Get your API key from Opencode Zen for GPT-powered features
              </p>
              <input
                type="password"
                value={opencodeZenKey}
                onChange={(e) => setOpencodeZenKey(e.target.value)}
                className="input-field"
                placeholder="sk-..."
              />
            </div>

            {saveSuccess && (
              <div className="p-4 rounded-xl bg-success/10 border border-success/20 text-success text-sm flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                API keys saved successfully!
              </div>
            )}

            <button onClick={handleSaveAPIKeys} className="btn-primary w-full">
              Save API Keys
            </button>
          </div>
        </div>

        <div className="glass-card p-6">
          <h2 className="text-xl font-semibold mb-4">About JobFlow</h2>
          <div className="text-text-secondary space-y-2 text-sm">
            <p>
              <strong>Version:</strong> 1.0.0
            </p>
            <p>
              JobFlow is a premium job application tracking platform with AI-powered tools to help you land your dream role.
            </p>
            <p className="pt-4 text-text-tertiary">
              Built with Next.js, Prisma, and Tailwind CSS. AI powered by NVIDIA NIMs and Opencode Zen.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileEditForm({ userName }: { userName?: string | null }) {
  const [name, setName] = useState(userName || "");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleSave = async () => {
    if (!name.trim()) {
      setError("Name cannot be empty");
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });

      if (response.ok) {
        setSuccess(true);
        setIsEditing(false);
        setTimeout(() => setSuccess(false), 3000);
        window.location.reload();
      } else {
        const data = await response.json();
        setError(data.error || "Failed to update profile");
      }
    } catch {
      setError("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="border-t border-glass-border pt-6 mt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium">Display Name</h3>
        {!isEditing && (
          <button onClick={() => setIsEditing(true)} className="text-sm text-accent-primary hover:underline">
            Edit
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-3">
          <input
            ref={inputRef}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input-field"
            placeholder="Enter your name"
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
          />
          {error && <p className="text-error text-sm">{error}</p>}
          <div className="flex gap-2">
            <button onClick={handleSave} disabled={isSaving} className="btn-primary text-sm">
              {isSaving ? "Saving..." : "Save"}
            </button>
            <button onClick={() => { setName(userName || ""); setIsEditing(false); }} className="btn-secondary text-sm">
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <p className="text-text-secondary">{name || "No name set"}</p>
      )}

      {success && <p className="mt-3 text-success text-sm">Profile updated!</p>}
    </div>
  );
}