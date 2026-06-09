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
// Thrown when the reader is rate-limited or the target blocks us, so callers
// can show a "try again / paste instead" message rather than feeding the model
// an error page.
class ScrapeError extends Error {
  constructor(message: string, public rateLimited = false) {
    super(message);
  }
}

// Detect when the "content" we got back is actually an error / sign-in / rate
// limit page rather than a real job posting. Critical: without this we'd hand
// a "429 Too Many Requests" page to the model, which then "analyzes" the error.
export function looksLikeErrorPage(text: string): boolean {
  const t = text.trim();
  if (t.length < 200) return true; // walls and errors are short
  const head = t.slice(0, 1000).toLowerCase();
  const markers = [
    "http error 429",
    "error 429",
    "too many requests",
    "rate limit",
    "sign in to continue",
    "sign in to view",
    "join linkedin to",
    "authwall",
    "this page doesn't exist",
    "page not found",
    "404 not found",
    "access to this page has been denied",
    "unusual activity",
    "captcha",
  ];
  return markers.some((m) => head.includes(m));
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function fetchReadableText(targetUrl: string): Promise<string> {
  const headers: Record<string, string> = { Accept: "text/plain", "X-No-Cache": "true" };
  // A free Jina API key (https://jina.ai/reader) raises rate limits massively.
  if (process.env.JINA_API_KEY) headers.Authorization = `Bearer ${process.env.JINA_API_KEY}`;

  let lastStatus = 0;
  // Retry transient rate limits with backoff before giving up.
  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await fetch(`https://r.jina.ai/${targetUrl}`, {
      headers,
      signal: AbortSignal.timeout(20000),
    });

    if (res.ok) {
      const text = await res.text();
      if (looksLikeErrorPage(text)) {
        throw new ScrapeError("The job page blocked automated reading (sign-in or rate limit).", true);
      }
      return text;
    }

    lastStatus = res.status;
    if (res.status === 429 && attempt < 2) {
      await sleep(1500 * (attempt + 1)); // 1.5s, then 3s
      continue;
    }
    break;
  }

  throw new ScrapeError(
    lastStatus === 429
      ? "The reader is temporarily rate-limited (HTTP 429)."
      : `Reader fetch failed (${lastStatus}).`,
    lastStatus === 429
  );
}

// Fast path: LinkedIn's public guest endpoint returns the job posting HTML by
// id without authentication — much quicker and far less rate-limited than
// rendering the full page through the reader.
async function fetchLinkedInGuestPosting(jobId: string): Promise<string | null> {
  try {
    const res = await fetch(`https://www.linkedin.com/jobs-guest/jobs/api/jobPosting/${jobId}`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
        Accept: "text/html",
      },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return null;
    const html = await res.text();
    const desc = html.match(/show-more-less-html__markup[^>]*>([\s\S]*?)<\/div>/i);
    if (!desc) return null;
    const title = html.match(/top-card-layout__title[^>]*>([^<]+)/i)?.[1]?.trim();
    const company = html.match(/topcard__org-name-link[^>]*>([^<]+)/i)?.[1]?.trim();
    const text = desc[1]
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/(p|li|ul|ol|div|h\d)>/gi, "\n")
      .replace(/<li[^>]*>/gi, "- ")
      .replace(/<[^>]+>/g, "")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&(?:nbsp|#160);/g, " ")
      .replace(/&#?\w+;/g, " ")
      .replace(/[ \t]+\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
    if (text.length < 150 || looksLikeErrorPage(text)) return null;
    const header = [title, company].filter(Boolean).join(" at ");
    return (header ? `${header}\n\n${text}` : text).slice(0, 8000);
  } catch {
    return null;
  }
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
    // Try the fast guest endpoint first; fall back to the reader if blocked.
    if (jobId) {
      const guest = await fetchLinkedInGuestPosting(jobId);
      if (guest) return { text: guest, source: "linkedin", jobId, resolvedUrl };
    }
    let rateLimited = false;
    try {
      const text = await fetchReadableText(resolvedUrl);
      const description = extractDescription(text);
      if (description && description.length > 150 && !looksLikeErrorPage(description)) {
        return { text: description, source: "linkedin", jobId: jobId || undefined, resolvedUrl };
      }
    } catch (e) {
      if (e instanceof ScrapeError && e.rateLimited) rateLimited = true;
    }
    throw new Error(
      rateLimited
        ? "LinkedIn is rate-limiting automated reads right now (HTTP 429). Wait a minute and try again, or paste the job description text below for an instant, reliable analysis."
        : jobId
        ? `Could not read the LinkedIn job posting (id ${jobId}). It may require sign-in or be expired. Open the job on LinkedIn, copy the description text, and paste that instead.`
        : "Could not extract a job id from that LinkedIn link. Paste the job description text instead."
    );
  }

  // Generic (non-LinkedIn) job URL.
  let rateLimited = false;
  try {
    const text = await fetchReadableText(raw);
    const description = extractDescription(text);
    if (description && description.length > 150 && !looksLikeErrorPage(description)) {
      return { text: description, source: "url", resolvedUrl: raw };
    }
  } catch (e) {
    if (e instanceof ScrapeError && e.rateLimited) rateLimited = true;
  }
  throw new Error(
    rateLimited
      ? "The page is rate-limiting automated reads right now (HTTP 429). Wait a minute and try again, or paste the job description text below."
      : "Could not read that job URL. Paste the job description text instead."
  );
}
