import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Politique de confidentialité | Solaris Congo",
};

export default function PolitiquePage() {
  return (
    <div className="bg-slate-50">
      <div className="mx-auto w-full max-w-4xl px-6 py-12">
        <div className="flex flex-col gap-6">
          <header className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">
              Politique de confidentialité
            </p>
            <h1 className="text-3xl font-semibold text-slate-900">
              Politique de confidentialité
            </h1>
            <p className="text-sm text-slate-600">
              Cette politique explique comment Solaris Congo collecte, utilise et
              protège vos données lorsque vous utilisez nos services.
            </p>
          </header>

          <section className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">
              Données collectées
            </h2>
            <p className="text-sm text-slate-600">
              Nous collectons uniquement les informations nécessaires au bon
              fonctionnement du service : données du formulaire de contact
              (nom, email, sujet, message) et, le cas échéant, des données
              d’usage anonymisées à des fins de mesure d’audience.
            </p>
          </section>

          <section className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Finalités</h2>
            <ul className="list-disc space-y-2 pl-5 text-sm text-slate-600">
              <li>Répondre à vos demandes envoyées via le formulaire.</li>
              <li>Améliorer la qualité et la sécurité du service.</li>
              <li>Suivre l’activité globale pour optimiser l’expérience.</li>
            </ul>
          </section>

          <section className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">
              Base légale
            </h2>
            <p className="text-sm text-slate-600">
              Les traitements relatifs au formulaire de contact reposent sur
              votre consentement. Les mesures d’audience relèvent de notre
              intérêt légitime à améliorer l’application.
            </p>
          </section>

          <section className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">
              Durées de conservation
            </h2>
            <p className="text-sm text-slate-600">
              Les messages envoyés via le formulaire sont conservés pendant 12
              mois maximum afin de suivre les échanges. Les statistiques
              d’audience, lorsqu’elles existent, sont agrégées et conservées
              pendant la durée strictement nécessaire.
            </p>
          </section>

          <section className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">
              Partage des données
            </h2>
            <p className="text-sm text-slate-600">
              Nous ne vendons ni ne louons vos données. Elles peuvent être
              traitées par des prestataires techniques strictement nécessaires au
              fonctionnement du service (hébergement, sécurité).
            </p>
          </section>

          <section className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Vos droits</h2>
            <p className="text-sm text-slate-600">
              Vous disposez d’un droit d’accès, de rectification et de suppression
              de vos données. Pour exercer vos droits, contactez-nous via la page
              <Link
                href="/a-propos"
                className="ml-1 font-medium text-emerald-600 underline-offset-4 hover:underline"
              >
                À propos
              </Link>
              .
            </p>
          </section>

          <section className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Contact</h2>
            <p className="text-sm text-slate-600">
              Pour toute question sur cette politique, utilisez notre formulaire
              de contact accessible depuis la page{" "}
              <Link
                href="/a-propos"
                className="font-medium text-emerald-600 underline-offset-4 hover:underline"
              >
                À propos
              </Link>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
