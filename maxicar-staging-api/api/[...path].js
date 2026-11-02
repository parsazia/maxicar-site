const crypto = require("node:crypto");

const SOURCE_BASE = "https://maxicar.ir";
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 40;
const buckets = new Map();

function equalSecret(a, b) {
  const x = Buffer.from(String(a || ""), "utf8");
  const y = Buffer.from(String(b || ""), "utf8");
  return x.length > 0 && x.length === y.length && crypto.timingSafeEqual(x, y);
}

function limited(req) {
  const now = Date.now();
  const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket?.remoteAddress || "unknown";
  let item = buckets.get(ip);
  if (!item || item.until <= now) item = { count: 0, until: now + WINDOW_MS };
  item.count += 1;
  buckets.set(ip, item);
  return item.count > MAX_REQUESTS;
}

module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");

  // This API is intentionally unavailable in Vercel Production.
  if (process.env.VERCEL === "1" && process.env.VERCEL_ENV !== "preview") {
    return res.status(404).json({ error: "preview_only" });
  }

  const pathname = new URL(req.url, "https://internal.invalid").pathname.replace(/\/+$/, "") || "/";
  if (pathname === "/api/health") {
    return res.status(200).json({
      ok: true,
      service: "maxicar-staging-api",
      mode: "read-only-preview",
      sourceConfigured: Boolean(process.env.MAXICAR_SOURCE_API_KEY),
      stagingKeyConfigured: Boolean(process.env.MAXICAR_STAGING_API_KEY),
      writable: false
    });
  }

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "read_only", message: "Only GET requests are supported." });
  }

  const stagingKey = process.env.MAXICAR_STAGING_API_KEY;
  const auth = String(req.headers.authorization || "");
  const supplied = auth.replace(/^Api-Key\s+/i, "");
  if (!stagingKey) return res.status(503).json({ error: "staging_key_not_configured" });
  if (!equalSecret(supplied, stagingKey)) return res.status(401).json({ error: "unauthorized" });
  if (limited(req)) return res.status(429).json({ error: "rate_limit_exceeded" });

  const productCollection = pathname === "/api/v4/products";
  const productDetail = /^\/api\/v4\/products\/\d+$/.test(pathname);
  if (!productCollection && !productDetail) {
    return res.status(404).json({ error: "route_not_allowed" });
  }

  const sourceKey = process.env.MAXICAR_SOURCE_API_KEY;
  if (!sourceKey) return res.status(503).json({ error: "source_api_key_not_configured" });

  const upstreamUrl = new URL(
    productDetail ? pathname.replace(/^\/api\/v4/, "/api/v4") + "/" : "/api/v4/products/",
    SOURCE_BASE
  );
  if (productCollection) {
    for (const key of ["page", "page_size", "search"]) {
      const value = req.query?.[key];
      if (value !== undefined && value !== "") {
        const text = String(value);
        if (text.length > 120 || /[\r\n]/.test(text)) return res.status(400).json({ error: "invalid_query" });
        upstreamUrl.searchParams.set(key, text);
      }
    }
  }

  try {
    const upstream = await fetch(upstreamUrl, {
      method: "GET",
      headers: {
        Authorization: "Api-Key " + sourceKey,
        Accept: "application/json"
      },
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.timeout(15_000)
    });
    const body = await upstream.text();
    res.status(upstream.status);
    res.setHeader("Content-Type", upstream.headers.get("content-type") || "application/json; charset=utf-8");
    return res.send(body);
  } catch {
    return res.status(502).json({ error: "upstream_unavailable" });
  }
};
