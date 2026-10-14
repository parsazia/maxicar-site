const express = require("express");
const crypto = require("node:crypto");

const app = express();
app.disable("x-powered-by");
app.use(express.json({ limit: "256kb", strict: true }));

const BASE_URL = "https://maxicar.ir";
const MAX_BODY_BYTES = 256 * 1024;
const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 30;
const buckets = new Map();

function safeEqual(a, b) {
  const left = Buffer.from(String(a || ""), "utf8");
  const right = Buffer.from(String(b || ""), "utf8");
  return left.length > 0 && left.length === right.length && crypto.timingSafeEqual(left, right);
}

function requireBridgeToken(req, res, next) {
  const expected = process.env.MAXICAR_BRIDGE_TOKEN;
  const supplied = (req.get("authorization") || "").replace(/^Bearer\s+/i, "");
  if (!expected) return res.status(503).json({ error: "bridge_not_configured" });
  if (!safeEqual(supplied, expected)) return res.status(401).json({ error: "unauthorized" });
  return next();
}

function rateLimit(req, res, next) {
  const now = Date.now();
  const key = req.ip || req.socket.remoteAddress || "unknown";
  let bucket = buckets.get(key);
  if (!bucket || bucket.until <= now) {
    bucket = { count: 0, until: now + RATE_WINDOW_MS };
    buckets.set(key, bucket);
  }
  bucket.count += 1;
  if (bucket.count > RATE_MAX) {
    res.set("Retry-After", String(Math.ceil((bucket.until - now) / 1000)));
    return res.status(429).json({ error: "rate_limit_exceeded" });
  }
  return next();
}

function productsPath() {
  const path = process.env.MAXICAR_PRODUCTS_PATH || "";
  if (!path.startsWith("/api/v4/") || path.includes("..") || /[?#]/.test(path)) {
    const error = new Error("MAXICAR_PRODUCTS_PATH must be a verified relative path beginning /api/v4/.");
    error.code = "PRODUCTS_PATH_NOT_CONFIGURED";
    throw error;
  }
  return path.endsWith("/") ? path : path + "/";
}

async function upstream(method, path, query, body) {
  const apiKey = process.env.MAXICAR_API_KEY;
  if (!apiKey) {
    const error = new Error("The upstream API key is not configured.");
    error.code = "API_KEY_NOT_CONFIGURED";
    throw error;
  }
  const url = new URL(path, BASE_URL);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null && value !== "") url.searchParams.set(key, String(value));
    }
  }
  const response = await fetch(url, {
    method,
    headers: {
      Authorization: "Api-Key " + apiKey,
      Accept: "application/json",
      ...(body === undefined ? {} : { "Content-Type": "application/json" }),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    cache: "no-store",
    signal: AbortSignal.timeout(15_000),
    redirect: "error",
  });
  const text = await response.text();
  let data;
  try { data = text ? JSON.parse(text) : null; }
  catch { data = { message: "Upstream returned a non-JSON response." }; }
  if (!response.ok) {
    const error = new Error("Upstream API returned HTTP " + response.status + ".");
    error.status = response.status;
    error.upstream = data;
    throw error;
  }
  return data;
}

function rpcError(id, code, message) {
  return { jsonrpc: "2.0", id: id ?? null, error: { code, message } };
}

function toolResult(id, data) {
  return {
    jsonrpc: "2.0",
    id,
    result: { content: [{ type: "text", text: JSON.stringify(data) }] },
  };
}

const tools = [
  {
    name: "list_products",
    description: "Read products from the Maxicar Open API. Supports pagination and text search.",
    inputSchema: {
      type: "object",
      properties: {
        page: { type: "integer", minimum: 1, default: 1 },
        page_size: { type: "integer", minimum: 1, maximum: 100, default: 20 },
        search: { type: "string" },
      },
      additionalProperties: false,
    },
  },
  {
    name: "get_product",
    description: "Read one product by numeric product ID.",
    inputSchema: {
      type: "object",
      properties: { product_id: { type: ["string", "integer"], pattern: "^[0-9]+$" } },
      required: ["product_id"],
      additionalProperties: false,
    },
  },
  {
    name: "create_product",
    description: "Create a product through the Maxicar Open API. This changes live store data; call only when the user explicitly asks to create the product and has supplied the required fields.",
    inputSchema: {
      type: "object",
      properties: { product: { type: "object", additionalProperties: true } },
      required: ["product"],
      additionalProperties: false,
    },
  },
  {
    name: "update_product",
    description: "Update a product through the Maxicar Open API. This changes live store data; call only when the user explicitly asks for this specific update. Send only the fields that should change.",
    inputSchema: {
      type: "object",
      properties: {
        product_id: { type: ["string", "integer"], pattern: "^[0-9]+$" },
        changes: { type: "object", additionalProperties: true },
      },
      required: ["product_id", "changes"],
      additionalProperties: false,
    },
  },
];

