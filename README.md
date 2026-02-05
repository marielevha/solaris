# Solaris – Dimensionnement solaire domestique

Application web mono-page pour dimensionner une installation solaire résidentielle : charges, batteries, PV, régulateur et onduleur. Les calculs suivent strictement le cahier des charges et sont isolés dans `src/domain`.

## Installation

```bash
pnpm install
```

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

## Pages utilitaires

- `/politique` : politique de confidentialité.
- `/conditions` : conditions générales d’utilisation.
- `/a-propos` : présentation du projet + formulaire de contact.

## Formulaire de contact

- **Endpoint** : `POST /api/contact`.
- **Stockage** : fichier local `.data/contact-messages.json` (MVP, sans envoi d’email).

## Hypothèses & choix documentés

- **Surge onduleur** : facteur 2× appliqué aux équipements dont le nom contient `frigo`, `réfrig`, `refrig`, `clim`, `climat`, `air` (réfrigérateur + climatisation minimum).
- **Paliers régulateur** : 10, 20, 30, 40, 50, 60, 80, 100, 120, 150, 200 A (palier immédiatement supérieur).
- **Tension auto** : 12 V ≤ 1000 W, 24 V entre 1001 et 2000 W, 48 V au-delà.
- **Impression** : le bouton “Exporter” lance `window.print` et affiche uniquement le résumé + tableau des équipements.
- **Partenaires** : données figées via `src/data/partners.json`, recherche/filtres/tri côté client avec normalisation (pays en uppercase, services nettoyés) dans `loadPartners`.
- **UI partenaires** : cartes responsives avec fallback d’initiales lorsque le logo n’est pas fourni, pagination client configurable.
- **Shop** : page `/shop` avec catalogue statique depuis `src/data/products.json`, images placeholder (`/public/shop/placeholder.svg`) en attendant des visuels produits.

## Shop

- **Page** : `/shop`.
- **Données** : `src/data/products.json`.
- **Disclaimer** : affiché sur la page shop pour signaler prix indicatifs et liens affiliés éventuels.
- **Format JSON attendu** :

```json
[
  {
    "id": "prod_001",
    "name": "Panneau solaire 450W monocristallin",
    "category": "Panneaux",
    "brand": "Generic",
    "price": 149.0,
    "currency": "EUR",
    "availability": "En stock",
    "rating": 4.5,
    "tags": ["Mono", "450W", "Half-cut"],
    "imageUrl": "/shop/panel-450.png",
    "shortDescription": "1 phrase max.",
    "specs": {
      "powerWp": 450,
      "voltageVmp": 41.0,
      "currentImp": 10.9
    },
    "affiliateUrl": "https://example.com"
  }
]
```

## Tests

```bash
pnpm test
```
