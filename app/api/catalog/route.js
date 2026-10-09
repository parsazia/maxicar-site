import {
  fetchLiveProducts,
  getDemoProducts,
  hasCatalogEndpoint,
  hasLiveCatalogConfig
} from "../../../lib/catalog.js";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  if (!hasCatalogEndpoint()) {
    const items = getDemoProducts();
    return Response.json({
      mode: "demo",
      connected: false,
      message: "اتصال به سامانهٔ واقعی محصولات هنوز تنظیم نشده است.",
      count: items.length,
      items
    }, { headers: { "Cache-Control": "no-store" } });
  }

  if (!hasLiveCatalogConfig()) {
    return Response.json({
      mode: "unavailable",
      connected: false,
      message: "نشانی سرویس ثبت شده، اما کلید API تنظیم نشده است."
    }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }

  try {
    const items = await fetchLiveProducts();
    return Response.json({
      mode: "live",
      connected: true,
      count: items.length,
      items
    }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({
      mode: "unavailable",
      connected: false,
      message: "دریافت محصولات از سرویس اصلی انجام نشد."
    }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
