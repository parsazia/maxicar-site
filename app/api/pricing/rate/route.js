import { NextResponse } from "next/server";
import { getAedRate } from "../../../../lib/tgju-aed";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    if (process.env.VERCEL_ENV !== "preview") return NextResponse.json({ error: "PREVIEW_ONLY" }, { status: 404 });
    const rate = await getAedRate();
    return NextResponse.json(rate, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return NextResponse.json({ error: "RATE_UNAVAILABLE", message: error.message || "نرخ درهم در دسترس نیست." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
