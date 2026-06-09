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
  const [saveError, setSaveError] = useState("");
  const [isSavingKeys, setIsSavingKeys] = useState(false);
  const [hasNvidiaKey, setHasNvidiaKey] = useState(false);
  const [hasOpencodeZenKey, setHasOpencodeZenKey] = useState(false);
  const [apiKeysUpdatedAt, setApiKeysUpdatedAt] = useState<string | null>(null);

  const [linkedinProfile, setLinkedinProfile] = useState("");
  const [linkedinLoading, setLinkedinLoading] = useState(false);
  const [linkedinSuccess, setLinkedinSuccess] = useState(false);
  const [linkedinError, setLinkedinError] = useState("");

  const [gmailConnected, setGmailConnected] = useState(false);
  const [gmailEmail, setGmailEmail] = useState<string | null>(null);
  const [gmailConfigured, setGmailConfigured] = useState(true);
  const [lastGmailSync, setLastGmailSync] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState("");
  const [gmailNotice, setGmailNotice] = useState("");

  useEffect(() => {
    fetchLinkedinProfile();
    fetchApiKeyStatus();
    fetchGmailStatus();

    // Surface the result of the OAuth round-trip (?gmail=connected|error).
    const params = new URLSearchParams(window.location.search);
    const g = params.get("gmail");
    if (g === "connected") setGmailNotice("Gmail connected! Click 'Sync now' to import your LinkedIn applications.");
    else if (g === "error") setGmailNotice("Gmail connection failed. Please try again.");
    else if (g === "norefresh") setGmailNotice("Gmail connected but no refresh token was returned. Remove access at myaccount.google.com and reconnect.");
    if (g) window.history.replaceState({}, "", "/settings");
  }, []);

  const fetchGmailStatus = async () => {
    try {
      const res = await fetch("/api/gmail");
      if (res.ok) {
        const data = await res.json();
        setGmailConnected(data.connected);
        setGmailEmail(data.gmailEmail);
        setLastGmailSync(data.lastGmailSync);
        setGmailConfigured(data.configured);
      }
    } catch {
      console.error("Failed to fetch Gmail status");
    }
  };

  const handleDisconnectGmail = async () => {
    await fetch("/api/gmail", { method: "DELETE" });
    setGmailConnected(false);
    setGmailEmail(null);
    setSyncMessage("");
  };

  const handleSyncLinkedIn = async () => {
    setIsSyncing(true);
    setSyncMessage("");
    try {
      const res = await fetch("/api/linkedin/sync", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setSyncMessage(
          data.imported > 0
            ? `Imported ${data.imported} new application${data.imported === 1 ? "" : "s"} (scanned ${data.scanned} emails).`
            : `No new applications found (scanned ${data.scanned} emails).`
        );
        setLastGmailSync(new Date().toISOString());
      } else {
        setSyncMessage(data.error || "Sync failed.");
      }
    } catch {
      setSyncMessage("Sync failed. Please try again.");
    } finally {
      setIsSyncing(false);
    }
  };

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

  const fetchApiKeyStatus = async () => {
    try {
      const res = await fetch("/api/user/profile");
      if (res.ok) {
        const data = await res.json();
        setHasNvidiaKey(data.hasNvidiaKey);
        setHasOpencodeZenKey(data.hasOpencodeZenKey);
        setApiKeysUpdatedAt(data.apiKeysUpdatedAt || null);
      }
    } catch {
      console.error("Failed to fetch API key status");
    }
  };

  const handleSaveAPIKeys = async () => {
    if (!nvidiaKey && !opencodeZenKey) return;
    setIsSavingKeys(true);
    setSaveError("");
    setSaveSuccess(false);
    try {
      const body: Record<string, string> = {};
      if (nvidiaKey) body.nvidiaApiKey = nvidiaKey;
      if (opencodeZenKey) body.opencodeZenApiKey = opencodeZenKey;
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const data = await res.json();
        setHasNvidiaKey(data.hasNvidiaKey);
        setHasOpencodeZenKey(data.hasOpencodeZenKey);
        setApiKeysUpdatedAt(data.apiKeysUpdatedAt);
        setNvidiaKey("");
        setOpencodeZenKey("");
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        const data = await res.json();
        setSaveError(data.error || "Failed to save keys");
      }
    } catch {
      setSaveError("Failed to save keys. Please try again.");
    } finally {
      setIsSavingKeys(false);
    }
  };

  const handleClearApiKey = async (provider: "nvidia" | "opencode") => {
    setIsSavingKeys(true);
    setSaveError("");
    try {
      const body = provider === "nvidia" ? { clearNvidiaKey: true } : { clearOpencodeZenKey: true };
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const data = await res.json();
        setHasNvidiaKey(data.hasNvidiaKey);
        setHasOpencodeZenKey(data.hasOpencodeZenKey);
        setApiKeysUpdatedAt(data.apiKeysUpdatedAt);
      } else {
        const data = await res.json();
        setSaveError(data.error || "Failed to clear key");
      }
    } catch {
      setSaveError("Failed to clear key.");
    } finally {
      setIsSavingKeys(false);
    }
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
        const descStatus = data.scraped
          ? "Job description scraped and saved."
          : "Job description could not be scraped — paste it manually in AI Studio for best results.";
        alert(`Job imported!\n\nCompany: ${data.company}\nPosition: ${data.position}\n\n${descStatus}`);
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
          <ProfileEditForm userName={session?.user?.name} />
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

        {/* Auto-tracking via Gmail */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-xl font-semibold">Auto-Track Applications</h2>
              <p className="text-text-secondary text-sm mt-1">
                Connect Gmail to automatically import jobs you applied to on LinkedIn
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-[#EA4335]/15 flex items-center justify-center">
              <svg className="w-6 h-6 text-[#EA4335]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-1.909V10.91L12 16.5 3.545 10.91v10.092H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-.9.732-1.636 1.636-1.636h.41L12 10.09l9.954-6.269h.41c.904 0 1.636.732 1.636 1.636z"/>
              </svg>
            </div>
          </div>

          <div className="p-3 mb-5 rounded-xl bg-accent-primary/5 border border-accent-primary/15 text-xs text-text-tertiary">
            Reads only LinkedIn &ldquo;application sent&rdquo; emails — never your other mail, and never touches your LinkedIn account directly.
          </div>

          {gmailNotice && (
            <div className="mb-4 p-4 rounded-xl bg-accent-primary/10 border border-accent-primary/20 text-accent-primary text-sm">
              {gmailNotice}
            </div>
          )}

          {!gmailConfigured ? (
            <div className="p-4 rounded-xl bg-warning/10 border border-warning/20 text-sm text-text-secondary">
              Gmail integration isn&rsquo;t configured yet. Add <code className="text-accent-primary">GOOGLE_CLIENT_ID</code> and{" "}
              <code className="text-accent-primary">GOOGLE_CLIENT_SECRET</code> to enable it.
            </div>
          ) : gmailConnected ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-success/10 border border-success/20">
                <div className="flex items-center gap-2 text-success text-sm min-w-0">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="truncate">Connected{gmailEmail ? ` · ${gmailEmail}` : ""}</span>
                </div>
                <button onClick={handleDisconnectGmail} className="text-xs text-error hover:underline flex-shrink-0 ml-3">
                  Disconnect
                </button>
              </div>

              <button
                onClick={handleSyncLinkedIn}
                disabled={isSyncing}
                className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSyncing ? (
                  <>
                    <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Scanning your inbox...
                  </>
                ) : (
                  "Sync now"
                )}
              </button>

              {lastGmailSync && (
                <p className="text-xs text-text-tertiary text-center">
                  Last synced {new Date(lastGmailSync).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                </p>
              )}

              {syncMessage && (
                <div className="p-3 rounded-xl bg-white/5 border border-glass-border text-sm text-text-secondary">
                  {syncMessage}
                </div>
              )}
            </div>
          ) : (
            <a
              href="/api/gmail/connect"
              className="btn-secondary w-full flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Connect Gmail
            </a>
          )}
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
          <div className="flex items-start justify-between mb-2">
            <h2 className="text-xl font-semibold">AI Integration</h2>
            {apiKeysUpdatedAt && (
              <span className="text-xs text-text-tertiary mt-1">
                Last updated {new Date(apiKeysUpdatedAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
              </span>
            )}
          </div>
          <p className="text-text-secondary mb-6">
            Configure your AI API keys for resume tailoring and cover letter generation. Keys are stored securely on the server.
          </p>

          <div className="space-y-5">
            {/* NVIDIA */}
            <div>
              <label className="block text-sm font-medium mb-1">NVIDIA API Key</label>
              <p className="text-xs text-text-tertiary mb-2">
                Get your free key from{" "}
                <a href="https://console.nvidia.com/" target="_blank" rel="noopener noreferrer" className="text-accent-primary hover:underline">
                  NVIDIA GPU Cloud
                </a>{" "}
                for NIM model access
              </p>
              {hasNvidiaKey ? (
                <div className="flex items-center justify-between p-3 rounded-xl bg-success/10 border border-success/20">
                  <div className="flex items-center gap-2 text-success text-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    API key configured
                  </div>
                  <button
                    onClick={() => handleClearApiKey("nvidia")}
                    disabled={isSavingKeys}
                    className="text-xs text-error hover:underline disabled:opacity-50"
                  >
                    Clear key
                  </button>
                </div>
              ) : (
                <input
                  type="password"
                  value={nvidiaKey}
                  onChange={(e) => setNvidiaKey(e.target.value)}
                  className="input-field"
                  placeholder="nvapi-..."
                />
              )}
            </div>

            {/* Opencode Zen */}
            <div>
              <label className="block text-sm font-medium mb-1">Opencode Zen API Key</label>
              <p className="text-xs text-text-tertiary mb-2">
                Get your API key from Opencode Zen for GPT-powered features
              </p>
              {hasOpencodeZenKey ? (
                <div className="flex items-center justify-between p-3 rounded-xl bg-success/10 border border-success/20">
                  <div className="flex items-center gap-2 text-success text-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    API key configured
                  </div>
                  <button
                    onClick={() => handleClearApiKey("opencode")}
                    disabled={isSavingKeys}
                    className="text-xs text-error hover:underline disabled:opacity-50"
                  >
                    Clear key
                  </button>
                </div>
              ) : (
                <input
                  type="password"
                  value={opencodeZenKey}
                  onChange={(e) => setOpencodeZenKey(e.target.value)}
                  className="input-field"
                  placeholder="sk-..."
                />
              )}
            </div>

            {saveSuccess && (
              <div className="p-4 rounded-xl bg-success/10 border border-success/20 text-success text-sm flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                API keys saved successfully!
              </div>
            )}

            {saveError && (
              <div className="p-4 rounded-xl bg-error/10 border border-error/20 text-error text-sm">
                {saveError}
              </div>
            )}

            {(!hasNvidiaKey || !hasOpencodeZenKey) && (
              <button
                onClick={handleSaveAPIKeys}
                disabled={isSavingKeys || (!nvidiaKey && !opencodeZenKey)}
                className="btn-primary w-full disabled:opacity-50"
              >
                {isSavingKeys ? "Saving..." : "Save API Keys"}
              </button>
            )}
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

function ProfileEditForm({ userName }: { userName?: string | null; userEmail?: string | null }) {
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