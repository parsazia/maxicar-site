import { NextResponse } from "next/server";
import { getProduct } from "../../../../../lib/mixin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request, { params }) {
  const { id } = await params;
  if (!/^\d+$/.test(String(id))) {
    return NextResponse.json({ error: "INVALID_PRODUCT_ID", message: "شناسه محصول معتبر نیست." }, { status: 400 });
  }
  try {
    const product = await getProduct(id);
    return NextResponse.json({ product, source: "mixin-api-v4" }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const status = error.status === 404 ? 404 : error.status === 503 ? 503 : error.status === 401 || error.status === 403 ? 502 : 502;
    return NextResponse.json({
      error: error.code || "UPSTREAM_API_ERROR",
      message: error.status === 401 || error.status === 403
        ? "دسترسی API رد شد؛ تنظیمات کلید را بررسی کنید."
        : error.status === 404 ? "این محصول در فروشگاه پیدا نشد." : error.message || "دریافت اطلاعات محصول ناموفق بود.",
    }, { status, headers: { "Cache-Control": "no-store" } });
  }
}
