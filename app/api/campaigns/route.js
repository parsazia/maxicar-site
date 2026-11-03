import { NextResponse } from "next/server";
import { listPublicCampaigns } from "../../../lib/campaigns-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const campaigns = await listPublicCampaigns();
    return NextResponse.json({ campaigns }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return NextResponse.json({ campaigns: [], message: error.message || "پیشنهادها فعلاً در دسترس نیستند." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
