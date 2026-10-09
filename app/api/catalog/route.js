import { products as demoProducts } from "../../data/catalog.js";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_ITEMS = 500;
const REQUEST_TIMEOUT_MS = 8000;

function cleanText(value, maxLength = 240) {
  if (typeof value !== "string" && typeof value !== "number") return "";
  return String(value).trim().slice(0, maxLength);
}

function normalizeProduct(item, index) {
  if (!item || typeof item !== "object") return null;

  const name = cleanText(item.name ?? item.title ?? item.name_fa, 180);
  if (!name) return null;
  const rawPrice = item.price ?? item.price_toman ?? item.final_price ?? null;
  const parsedPrice = typeof rawPrice === "string"
    ? Number(rawPrice.replace(/[\s,٬،]/g, ""))
    : Number(rawPrice);
  const price = rawPrice !== null && rawPrice !== "" && Number.isFinite(parsedPrice) && parsedPrice > 0
    ? parsedPrice
    : null;

  return {
    id: cleanText(item.id ?? item.product_id ?? item.slug ?? index, 100),
    slug: cleanText(item.slug ?? item.id ?? item.product_id ?? `item-${index + 1}`, 120),
    name,
    car: cleanText(item.car ?? item.vehicle ?? item.car_slug, 60),
    carName: cleanText(item.carName ?? item.car_name ?? item.vehicle_name, 100),
    system: cleanText(item.system ?? item.category ?? item.category_name, 100),
    condition: cleanText(item.condition ?? item.status_condition ?? item.product_condition, 40),
    status: cleanText(item.status ?? item.inventory_status ?? item.stock_status, 60),
    partNumber: cleanText(item.partNumber ?? item.part_number ?? item.sku ?? item.oem, 100),
    price,
    image: cleanText(item.image ?? item.image_url ?? item.thumbnail, 1000),
    note: cleanText(item.note ?? item.description ?? item.short_description, 500),
    aliases: Array.isArray(item.aliases)
      ? item.aliases.slice(0, 20).map((alias) => cleanText(alias, 100)).filter(Boolean)
      : []
  };
}

function validUpstreamUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || (process.env.NODE_ENV !== "production" && url.hostname === "localhost");
  } catch {
    return false;
  }
}

export async function GET() {
  const endpoint = process.env.MAXICAR_CATALOG_API_URL;
  const token = process.env.MAXICAR_CATALOG_API_TOKEN;

  if (!endpoint) {
    return Response.json({
      mode: "demo",
      connected: false,
      message: "اتصال به سامانهٔ واقعی محصولات هنوز تنظیم نشده است.",
      count: demoProducts.length,
      items: demoProducts.map((item, index) => normalizeProduct(item, index)).filter(Boolean)
    }, {
      headers: { "Cache-Control": "no-store" }
    });
  }

  if (!validUpstreamUrl(endpoint)) {
    return Response.json({
      mode: "unavailable",
      connected: false,
      message: "نشانی سرویس محصولات باید یک نشانی امن HTTPS باشد."
    }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }

  try {
    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      cache: "no-store",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
    });

    if (!response.ok) {
      return Response.json({
        mode: "unavailable",
        connected: false,
        message: "سرویس محصولات پاسخ موفقی نداد."
      }, { status: 502, headers: { "Cache-Control": "no-store" } });
    }

    const payload = await response.json();
    const sourceItems = Array.isArray(payload)
      ? payload
      : Array.isArray(payload?.items)
        ? payload.items
        : Array.isArray(payload?.products)
          ? payload.products
          : null;

    if (!sourceItems) {
      return Response.json({
        mode: "unavailable",
        connected: false,
        message: "ساختار پاسخ سرویس محصولات قابل‌شناسایی نیست."
      }, { status: 502, headers: { "Cache-Control": "no-store" } });
    }

    const items = sourceItems.slice(0, MAX_ITEMS)
      .map((item, index) => normalizeProduct(item, index))
      .filter(Boolean);

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
      message: "ارتباط با سرویس محصولات برقرار نشد."
    }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
