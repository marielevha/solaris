import Image from "next/image";
import type { Partner } from "@/types/partners";

const getInitials = (name: string) => {
  const parts = name.split(" ").filter(Boolean);
  const initials = parts.slice(0, 2).map((part) => part[0]?.toUpperCase());
  return initials.join("") || "?";
};

const formatLocation = (partner: Partner) =>
  partner.city ? `${partner.city}, ${partner.country}` : partner.country;

export default function PartnerCard({ partner }: { partner: Partner }) {
  return (
    <article className="card flex h-full flex-col">
      <div className="card-body flex flex-1 flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            {partner.logoUrl ? (
              <div className="relative h-12 w-12 overflow-hidden rounded-full border border-slate-100 bg-white">
                <Image
                  src={partner.logoUrl}
                  alt={`Logo ${partner.name}`}
                  fill
                  className="object-contain p-2"
                />
              </div>
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-slate-100 bg-slate-50 text-sm font-semibold text-slate-600">
                {getInitials(partner.name)}
              </div>
            )}
            <div className="space-y-1">
              <h3 className="text-base font-semibold text-slate-900">
                {partner.name}
              </h3>
              <span className="inline-flex items-center rounded-full border border-slate-200 px-2 py-1 text-[11px] font-semibold text-slate-600">
                {partner.type}
              </span>
            </div>
          </div>
        </div>

        <div className="text-sm text-slate-600">
          <span className="font-medium text-slate-900">Localisation :</span>{" "}
          {formatLocation(partner)}
        </div>

        <div className="flex flex-wrap gap-2">
          {partner.services.slice(0, 3).map((service) => (
            <span
              key={service}
              className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600"
            >
              {service}
            </span>
          ))}
          {partner.services.length > 3 && (
            <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600">
              +{partner.services.length - 3}
            </span>
          )}
        </div>

        {partner.description && (
          <p
            className="text-sm text-slate-600"
            style={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {partner.description}
          </p>
        )}

        <div className="mt-auto flex flex-wrap gap-3">
          {partner.website && (
            <a
              href={partner.website}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary text-xs"
            >
              Site web
            </a>
          )}
          {partner.contactEmail && (
            <a
              href={`mailto:${partner.contactEmail}`}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              Contacter
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
