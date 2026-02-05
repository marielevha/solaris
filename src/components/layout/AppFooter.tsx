import Link from "next/link";

const quickLinks = [
  { label: "Dimensionnement", href: "/" },
  { label: "Partenaires", href: "/partenaires" },
  { label: "Shop", href: "/shop" },
];

const infoLinks = [
  { label: "Politique de confidentialité", href: "/politique" },
  { label: "Conditions générales", href: "/conditions" },
  { label: "À propos", href: "/a-propos" },
];

export default function AppFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-100 bg-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 text-sm text-slate-500 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-2">
            <span>© {year} Solaris Congo.</span>
            <span>Dimensionnement solaire & partenaires certifiés.</span>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            <nav aria-label="Liens rapides">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Navigation
              </p>
              <ul className="mt-3 flex flex-col gap-2">
                {quickLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-500 underline-offset-4 transition hover:text-slate-900 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <nav aria-label="Informations">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Informations
              </p>
              <ul className="mt-3 flex flex-col gap-2">
                {infoLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-500 underline-offset-4 transition hover:text-slate-900 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
}
