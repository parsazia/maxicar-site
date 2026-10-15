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

function asText(value) {
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (Array.isArray(value)) return value.map(asText).filter(Boolean).join("، ");
  if (value && typeof value === "object") return String(firstValue(value, ["name", "title", "value", "label", "display_name", "url"], ""));
  return "";
}

function imageUrlFrom(value) {
  const raw = typeof value === "string" ? value : firstValue(value, ["image_url", "thumbnail_url", "url", "src", "original", "thumbnail", "image"], "");
  if (!raw || typeof raw !== "string") return null;
  if (raw.startsWith("/")) return new URL(raw, BASE_URL).toString();
  try {
    const parsed = new URL(raw);
    return ["http:", "https:"].includes(parsed.protocol) ? parsed.toString() : null;
  } catch {
    return null;
  }
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

function vehicleNames(product) {
  const text = [
    product?.name, product?.english_name, product?.description, product?.analysis,
    product?.main_category_name, product?.main_category?.name,
    product?.other_categories, product?.tags, product?.extra_fields
  ].map(asText).join(" ").toLowerCase();
  const found = [];
  if (/ماکسیما|maxima/.test(text)) found.push("ماکسیما");
  if (/مورانو|murano/.test(text)) found.push("مورانو");
  if (/تیانا|teana|teana/.test(text)) found.push("تیانا");
  return found;
}

export function normalizeProduct(input, imageOverride = null) {
  const product = unwrapProduct(input) || {};
  const id = firstValue(product, ["id", "product_id", "pk"]);
  const name = firstValue(product, ["name", "title", "product_name", "name_fa"], "محصول بدون نام");
  const categoryRaw = firstValue(product, ["main_category_name", "main_category", "category_name", "category", "categories", "other_categories", "category_names"], []);
  const categoryText = asText(categoryRaw);
  const rawPrice = firstValue(product, ["price", "final_price", "sale_price", "current_price"]);
  const availableRaw = firstValue(product, ["available", "is_available", "in_stock"], null);
  const stockRaw = firstValue(product, ["stock", "stock_quantity", "quantity", "inventory"], null);
  const stockTypeRaw = firstValue(product, ["stock_type", "availability", "product_condition", "condition", "quality"], "");
  const stockType = asText(stockTypeRaw).toLowerCase();
  const stockTypeMap = {
    unlimited: "نامحدود", limited: "محدود", contact: "تماس بگیرید",
    unavailable: "ناموجود", out_of_stock: "ناموجود", available: "موجود"
  };
  const condition = stockTypeMap[stockType] || asText(stockTypeRaw);
  const explicitlyUnavailable = availableRaw === false || availableRaw === 0 || availableRaw === "false" ||
    ["unavailable", "out_of_stock", "ناموجود"].includes(stockType);
  let status = "استعلام موجودی";
  if (explicitlyUnavailable) status = "ناموجود";
  else if (stockType === "unlimited" || stockType === "نامحدود") status = "موجودی نامحدود";
  else if (stockType === "limited" || stockType === "محدود") status = stockRaw !== null && stockRaw !== "" ? "موجودی محدود: " + stockRaw : "موجودی محدود";
  else if (stockType === "contact" || stockType === "تماس بگیرید") status = "تماس بگیرید";
  else if (availableRaw === true || availableRaw === 1 || availableRaw === "true") status = "موجود";
  else if (stockRaw !== null && stockRaw !== "" && Number(stockRaw) <= 0) status = "ناموجود";

  const images = firstValue(product, ["images", "product_images", "image_list"], []);
  const embeddedImage = Array.isArray(images)
    ? (images.find((image) => image?.default) || images[0])
    : images;
  const imageUrl = imageUrlFrom(imageOverride) || imageUrlFrom(firstValue(product, ["image_url", "thumbnail_url", "main_image", "primary_image", "image", "thumbnail"], "")) || imageUrlFrom(embeddedImage);
  const brandRaw = firstValue(product, ["brand_name", "brand"], "");
  const brand = asText(brandRaw);
  const vehicleList = vehicleNames(product);
  const carName = vehicleList.join("، ");
  const identifier = firstValue(product, ["product_identifier", "barcode", "sku", "part_number", "technical_code", "code", "product_code"], "");
  const description = firstValue(product, ["description", "short_description", "summary"], "");
  const tags = Array.isArray(product?.tags) ? product.tags.map(asText).filter(Boolean) : [];

  return {
    id: id === "" ? null : id,
    slug: String(firstValue(product, ["slug", "url_slug"], id || name)),
    name: String(name),
    carName,
    cars: vehicleList,
    category: categoryText,
    condition: condition || "",
    status,
    stock: stockRaw === null ? null : stockRaw,
    price: rawPrice === "" ? null : rawPrice,
    imageUrl,
    partNumber: asText(identifier),
    brand,
    description: asText(description),
    tags,
    source: "mixin-api-v4",
  };
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

async function loadImageMap() {
  try {
    const payload = await apiGet("product-images/", { page: 1, page_size: 1000 });
    const images = extractProducts(payload);
    const map = new Map();
    for (const image of images) {
      const productId = firstValue(image, ["product_id", "product", "productId"]);
      const url = imageUrlFrom(image);
      if (productId !== "" && url && !map.has(String(productId))) map.set(String(productId), url);
      else if (productId !== "" && url && image?.default) map.set(String(productId), url);
    }
    return map;
  } catch {
    return new Map();
  }
}

export async function listProducts({ page = 1, pageSize = 50, search = "" } = {}) {
  const normalizedPage = Math.max(1, Number(page) || 1);
  const normalizedPageSize = Math.min(100, Math.max(1, Number(pageSize) || 50));
  const [payload, imageMap] = await Promise.all([
    apiGet("products/", {
      page: normalizedPage,
      page_size: normalizedPageSize,
      search: search.trim(),
    }),
    loadImageMap(),
  ]);
  const rawProducts = extractProducts(payload);
  const products = rawProducts.map((product) => {
    const id = firstValue(product, ["id", "product_id", "pk"]);
    return normalizeProduct(product, imageMap.get(String(id)) || null);
  });
  return {
    products,
    count: firstValue(payload, ["count", "total", "total_count"], products.length),
    page: normalizedPage,
    pageSize: normalizedPageSize,
  };
}

export async function getProduct(productId) {
  const payload = await apiGet(`products/${encodeURIComponent(String(productId))}/`);
  const product = unwrapProduct(payload);
  const images = await apiGet("product-images/", { page: 1, page_size: 100, product_id: productId }).catch(() => null);
  const imageList = extractProducts(images);
  const defaultImage = imageList.find((image) => image?.default) || imageList[0] || null;
  return normalizeProduct(product, imageUrlFrom(defaultImage));
}
