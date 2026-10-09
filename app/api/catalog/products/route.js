import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BASE_URL = "https://maxicar.ir";

function firstValue(object, keys, fallback = "") {
  for (const key of keys) {
    const value = object?.[key];
    if (value !== undefined && value !== null && value !== "") return value;
  }
  return fallback;
}

function extractProducts(payload) {
  if (Array.isArray(payload)) return payload;
  for (const key of ["results", "products", "items", "data"]) {
    if (Array.isArray(payload?.[key])) return payload[key];
  }
  if (Array.isArray(payload?.data?.results)) return payload.data.results;
  return [];
}

function normalizeProduct(product) {
  const id = firstValue(product, ["id", "product_id", "pk"]);
  const name = firstValue(product, ["name", "title", "product_name", "name_fa"], "محصول بدون نام");
  const categories = firstValue(product, ["categories", "category_names", "main_category"], []);
  const categoryText = Array.isArray(categories)
    ? categories.map((item) => typeof item === "string" ? item : firstValue(item, ["name", "title"])).filter(Boolean).join("، ")
    : typeof categories === "object" ? firstValue(categories, ["name", "title"]) : String(categories || "");
  const rawPrice = firstValue(product, ["price", "final_price", "sale_price", "current_price"]);
  const available = firstValue(product, ["available", "is_available", "in_stock"]);
  const stock = firstValue(product, ["stock", "stock_quantity", "quantity"]);
  const condition = firstValue(product, ["condition", "product_condition", "quality", "stock_type", "product_type"]);
  const image = firstValue(product, ["image", "image_url", "thumbnail", "main_image"]);
  const imageUrl = typeof image === "string" ? image : firstValue(image, ["url", "src"]);
  return {
    id: id === "" ? null : id,
    slug: String(firstValue(product, ["slug", "url_slug"], id || name)),
    name: String(name),
    carName: String(firstValue(product, ["car_name", "vehicle_name", "vehicle"], "قطعات نیسان")),
    category: categoryText,
    condition: String(condition || ""),
    status: available === false || available === 0 ? "ناموجود" : stock !== "" && Number(stock) <= 0 ? "ناموجود" : "استعلام موجودی",
    price: rawPrice === "" ? null : rawPrice,
    imageUrl: imageUrl || null,
    partNumber: String(firstValue(product, ["sku", "part_number", "technical_code", "code"], "")),
    source: "mixin-api-v4",
  };
}

export async function GET(request) {
  const apiKey = process.env.MAXICAR_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "API_KEY_NOT_CONFIGURED", message: "کلید API برای محیط آزمایشی تنظیم نشده است." },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }

  const incoming = new URL(request.url);
  const params = new URLSearchParams();
  params.set("page", incoming.searchParams.get("page") || "1");
  params.set("page_size", String(Math.min(100, Math.max(1, Number(incoming.searchParams.get("page_size") || 50)))));
  const search = incoming.searchParams.get("search")?.trim();
  if (search) params.set("search", search);

  try {
    const response = await fetch(`${BASE_URL}/api/v4/products/?${params.toString()}`, {
      method: "GET",
      headers: { Authorization: `Api-Key ${apiKey}`, Accept: "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "UPSTREAM_API_ERROR", message: `درخواست فروشگاه با وضعیت ${response.status} پاسخ داد.` },
        { status: response.status === 401 || response.status === 403 ? 502 : response.status, headers: { "Cache-Control": "no-store" } }
      );
    }

    const payload = await response.json();
    const products = extractProducts(payload).map(normalizeProduct);
    return NextResponse.json(
      { products, count: firstValue(payload, ["count", "total", "total_count"], products.length), page: Number(params.get("page")), pageSize: Number(params.get("page_size")), source: "mixin-api-v4" },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch {
    return NextResponse.json(
      { error: "UPSTREAM_UNAVAILABLE", message: "ارتباط با API فروشگاه برقرار نشد." },
      { status: 502, headers: { "Cache-Control": "no-store" } }
    );
  }
}
