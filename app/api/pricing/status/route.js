import { NextResponse } from "next/server";
import { getPricingApiConfig } from "../../../../lib/mixin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (process.env.VERCEL_ENV !== "preview") return NextResponse.json({ error: "PREVIEW_ONLY" }, { status: 404 });
  try {
    getPricingApiConfig();
    return NextResponse.json({ canApply: true, message: "اتصال API آزمایشی مستقل تنظیم شده است." }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ canApply: false, message: "برای اعمال قیمت باید MAXICAR_PRICING_API_BASE_URL و MAXICAR_PRICING_API_KEY مربوط به فروشگاه آزمایشی مستقل تنظیم شوند. تا آن زمان فقط پیش‌نمایش فعال است." }, { headers: { "Cache-Control": "no-store" } });
  }
}
