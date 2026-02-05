import Link from "next/link";

const footerLinks = [
  { label: "Dimensionnement", href: "/" },
  { label: "Partenaires", href: "/partenaires" },
  { label: "Shop", href: "/shop" },
];

export default function AppFooter() {
  return (
    <footer className="border-t border-slate-100 bg-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div className="flex flex-col gap-2">
          <span>© Solaris Congo. Tous droits réservés.</span>
          <span>Dimensionnement solaire & partenaires certifiés.</span>
        </div>
        <nav aria-label="Liens rapides">
          <ul className="flex flex-wrap gap-3">
            {footerLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
}
