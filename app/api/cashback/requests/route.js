import { currentMonthStart, jsonError, requireUser, supabaseConfig, supabaseRest } from "../../../../lib/cashback-server";

export const dynamic = "force-dynamic";
export async function GET(request) {
  const auth = await requireUser(request);
  if (auth.error) return auth.error;
  const { response, data } = await supabaseRest(auth.cfg, "cashback_requests?customer_id=eq." + encodeURIComponent(auth.user.id) + "&select=id,period_month,eligible_purchase_toman,rate_percent,amount_toman,status,customer_note,admin_note,created_at,updated_at,processed_at&order=created_at.desc");
  if (!response.ok) return jsonError("دریافت تاریخچه درخواست‌ها ممکن نشد. تنظیمات پایگاه داده را بررسی کنید.", 503);
  return Response.json({ requests: data || [] }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request) {
  const auth = await requireUser(request);
  if (auth.error) return auth.error;
  let body;
  try { body = await request.json(); } catch { return jsonError("درخواست نامعتبر است."); }
  const note = typeof body?.note === "string" ? body.note.slice(0, 1000) : "";
  const period = currentMonthStart();
  const { response, data } = await supabaseRest(auth.cfg, "rpc/submit_cashback_request", {
    method: "POST",
    body: JSON.stringify({ p_customer_id: auth.user.id, p_period_month: period, p_customer_note: note }),
  });
  if (!response.ok) {
    const reason = data?.message || data?.details || "";
    if (reason.includes("request_already_open")) return jsonError("برای ماه جاری درخواست بازی دارید.", 409);
    if (reason.includes("minimum_threshold_not_reached")) return jsonError("مجموع خرید واجد شرایط شما هنوز به حداقل سطح بازگشت وجه نرسیده است.", 422);
    if (reason.includes("current_month_only")) return jsonError("درخواست فقط برای ماه جاری امکان‌پذیر است.", 422);
    return jsonError("ثبت درخواست انجام نشد. احتمالاً پایگاه داده هنوز راه‌اندازی نشده است.", 503);
  }
  return Response.json({ request: data }, { status: 201, headers: { "Cache-Control": "no-store" } });
}
