import { NextResponse } from "next/server";
import { getRawProduct, listRawProducts } from "../../../../lib/mixin";
import { calculateAedSalePrice } from "../../../../lib/aed-pricing";
import { getAedRate } from "../../../../lib/tgju-aed";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function stockEligibility(product) {
  const type = String(product?.stock_type ?? product?.availability ?? "").toLowerCase();
  const available = product?.available ?? product?.is_available ?? product?.in_stock;
  const stock = product?.stock ?? product?.stock_quantity ?? product?.quantity;
  if (available === false || available === 0 || available === "false" || ["unavailable", "out_of_stock", "ناموجود"].includes(type)) return { eligible: false, reason: "محصول ناموجود است." };
  if (["unlimited", "نامحدود", "available", "موجود"].includes(type) || available === true || available === 1 || available === "true") return { eligible: true, reason: "موجود" };
  if ((type === "limited" || type === "محدود") && (stock === null || stock === undefined || stock === "" || Number(stock) > 0)) return { eligible: true, reason: "موجودی محدود" };
  return { eligible: false, reason: "وضعیت موجودی صریحاً تأیید نشده است." };
}

function savedAed(product) {
  const fields = product?.extra_fields;
  if (fields && !Array.isArray(fields) && typeof fields === "object") {
    const value = Number(fields.maxicar_base_price_aed);
    return Number.isFinite(value) && value > 0 ? value : null;
  }
  return null;
}

async function allSavedItems() {
  const items = [];
  let page = 1;
  let knownCount = null;
  while (page <= 20) {
    const batch = await listRawProducts({ page, pageSize: 100 });
    knownCount = batch.count ?? knownCount;
    for (const product of batch.products) {
      const basePriceAed = savedAed(product);
      const id = String(product?.id ?? product?.product_id ?? product?.pk ?? "");
      if (/^\d+$/.test(id) && basePriceAed) items.push({ id, basePriceAed });
    }
    if (!batch.products.length || batch.products.length < 100 || (knownCount !== null && page * 100 >= knownCount)) break;
    page += 1;
  }
  return items;
}

export async function POST(request) {
  if (process.env.VERCEL_ENV !== "preview") return NextResponse.json({ error: "PREVIEW_ONLY" }, { status: 404 });
  try {
    const body = await request.json();
    let items = body?.useSaved === true ? await allSavedItems() : body?.items;
    if (!Array.isArray(items) || items.length < 1 || items.length > 100) return NextResponse.json({ error: "INVALID_ITEMS", message: body?.useSaved === true ? "هیچ محصولی با قیمت پایه درهم ذخیره‌شده پیدا نشد؛ ابتدا قیمت پایه محصولات را ثبت کنید." : "بین ۱ تا ۱۰۰ محصول وارد کنید." }, { status: 400 });
    const rate = await getAedRate();
    const results = await Promise.all(items.map(async (item) => {
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
    return NextResponse.json({ rate, results, previewOnly: true, source: body?.useSaved === true ? "saved-aed-prices" : "manual-input" }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return NextResponse.json({ error: "PREVIEW_FAILED", message: error.message || "پیش‌نمایش ناموفق بود." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
