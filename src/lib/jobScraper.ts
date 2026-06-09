// Shared job-posting scraper. Turns a pasted URL (LinkedIn job links, including
// tracking/redirect/`/comm/` variants, or any generic job URL) into clean text
// the AI can actually analyze. When the input is already plain text, it is
// returned unchanged.

// Extract a LinkedIn numeric job id from any of LinkedIn's URL shapes:
//   /jobs/view/4424068066
//   /jobs/view/some-title-4424068066
//   /comm/jobs/view/4424068066?...           (email/tracking redirect)
//   ?currentJobId=4424068066 / &refId=...
//   heavily url-encoded redirect links that still contain the id
export function extractLinkedInJobId(url: string): string | null {
  const decoded = (() => {
    try {
      return decodeURIComponent(url);
    } catch {
      return url;
    }
  })();
  const candidates = [url, decoded];
  const patterns = [
    /currentJobId=(\d{6,})/i,
    /\/jobs\/view\/(?:[^/?]*-)?(\d{6,})/i,
    /jobPosting(?:\/|%2F)(\d{6,})/i,
    /[?&]jobId=(\d{6,})/i,
  ];
  for (const c of candidates) {
    for (const re of patterns) {
      const m = c.match(re);
      if (m) return m[1];
    }
  }
  // Last resort: a long standalone number that looks like a LinkedIn job id.
  const loose = decoded.match(/(?<!\d)(\d{10})(?!\d)/);
  return loose ? loose[1] : null;
}

export function isUrl(text: string): boolean {
  const t = text.trim();
  if (/\s/.test(t)) return false; // multi-word → it's a pasted description, not a URL
  return /^https?:\/\//i.test(t);
}

// Fetch readable text for a URL through Jina's reader, which renders the page
// and returns clean markdown — this is what lets us read LinkedIn job pages
// without an authenticated session.
async function fetchReadableText(targetUrl: string): Promise<string> {
  const res = await fetch(`https://r.jina.ai/${targetUrl}`, {
    headers: { Accept: "text/plain", "X-No-Cache": "true" },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`Reader fetch failed (${res.status})`);
  return res.text();
}

// Pull the job-description body out of the readable markdown, dropping the
// LinkedIn chrome (nav, "people also viewed", footer) so the model focuses on
// the posting itself.
function extractDescription(text: string): string {
  const descMatch = text.match(
    /(?:About the (?:job|role)|Job description|Description|Responsibilities|What you.ll do|Qualifications)[:\s]*\n([\s\S]{200,})/i
  );
  let body = descMatch ? descMatch[1] : text;
  // Trim trailing LinkedIn boilerplate sections.
  body = body.split(/\n(?:People also viewed|Similar jobs|Set alert|Sign in to|Referrals increase)/i)[0];
  return body.slice(0, 8000).trim();
}

export interface ResolvedJob {
  text: string;
  source: "text" | "linkedin" | "url";
  jobId?: string;
  resolvedUrl?: string;
}

// Main entry: given whatever the user pasted, return analyzable job text.
export async function resolveJobInput(input: string): Promise<ResolvedJob> {
  const raw = (input || "").trim();
  if (!raw) throw new Error("No job description or URL provided");
  if (!isUrl(raw)) return { text: raw, source: "text" };

  const isLinkedIn = /linkedin\.com/i.test(raw);
  if (isLinkedIn) {
    const jobId = extractLinkedInJobId(raw);
    // Normalize to the clean guest job view so tracking/redirect params don't
    // confuse the reader.
    const resolvedUrl = jobId
      ? `https://www.linkedin.com/jobs/view/${jobId}`
      : raw;
    try {
      const text = await fetchReadableText(resolvedUrl);
      const description = extractDescription(text);
      if (description && description.length > 150) {
        return { text: description, source: "linkedin", jobId: jobId || undefined, resolvedUrl };
      }
    } catch {
      // fall through to a clear error below
    }
    throw new Error(
      jobId
        ? `Could not read the LinkedIn job posting (id ${jobId}). It may require sign-in or be expired. Open the job on LinkedIn, copy the description text, and paste that instead.`
        : "Could not extract a job id from that LinkedIn link. Paste the job description text instead."
    );
  }

  // Generic (non-LinkedIn) job URL.
  try {
    const text = await fetchReadableText(raw);
    const description = extractDescription(text);
    if (description && description.length > 150) {
      return { text: description, source: "url", resolvedUrl: raw };
    }
  } catch {
    // fall through
  }
  throw new Error("Could not read that job URL. Paste the job description text instead.");
}
