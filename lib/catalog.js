import { cars, normalize, products as demoProducts, systems } from "../app/data/catalog.js";

export const MAX_CATALOG_ITEMS = 500;
const REQUEST_TIMEOUT_MS = 8000;

export function hasCatalogEndpoint() {
  return Boolean(process.env.MAXICAR_CATALOG_API_URL);
}

export function hasLiveCatalogConfig() {
  return Boolean(process.env.MAXICAR_CATALOG_API_URL && process.env.MAXICAR_CATALOG_API_TOKEN);
}

function getProductsEndpoint() {
  const raw = process.env.MAXICAR_CATALOG_API_URL;
  if (!raw) return null;

  const url = new URL(raw);
  if (url.protocol !== "https:" && !(process.env.NODE_ENV !== "production" && url.hostname === "localhost")) {
    throw new Error("Catalog endpoint must use HTTPS.");
  }
  if (!url.pathname.endsWith("/")) url.pathname += "/";
  return url;
}

function parsePrice(value) {
  if (value === null || value === undefined || value === "") return null;
  const ascii = String(value)
    .replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)))
    .replace(/[\s,٬،]/g, "");
  const parsed = Number(ascii);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function readLabel(value) {
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (value && typeof value === "object") return String(value.label ?? value.name ?? value.value ?? "");
  return "";
}

function inferCar(item, categoryName) {
  const raw = [
    item.carName, item.car_name, item.vehicle_name, item.car, item.vehicle,
    categoryName, item.name, item.english_name
  ].filter(Boolean).join(" ");
  const normalized = normalize(raw);
  if (normalized.includes("مورانو") || normalized.includes("murano")) return { slug: "murano", name: "نیسان مورانو" };
  if (normalized.includes("تیانا") || normalized.includes("teana")) return { slug: "teana", name: "نیسان تیانا" };
  if (normalized.includes("ماکسیما") || normalized.includes("مکسیم") || normalized.includes("maxima")) return { slug: "maxima", name: "نیسان ماکسیما" };
  return null;
}

function inferSystem(item, categoryName) {
  const raw = normalize([item.system, item.category_name, categoryName, item.name].filter(Boolean).join(" "));
  const match = systems.find((system) => system.terms.some((term) => raw.includes(normalize(term))));
  return match ?? null;
}

function readImage(item) {
  const candidate = item.image ?? item.image_url ?? item.thumbnail ??
    item.default_image?.image ?? item.default_image?.url ??
    item.images?.[0]?.image ?? item.images?.[0]?.url;
  return typeof candidate === "string" ? candidate.slice(0, 1000) : "";
}

export function normalizeProduct(item, index = 0) {
  if (!item || typeof item !== "object") return null;
  const name = String(item.name ?? item.title ?? item.name_fa ?? "").trim().slice(0, 180);
  if (!name) return null;

  const categoryName = readLabel(item.main_category ?? item.category ?? item.category_name);
  const car = inferCar(item, categoryName);
  const system = inferSystem(item, categoryName);
  const stockValue = String(item.stock_type?.value ?? item.stock_type ?? item.inventory_status ?? item.stock_status ?? "").toLowerCase();
  const stockLabel = readLabel(item.stock_type);
  const stockNumber = item.stock_number ?? item.stock;
  let status = String(item.status ?? item.inventory_status ?? "").trim();
  if (!status) {
    if (stockValue.includes("out_of_stock") || item.available === false) status = "ناموجود";
    else if (stockValue.includes("unlimited")) status = "موجود";
    else if (stockValue.includes("limited")) status = stockNumber ? `موجودی محدود: ${stockNumber}` : "موجودی محدود";
    else if (stockValue.includes("call")) status = "تماس بگیرید";
    else status = stockLabel || "استعلام موجودی";
  }

  const rawCondition = item.condition ?? item.extra_fields?.condition ?? item.extra_fields?.product_condition;
  const tags = Array.isArray(item.tags) ? item.tags.map((tag) => readLabel(tag?.value ?? tag)).filter(Boolean) : [];
  const conditionFromTags = tags.find((tag) => /استوک|کارکرده|دست.?دوم|نو|جدید/i.test(tag));
  const condition = String(rawCondition ?? conditionFromTags ?? "استعلام وضعیت").slice(0, 40);
  const aliases = [
    ...(Array.isArray(item.aliases) ? item.aliases : []),
    item.english_name,
    item.english_title
  ].filter((value) => typeof value === "string" && value.trim()).slice(0, 20);

  return {
    id: String(item.id ?? item.product_id ?? item.slug ?? index),
    slug: String(item.slug ?? item.id ?? item.product_id ?? `item-${index + 1}`),
    name,
    car: item.car_slug ?? item.car ?? item.vehicle ?? car?.slug ?? "",
    carName: item.carName ?? item.car_name ?? item.vehicle_name ?? car?.name ?? "",
    system: item.system ?? item.system_name ?? system?.name ?? categoryName,
    condition,
    status,
    partNumber: String(item.partNumber ?? item.part_number ?? item.product_identifier ?? item.barcode ?? item.sku ?? ""),
    price: item.show_price === false ? null : parsePrice(item.price ?? item.final_price ?? item.price_toman),
    image: readImage(item),
    note: String(item.note ?? item.short_description ?? item.description ?? "").slice(0, 500),
    aliases
  };
}

