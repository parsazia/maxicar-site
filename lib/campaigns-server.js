import { supabaseConfig, supabaseRest } from "./cashback-server";

export async function listPublicCampaigns(isMember = false) {
  const cfg = supabaseConfig();
  const now = new Date().toISOString();
  const audiences = isMember ? "all,members,maxima,teana,murano" : "all,maxima,teana,murano";
  const query = "campaigns?select=id,title,description,campaign_type,media_url,media_type,product_ids,discount_type,discount_value,audience,starts_at,ends_at,quantity_limit,sold_quantity&status=eq.published&stock_confirmed=eq.true&audience=in.(" + audiences + ")&starts_at=lte." + encodeURIComponent(now) + "&ends_at=gt." + encodeURIComponent(now) + "&order=created_at.desc";
  const { response, data } = await supabaseRest(cfg, query);
  if (!response.ok) throw new Error("دریافت پیشنهادهای فعال ناموفق بود.");
  return Array.isArray(data) ? data : [];
}

export function validateCampaign(input, requireStock = false) {
  const title = String(input?.title || "").trim();
  const description = String(input?.description || "").trim();
  const campaignType = String(input?.campaign_type || "story");
  const status = String(input?.status || "draft");
  const startsAt = new Date(input?.starts_at);
  const endsAt = new Date(input?.ends_at);
  const discountType = String(input?.discount_type || "percent");
  const discountValue = Number(input?.discount_value || 0);
  const productIds = Array.isArray(input?.product_ids) ? input.product_ids.slice(0, 20) : [];
  if (title.length < 2 || title.length > 120) throw new Error("عنوان باید بین ۲ تا ۱۲۰ نویسه باشد.");
  if (!["story","flash_sale","limited_deal","member_offer","bundle"].includes(campaignType)) throw new Error("نوع کمپین معتبر نیست.");
  if (!["draft","published","paused","archived"].includes(status)) throw new Error("وضعیت کمپین معتبر نیست.");
  if (!Number.isFinite(startsAt.getTime()) || !Number.isFinite(endsAt.getTime()) || endsAt <= startsAt) throw new Error("بازه زمانی کمپین معتبر نیست.");
  if (!["percent","fixed"].includes(discountType) || !Number.isFinite(discountValue) || discountValue < 0 || (discountType === "percent" && discountValue > 90)) throw new Error("مقدار تخفیف معتبر نیست.");
  if (!productIds.length) throw new Error("حداقل یک محصول باید انتخاب شود.");
  if (status === "published" && requireStock && input?.stock_confirmed !== true) throw new Error("برای انتشار، تأیید موجودی و امکان تأمین الزامی است.");
  const quantity = input?.quantity_limit === "" || input?.quantity_limit == null ? null : Number(input.quantity_limit);
  if (quantity !== null && (!Number.isInteger(quantity) || quantity < 1)) throw new Error("محدودیت تعداد معتبر نیست.");
  const audience = String(input?.audience || "all");
  if (!["all","members","maxima","teana","murano"].includes(audience)) throw new Error("مخاطب کمپین معتبر نیست.");
  return {
    title, description, campaign_type: campaignType, status,
    media_url: input?.media_url ? String(input.media_url).slice(0, 2000) : null,
    media_type: input?.media_type === "video" ? "video" : "image",
    product_ids: productIds,
    discount_type: discountType, discount_value: Math.round(discountValue),
    audience, starts_at: startsAt.toISOString(), ends_at: endsAt.toISOString(),
    quantity_limit: quantity, stock_confirmed: input?.stock_confirmed === true,
  };
}

export async function notifyCampaignSubscribers(cfg, campaign) {
  const audience = String(campaign?.audience || "all");
  const filter = audience === "all" ? "" : "&audience=eq." + encodeURIComponent(audience);
  const { response, data } = await supabaseRest(cfg, "campaign_subscriptions?select=customer_id" + filter);
  if (!response.ok) throw new Error("دریافت اعضای دنبال‌کننده ناموفق بود.");
  const ids = [...new Set((data || []).map(row => row.customer_id).filter(Boolean))];
  if (!ids.length) return 0;
  const rows = ids.map(customer_id => ({ customer_id, campaign_id: campaign.id }));
  const { response: insertResponse } = await supabaseRest(cfg, "campaign_notifications", {
    method: "POST",
    headers: { Prefer: "resolution=ignore-duplicates" },
    body: JSON.stringify(rows),
  });
  if (!insertResponse.ok) throw new Error("ثبت اعلان کمپین ناموفق بود.");
  return ids.length;
}
