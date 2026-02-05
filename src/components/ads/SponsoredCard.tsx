import type { Ad } from "@/types/ads";

type SponsoredCardProps = {
  ad: Ad;
  variant?: "compact" | "full";
  onCtaClick?: () => void;
};

export const SponsoredCard = ({
  ad,
  variant = "full",
  onCtaClick,
}: SponsoredCardProps) => {
  const isCompact = variant === "compact";

  return (
    <div
      className={`flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm ${
        isCompact ? "sm:flex-row sm:items-center" : ""
      }`}
    >
      <div className="flex flex-1 flex-col gap-3">
        <div className="inline-flex items-center gap-2">
          <span className="rounded-full bg-emerald-100 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-700">
            {ad.sponsorLabel || "Sponsorisé"}
          </span>
          <span className="text-xs text-slate-500">Partenaire</span>
        </div>
        <div>
          <h3 className="text-base font-semibold text-slate-900">{ad.title}</h3>
          <p className="mt-1 text-sm text-slate-600">{ad.description}</p>
        </div>
        <a
          href={ad.href}
          onClick={onCtaClick}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary inline-flex w-fit"
        >
          {ad.cta}
        </a>
      </div>
      {ad.imageUrl ? (
        <div className="overflow-hidden rounded-xl border border-slate-100">
          <img
            src={ad.imageUrl}
            alt={ad.title}
            className={`object-cover ${
              isCompact ? "h-20 w-28" : "h-36 w-52"
            }`}
          />
        </div>
      ) : null}
    </div>
  );
};
