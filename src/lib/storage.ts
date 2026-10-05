export interface Result {
  found: number;
  hints: number;
  gaveUp: boolean;
  at: number;
}

import { useSyncExternalStore } from "react";

const KEY = "top10:v1:results";
const EVENT = "top10:results";
const EMPTY: Record<string, Result> = {};
let cache: { raw: string | null; value: Record<string, Result> } | null = null;

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
    const all = { ...loadResults(), [id]: result };
    window.localStorage.setItem(KEY, JSON.stringify(all));
    window.dispatchEvent(new Event(EVENT));
  } catch {
    /* storage unavailable */
  }
}

function getSnapshot(): Record<string, Result> {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(KEY);
  } catch {
    return EMPTY;
  }
  if (!cache || cache.raw !== raw) {
    let value = EMPTY;
    try {
      value = raw ? (JSON.parse(raw) as Record<string, Result>) : EMPTY;
    } catch {
      value = EMPTY;
    }
    cache = { raw, value };
  }
  return cache.value;
}

function subscribe(cb: () => void) {
  window.addEventListener("storage", cb);
  window.addEventListener(EVENT, cb);
  return () => {
    window.removeEventListener("storage", cb);
    window.removeEventListener(EVENT, cb);
  };
}

/** Résultats enregistrés, {} côté serveur et au premier rendu. */
export function useResults(): Record<string, Result> {
  return useSyncExternalStore(subscribe, getSnapshot, () => EMPTY);
}

export function clearResults() {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
