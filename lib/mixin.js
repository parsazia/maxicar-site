const BASE_URL = "https://maxicar.ir";

function firstValue(object, keys, fallback = "") {
  for (const key of keys) {
    const value = object?.[key];
    if (value !== undefined && value !== null && value !== "") return value;
  }
  return fallback;
}

function unwrapProduct(payload) {
  if (!payload || typeof payload !== "object") return payload;
  for (const key of ["product", "item", "data", "result"]) {
    const value = payload[key];
    if (value && typeof value === "object" && !Array.isArray(value)) {
      if (value.id !== undefined || value.product_id !== undefined || value.name !== undefined || value.title !== undefined) return value;
    }
  }
  return payload;
}

export function normalizeProduct(input) {
  const product = unwrapProduct(input);
  const id = firstValue(product, ["id", "product_id", "pk"]);
  const name = firstValue(product, ["name", "title", "product_name", "name_fa"], "محصول بدون نام");
  const categories = firstValue(product, ["categories", "category_names", "main_category", "category"], []);
  const categoryText = Array.isArray(categories)
    ? categories.map((item) => typeof item === "string" ? item : firstValue(item, ["name", "title"])).filter(Boolean).join("، ")
    : typeof categories === "object" ? firstValue(categories, ["name", "title"]) : String(categories || "");
  const rawPrice = firstValue(product, ["price", "final_price", "sale_price", "current_price"]);
  const available = firstValue(product, ["available", "is_available", "in_stock"]);
  const stock = firstValue(product, ["stock", "stock_quantity", "quantity"]);
  const condition = firstValue(product, ["condition", "product_condition", "quality", "stock_type", "product_type"]);
  const image = firstValue(product, ["image", "image_url", "thumbnail", "main_image", "primary_image"]);
  const imageUrl = typeof image === "string" ? image : firstValue(image, ["url", "src", "original"]);
  const brand = firstValue(product, ["brand_name", "brand"], "");
  return {
    id: id === "" ? null : id,
    slug: String(firstValue(product, ["slug", "url_slug"], id || name)),
    name: String(name),
    carName: String(firstValue(product, ["car_name", "vehicle_name", "vehicle"], "")),
    category: categoryText,
    condition: String(condition || ""),
    status: available === false || available === 0 || available === "false" ? "ناموجود" : stock !== "" && Number(stock) <= 0 ? "ناموجود" : "استعلام موجودی",
    price: rawPrice === "" ? null : rawPrice,
    imageUrl: imageUrl || null,
    partNumber: String(firstValue(product, ["sku", "part_number", "technical_code", "code", "product_code"], "")),
    brand: String(brand || ""),
    description: String(firstValue(product, ["description", "short_description", "summary"], "")),
    source: "mixin-api-v4",
  };
}

function extractProducts(payload) {
  if (Array.isArray(payload)) return payload;
  for (const key of ["results", "products", "items", "data"]) {
    if (Array.isArray(payload?.[key])) return payload[key];
  }
  if (Array.isArray(payload?.data?.results)) return payload.data.results;
  if (Array.isArray(payload?.data?.products)) return payload.data.products;
  return [];
}

function getApiKey() {
  const apiKey = process.env.MAXICAR_API_KEY;
  if (!apiKey) {
    const error = new Error("کلید API برای محیط آزمایشی تنظیم نشده است.");
    error.code = "API_KEY_NOT_CONFIGURED";
    error.status = 503;
    throw error;
  }
  return apiKey;
}

async function apiGet(path, params) {
  const url = new URL(`${BASE_URL}/api/v4/${path}`);
  if (params) for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") url.searchParams.set(key, String(value));
  }
  const response = await fetch(url, {
    method: "GET",
    headers: { Authorization: `Api-Key ${getApiKey()}`, Accept: "application/json" },
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) {
    const error = new Error(`درخواست فروشگاه با وضعیت ${response.status} پاسخ داد.`);
    error.status = response.status;
    throw error;
  }
  return response.json();
}

export async function listProducts({ page = 1, pageSize = 50, search = "" } = {}) {
  const payload = await apiGet("products/", {
    page: Math.max(1, Number(page) || 1),
    page_size: Math.min(100, Math.max(1, Number(pageSize) || 50)),
    search: search.trim(),
  });
  const products = extractProducts(payload).map(normalizeProduct);
  return {
    products,
    count: firstValue(payload, ["count", "total", "total_count"], products.length),
    page: Math.max(1, Number(page) || 1),
    pageSize: Math.min(100, Math.max(1, Number(pageSize) || 50)),
  };
}

export async function getProduct(productId) {
  const payload = await apiGet(`products/${encodeURIComponent(String(productId))}/`);
  return normalizeProduct(payload);
}
