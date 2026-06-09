// Lightweight Gmail integration using plain fetch (no googleapis dependency,
// keeps the serverless bundle small). Reads ONLY LinkedIn job-application
// confirmation emails to auto-create application records.

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GMAIL_API = "https://gmail.googleapis.com/gmail/v1/users/me";

// Read-only Gmail + the email address, so we can show which account is linked.
export const GMAIL_SCOPES = [
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/userinfo.email",
  "openid",
].join(" ");

export function getRedirectUri(): string {
  const base = process.env.NEXTAUTH_URL || "http://localhost:3000";
  return `${base.replace(/\/$/, "")}/api/gmail/callback`;
}

export function buildConsentUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID || "",
    redirect_uri: getRedirectUri(),
    response_type: "code",
    scope: GMAIL_SCOPES,
    access_type: "offline", // needed to receive a refresh token
    prompt: "consent", // force refresh-token issuance on every connect
    state,
  });
  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
}

interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  id_token?: string;
}

// Exchange an authorization code for tokens (during the OAuth callback).
export async function exchangeCodeForTokens(code: string): Promise<TokenResponse> {
  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID || "",
      client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
      redirect_uri: getRedirectUri(),
      grant_type: "authorization_code",
    }),
  });
  if (!res.ok) throw new Error(`Token exchange failed (${res.status}): ${await res.text()}`);
  return res.json();
}

// Exchange a stored refresh token for a fresh access token (during sync).
export async function getAccessToken(refreshToken: string): Promise<string> {
  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: process.env.GOOGLE_CLIENT_ID || "",
      client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
      grant_type: "refresh_token",
    }),
  });
  if (!res.ok) {
    throw new Error(
      `Could not refresh Gmail access. Your connection may have expired — reconnect Gmail in Settings. (${res.status})`
    );
  }
  const data = (await res.json()) as TokenResponse;
  return data.access_token;
}

// Read the connected account's email address from an id_token (no extra call).
export function emailFromIdToken(idToken?: string): string | null {
  if (!idToken) return null;
  try {
    const payload = JSON.parse(Buffer.from(idToken.split(".")[1], "base64").toString("utf8"));
    return payload.email || null;
  } catch {
    return null;
  }
}

interface GmailMessageMeta {
  id: string;
  threadId: string;
}

// List message ids matching LinkedIn application-confirmation emails.
export async function listLinkedInApplicationEmails(accessToken: string, max = 25): Promise<GmailMessageMeta[]> {
  // LinkedIn sends these from jobs-noreply@linkedin.com with subjects like
  // "Your application was sent to {Company}". Restrict to recent mail.
  const query = [
    'from:linkedin.com',
    'subject:("your application was sent" OR "application was sent to")',
    'newer_than:90d',
  ].join(" ");
  const url = `${GMAIL_API}/messages?q=${encodeURIComponent(query)}&maxResults=${max}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
  if (!res.ok) throw new Error(`Gmail search failed (${res.status}): ${await res.text()}`);
  const data = (await res.json()) as { messages?: GmailMessageMeta[] };
  return data.messages || [];
}

export interface ParsedApplication {
  messageId: string;
  company: string;
  position: string;
  appliedAt: Date;
  snippet: string;
}

function decodeBase64Url(data: string): string {
  return Buffer.from(data.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8");
}

// Walk a Gmail payload tree and concatenate any text/plain (fallback text/html) parts.
function extractBodyText(payload: Record<string, unknown> | undefined): string {
  if (!payload) return "";
  const parts: string[] = [];
  const walk = (node: Record<string, unknown>) => {
    const mimeType = node.mimeType as string | undefined;
    const body = node.body as { data?: string } | undefined;
    if (body?.data && (mimeType === "text/plain" || mimeType === "text/html")) {
      let text = decodeBase64Url(body.data);
      if (mimeType === "text/html") text = text.replace(/<[^>]+>/g, " ");
      parts.push(text);
    }
    const children = node.parts as Record<string, unknown>[] | undefined;
    if (children) children.forEach(walk);
  };
  walk(payload);
  return parts.join("\n").replace(/\s+\n/g, "\n");
}

// Fetch one message and parse company/position out of it.
export async function fetchAndParseApplication(
  accessToken: string,
  messageId: string
): Promise<ParsedApplication | null> {
  const res = await fetch(`${GMAIL_API}/messages/${messageId}?format=full`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) return null;
  const msg = (await res.json()) as {
    snippet?: string;
    internalDate?: string;
    payload?: { headers?: { name: string; value: string }[] } & Record<string, unknown>;
  };

  const headers = msg.payload?.headers || [];
  const subject = headers.find((h) => h.name.toLowerCase() === "subject")?.value || "";
  const body = extractBodyText(msg.payload);
  const snippet = msg.snippet || "";
  const appliedAt = msg.internalDate ? new Date(Number(msg.internalDate)) : new Date();

  // Company: subject "Your application was sent to {Company}"
  let company = "";
  const subjMatch = subject.match(/application was sent to\s+(.+?)\s*$/i);
  if (subjMatch) company = subjMatch[1].trim();

  // Position: body usually contains the job title near the company. Try a few
  // shapes; fall back to the first line that looks like a title.
  let position = "";
  const text = `${subject}\n${body}\n${snippet}`;
  const posPatterns = [
    /your application(?: for the)?\s+(.+?)\s+(?:position|role)\b/i,
    /applied to\s+(.+?)\s+at\s+/i,
    /\n([A-Z][A-Za-z0-9 ,/&+().-]{3,60})\n[^\n]*\b(?:at|·)\b/,
  ];
  for (const re of posPatterns) {
    const m = text.match(re);
    if (m) { position = m[1].trim(); break; }
  }

  if (!company && !position) return null;
  return {
    messageId,
    company: company || "Unknown company",
    position: position || "Position (from LinkedIn email)",
    appliedAt,
    snippet: snippet.slice(0, 400),
  };
}
