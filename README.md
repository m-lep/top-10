# Top 10

Jeu de devinettes à faire entre amis : les chiffres d'un classement sont affichés, il faut retrouver les dix noms.

- Next.js 16 (App Router, pages statiques), Tailwind v4, aucune base de données.
- Les classements vivent dans `src/data/` : `base.ts` (rédigés à la main) et `research/*.json` (compilés avec sources).
- Chaque liste indique sa source, l'année des données et d'éventuelles réserves.

```bash
npm install
npm run dev -- -p 3032
```

Pour réimporter des classements compilés : `node scripts/import-research.mjs <dossier>`.
