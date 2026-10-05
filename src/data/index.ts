import type { TopList, Category } from "./types";
import { BASE_LISTS } from "./base";
import { RESEARCH_LISTS } from "./research";

function validate(list: TopList) {
  if (list.items.length !== 10) {
    throw new Error(`Liste ${list.id} : ${list.items.length} éléments au lieu de 10`);
  }
  const names = new Set(list.items.map((i) => i.name.toLowerCase()));
  if (names.size !== 10) throw new Error(`Liste ${list.id} : doublon de nom`);
}

const all: TopList[] = [...BASE_LISTS, ...RESEARCH_LISTS];
const seen = new Set<string>();
for (const l of all) {
  if (seen.has(l.id)) throw new Error(`Identifiant de liste en double : ${l.id}`);
  seen.add(l.id);
  validate(l);
}

export const LISTS: TopList[] = all;

const byId = new Map(LISTS.map((l) => [l.id, l]));
export function getList(id: string): TopList | undefined {
  return byId.get(id);
}

export function listsByCategory(cat: Category): TopList[] {
  return LISTS.filter((l) => l.category === cat);
}

/** Lightweight summary for the home page. */
export interface ListSummary {
  id: string;
  title: string;
  measure: string;
  category: Category;
  year: string;
  unit: string;
  source: string;
}
export function summaries(): ListSummary[] {
  return LISTS.map((l) => ({
    id: l.id,
    title: l.title,
    measure: l.measure,
    category: l.category,
    year: l.year,
    unit: l.unit,
    source: l.source.name,
  }));
}
