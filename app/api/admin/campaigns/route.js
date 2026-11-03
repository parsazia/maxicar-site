import { isAdmin, jsonError, requireUser, supabaseRest } from "../../../../lib/cashback-server";
import { validateCampaign, notifyCampaignSubscribers } from "../../../../lib/campaigns-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function authorize(request) {
  const auth = await requireUser(request);
  if (auth.error) return { error: auth.error };
  let admin = false;
  try { admin = await isAdmin(auth.user.id, auth.cfg); } catch { return { error: jsonError("بررسی دسترسی مدیر ناموفق بود.", 503) }; }
  if (!admin) return { error: jsonError("دسترسی مدیر لازم است.", 403) };
  return { auth };
}

export async function GET(request) {
  const access = await authorize(request);
  if (access.error) return access.error;
  const { response, data } = await supabaseRest(access.auth.cfg, "campaigns?select=*&order=created_at.desc");
  if (!response.ok) return jsonError("دریافت کمپین‌ها ناموفق بود.", 503);
  const events = await supabaseRest(access.auth.cfg, "campaign_events?select=campaign_id,event_type");
  const counts = {};
  for (const event of (events.data || [])) {
    const row = counts[event.campaign_id] || (counts[event.campaign_id] = { views: 0, clicks: 0, orders: 0 });
    if (event.event_type === "view") row.views++;
    if (event.event_type === "click") row.clicks++;
    if (event.event_type === "order") row.orders++;
  }
  return Response.json({ campaigns: (data || []).map(c => ({ ...c, stats: counts[c.id] || { views: 0, clicks: 0, orders: 0 } })) }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request) {
  const access = await authorize(request);
  if (access.error) return access.error;
  let body;
  try { body = await request.json(); } catch { return jsonError("اطلاعات ارسالی معتبر نیست."); }
  let campaign;
  try { campaign = validateCampaign(body, true); } catch (error) { return jsonError(error.message); }
  const { response, data } = await supabaseRest(access.auth.cfg, "campaigns", {
    method: "POST", headers: { Prefer: "return=representation" },
    body: JSON.stringify({ ...campaign, created_by: access.auth.user.id }),
  });
  if (!response.ok) return jsonError(data?.message || "ذخیره کمپین ناموفق بود.", 503);
  const saved = data?.[0] || data;
  let notificationWarning = null;
  if (saved?.status === "published") {
    try { await notifyCampaignSubscribers(access.auth.cfg, saved); }
    catch { notificationWarning = "کمپین منتشر شد، اما ثبت اعلان دنبال‌کنندگان انجام نشد."; }
  }
  return Response.json({ campaign: saved, notificationWarning }, { status: 201, headers: { "Cache-Control": "no-store" } });
}

export async function PATCH(request) {
  const access = await authorize(request);
  if (access.error) return access.error;
  let body;
  try { body = await request.json(); } catch { return jsonError("اطلاعات ارسالی معتبر نیست."); }
  if (!/^[0-9a-f-]{36}$/i.test(body?.id || "")) return jsonError("شناسه کمپین معتبر نیست.");
  let campaign;
  try { campaign = validateCampaign(body, true); } catch (error) { return jsonError(error.message); }
  const { response, data } = await supabaseRest(access.auth.cfg, "campaigns?id=eq." + encodeURIComponent(body.id), {
    method: "PATCH", headers: { Prefer: "return=representation" }, body: JSON.stringify(campaign),
  });
  if (!response.ok) return jsonError(data?.message || "به‌روزرسانی کمپین ناموفق بود.", 503);
  if (!data?.length) return jsonError("کمپین پیدا نشد.", 404);
  let notificationWarning = null;
  if (data[0]?.status === "published") {
    try { await notifyCampaignSubscribers(access.auth.cfg, data[0]); }
    catch { notificationWarning = "کمپین منتشر شد، اما ثبت اعلان دنبال‌کنندگان انجام نشد."; }
  }
  return Response.json({ campaign: data[0], notificationWarning }, { headers: { "Cache-Control": "no-store" } });
}
