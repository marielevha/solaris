import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    { error: "Not Implemented", detail: "TODO: PDF export v2 via Playwright." },
    { status: 501 },
  );
}
