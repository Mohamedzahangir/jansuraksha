const TTL_MS = 15 * 60 * 1000;
const MAX_ENTRIES = 500;

const store = new Map();

export function getCachedResult(key) {
  const entry = store.get(key);
  if (!entry) return null;

  if (Date.now() - entry.cachedAt > TTL_MS) {
    store.delete(key);
    return null;
  }

  return entry.result;
}

export function setCachedResult(key, result) {
  if (store.has(key)) store.delete(key);

  if (store.size >= MAX_ENTRIES) {
    const oldestKey = store.keys().next().value;
    if (oldestKey) store.delete(oldestKey);
  }

  store.set(key, { result, cachedAt: Date.now() });
  return result;
}

export function cacheStats() {
  const now = Date.now();
  let expired = 0;

  for (const entry of store.values()) {
    if (now - entry.cachedAt > TTL_MS) expired += 1;
  }

  return { size: store.size, expired, maxEntries: MAX_ENTRIES, ttlMs: TTL_MS };
}
