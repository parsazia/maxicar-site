import {
  fetchProductCollection,
  previewOnlyResponse,
  rateLimitResponse,
  requireApiKeyResponse,
} from "../../../../lib/maxicar-catalog-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request) {
  const blocked = previewOnlyResponse();
  if (blocked) return blocked;

  const authError = requireApiKeyResponse(request, "MAXICAR_STAGING_API_KEY", "Api-Key");
  if (authError) return authError;

  const limited = rateLimitResponse(request, "catalog", 40);
  if (limited) return limited;

  const url = new URL(request.url);
  const query = {};
  for (const key of ["page", "page_size", "search"]) {
    const value = url.searchParams.get(key);
    if (value === null || value === "") continue;
    if (value.length > 120 || /[\\r\\n]/.test(value)) {
      return Response.json(
        { error: "invalid_query" },
        { status: 400, headers: { "Cache-Control": "no-store" } }
      );
    }
    query[key] = value;
  }

  if (query.page !== undefined && (!/^\\d+$/.test(query.page) || Number(query.page) < 1)) {
    return Response.json({ error: "invalid_page" }, { status: 400, headers: { "Cache-Control": "no-store" } });
  }
  if (query.page_size !== undefined && (!/^\\d+$/.test(query.page_size) || Number(query.page_size) < 1 || Number(query.page_size) > 100)) {
    return Response.json({ error: "invalid_page_size" }, { status: 400, headers: { "Cache-Control": "no-store" } });
  }

  try {
    return await fetchProductCollection(query);
  } catch (error) {
    return Response.json(
      { error: error.code || "upstream_unavailable" },
      { status: error.status || 502, headers: { "Cache-Control": "no-store" } }
    );
  }
}
