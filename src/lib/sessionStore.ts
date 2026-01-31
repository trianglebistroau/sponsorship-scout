// src/lib/sessionStore.ts
export function ssGet<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = sessionStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function ssSet<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(key, JSON.stringify(value));
}

/**
 * Optional: notify other components in the SAME tab that data changed.
 * (sessionStorage doesn't give you a reliable cross-component event by itself.)
 */
const EVENT_PREFIX = "ss:";
export function ssEmit(key: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(`${EVENT_PREFIX}${key}`));
}

export function ssSubscribe(key: string, cb: () => void) {
  if (typeof window === "undefined") return () => {};
  const handler = () => cb();
  window.addEventListener(`${EVENT_PREFIX}${key}`, handler as EventListener);
  return () => window.removeEventListener(`${EVENT_PREFIX}${key}`, handler as EventListener);
}
