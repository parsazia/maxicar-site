const required = ["SUPABASE_URL", "SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY"];
export function supabaseConfig() {
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length) throw new Error("Supabase environment variables missing: " + missing.join(", "));
  return {
    url: process.env.SUPABASE_URL.replace(/\/$/, ""),
    anon: process.env.SUPABASE_ANON_KEY,
    service: process.env.SUPABASE_SERVICE_ROLE_KEY,
  };
}
export function jsonError(message, status = 400) {
  return Response.json({ error: message }, { status, headers: { "Cache-Control": "no-store" } });
}
export async function requireUser(request) {
  const token = request.headers.get("authorization")?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) return { error: jsonError("برای ادامه وارد حساب کاربری شوید.", 401) };
  let cfg;
  try { cfg = supabaseConfig(); } catch { return { error: jsonError("احراز هویت هنوز پیکربندی نشده است.", 503) }; }
  const response = await fetch(cfg.url + "/auth/v1/user", {
    headers: { apikey: cfg.anon, Authorization: "Bearer " + token },
    cache: "no-store",
  });
  if (!response.ok) return { error: jsonError("نشست معتبر نیست؛ دوباره وارد شوید.", 401) };
  const user = await response.json();
  if (!user?.id) return { error: jsonError("نشست معتبر نیست.", 401) };
  return { user, cfg };
}
export async function isAdmin(userId, cfg) {
  const response = await fetch(cfg.url + "/rest/v1/profiles?id=eq." + encodeURIComponent(userId) + "&select=role&limit=1", {
    headers: { apikey: cfg.service, Authorization: "Bearer " + cfg.service },
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Could not verify administrator role");
  const rows = await response.json();
  return rows?.[0]?.role === "admin";
}
export async function supabaseRest(cfg, path, options = {}) {
  const response = await fetch(cfg.url + "/rest/v1/" + path, {
    ...options,
    cache: "no-store",
    headers: {
      apikey: cfg.service,
      Authorization: "Bearer " + cfg.service,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  const text = await response.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  return { response, data };
}
export function currentMonthStart() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString().slice(0, 10);
}
