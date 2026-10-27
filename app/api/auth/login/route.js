import { jsonError, supabaseConfig } from "../../../../lib/cashback-server";

export async function POST(request) {
  let body;
  try { body = await request.json(); } catch { return jsonError("درخواست نامعتبر است."); }
  const email = String(body?.email || "").trim().toLowerCase();
  const password = String(body?.password || "");
  if (!email || !password) return jsonError("ایمیل و رمز عبور الزامی است.");
  let cfg;
  try { cfg = supabaseConfig(); } catch { return jsonError("پایگاه داده هنوز متصل نشده است.", 503); }
  const response = await fetch(cfg.url + "/auth/v1/token?grant_type=password", {
    method: "POST",
    headers: { apikey: cfg.anon, "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    cache: "no-store",
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) return jsonError(data.msg || data.message || "ورود ناموفق بود؛ اطلاعات را بررسی کنید.", 401);
  return Response.json(data, { headers: { "Cache-Control": "no-store" } });
}