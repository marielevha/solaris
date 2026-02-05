import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const placementSchema = z.enum(["results", "header", "footer", "print"]);
const batterySchema = z.enum(["AGM", "GEL", "LiFePO4"]);
const eventSchema = z.object({
  adId: z.string().min(1),
  type: z.enum(["impression", "click"]),
  placement: placementSchema,
  context: z
    .object({
      country: z.string().min(1).optional(),
      pvKw: z.number().optional(),
      systemVoltage: z.number().optional(),
      batteryType: batterySchema.optional(),
    })
    .optional(),
});

export async function POST(request: Request) {
  const body = await request.json();
  const payload = eventSchema.safeParse(body);

  if (!payload.success) {
    return NextResponse.json({ error: "Payload invalide." }, { status: 400 });
  }

  const { adId, type, placement, context } = payload.data;
  const increment =
    type === "impression"
      ? { impressions: { increment: 1 } }
      : { clicks: { increment: 1 } };

  await prisma.$transaction([
    prisma.adEvent.create({
      data: {
        ad: { connect: { id: adId } },
        type,
        placement,
        country: context?.country,
        pvKw: context?.pvKw,
        voltage: context?.systemVoltage,
        battery: context?.batteryType,
      },
    }),
    prisma.partnerAd.update({
      where: { id: adId },
      data: increment,
    }),
  ]);

  return NextResponse.json({ ok: true });
}
