import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const seedAds = [
  {
    sponsorLabel: "Sponsorisé",
    title: "Kits solaires résidentiels 3-5 kWp",
    description: "Solutions clés en main avec installation locale.",
    cta: "Découvrir les kits",
    href: "https://example.com/kits-solaires",
    imageUrl: "https://images.unsplash.com/photo-1509395176047-4a66953fd231",
    placements: "results,header",
    countries: "FR,MA",
    minPvKw: 2,
    maxPvKw: 6,
    voltages: "24,48",
    batteryTypes: "AGM,LiFePO4",
    priority: 3,
  },
  {
    sponsorLabel: "Partenaire",
    title: "Batteries LiFePO4 48V",
    description: "Durée de vie longue, garantie 5 ans.",
    cta: "Voir les modèles",
    href: "https://example.com/batteries-lifepo4",
    imageUrl: "https://images.unsplash.com/photo-1509395062183-67c5ad6faff9",
    placements: "results,footer,print",
    countries: "FR",
    minPvKw: 1,
    voltages: "48",
    batteryTypes: "LiFePO4",
    priority: 4,
  },
  {
    sponsorLabel: "Sponsorisé",
    title: "Régulateurs MPPT haute performance",
    description: "Optimisez vos rendements avec nos MPPT.",
    cta: "Comparer",
    href: "https://example.com/regulateurs-mppt",
    imageUrl: "https://images.unsplash.com/photo-1509395176047-4a66953fd231?auto=format&fit=crop&w=400&q=80",
    placements: "header,footer",
    voltages: "12,24",
    batteryTypes: "AGM,GEL",
    priority: 2,
  },
  {
    sponsorLabel: "Sponsorisé",
    title: "Onduleurs hybrides pour sites isolés",
    description: "Gestion intelligente charge + batteries.",
    cta: "Voir l'offre",
    href: "https://example.com/onduleurs-hybrides",
    imageUrl: "https://images.unsplash.com/photo-1509395062183-67c5ad6faff9?auto=format&fit=crop&w=400&q=80",
    placements: "results,print",
    minPvKw: 3,
    maxPvKw: 12,
    voltages: "48",
    priority: 5,
  },
  {
    sponsorLabel: "Partenaire",
    title: "Panneaux 450 Wp premium",
    description: "Modules performants pour toitures résidentielles.",
    cta: "Obtenir un devis",
    href: "https://example.com/panneaux-450wp",
    imageUrl: "https://images.unsplash.com/photo-1497436072909-60f360e1d4b1",
    placements: "footer,print",
    countries: "MA",
    minPvKw: 1.5,
    maxPvKw: 8,
    voltages: "24,48",
    priority: 1,
  },
  {
    sponsorLabel: "Sponsorisé",
    title: "Maintenance & monitoring solaire",
    description: "Supervision à distance de votre installation.",
    cta: "Activer le monitoring",
    href: "https://example.com/monitoring-solaire",
    placements: "results,header,footer",
    priority: 0,
  },
];

async function main() {
  await prisma.partnerAd.createMany({
    data: seedAds,
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
