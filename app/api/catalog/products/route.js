import { NextResponse } from "next/server";
import { listProducts } from "../../../../lib/mixin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request) {
  const incoming = new URL(request.url);
  try {
    const result = await listProducts({
      page: incoming.searchParams.get("page") || 1,
      pageSize: incoming.searchParams.get("page_size") || 50,
      search: incoming.searchParams.get("search") || "",
    });
    return NextResponse.json(
      { ...result, source: "mixin-api-v4" },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    const status = error.status === 503 ? 503 : error.status === 401 || error.status === 403 ? 502 : error.status === 404 ? 404 : 502;
    return NextResponse.json(
      {
        error: error.code || "UPSTREAM_API_ERROR",
        message: error.status === 401 || error.status === 403
          ? "دسترسی API رد شد؛ تنظیمات کلید را بررسی کنید."
          : error.message || "دریافت اطلاعات فروشگاه ناموفق بود.",
      },
      { status, headers: { "Cache-Control": "no-store" } }
    );
  }
}
