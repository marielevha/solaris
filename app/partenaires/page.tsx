import { loadPartners } from "@/lib/loadPartners";
import PartnersClient from "@/components/partners/PartnersClient";

export default function PartenairesPage() {
  const partners = loadPartners();

  return (
    <div className="bg-slate-50">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-8 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">
            Réseau
          </p>
          <h1 className="text-3xl font-semibold text-slate-900 sm:text-4xl">
            Partenaires
          </h1>
          <p className="max-w-2xl text-sm text-slate-600">
            Retrouvez les prestataires et fournisseurs présentés sur la plateforme.
          </p>
        </div>
      </section>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-12 sm:px-6 lg:px-8">
        <PartnersClient initialPartners={partners} />
      </div>
    </div>
  );
}
