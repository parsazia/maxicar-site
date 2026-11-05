import {
  previewOnlyResponse,
  rateLimitResponse,
  readProductCollection,
  readProductDetail,
  safeSecretEqual,
} from "../../../lib/maxicar-catalog-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 256 * 1024;

const tools = [
  {
    name: "list_products",
    description: "Read products from the Maxicar catalog. Supports pagination and text search.",
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
      properties: {
        product_id: { type: ["string", "integer"], pattern: "^[0-9]+$" },
      },
      required: ["product_id"],
      additionalProperties: false,
    },
  },
];

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

function requireBridgeToken(request) {
  const expected = process.env.MAXICAR_BRIDGE_TOKEN;
  const supplied = (request.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  if (!expected) {
    return Response.json({ error: "bridge_not_configured" }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
  if (!safeSecretEqual(supplied, expected)) {
    return Response.json({ error: "unauthorized" }, { status: 401, headers: { "Cache-Control": "no-store" } });
  }
  return null;
}

async function callTool(name, args) {
  if (!args || typeof args !== "object" || Array.isArray(args)) {
    throw Object.assign(new Error("Tool arguments must be an object."), { code: "INVALID_ARGUMENTS" });
  }

  if (name === "list_products") {
    const page = Math.max(1, Number(args.page) || 1);
    const page_size = Math.min(100, Math.max(1, Number(args.page_size) || 20));
    const search = String(args.search || "").trim();
    if (search.length > 120 || /[\r\n]/.test(search)) {
      throw Object.assign(new Error("Search text is invalid."), { code: "INVALID_SEARCH" });
    }
    return readProductCollection({ page, page_size, search });
  }

  if (name === "get_product") {
    const id = String(args.product_id || "");
    if (!/^\d+$/.test(id)) {
      throw Object.assign(new Error("product_id must be numeric."), { code: "INVALID_PRODUCT_ID" });
    }
    return readProductDetail(id);
  }

  throw Object.assign(new Error("Unknown tool: " + name), { code: "UNKNOWN_TOOL" });
}

export async function POST(request) {
  const blocked = previewOnlyResponse();
  if (blocked) return blocked;

  const limited = rateLimitResponse(request, "mcp", 30);
  if (limited) return limited;

  const authError = requireBridgeToken(request);
  if (authError) return authError;

  const declaredLength = Number(request.headers.get("content-length") || 0);
  if (declaredLength > MAX_BODY_BYTES) {
    return Response.json({ error: "payload_too_large" }, { status: 413, headers: { "Cache-Control": "no-store" } });
  }

  let message;
  try {
    const raw = await request.text();
    if (Buffer.byteLength(raw, "utf8") > MAX_BODY_BYTES) {
      return Response.json({ error: "payload_too_large" }, { status: 413, headers: { "Cache-Control": "no-store" } });
    }
    message = JSON.parse(raw);
  } catch {
    return Response.json(rpcError(null, -32700, "Invalid JSON body."), { status: 400, headers: { "Cache-Control": "no-store" } });
  }

  const id = message?.id;
  if (message?.jsonrpc !== "2.0" || typeof message?.method !== "string") {
    return Response.json(rpcError(id, -32600, "Invalid JSON-RPC request."), { status: 400, headers: { "Cache-Control": "no-store" } });
  }

  const headers = { "Cache-Control": "no-store" };

  if (message.method === "notifications/initialized" || message.method === "notifications/cancelled") {
    return new Response(null, { status: 202, headers });
  }
  if (message.method === "initialize") {
    return Response.json({
      jsonrpc: "2.0",
      id,
      result: {
        protocolVersion: "2025-03-26",
        capabilities: { tools: { listChanged: false } },
        serverInfo: { name: "maxicar-management-mcp", version: "1.0.0" },
      },
    }, { headers });
  }
  if (message.method === "ping") {
    return Response.json({ jsonrpc: "2.0", id, result: {} }, { headers });
  }
  if (message.method === "tools/list") {
    return Response.json({ jsonrpc: "2.0", id, result: { tools } }, { headers });
  }
  if (message.method === "tools/call") {
    try {
      const data = await callTool(message.params?.name, message.params?.arguments || {});
      return Response.json(toolResult(id, data), { headers });
    } catch (error) {
      const safe = {
        error: error.code || "UPSTREAM_API_ERROR",
        message: error.message || "The operation failed.",
        ...(error.status ? { upstreamStatus: error.status } : {}),
      };
      return Response.json({
        jsonrpc: "2.0",
        id,
        result: { isError: true, content: [{ type: "text", text: JSON.stringify(safe) }] },
      }, { headers });
    }
  }

  return Response.json(rpcError(id, -32601, "Method not found."), { status: 400, headers });
}

export async function GET() {
  const blocked = previewOnlyResponse();
  if (blocked) return blocked;
  return Response.json(
    { error: "method_not_allowed", message: "Use POST for Streamable HTTP JSON-RPC requests." },
    { status: 405, headers: { "Allow": "POST", "Cache-Control": "no-store" } }
  );
}
