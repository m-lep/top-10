export type Category =
  | "monde"
  | "france"
  | "economie"
  | "culture"
  | "sport"
  | "tech"
  | "sciences";

export const CATEGORIES: { key: Category; label: string }[] = [
  { key: "monde", label: "Monde" },
  { key: "france", label: "France" },
  { key: "economie", label: "Économie" },
  { key: "culture", label: "Culture" },
  { key: "sport", label: "Sport" },
  { key: "tech", label: "Tech" },
  { key: "sciences", label: "Sciences" },
];

export const CATEGORY_LABEL: Record<Category, string> = Object.fromEntries(
  CATEGORIES.map((c) => [c.key, c.label]),
) as Record<Category, string>;

export interface TopItem {
  rank: number;
  name: string;
  value: number;
  aliases?: string[];
  note?: string;
  /** Autres noms à égalité (même valeur) non listés : acceptés comme bonnes réponses. */
  ties?: string[];
}

export interface TopList {
  id: string;
  title: string;
  measure: string;
  category: Category;
  unit: string;
  precision: number;
  year: string;
  source: { name: string; url?: string };
  confidence?: "high" | "medium" | "low";
  notes?: string;
  items: TopItem[];
}
