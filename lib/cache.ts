interface CacheEntry<T> {
  data: T;
  storedAt: number;
  expiresAt: number;
}

// Module-level map persists across requests in the same server process
const store = new Map<string, CacheEntry<unknown>>();

export function getCached<T>(key: string): { data: T; storedAt: number } | null {
  const entry = store.get(key) as CacheEntry<T> | undefined;
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return null;
  }
  return { data: entry.data, storedAt: entry.storedAt };
}

export function setCached<T>(key: string, data: T, ttlSeconds: number): void {
  const now = Date.now();
  store.set(key, { data, storedAt: now, expiresAt: now + ttlSeconds * 1000 });
}

/** Return stale entry regardless of expiry (used as fallback on API failure) */
export function getStale<T>(key: string): { data: T; storedAt: number } | null {
  const entry = store.get(key) as CacheEntry<T> | undefined;
  if (!entry) return null;
  return { data: entry.data, storedAt: entry.storedAt };
}