async function callTool(name, args) {
  const base = productsPath();
  if (name === "list_products") {
    const page = Math.max(1, Number(args.page) || 1);
    const page_size = Math.min(100, Math.max(1, Number(args.page_size) || 20));
    return upstream("GET", base, { page, page_size, search: String(args.search || "").trim() });
  }
  if (name === "get_product") {
    const id = String(args.product_id || "");
    if (!/^\d+$/.test(id)) throw new Error("product_id must be numeric.");
    return upstream("GET", base + encodeURIComponent(id) + "/");
  }
  if (name === "create_product") {
    if (!args.product || typeof args.product !== "object" || Array.isArray(args.product)) throw new Error("product must be a JSON object.");
    return upstream("POST", base, undefined, args.product);
  }
  if (name === "update_product") {
    const id = String(args.product_id || "");
    if (!/^\d+$/.test(id)) throw new Error("product_id must be numeric.");
    if (!args.changes || typeof args.changes !== "object" || Array.isArray(args.changes) || !Object.keys(args.changes).length) throw new Error("changes must be a non-empty JSON object.");
    return upstream("PATCH", base + encodeURIComponent(id) + "/", undefined, args.changes);
  }
  throw new Error("Unknown tool: " + name);
}

app.get("/api/health", (_req, res) => {
  res.set("Cache-Control", "no-store");
  res.json({
    ok: true,
    service: "maxicar-management-mcp",
    mode: "product-management",
    configured: {
      bridgeToken: Boolean(process.env.MAXICAR_BRIDGE_TOKEN),
      apiKey: Boolean(process.env.MAXICAR_API_KEY),
      productsPath: Boolean(process.env.MAXICAR_PRODUCTS_PATH && process.env.MAXICAR_PRODUCTS_PATH.startsWith("/api/v4/")),
    },
  });
});

app.post("/mcp", rateLimit, requireBridgeToken, async (req, res) => {
  res.set("Cache-Control", "no-store");
  const message = req.body || {};
  const id = message.id;
  if (message.jsonrpc !== "2.0" || typeof message.method !== "string") {
    return res.status(400).json(rpcError(id, -32600, "Invalid JSON-RPC request."));
  }
  if (message.method === "notifications/initialized" || message.method === "notifications/cancelled") {
    return res.status(202).end();
  }
  if (message.method === "initialize") {
    return res.json({
      jsonrpc: "2.0",
      id,
      result: {
        protocolVersion: "2025-03-26",
        capabilities: { tools: { listChanged: false } },
        serverInfo: { name: "maxicar-management-mcp", version: "1.0.0" },
      },
    });
  }
  if (message.method === "ping") return res.json({ jsonrpc: "2.0", id, result: {} });
  if (message.method === "tools/list") {
    return res.json({ jsonrpc: "2.0", id, result: { tools } });
  }
  if (message.method === "tools/call") {
    const name = message.params?.name;
    const args = message.params?.arguments || {};
    try {
      const data = await callTool(name, args);
      return res.json(toolResult(id, data));
    } catch (error) {
      const status = error.status;
      const safe = {
        error: error.code || "UPSTREAM_API_ERROR",
        message: error.message || "The operation failed.",
        ...(status ? { upstreamStatus: status } : {}),
        ...(error.upstream ? { upstreamResponse: error.upstream } : {}),
      };
      return res.json({
        jsonrpc: "2.0",
        id,
        result: { isError: true, content: [{ type: "text", text: JSON.stringify(safe) }] },
      });
    }
  }
  return res.status(400).json(rpcError(id, -32601, "Method not found."));
});

app.get("/mcp", (_req, res) => {
  res.set("Allow", "POST");
  res.status(405).json({ error: "method_not_allowed", message: "Use POST for Streamable HTTP JSON-RPC requests." });
});

app.use((_req, res) => res.status(404).json({ error: "not_found" }));

module.exports = app;
