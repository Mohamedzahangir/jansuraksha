const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS = 20;
const MAX_ENTRIES = 10000;

const hits = new Map();

function prune() {
  const now = Date.now();

  for (const key of hits.keys()) {
    if (hits.size <= MAX_ENTRIES) break;
    hits.delete(key);
  }

  for (const [key, record] of hits) {
    if (now - record.windowStart > WINDOW_MS) hits.delete(key);
  }
}

export function checkRateLimit(clientKey) {
  const now = Date.now();
  const record = hits.get(clientKey);

  if (!record || now - record.windowStart > WINDOW_MS) {
    hits.set(clientKey, { windowStart: now, count: 1 });
    if (hits.size > MAX_ENTRIES) prune();
    return { allowed: true, remaining: MAX_REQUESTS - 1, resetInMs: WINDOW_MS };
  }

  record.count += 1;
  const resetInMs = WINDOW_MS - (now - record.windowStart);

  if (record.count > MAX_REQUESTS) {
    return { allowed: false, remaining: 0, resetInMs };
  }

  return { allowed: true, remaining: MAX_REQUESTS - record.count, resetInMs };
}

export function getClientIp(request) {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return request.headers.get('x-real-ip') || 'unknown';
}
