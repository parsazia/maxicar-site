import { NextResponse } from "next/server";
import { getRawProduct, patchRawProduct } from "../../../../lib/mixin";
import { calculateAedSalePrice } from "../../../../lib/aed-pricing";
import { getAedRate } from "../../../../lib/tgju-aed";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function stockEligible(product) {
  const type = String(product?.stock_type ?? product?.availability ?? "").toLowerCase();
  const available = product?.available ?? product?.is_available ?? product?.in_stock;
  const stock = product?.stock ?? product?.stock_quantity ?? product?.quantity;
  if (available === false || available === 0 || available === "false" || ["unavailable", "out_of_stock", "ناموجود"].includes(type)) return false;
  if (["unlimited", "نامحدود", "available", "موجود"].includes(type) || available === true || available === 1 || available === "true") return true;
  return (type === "limited" || type === "محدود") && (stock === null || stock === undefined || stock === "" || Number(stock) > 0);
}

export async function POST(request) {
  if (process.env.VERCEL_ENV !== "preview") return NextResponse.json({ error: "PREVIEW_ONLY" }, { status: 404 });
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return NextResponse.json({ error: "ORIGIN_REJECTED" }, { status: 403 });
  try {
    const body = await request.json();
    if (body?.confirm !== true) return NextResponse.json({ error: "EXPLICIT_CONFIRMATION_REQUIRED", message: "تأیید صریح لازم است." }, { status: 400 });
    if (!Array.isArray(body.items) || body.items.length < 1 || body.items.length > 100) return NextResponse.json({ error: "INVALID_ITEMS", message: "بین ۱ تا ۱۰۰ محصول وارد کنید." }, { status: 400 });
    const rate = await getAedRate();
    if (Number(body.expectedRateToman) !== rate.rateToman) return NextResponse.json({ error: "RATE_CHANGED", message: "نرخ درهم از زمان پیش‌نمایش تغییر کرده است؛ دوباره پیش‌نمایش بگیرید.", currentRateToman: rate.rateToman }, { status: 409 });
    const results = [];
    for (const item of body.items) {
      const id = String(item?.id ?? "").trim();
      const basePriceAed = Number(item?.basePriceAed);
      if (!/^\d+$/.test(id) || !Number.isFinite(basePriceAed) || basePriceAed <= 0) {
        results.push({ id, ok: false, reason: "شناسه یا قیمت پایه درهم معتبر نیست." }); continue;
      }
      try {
        const before = await getRawProduct(id);
        if (!stockEligible(before)) { results.push({ id, ok: false, reason: "موجودی محصول تأیید نشده یا ناموجود است؛ تغییر داده نشد." }); continue; }
        const oldFields = before?.extra_fields;
        if (oldFields !== undefined && oldFields !== null && (Array.isArray(oldFields) || typeof oldFields !== "object")) {
          results.push({ id, ok: false, reason: "ساختار extra_fields این محصول هنوز قابل تأیید نیست؛ هیچ تغییری اعمال نشد." }); continue;
        }
        const mergedFields = { ...(oldFields || {}), maxicar_base_price_aed: String(basePriceAed) };
        await patchRawProduct(id, { extra_fields: mergedFields });
        const afterFields = await getRawProduct(id);
        if (String(afterFields?.extra_fields?.maxicar_base_price_aed ?? "") !== String(basePriceAed)) {
          results.push({ id, ok: false, reason: "ذخیره قیمت پایه درهم از API تأیید نشد؛ قیمت فروش تغییر داده نشد." }); continue;
        }
        const calculated = calculateAedSalePrice(basePriceAed, rate.rateToman);
        await patchRawProduct(id, { price: calculated.salePriceToman });
        const verified = await getRawProduct(id);
        if (Number(verified?.price) !== calculated.salePriceToman) {
          results.push({ id, ok: false, reason: "قیمت فروش پس از نوشتن تأیید نشد؛ بررسی دستی لازم است.", basePriceSaved: true, expectedPrice: calculated.salePriceToman, observedPrice: verified?.price ?? null }); continue;
        }
        results.push({ id, name: verified?.name || before?.name || "", ok: true, previousPrice: before?.price ?? null, ...calculated });
      } catch (error) {
        results.push({ id, ok: false, reason: error.message || "به‌روزرسانی محصول ناموفق بود." });
      }
    }
    return NextResponse.json({ rate, results, applied: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return NextResponse.json({ error: "APPLY_FAILED", message: error.message || "اعمال قیمت‌ها ناموفق بود." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
