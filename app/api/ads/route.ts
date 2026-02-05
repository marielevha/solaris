import { NextResponse } from "next/server";
import { mapPartnerAdToAd } from "@/lib/adsMapper";
import { prisma } from "@/lib/prisma";
import type { AdPlacement } from "@/types/ads";

const allowedPlacements: AdPlacement[] = ["results", "header", "footer", "print"];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const placement = searchParams.get("placement");

  if (!placement || !allowedPlacements.includes(placement as AdPlacement)) {
    return NextResponse.json({ error: "Placement requis." }, { status: 400 });
  }

  const rawAds = await prisma.partnerAd.findMany({
    where: {
      active: true,
      placements: {
        contains: placement,
      },
    },
    orderBy: [{ priority: "desc" }, { id: "asc" }],
  });

  const ads = rawAds
    .map(mapPartnerAdToAd)
    .filter((ad) => ad.placement.includes(placement as AdPlacement));

  return NextResponse.json({ ads });
}
