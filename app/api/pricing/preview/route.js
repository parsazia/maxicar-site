import { NextResponse } from "next/server";
import { getRawProduct } from "../../../../lib/mixin";
import { calculateAedSalePrice } from "../../../../lib/aed-pricing";
import { getAedRate } from "../../../../lib/tgju-aed";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function basePriceFrom(product) {
  const fields = product?.extra_fields;
  if (fields && !Array.isArray(fields) && typeof fields === "object") {
    const value = fields.maxicar_base_price_aed;
    if (value !== undefined && value !== null && value !== "") return Number(value);
  }
  return null;
}

function stockEligibility(product) {
  const type = String(product?.stock_type ?? product?.availability ?? "").toLowerCase();
  const available = product?.available ?? product?.is_available ?? product?.in_stock;
  const stock = product?.stock ?? product?.stock_quantity ?? product?.quantity;
  if (available === false || available === 0 || available === "false" || ["unavailable", "out_of_stock", "ناموجود"].includes(type)) return { eligible: false, reason: "محصول ناموجود است." };
  if (type === "unlimited" || type === "نامحدود" || type === "available" || type === "موجود" || available === true || available === 1 || available === "true") return { eligible: true, reason: "موجود" };
  if ((type === "limited" || type === "محدود") && stock !== null && stock !== undefined && stock !== "" && Number(stock) > 0) return { eligible: true, reason: "موجودی محدود" };
  return { eligible: false, reason: "وضعیت موجودی صریحاً تأیید نشده است." };
}

export async function POST(request) {
  if (process.env.VERCEL_ENV !== "preview") return NextResponse.json({ error: "PREVIEW_ONLY" }, { status: 404 });
  try {
    const body = await request.json();
    if (!Array.isArray(body.items) || body.items.length < 1 || body.items.length > 100) return NextResponse.json({ error: "INVALID_ITEMS", message: "بین ۱ تا ۱۰۰ محصول وارد کنید." }, { status: 400 });
    const rate = await getAedRate();
    const results = await Promise.all(body.items.map(async (item) => {
      const id = String(item?.id ?? "").trim();
      const basePriceAed = Number(item?.basePriceAed);
      if (!/^\d+$/.test(id) || !Number.isFinite(basePriceAed) || basePriceAed <= 0) return { id, ok: false, reason: "شناسه یا قیمت پایه درهم معتبر نیست." };
      try {
        const product = await getRawProduct(id);
        const eligibility = stockEligibility(product);
        if (!eligibility.eligible) return { id, name: product?.name || "", ok: false, reason: eligibility.reason, currentPrice: product?.price ?? null };
        const calculated = calculateAedSalePrice(basePriceAed, rate.rateToman);
        return { id, name: product?.name || product?.title || "محصول بدون نام", ok: true, stockStatus: eligibility.reason, currentPrice: product?.price ?? null, basePriceAed, ...calculated };
      } catch (error) {
        return { id, ok: false, reason: error.message || "دریافت محصول ناموفق بود." };
      }
    }));
    return NextResponse.json({ rate, results, previewOnly: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return NextResponse.json({ error: "PREVIEW_FAILED", message: error.message || "پیش‌نمایش ناموفق بود." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
