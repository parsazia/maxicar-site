import { isAdmin, jsonError, requireUser, supabaseRest } from "../../../../../lib/cashback-server";

export const dynamic = "force-dynamic";
export async function GET(request) {
  const auth = await requireUser(request);
  if (auth.error) return auth.error;
  let admin;
  try { admin = await isAdmin(auth.user.id, auth.cfg); } catch { return jsonError("بررسی سطح دسترسی مدیر ممکن نشد.", 503); }
  if (!admin) return jsonError("دسترسی مدیر لازم است.", 403);
  const url = new URL(request.url);
  const status = url.searchParams.get("status");
  const allowed = new Set(["pending", "processing", "paid", "rejected"]);
  const filter = status && allowed.has(status) ? "&status=eq." + status : "";
  const { response, data } = await supabaseRest(auth.cfg, "cashback_requests?select=*&order=created_at.asc" + filter);
  if (!response.ok) return jsonError("دریافت درخواست‌ها ممکن نشد؛ تنظیمات پایگاه داده را بررسی کنید.", 503);
  return Response.json({ requests: data || [] }, { headers: { "Cache-Control": "no-store" } });
}

export async function PATCH(request) {
  const auth = await requireUser(request);
  if (auth.error) return auth.error;
  let admin;
  try { admin = await isAdmin(auth.user.id, auth.cfg); } catch { return jsonError("بررسی سطح دسترسی مدیر ممکن نشد.", 503); }
  if (!admin) return jsonError("دسترسی مدیر لازم است.", 403);
  let body;
  try { body = await request.json(); } catch { return jsonError("درخواست نامعتبر است."); }
  if (!/^[0-9a-f-]{36}$/i.test(body?.id || "")) return jsonError("شناسه درخواست معتبر نیست.");
  if (!["processing", "paid", "rejected"].includes(body?.status)) return jsonError("وضعیت انتخاب‌شده معتبر نیست.");
  const note = typeof body?.note === "string" ? body.note.slice(0, 1000) : "";
  const { response, data } = await supabaseRest(auth.cfg, "rpc/admin_update_cashback_request", {
    method: "POST",
    body: JSON.stringify({ p_request_id: body.id, p_actor_id: auth.user.id, p_new_status: body.status, p_admin_note: note }),
  });
  if (!response.ok) {
    const reason = data?.message || "";
    if (reason.includes("invalid_transition") || reason.includes("request_closed")) return jsonError("این تغییر وضعیت مجاز نیست.", 409);
    if (reason.includes("request_not_found")) return jsonError("درخواست پیدا نشد.", 404);
    return jsonError("تغییر وضعیت انجام نشد؛ تنظیمات پایگاه داده را بررسی کنید.", 503);
  }
  return Response.json({ request: data }, { headers: { "Cache-Control": "no-store" } });
}