async function fetchApi(url) {
  const token = process.env.MAXICAR_CATALOG_API_TOKEN;
  if (!token) throw new Error("Catalog API token is not configured.");

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Api-Key ${token}`
    },
    cache: "no-store",
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
  });

  if (!response.ok) throw new Error(`Catalog API returned ${response.status}.`);
  return response.json();
}

export async function fetchLiveProducts() {
  const endpoint = getProductsEndpoint();
  if (!endpoint || !hasLiveCatalogConfig()) throw new Error("Live catalog is not configured.");

  endpoint.searchParams.set("page", "1");
  endpoint.searchParams.set("page_size", String(MAX_CATALOG_ITEMS));
  const payload = await fetchApi(endpoint);
  const sourceItems = Array.isArray(payload?.data)
    ? payload.data
    : Array.isArray(payload?.items)
      ? payload.items
      : Array.isArray(payload?.products)
        ? payload.products
        : Array.isArray(payload)
          ? payload
          : null;

  if (!sourceItems) throw new Error("Catalog API returned an unsupported response shape.");
  return sourceItems.slice(0, MAX_CATALOG_ITEMS)
    .map((item, index) => normalizeProduct(item, index))
    .filter(Boolean);
}

export async function fetchLiveProduct(id) {
  if (!/^\d+$/.test(String(id))) return null;
  const endpoint = getProductsEndpoint();
  if (!endpoint || !hasLiveCatalogConfig()) throw new Error("Live catalog is not configured.");

  endpoint.search = "";
  endpoint.pathname = `${endpoint.pathname.replace(/\/+$/, "")}/${encodeURIComponent(String(id))}/`;
  const payload = await fetchApi(endpoint);
  const item = payload?.data && !Array.isArray(payload.data) ? payload.data : payload?.product ?? null;
  return normalizeProduct(item, id);
}

export function getDemoProducts() {
  return demoProducts.map((item, index) => normalizeProduct(item, index)).filter(Boolean);
}

export function getDemoProduct(slug) {
  const product = demoProducts.find((item) => item.slug === String(slug));
  return product ? normalizeProduct(product, demoProducts.indexOf(product)) : null;
}

export function getCarForProduct(product) {
  return cars.find((car) => car.slug === product?.car) ??
    cars.find((car) => normalize(product?.carName ?? "").includes(normalize(car.name))) ??
    { slug: "maxima", name: product?.carName || "خودرو", en: "" };
}

export function getSystemForProduct(product) {
  return systems.find((system) => system.slug === product?.system) ??
    systems.find((system) => system.name === product?.system) ??
    { slug: "engine", name: product?.system || "قطعات یدکی" };
}
