// Browser-side helpers for the lead form: where the visitor came from, the
// payload for the lead service (AnamataHQ/anamata-leads) and the submit call.
// No runtime imports, so the node tests can load this file directly.

export type LeadKind = 'demo' | 'contact';
export type LeadLanguage = 'en' | 'nl';
export type SubmitOutcome = 'success' | 'failure';

export const LEAD_ENDPOINT = '/api/lead';
export const SOURCE_STORAGE_KEY = 'anna-lead-source';
export const TURNSTILE_SCRIPT_URL =
  'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
// Cloudflare's always-pass test site key, for local development only. The
// deploy workflow refuses a build that still contains it.
export const TURNSTILE_TEST_SITE_KEY = '1x00000000000000000000AA';

// The lengths the lead service accepts per source field.
const SOURCE_LIMITS = {
  referrer: 2048,
  utm_source: 200,
  utm_medium: 200,
  utm_campaign: 200,
  utm_term: 200,
  utm_content: 200,
  landing_path: 2048,
} as const;

export type LeadSource = Record<keyof typeof SOURCE_LIMITS, string>;

export type LeadFields = {
  name: string;
  email: string;
  org: string;
  message: string;
};

type LocationLike = { pathname: string; search: string };
type StorageLike = Pick<Storage, 'getItem' | 'setItem'>;

export function readSource(location: LocationLike, referrer: string): LeadSource {
  const params = new URLSearchParams(location.search);
  const utm = (name: keyof LeadSource) => params.get(name) ?? '';
  const source: LeadSource = {
    referrer,
    utm_source: utm('utm_source'),
    utm_medium: utm('utm_medium'),
    utm_campaign: utm('utm_campaign'),
    utm_term: utm('utm_term'),
    utm_content: utm('utm_content'),
    // The path only: other query values (click IDs, tokens) are not ours to send.
    landing_path: location.pathname,
  };
  for (const key of Object.keys(SOURCE_LIMITS) as (keyof LeadSource)[]) {
    source[key] = source[key].slice(0, SOURCE_LIMITS[key]);
  }
  return source;
}

function isSource(value: unknown): value is LeadSource {
  if (typeof value !== 'object' || value === null) return false;
  return Object.keys(SOURCE_LIMITS).every(
    (key) => typeof (value as Record<string, unknown>)[key] === 'string',
  );
}

// The first page of the visit is the one that tells how they found us, so it
// is kept for the session. Storage can be blocked; then the current page counts.
export function rememberFirstSource(
  storage: StorageLike | null,
  location: LocationLike,
  referrer: string,
): LeadSource {
  const current = readSource(location, referrer);
  if (!storage) return current;
  try {
    const stored = storage.getItem(SOURCE_STORAGE_KEY);
    if (stored) {
      const parsed: unknown = JSON.parse(stored);
      if (isSource(parsed)) return parsed;
    }
    storage.setItem(SOURCE_STORAGE_KEY, JSON.stringify(current));
  } catch {
    // Blocked or corrupt storage: fall back to this page.
  }
  return current;
}

export function buildPayload(input: {
  kind: LeadKind;
  lang: LeadLanguage;
  fields: LeadFields;
  source: LeadSource;
  turnstileToken: string;
  honeypot: string;
  elapsedMs: number;
}) {
  return {
    kind: input.kind,
    name: input.fields.name,
    email: input.fields.email,
    org: input.fields.org,
    message: input.fields.message,
    lang: input.lang,
    source: input.source,
    turnstileToken: input.turnstileToken,
    honeypot: input.honeypot,
    elapsedMs: Math.round(input.elapsedMs),
  };
}

// A server that never answers must still end in the mail fallback.
export async function submitLead(
  payload: unknown,
  fetchImpl: typeof fetch = fetch,
  { timeoutMs = 20_000 } = {},
): Promise<SubmitOutcome> {
  try {
    const response = await fetchImpl(LEAD_ENDPOINT, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(timeoutMs),
    });
    return response.status === 200 ? 'success' : 'failure';
  } catch {
    return 'failure';
  }
}

// Turnstile usually hands out a token within a second or two. If it never
// does (blocked by an extension, offline), give up so the visitor sees the
// mail fallback instead of a request the service would drop as spam.
export async function waitForToken(
  getToken: () => string,
  { timeoutMs = 8000, intervalMs = 100 } = {},
): Promise<string | null> {
  const deadline = Date.now() + timeoutMs;
  for (;;) {
    const token = getToken();
    if (token) return token;
    if (Date.now() >= deadline) return null;
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
}

// Numbers each opening of the dialog, so a submission that finishes after the
// dialog was closed (or reopened) can tell its result is no longer wanted.
export function createOpenings() {
  let current = 0;
  let open = false;
  return {
    next() {
      current += 1;
      open = true;
      return current;
    },
    close() {
      open = false;
    },
    isCurrent: (id: number) => open && id === current,
  };
}
