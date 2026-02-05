export type ProductCategory =
  | "Panneaux"
  | "Batteries"
  | "Onduleurs"
  | "Régulateurs"
  | "Câbles"
  | "Protections"
  | "Accessoires";

export type Availability = "En stock" | "Rupture" | "Précommande";

export type ProductSpecs = Record<string, string | number | boolean | null>;

export type Product = {
  id: string;
  name: string;
  category: ProductCategory;
  brand?: string;
  price: number;
  currency: "EUR" | "MAD" | "USD";
  availability: Availability;
  rating?: number;
  tags?: string[];
  imageUrl?: string;
  shortDescription?: string;
  specs?: ProductSpecs;
  affiliateUrl?: string;
};
