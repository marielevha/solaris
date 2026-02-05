import ShopClient from "@/components/shop/ShopClient";
import { loadProducts } from "@/lib/loadProducts";

export default function ShopPage() {
  const products = loadProducts();

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 pb-16 pt-8 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-3">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-600">
          Boutique solaire
        </p>
        <h1 className="text-3xl font-semibold text-slate-900 sm:text-4xl">
          Shop
        </h1>
        <p className="max-w-2xl text-base text-slate-600">
          Sélection de matériel solaire (liste indicative).
        </p>
      </header>
      <ShopClient initialProducts={products} />
    </div>
  );
}
