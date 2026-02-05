import type { Metadata } from "next";
import ContactForm from "@/components/contact/ContactForm";

export const metadata: Metadata = {
  title: "À propos | Solaris Congo",
};

export default function AboutPage() {
  return (
    <div className="bg-slate-50">
      <div className="mx-auto w-full max-w-4xl px-6 py-12">
        <div className="flex flex-col gap-10">
          <header className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">
              À propos
            </p>
            <h1 className="text-3xl font-semibold text-slate-900">
              Une plateforme claire pour vos projets solaires
            </h1>
            <p className="text-sm text-slate-600">
              Solaris Congo met à disposition des outils simples pour estimer un
              dimensionnement solaire résidentiel. Notre objectif est de rendre
              l’information technique plus accessible, sans jargon inutile.
            </p>
            <p className="text-sm text-slate-600">
              Les recommandations fournies sont conçues comme un point de départ
              pour vos discussions avec des professionnels locaux. Nous
              privilégions la transparence, la pédagogie et une expérience
              utilisateur fluide.
            </p>
            <p className="text-sm text-slate-600">
              Vous souhaitez en savoir plus, proposer un partenariat ou faire un
              retour ? Écrivez-nous via le formulaire ci-dessous.
            </p>
          </header>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-slate-900">Contact</h2>
              <p className="text-sm text-slate-600">
                Remplissez ce formulaire et nous reviendrons vers vous au plus
                vite.
              </p>
            </div>
            <ContactForm />
          </section>
        </div>
      </div>
    </div>
  );
}
