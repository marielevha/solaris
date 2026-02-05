# Solaris – Dimensionnement solaire domestique

Application web mono-page pour dimensionner une installation solaire résidentielle : charges, batteries, PV, régulateur et onduleur. Les calculs suivent strictement le cahier des charges et sont isolés dans `src/domain`.

## Installation

```bash
pnpm install
```

## Base de données (SQLite + Prisma)

```bash
cp .env.example .env
pnpm prisma migrate dev
pnpm prisma:seed
```

La base locale est `dev.db`. Vous pouvez modifier les annonces via `prisma/seed.ts` puis relancer le seed.

## Développement

```bash
pnpm dev
```

Ouvrez [http://localhost:3000](http://localhost:3000).

## Build production

```bash
pnpm build
pnpm start
```

## Architecture

- `app/page.tsx` : UI et interactions (aucun calcul métier).
- `src/domain` : fonctions pures de calcul (testées avec Vitest).
- `src/store` : store Zustand avec persistance localStorage.
- `src/domain/ads` : ciblage & sélection d'annonces (pure/testable).
- `app/api/ads` : API pour servir les annonces et tracer impressions/clics.

## Hypothèses & choix documentés

- **Surge onduleur** : facteur 2× appliqué aux équipements dont le nom contient `frigo`, `réfrig`, `refrig`, `clim`, `climat`, `air` (réfrigérateur + climatisation minimum).
- **Paliers régulateur** : 10, 20, 30, 40, 50, 60, 80, 100, 120, 150, 200 A (palier immédiatement supérieur).
- **Tension auto** : 12 V ≤ 1000 W, 24 V entre 1001 et 2000 W, 48 V au-delà.
- **Impression** : le bouton “Exporter” ouvre `/print` pour un rendu propre (synthèse + tableau équipements + annonce print).

## Module partenaires / publicité

- **Placements** : `results`, `header`, `footer`, `print`.
- **Ciblage** : pays, PV kWp, tension système, type batterie (pas d'IA).
- **Tracking** : impression à la visibilité (IntersectionObserver + dédup sessionStorage), clics enregistrés à chaque CTA.
- **Limites MVP** : pas d'interface d'administration, pas d'authentification.

## Tests

```bash
pnpm test
```
