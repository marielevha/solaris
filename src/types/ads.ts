export type AdPlacement = "results" | "header" | "footer" | "print";

export type Targeting = {
  countries?: string[];
  minPvKw?: number;
  maxPvKw?: number;
  systemVoltages?: number[];
  batteryTypes?: ("AGM" | "GEL" | "LiFePO4")[];
};

export type Ad = {
  id: string;
  active: boolean;
  priority: number;
  placement: AdPlacement[];
  title: string;
  description: string;
  cta: string;
  href: string;
  imageUrl?: string;
  sponsorLabel: string;
  targeting?: Targeting;
};

export type AdContext = {
  country?: string;
  pvKw?: number;
  systemVoltage?: number;
  batteryType?: "AGM" | "GEL" | "LiFePO4";
};
