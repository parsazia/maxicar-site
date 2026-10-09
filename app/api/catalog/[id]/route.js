import {
  fetchLiveProduct,
  getDemoProduct,
  hasCatalogEndpoint,
  hasLiveCatalogConfig
} from "../../../../lib/catalog.js";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(_request, { params }) {
  const { id } = await params;

  if (!hasCatalogEndpoint()) {
    const item = getDemoProduct(id);
    if (!item) {
      return Response.json({ mode: "demo", item: null }, {
        status: 404,
        headers: { "Cache-Control": "no-store" }
      });
    }
    return Response.json({ mode: "demo", item }, {
      headers: { "Cache-Control": "no-store" }
    });
  }

  if (!hasLiveCatalogConfig()) {
    return Response.json({
      mode: "unavailable",
      message: "کلید اتصال به سامانهٔ محصولات تنظیم نشده است."
    }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }

  if (!/^\d+$/.test(String(id))) {
    return Response.json({ mode: "live", item: null }, {
      status: 400,
      headers: { "Cache-Control": "no-store" }
    });
  }

  try {
    const item = await fetchLiveProduct(id);
    if (!item) {
      return Response.json({ mode: "live", item: null }, {
        status: 404,
        headers: { "Cache-Control": "no-store" }
      });
    }
    return Response.json({ mode: "live", item }, {
      headers: { "Cache-Control": "no-store" }
    });
  } catch {
    return Response.json({
      mode: "unavailable",
      message: "دریافت مشخصات قطعه انجام نشد."
    }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
