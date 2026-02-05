import { NextResponse } from "next/server";
import { z } from "zod";
import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";

const contactSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(120),
  subject: z.string().trim().min(2).max(120),
  message: z.string().trim().min(10).max(2000),
  consent: z.boolean().refine((value) => value),
});

const RATE_LIMIT_WINDOW_MS = 30_000;
const rateLimitStore = new Map<string, number>();

const getClientIp = (request: Request) => {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }
  return request.headers.get("x-real-ip") || "unknown";
};

const storeContactMessage = async (
  payload: z.infer<typeof contactSchema>,
) => {
  const dataDir = path.join(process.cwd(), ".data");
  const filePath = path.join(dataDir, "contact-messages.json");

  await fs.mkdir(dataDir, { recursive: true });

  let existing: Array<Record<string, unknown>> = [];
  try {
    const file = await fs.readFile(filePath, "utf-8");
    existing = JSON.parse(file) as Array<Record<string, unknown>>;
  } catch (error) {
    existing = [];
  }

  existing.push({
    id: randomUUID(),
    ...payload,
    createdAt: new Date().toISOString(),
  });

  await fs.writeFile(filePath, JSON.stringify(existing, null, 2));
};

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const now = Date.now();
  const lastRequest = rateLimitStore.get(ip);
  if (lastRequest && now - lastRequest < RATE_LIMIT_WINDOW_MS) {
    return NextResponse.json(
      { ok: false, error: "RATE_LIMIT" },
      { status: 429 },
    );
  }

  let body: unknown = null;
  try {
    body = await request.json();
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: "VALIDATION_ERROR" },
      { status: 400 },
    );
  }

  const validation = contactSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json(
      { ok: false, error: "VALIDATION_ERROR" },
      { status: 400 },
    );
  }

  rateLimitStore.set(ip, now);

  try {
    await storeContactMessage(validation.data);
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: "SERVER_ERROR" },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { ok: false, error: "METHOD_NOT_ALLOWED" },
    { status: 405 },
  );
}
