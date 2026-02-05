"use client";

import type { Availability, ProductCategory } from "@/types/products";

const categories: ProductCategory[] = [
  "Panneaux",
  "Batteries",
  "Onduleurs",
  "Régulateurs",
  "Câbles",
  "Protections",
  "Accessoires",
];

const availabilityOptions: Availability[] = [
  "En stock",
  "Rupture",
  "Précommande",
];

export type ShopFiltersState = {
  search: string;
  category: string;
  availability: string;
  minPrice: string;
  maxPrice: string;
  sort: string;
};

type ShopFiltersProps = {
  state: ShopFiltersState;
  onChange: (next: ShopFiltersState) => void;
  onReset: () => void;
};

export default function ShopFilters({
  state,
  onChange,
  onReset,
}: ShopFiltersProps) {
  return (
    <section className="card">
      <div className="card-header">
        <h2 className="card-title">Filtres & recherche</h2>
        <p className="text-sm text-slate-500">
          Affinez la liste par nom, marque, tags ou disponibilité.
        </p>
      </div>
      <div className="card-body grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
          Recherche
          <input
            type="search"
            placeholder="Rechercher un produit"
            className="input"
            value={state.search}
            onChange={(event) =>
              onChange({ ...state, search: event.target.value })
            }
          />
        </label>
        <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
          Catégorie
          <select
            className="input"
            value={state.category}
            onChange={(event) =>
              onChange({ ...state, category: event.target.value })
            }
          >
            <option value="">Toutes les catégories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
          Disponibilité
          <select
            className="input"
            value={state.availability}
            onChange={(event) =>
              onChange({ ...state, availability: event.target.value })
            }
          >
            <option value="">Toutes</option>
            {availabilityOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
          Prix min (€)
          <input
            type="number"
            min={0}
            placeholder="0"
            className="input"
            value={state.minPrice}
            onChange={(event) =>
              onChange({ ...state, minPrice: event.target.value })
            }
          />
        </label>
        <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
          Prix max (€)
          <input
            type="number"
            min={0}
            placeholder="Aucun"
            className="input"
            value={state.maxPrice}
            onChange={(event) =>
              onChange({ ...state, maxPrice: event.target.value })
            }
          />
        </label>
        <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
          Trier par
          <select
            className="input"
            value={state.sort}
            onChange={(event) => onChange({ ...state, sort: event.target.value })}
          >
            <option value="relevance">Pertinence</option>
            <option value="price-asc">Prix croissant</option>
            <option value="price-desc">Prix décroissant</option>
            <option value="rating-desc">Meilleures notes</option>
          </select>
        </label>
        <div className="flex items-end">
          <button
            type="button"
            onClick={onReset}
            className="btn-secondary w-full"
          >
            Réinitialiser filtres
          </button>
        </div>
      </div>
    </section>
  );
}
