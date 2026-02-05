import type { PartnerAd } from "@prisma/client";
import type { Ad, AdPlacement, Targeting } from "@/types/ads";

const allowedPlacements: AdPlacement[] = ["results", "header", "footer", "print"];
type BatteryType = "AGM" | "GEL" | "LiFePO4";

const allowedBatteryTypes: BatteryType[] = ["AGM", "GEL", "LiFePO4"];

const parseCsv = (value?: string | null) => {
  if (!value) return [];
  const entries = value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
  return Array.from(new Set(entries));
};

const parsePlacements = (value: string) =>
  parseCsv(value).filter((placement): placement is AdPlacement =>
    allowedPlacements.includes(placement as AdPlacement),
  );

const parseVoltages = (value?: string | null) =>
  parseCsv(value)
    .map((entry) => Number(entry))
    .filter((entry) => Number.isFinite(entry));

const parseBatteryTypes = (value?: string | null) =>
  parseCsv(value).filter((entry): entry is BatteryType =>
    allowedBatteryTypes.includes(entry as BatteryType),
  );

const parseCountries = (value?: string | null) =>
  parseCsv(value).map((country) => country.toUpperCase());

export const mapPartnerAdToAd = (row: PartnerAd): Ad => {
  const placements = parsePlacements(row.placements);
  const countries = parseCountries(row.countries);
  const voltages = parseVoltages(row.voltages);
  const batteryTypes = parseBatteryTypes(row.batteryTypes);

  const targeting: Targeting = {};
  if (countries.length > 0) targeting.countries = countries;
  if (typeof row.minPvKw === "number") targeting.minPvKw = row.minPvKw;
  if (typeof row.maxPvKw === "number") targeting.maxPvKw = row.maxPvKw;
  if (voltages.length > 0) targeting.systemVoltages = voltages;
  if (batteryTypes.length > 0) targeting.batteryTypes = batteryTypes;

  return {
    id: row.id,
    active: row.active,
    priority: row.priority,
    placement: placements,
    title: row.title,
    description: row.description,
    cta: row.cta,
    href: row.href,
    imageUrl: row.imageUrl ?? undefined,
    sponsorLabel: row.sponsorLabel,
    targeting: Object.keys(targeting).length > 0 ? targeting : undefined,
  };
};
