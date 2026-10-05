// Importe les classements compilés (JSON) depuis le dossier passé en argument
// vers src/data/research/<fichier>.json et régénère src/data/research.ts.
import { readdirSync, readFileSync, writeFileSync, copyFileSync } from "node:fs";
import { join, basename } from "node:path";

const src = process.argv[2];
if (!src) {
  console.error("usage: node scripts/import-research.mjs <dossier-json>");
  process.exit(1);
}
const dest = new URL("../src/data/research/", import.meta.url).pathname;
const files = readdirSync(src).filter((f) => f.startsWith("data-") && f.endsWith(".json"));
const names = [];
for (const f of files) {
  const lists = JSON.parse(readFileSync(join(src, f), "utf8"));
  if (!Array.isArray(lists)) throw new Error(`${f}: pas un tableau`);
  for (const l of lists) {
    if (!l.id || !l.title || !Array.isArray(l.items)) throw new Error(`${f}: liste invalide ${l.id}`);
    if (l.items.length !== 10) console.warn(`⚠ ${l.id}: ${l.items.length} éléments`);
  }
  copyFileSync(join(src, f), join(dest, f));
  names.push(basename(f, ".json"));
  console.log(`${f}: ${lists.length} listes`);
}
const ident = (n) => n.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
const ts = `import type { TopList } from "./types";
${names.map((n) => `import ${ident(n)} from "./research/${n}.json";`).join("\n")}

// Généré par scripts/import-research.mjs — ne pas éditer à la main.
export const RESEARCH_LISTS: TopList[] = [
${names.map((n) => `  ...(${ident(n)} as TopList[]),`).join("\n")}
];
`;
writeFileSync(new URL("../src/data/research.ts", import.meta.url), ts);
console.log("research.ts régénéré");
