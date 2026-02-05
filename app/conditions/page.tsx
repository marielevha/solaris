import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Conditions générales | Solaris Congo",
};

export default function ConditionsPage() {
  return (
    <div className="bg-slate-50">
      <div className="mx-auto w-full max-w-4xl px-6 py-12">
        <div className="flex flex-col gap-6">
          <header className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">
              Conditions générales
            </p>
            <h1 className="text-3xl font-semibold text-slate-900">
              Conditions générales d’utilisation
            </h1>
            <p className="text-sm text-slate-600">
              Ces conditions définissent les règles d’utilisation du service
              Solaris Congo.
            </p>
          </header>

          <section className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Objet</h2>
            <p className="text-sm text-slate-600">
              Solaris Congo propose des outils d’aide au dimensionnement solaire
              résidentiel. Les résultats fournis sont indicatifs et doivent être
              validés par un professionnel.
            </p>
          </section>

          <section className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">
              Accès au service
            </h2>
            <p className="text-sm text-slate-600">
              Le service est accessible en ligne. Nous nous efforçons d’assurer
              sa disponibilité, sans garantie d’absence d’interruptions ou
              d’erreurs.
            </p>
          </section>

          <section className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">
              Responsabilités et limites
            </h2>
            <ul className="list-disc space-y-2 pl-5 text-sm text-slate-600">
              <li>
                Les simulations sont fournies à titre informatif et ne remplacent
                pas une étude technique complète.
              </li>
              <li>
                L’utilisateur reste responsable des décisions prises à partir
                des résultats.
              </li>
              <li>
                Solaris Congo ne peut être tenu responsable des dommages directs
                ou indirects liés à l’usage du service.
              </li>
            </ul>
          </section>

          <section className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">
              Propriété intellectuelle
            </h2>
            <p className="text-sm text-slate-600">
              Les contenus, logos, textes et interfaces sont la propriété de
              Solaris Congo ou de ses partenaires. Toute reproduction non
              autorisée est interdite.
            </p>
          </section>

          <section className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">
              Liens externes et affiliation
            </h2>
            <p className="text-sm text-slate-600">
              Des liens vers des sites tiers ou des offres affiliées peuvent être
              proposés (notamment sur la boutique). Solaris Congo n’est pas
              responsable du contenu de ces sites.
            </p>
          </section>

          <section className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">
              Modification des conditions
            </h2>
            <p className="text-sm text-slate-600">
              Nous pouvons mettre à jour ces conditions à tout moment. La
              version applicable est celle publiée en ligne au moment de votre
              visite.
            </p>
          </section>

          <section className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Droit applicable</h2>
            <p className="text-sm text-slate-600">
              Ces conditions sont régies par le droit applicable en République du
              Congo, sauf dispositions légales contraires.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
