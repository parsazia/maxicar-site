import crypto from "node:crypto";

const SOURCE_BASE = "https://maxicar.ir";
const WINDOW_MS = 60_000;
const buckets = new Map();

export function previewOnlyResponse() {
  if (process.env.VERCEL === "1" && process.env.VERCEL_ENV !== "preview") {
    return Response.json(
      { error: "preview_only" },
      { status: 404, headers: { "Cache-Control": "no-store" } }
    );
  }
  return null;
}

export function safeSecretEqual(a, b) {
  const left = Buffer.from(String(a || ""), "utf8");
  const right = Buffer.from(String(b || ""), "utf8");
  return left.length > 0 && left.length === right.length && crypto.timingSafeEqual(left, right);
}

export function rateLimitResponse(request, namespace, maximum) {
  const now = Date.now();
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = request.headers.get("x-real-ip") || forwarded || "unknown";
  const key = namespace + ":" + ip;
  let bucket = buckets.get(key);

  if (!bucket || bucket.until <= now) {
    bucket = { count: 0, until: now + WINDOW_MS };
  }

  bucket.count += 1;
  buckets.set(key, bucket);

  if (buckets.size > 10_000) {
    for (const [entryKey, entry] of buckets) {
      if (entry.until <= now) buckets.delete(entryKey);
    }
  }

  if (bucket.count <= maximum) return null;

  return Response.json(
    { error: "rate_limit_exceeded" },
    {
      status: 429,
      headers: {
        "Cache-Control": "no-store",
        "Retry-After": String(Math.max(1, Math.ceil((bucket.until - now) / 1000))),
      },
    }
  );
}

export function requireApiKeyResponse(request, envName, scheme) {
  const expected = process.env[envName];
  const authorization = request.headers.get("authorization") || "";
  const supplied = authorization.replace(new RegExp("^" + scheme + "\\s+", "i"), "");

  if (!expected) {
    return Response.json(
      { error: "api_key_not_configured" },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }

  if (!safeSecretEqual(supplied, expected)) {
    return Response.json(
      { error: "unauthorized" },
      { status: 401, headers: { "Cache-Control": "no-store" } }
    );
  }

  return null;
}

function sourceApiKey() {
  const key = process.env.MAXICAR_SOURCE_API_KEY;
  if (!key) {
    const error = new Error("The read-only source API key is not configured.");
    error.code = "SOURCE_API_KEY_NOT_CONFIGURED";
    error.status = 503;
    throw error;
  }
  return key;
}

async function fetchCatalog(path, query) {
  const url = new URL(path, SOURCE_BASE);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, String(value));
      }
    }
  }

  let upstream;
  try {
    upstream = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: "Api-Key " + sourceApiKey(),
        Accept: "application/json",
      },
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.timeout(15_000),
    });
  } catch {
    const error = new Error("The Maxicar catalog service is unavailable.");
    error.code = "UPSTREAM_UNAVAILABLE";
    error.status = 502;
    throw error;
  }

  const body = await upstream.text();
  const headers = new Headers({
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
  });
  const contentType = upstream.headers.get("content-type");
  if (contentType) headers.set("Content-Type", contentType);

  return new Response(body, { status: upstream.status, headers });
}

export function fetchProductCollection(query = {}) {
  return fetchCatalog("/api/v4/products/", query);
}

export function fetchProductDetail(productId) {
  const id = String(productId || "");
  if (!/^\\d+$/.test(id)) {
    const error = new Error("product_id_must_be_numeric");
    error.code = "INVALID_PRODUCT_ID";
    error.status = 400;
    throw error;
  }
  return fetchCatalog("/api/v4/products/" + encodeURIComponent(id) + "/");
}

export async function readProductCollection(query = {}) {
  const response = await fetchProductCollection(query);
  if (!response.ok) {
    const error = new Error("The Maxicar catalog returned HTTP " + response.status + ".");
    error.code = "UPSTREAM_HTTP_ERROR";
    error.status = response.status;
    throw error;
  }
  return response.json();
}

export async function readProductDetail(productId) {
  const response = await fetchProductDetail(productId);
  if (!response.ok) {
    const error = new Error("The Maxicar catalog returned HTTP " + response.status + ".");
    error.code = "UPSTREAM_HTTP_ERROR";
    error.status = response.status;
    throw error;
  }
  return response.json();
}
