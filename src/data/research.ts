import type { TopList } from "./types";
import dataCulture from "./research/data-culture.json";
import dataEconomie from "./research/data-economie.json";
import dataFrCinema from "./research/data-fr-cinema.json";
import dataFrMusique from "./research/data-fr-musique.json";
import dataFrSociete from "./research/data-fr-societe.json";
import dataFrSport from "./research/data-fr-sport.json";
import dataMonde from "./research/data-monde.json";
import dataSportFranceTech from "./research/data-sport-france-tech.json";

// Généré par scripts/import-research.mjs — ne pas éditer à la main.
export const RESEARCH_LISTS: TopList[] = [
  ...(dataCulture as TopList[]),
  ...(dataEconomie as TopList[]),
  ...(dataFrCinema as TopList[]),
  ...(dataFrMusique as TopList[]),
  ...(dataFrSociete as TopList[]),
  ...(dataFrSport as TopList[]),
  ...(dataMonde as TopList[]),
  ...(dataSportFranceTech as TopList[]),
];
