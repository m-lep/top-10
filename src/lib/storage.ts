export interface Result {
  found: number;
  hints: number;
  gaveUp: boolean;
  at: number;
}

const KEY = "top10:v1:results";

export function loadResults(): Record<string, Result> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Record<string, Result>) : {};
  } catch {
    return {};
  }
}

export function saveResult(id: string, result: Result) {
  try {
    const all = loadResults();
    all[id] = result;
    window.localStorage.setItem(KEY, JSON.stringify(all));
  } catch {
    /* storage unavailable */
  }
}

export function clearResults() {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
