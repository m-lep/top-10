import type { TopList } from "./types";
import dataCulture from "./research/data-culture.json";
import dataEconomie from "./research/data-economie.json";
import dataMonde from "./research/data-monde.json";
import dataSportFranceTech from "./research/data-sport-france-tech.json";

// Généré par scripts/import-research.mjs — ne pas éditer à la main.
export const RESEARCH_LISTS: TopList[] = [
  ...(dataCulture as TopList[]),
  ...(dataEconomie as TopList[]),
  ...(dataMonde as TopList[]),
  ...(dataSportFranceTech as TopList[]),
];
