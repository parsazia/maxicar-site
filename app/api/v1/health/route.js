export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json({
    service: "maxicar-catalog-api",
    version: "v1",
    status: "ok",
    catalogMode: process.env.MAXICAR_CATALOG_API_URL && process.env.MAXICAR_CATALOG_API_TOKEN
      ? "configured"
      : "demo"
  }, {
    headers: {
      "Cache-Control": "no-store",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  });
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
