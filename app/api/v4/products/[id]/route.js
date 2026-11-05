import {
  fetchProductDetail,
  previewOnlyResponse,
  rateLimitResponse,
  requireApiKeyResponse,
} from "../../../../../lib/maxicar-catalog-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
  const blocked = previewOnlyResponse();
  if (blocked) return blocked;

  const authError = requireApiKeyResponse(request, "MAXICAR_BRIDGE_TOKEN", "Bearer");
  if (authError) return authError;

  const limited = rateLimitResponse(request, "catalog", 40);
  if (limited) return limited;

  const { id } = await params;
  if (!/^\d+$/.test(String(id || ""))) {
    return Response.json({ error: "route_not_allowed" }, { status: 404, headers: { "Cache-Control": "no-store" } });
  }

  try {
    return await fetchProductDetail(id);
  } catch (error) {
    return Response.json(
      { error: error.code || "upstream_unavailable" },
      { status: error.status || 502, headers: { "Cache-Control": "no-store" } }
    );
  }
}
