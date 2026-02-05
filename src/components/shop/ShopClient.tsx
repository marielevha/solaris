"use client";

import { useCallback, useMemo, useState } from "react";
import type { Product } from "@/types/products";
import ProductCard from "@/components/shop/ProductCard";
import ShopFilters, {
  type ShopFiltersState,
} from "@/components/shop/ShopFilters";

const initialFilters: ShopFiltersState = {
  search: "",
  category: "",
  availability: "",
  minPrice: "",
  maxPrice: "",
  sort: "relevance",
};

type ShopClientProps = {
  initialProducts: Product[];
};

export default function ShopClient({ initialProducts }: ShopClientProps) {
  const [filters, setFilters] = useState<ShopFiltersState>(initialFilters);

  const productsWithIndex = useMemo(
    () =>
      initialProducts.map((product, index) => ({
        ...product,
        __index: index,
      })),
    [initialProducts],
  );

  const filteredProducts = useMemo(() => {
    const search = filters.search.trim().toLowerCase();
    const minPrice = filters.minPrice ? Number(filters.minPrice) : undefined;
    const maxPrice = filters.maxPrice ? Number(filters.maxPrice) : undefined;

    return productsWithIndex.filter((product) => {
      if (filters.category && product.category !== filters.category) {
        return false;
      }
      if (filters.availability && product.availability !== filters.availability) {
        return false;
      }
      if (minPrice !== undefined && product.price < minPrice) {
        return false;
      }
      if (maxPrice !== undefined && product.price > maxPrice) {
        return false;
      }
      if (search) {
        const haystack = [
          product.name,
          product.brand,
          product.category,
          ...(product.tags ?? []),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return haystack.includes(search);
      }
      return true;
    });
  }, [filters, productsWithIndex]);

  const sortedProducts = useMemo(() => {
    const products = [...filteredProducts];
    switch (filters.sort) {
      case "price-asc":
        return products.sort((a, b) => a.price - b.price);
      case "price-desc":
        return products.sort((a, b) => b.price - a.price);
      case "rating-desc":
        return products.sort(
          (a, b) => (b.rating ?? 0) - (a.rating ?? 0),
        );
      default:
        return products.sort((a, b) => a.__index - b.__index);
    }
  }, [filteredProducts, filters.sort]);

  const handleReset = useCallback(() => {
    setFilters(initialFilters);
  }, []);

  const handleAffiliateClick = useCallback((productId: string) => {
    if (typeof window === "undefined") return;
    try {
      const storedClicks = window.localStorage.getItem("shop_clicks");
      const parsed = storedClicks ? JSON.parse(storedClicks) : {};
      const nextClicks =
        parsed && typeof parsed === "object" ? { ...parsed } : {};
      nextClicks[productId] = (nextClicks[productId] ?? 0) + 1;
      window.localStorage.setItem("shop_clicks", JSON.stringify(nextClicks));
    } catch {
      // Ignore tracking issues.
    }
  }, []);

  return (
    <div className="flex flex-col gap-8">
      <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-5 py-4 text-sm text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-100">
        Les prix sont indicatifs. Les liens peuvent être affiliés.
      </div>

      <ShopFilters
        state={filters}
        onChange={setFilters}
        onReset={handleReset}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-500">
          {sortedProducts.length} produit{sortedProducts.length > 1 ? "s" : ""}
        </p>
      </div>

      {sortedProducts.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-8 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900">
          Aucun produit ne correspond aux filtres sélectionnés.
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {sortedProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAffiliateClick={handleAffiliateClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}
