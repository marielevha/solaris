"use client";

import { useEffect, useMemo, useState } from "react";
import type { Partner, PartnerType } from "@/types/partners";
import PartnerCard from "@/components/partners/PartnerCard";

type SortOption = "az" | "type";
type PageSizeOption = 6 | 9 | 12;

const normalizeText = (value: string) => value.toLowerCase().trim();

const matchesSearch = (partner: Partner, query: string) => {
  if (!query) return true;
  const haystack = [
    partner.name,
    partner.city ?? "",
    partner.country,
    partner.type,
    ...partner.services,
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(query);
};

const sortPartners = (partners: Partner[], sort: SortOption) => {
  const sorted = [...partners];
  if (sort === "type") {
    sorted.sort((a, b) => {
      const typeCompare = a.type.localeCompare(b.type);
      if (typeCompare !== 0) return typeCompare;
      return a.name.localeCompare(b.name);
    });
    return sorted;
  }
  sorted.sort((a, b) => a.name.localeCompare(b.name));
  return sorted;
};

export default function PartnersClient({
  initialPartners,
}: {
  initialPartners: Partner[];
}) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<PartnerType | "all">("all");
  const [countryFilter, setCountryFilter] = useState<string | "all">("all");
  const [sort, setSort] = useState<SortOption>("az");
  const [pageSize, setPageSize] = useState<PageSizeOption>(6);
  const [page, setPage] = useState(1);

  const countries = useMemo(() => {
    const unique = Array.from(
      new Set(initialPartners.map((partner) => partner.country)),
    );
    return unique.sort();
  }, [initialPartners]);

  const types = useMemo(() => {
    const unique = Array.from(
      new Set(initialPartners.map((partner) => partner.type)),
    );
    return unique.sort() as PartnerType[];
  }, [initialPartners]);

  const filteredPartners = useMemo(() => {
    const query = normalizeText(search);
    const filtered = initialPartners.filter((partner) => {
      if (!matchesSearch(partner, query)) return false;
      if (typeFilter !== "all" && partner.type !== typeFilter) return false;
      if (countryFilter !== "all" && partner.country !== countryFilter)
        return false;
      return true;
    });
    return sortPartners(filtered, sort);
  }, [countryFilter, initialPartners, search, sort, typeFilter]);

  useEffect(() => {
    setPage(1);
  }, [search, typeFilter, countryFilter, sort, pageSize]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredPartners.length / pageSize),
  );
  const clampedPage = Math.min(page, totalPages);
  const paginatedPartners = filteredPartners.slice(
    (clampedPage - 1) * pageSize,
    clampedPage * pageSize,
  );

  return (
    <section className="space-y-8">
      <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-4">
        <div className="md:col-span-2">
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Recherche
          </label>
          <input
            className="input mt-2"
            type="search"
            placeholder="Nom, ville, service, pays..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            aria-label="Rechercher un partenaire"
          />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Type
          </label>
          <select
            className="input mt-2"
            value={typeFilter}
            onChange={(event) =>
              setTypeFilter(event.target.value as PartnerType | "all")
            }
            aria-label="Filtrer par type"
          >
            <option value="all">Tous</option>
            {types.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Pays
          </label>
          <select
            className="input mt-2"
            value={countryFilter}
            onChange={(event) => setCountryFilter(event.target.value)}
            aria-label="Filtrer par pays"
          >
            <option value="all">Tous</option>
            {countries.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600">
        <span>
          {filteredPartners.length} partenaire
          {filteredPartners.length > 1 ? "s" : ""}
        </span>
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Trier par
            <select
              className="input w-auto"
              value={sort}
              onChange={(event) => setSort(event.target.value as SortOption)}
              aria-label="Trier les partenaires"
            >
              <option value="az">A–Z</option>
              <option value="type">Type</option>
            </select>
          </label>
          <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Par page
            <select
              className="input w-auto"
              value={pageSize}
              onChange={(event) =>
                setPageSize(Number(event.target.value) as PageSizeOption)
              }
              aria-label="Choisir le nombre de partenaires par page"
            >
              <option value={6}>6</option>
              <option value={9}>9</option>
              <option value={12}>12</option>
            </select>
          </label>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {paginatedPartners.map((partner) => (
          <PartnerCard key={partner.id} partner={partner} />
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600">
        <span>
          Page {clampedPage} sur {totalPages}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="btn-secondary text-xs"
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            disabled={clampedPage === 1}
            aria-label="Aller à la page précédente"
          >
            Précédent
          </button>
          <button
            type="button"
            className="btn-secondary text-xs"
            onClick={() =>
              setPage((current) => Math.min(totalPages, current + 1))
            }
            disabled={clampedPage === totalPages}
            aria-label="Aller à la page suivante"
          >
            Suivant
          </button>
        </div>
      </div>
    </section>
  );
}
