import { jsonError, supabaseConfig } from "@/lib/cashback-server";

export async function POST(request) {
  let body;
  try { body = await request.json(); } catch { return jsonError("درخواست نامعتبر است."); }
  const email = String(body?.email || "").trim().toLowerCase();
  const password = String(body?.password || "");
  if (!email || password.length < 8) return jsonError("ایمیل معتبر و رمز عبور حداقل ۸ کاراکتری وارد کنید.");
  let cfg;
  try { cfg = supabaseConfig(); } catch { return jsonError("پایگاه داده هنوز متصل نشده است.", 503); }
  const response = await fetch(cfg.url + "/auth/v1/signup", {
    method: "POST",
    headers: { apikey: cfg.anon, "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    cache: "no-store",
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) return jsonError(data.msg || data.message || "ثبت‌نام انجام نشد.", 400);
  return Response.json(data, { status: 201, headers: { "Cache-Control": "no-store" } });
}