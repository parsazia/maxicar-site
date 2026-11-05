import { previewOnlyResponse } from "../../../lib/maxicar-catalog-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const blocked = previewOnlyResponse();
  if (blocked) return blocked;

  return Response.json(
    {
      ok: true,
      service: "maxicar-site",
      mode: "read-only-preview",
      configured: {
        bridgeToken: Boolean(process.env.MAXICAR_BRIDGE_TOKEN),
        sourceApiKey: Boolean(process.env.MAXICAR_SOURCE_API_KEY),
        
        supabaseUrl: Boolean(process.env.SUPABASE_URL),
        supabaseAnonKey: Boolean(process.env.SUPABASE_ANON_KEY),
        supabaseServiceRoleKey: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
      },
      writable: false,
    },
    { headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } }
  );
}
