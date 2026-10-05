import type { TopItem } from "@/data/types";

const ARTICLES = /^(le|la|les|l|the|los|las|el|des|du|de|d|un|une|a|an) /;

export function normalize(input: string): string {
  let s = input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/œ/g, "oe")
    .replace(/æ/g, "ae")
    .replace(/ß/g, "ss")
    .replace(/[’'`´\-–—_/.,:;!?()\[\]"«»&+]/g, " ")
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  s = s.replace(ARTICLES, "");
  // "saint" / "st" equivalence
  s = s.replace(/\bst\b/g, "saint").replace(/\bste\b/g, "sainte");
  return s;
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (Math.abs(a.length - b.length) > 2) return 3;
  const prev = new Array(b.length + 1);
  for (let j = 0; j <= b.length; j++) prev[j] = j;
  for (let i = 1; i <= a.length; i++) {
    let last = i;
    let diag = prev[0];
    prev[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = prev[j];
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      last = Math.min(prev[j] + 1, last + 1, diag + cost);
      prev[j] = last;
      diag = tmp;
    }
  }
  return prev[b.length];
}

function candidates(item: TopItem): string[] {
  const raw = [item.name, ...(item.aliases ?? [])];
  const out = new Set<string>();
  for (const r of raw) {
    const n = normalize(r);
    if (n) out.add(n);
    // Without a trailing parenthetical: "Atlanta (Hartsfield-Jackson)" -> "atlanta"
    const noParen = r.replace(/\s*\([^)]*\)\s*$/, "");
    if (noParen !== r) {
      const n2 = normalize(noParen);
      if (n2) out.add(n2);
    }
  }
  return [...out];
}

function tolerance(len: number): number {
  if (len < 5) return 0;
  if (len < 9) return 1;
  return 2;
}

/** Returns true when `guess` designates `item`. */
export function matches(guess: string, item: TopItem): boolean {
  const g = normalize(guess);
  if (!g) return false;
  for (const c of candidates(item)) {
    if (g === c) return true;
    const tol = Math.min(tolerance(g.length), tolerance(c.length));
    if (tol > 0 && levenshtein(g, c) <= tol) return true;
  }
  return false;
}

export interface Match {
  item: TopItem;
  /** Name to display: the item's own name, or the tied name that was guessed. */
  as: string;
}

function tieMatch(guess: string, item: TopItem, exactOnly: boolean): string | undefined {
  const g = normalize(guess);
  for (const t of item.ties ?? []) {
    const c = normalize(t);
    if (g === c) return t;
    if (!exactOnly) {
      const tol = Math.min(tolerance(g.length), tolerance(c.length));
      if (tol > 0 && levenshtein(g, c) <= tol) return t;
    }
  }
  return undefined;
}

/** Among `items`, find the best (highest-ranked) match for a guess. */
export function findMatch(guess: string, items: TopItem[]): Match | undefined {
  const g = normalize(guess);
  if (!g) return undefined;
  // Exact matches win over fuzzy ones.
  for (const it of items) {
    if (candidates(it).includes(g)) return { item: it, as: it.name };
    const t = tieMatch(guess, it, true);
    if (t) return { item: it, as: t };
  }
  for (const it of items) {
    if (matches(guess, it)) return { item: it, as: it.name };
    const t = tieMatch(guess, it, false);
    if (t) return { item: it, as: t };
  }
  return undefined;
}

/** Word shape with the first letter revealed: "France" -> "F _ _ _ _ _" */
export function hintShape(name: string): string {
  const base = name.replace(/\s*\([^)]*\)\s*$/, "");
  return base
    .split(" ")
    .map((word) =>
      word
        .split("")
        .map((ch, i) => (i === 0 ? ch : /[\p{L}\p{N}]/u.test(ch) ? "_" : ch))
        .join(" "),
    )
    .join("   ");
}
