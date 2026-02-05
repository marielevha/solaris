import { z } from "zod";
import rawProducts from "@/data/products.json";
import type {
  Availability,
  Product,
  ProductCategory,
  ProductSpecs,
} from "@/types/products";

const trimString = (value: string) => value.trim();

const categorySchema = z.enum([
  "Panneaux",
  "Batteries",
  "Onduleurs",
  "Régulateurs",
  "Câbles",
  "Protections",
  "Accessoires",
]);

const availabilitySchema = z.enum(["En stock", "Rupture", "Précommande"]);

const currencySchema = z
  .string()
  .transform((value) => value.trim().toUpperCase())
  .pipe(z.enum(["EUR", "MAD", "USD"]));

const productSchema = z.object({
  id: z.string().transform(trimString),
  name: z.string().transform(trimString),
  category: categorySchema,
  brand: z.string().transform(trimString).optional(),
  price: z.number().min(0),
  currency: currencySchema,
  availability: availabilitySchema,
  rating: z.number().min(0).max(5).optional(),
  tags: z.array(z.string().transform(trimString)).optional(),
  imageUrl: z.string().transform(trimString).optional(),
  shortDescription: z.string().transform(trimString).optional(),
  specs: z
    .record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null()]))
    .optional(),
  affiliateUrl: z.string().transform(trimString).optional(),
});

const productsSchema = z.array(productSchema);

const clampRating = (rating?: number) => {
  if (rating === undefined) return undefined;
  return Math.max(0, Math.min(5, rating));
};

const normalizeTags = (tags?: string[]) => {
  if (!tags) return undefined;
  const normalized = tags.map((tag) => tag.trim()).filter(Boolean);
  return normalized.length > 0 ? normalized : undefined;
};

export const loadProducts = (): Product[] => {
  const parsed = productsSchema.parse(rawProducts);

  return parsed.map((product) => ({
    ...product,
    id: product.id.trim(),
    name: product.name.trim(),
    category: product.category as ProductCategory,
    brand: product.brand?.trim(),
    currency: product.currency as Product["currency"],
    availability: product.availability as Availability,
    rating: clampRating(product.rating),
    tags: normalizeTags(product.tags),
    imageUrl: product.imageUrl?.trim(),
    shortDescription: product.shortDescription?.trim(),
    specs: product.specs as ProductSpecs | undefined,
    affiliateUrl: product.affiliateUrl?.trim(),
  }));
};
