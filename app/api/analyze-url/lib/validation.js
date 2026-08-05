const MAX_URL_LENGTH = 2048;

export function validateAndSanitizeUrl(raw) {
  if (!raw) return { ok: false, error: 'URL is required' };
  if (typeof raw !== 'string') return { ok: false, error: 'URL must be a string' };

  let candidate = raw.trim();
  if (candidate.length === 0) return { ok: false, error: 'URL is required' };
  if (candidate.length > MAX_URL_LENGTH) {
    return { ok: false, error: `URL is too long (max ${MAX_URL_LENGTH} characters)` };
  }

  if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(candidate)) {
    candidate = `https://${candidate}`;
  }

  let parsed;
  try {
    parsed = new URL(candidate);
  } catch {
    return { ok: false, error: 'Invalid URL format. Please include http:// or https://' };
  }

  if (!/^https?:$/.test(parsed.protocol)) {
    return { ok: false, error: 'Only http:// and https:// URLs are supported' };
  }

  if (!parsed.hostname) {
    return { ok: false, error: 'URL is missing a hostname' };
  }

  return { ok: true, url: parsed.toString() };
}
