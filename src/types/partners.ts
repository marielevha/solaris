export type PartnerType =
  | "Installateur"
  | "Fournisseur"
  | "Bureau d’étude"
  | "Distributeur";

export type Partner = {
  id: string;
  name: string;
  type: PartnerType;
  country: string;
  city?: string;
  services: string[];
  website?: string;
  contactEmail?: string;
  logoUrl?: string;
  description?: string;
};
