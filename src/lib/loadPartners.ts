import { z } from "zod";
import partnersData from "@/data/partners.json";
import type { Partner } from "@/types/partners";

const partnerTypeSchema = z.enum([
  "Installateur",
  "Fournisseur",
  "Bureau d’étude",
  "Distributeur",
]);

const partnerSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  type: partnerTypeSchema,
  country: z.string().min(2),
  city: z.string().min(1).optional(),
  services: z.array(z.string().min(1)).max(5),
  website: z.string().url().optional(),
  contactEmail: z.string().email().optional(),
  logoUrl: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
});

const partnersSchema = z.array(partnerSchema);

const sanitizeWebsite = (website?: string) => {
  if (!website) return undefined;
  try {
    const parsed = new URL(website);
    if (parsed.protocol !== "https:") return undefined;
    return parsed.toString();
  } catch {
    return undefined;
  }
};

export const loadPartners = (): Partner[] => {
  const parsedPartners = partnersSchema.parse(partnersData);

  return parsedPartners.map((partner) => ({
    ...partner,
    country: partner.country.toUpperCase(),
    city: partner.city?.trim(),
    services: partner.services
      .map((service) => service.trim())
      .filter(Boolean)
      .slice(0, 5),
    website: sanitizeWebsite(partner.website),
  }));
};
