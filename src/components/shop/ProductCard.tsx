import Image from "next/image";
import type { Product } from "@/types/products";

const formatPrice = (price: number, currency: Product["currency"]) =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(price);

const availabilityStyles: Record<Product["availability"], string> = {
  "En stock":
    "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200",
  Rupture:
    "bg-rose-50 text-rose-700 dark:bg-rose-900/40 dark:text-rose-200",
  Précommande:
    "bg-amber-50 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200",
};

type ProductCardProps = {
  product: Product;
  onAffiliateClick: (productId: string) => void;
};

export default function ProductCard({
  product,
  onAffiliateClick,
}: ProductCardProps) {
  const tags = product.tags ?? [];
  const displayedTags = tags.slice(0, 3);
  const extraTags = tags.length - displayedTags.length;

  return (
    <article className="card flex h-full flex-col overflow-hidden">
      <div className="relative h-44 w-full bg-slate-50 dark:bg-slate-900">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-contain p-6"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-slate-400">
            Image indisponible
          </div>
        )}
      </div>
      <div className="card-body flex flex-1 flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200">
            {product.category}
          </span>
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              availabilityStyles[product.availability]
            }`}
          >
            {product.availability}
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <h3 className="text-base font-semibold text-slate-900">
            {product.name}
          </h3>
          {product.brand ? (
            <p className="text-sm text-slate-500">{product.brand}</p>
          ) : null}
          {product.shortDescription ? (
            <p className="text-sm text-slate-600">{product.shortDescription}</p>
          ) : null}
        </div>
        <div className="flex items-center justify-between text-sm text-slate-600">
          <span className="text-lg font-semibold text-slate-900">
            {formatPrice(product.price, product.currency)}
          </span>
          <span>
            {product.rating !== undefined
              ? `${product.rating.toFixed(1)}/5`
              : "Sans note"}
          </span>
        </div>
        {displayedTags.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {displayedTags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-200"
              >
                {tag}
              </span>
            ))}
            {extraTags > 0 ? (
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-200">
                +{extraTags}
              </span>
            ) : null}
          </div>
        ) : null}
        <div className="mt-auto flex flex-col gap-2">
          {product.affiliateUrl ? (
            <a
              href={product.affiliateUrl}
              target="_blank"
              rel="noreferrer"
              className="btn-primary w-full"
              onClick={() => onAffiliateClick(product.id)}
            >
              Voir l’offre
            </a>
          ) : (
            <button
              type="button"
              className="btn-primary w-full cursor-not-allowed opacity-60"
              disabled
              aria-disabled="true"
            >
              Indisponible
            </button>
          )}
          {product.specs && Object.keys(product.specs).length > 0 ? (
            <details className="rounded-2xl border border-slate-100 bg-slate-50 p-3 text-sm dark:border-slate-800 dark:bg-slate-900">
              <summary className="cursor-pointer font-semibold text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 dark:text-slate-200">
                Détails
              </summary>
              <div className="mt-3 grid gap-2 text-sm text-slate-600 dark:text-slate-300">
                {Object.entries(product.specs).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between gap-3"
                  >
                    <span className="capitalize text-slate-500 dark:text-slate-400">
                      {key.replace(/([A-Z])/g, " $1")}
                    </span>
                    <span className="font-medium text-slate-700 dark:text-slate-200">
                      {String(value)}
                    </span>
                  </div>
                ))}
              </div>
            </details>
          ) : (
            <span className="text-xs text-slate-400">
              Aucun détail technique disponible.
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
