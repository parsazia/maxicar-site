import { NextResponse } from "next/server";
import { listPublicCampaigns } from "../../../lib/campaigns-server";
import { requireUser } from "../../../lib/cashback-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const token = request.headers.get("authorization") || "";
    let isMember = false;
    if (/^Bearer\s+/i.test(token)) {
      const auth = await requireUser(request);
      isMember = !auth.error;
    }
    const campaigns = await listPublicCampaigns(isMember);
    return NextResponse.json({ campaigns }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return NextResponse.json({ campaigns: [], message: error.message || "پیشنهادها فعلاً در دسترس نیستند." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
