import type { Ad, AdContext, AdPlacement } from "@/types/ads";

const matchesTargeting = (ad: Ad, context: AdContext) => {
  const targeting = ad.targeting;
  if (!targeting) return true;

  if (context.country && targeting.countries?.length) {
    if (!targeting.countries.includes(context.country)) return false;
  }

  if (typeof context.pvKw === "number") {
    if (typeof targeting.minPvKw === "number" && context.pvKw < targeting.minPvKw) {
      return false;
    }
    if (typeof targeting.maxPvKw === "number" && context.pvKw > targeting.maxPvKw) {
      return false;
    }
  }

  if (typeof context.systemVoltage === "number" && targeting.systemVoltages?.length) {
    if (!targeting.systemVoltages.includes(context.systemVoltage)) return false;
  }

  if (context.batteryType && targeting.batteryTypes?.length) {
    if (!targeting.batteryTypes.includes(context.batteryType)) return false;
  }

  return true;
};

export function selectAd(
  ads: Ad[],
  placement: AdPlacement,
  context: AdContext,
): Ad | null {
  const filtered = ads.filter(
    (ad) => ad.active && ad.placement.includes(placement) && matchesTargeting(ad, context),
  );

  if (filtered.length === 0) return null;

  const sorted = [...filtered].sort((a, b) => {
    if (a.priority !== b.priority) return b.priority - a.priority;
    return a.id.localeCompare(b.id);
  });

  return sorted[0] ?? null;
}
