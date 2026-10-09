import { GET as getProduct } from "../../../catalog/[id]/route.js";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request, context) {
  return getProduct(request, context);
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400"
    }
  });
}
