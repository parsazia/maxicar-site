import { isAdmin, jsonError, requireUser } from "../../../../../lib/cashback-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request) {
  const auth = await requireUser(request);
  if (auth.error) return auth.error;
  try {
    if (!(await isAdmin(auth.user.id, auth.cfg))) return jsonError("دسترسی مدیر لازم است.", 403);
  } catch { return jsonError("بررسی دسترسی مدیر ناموفق بود.", 503); }

  const form = await request.formData();
  const file = form.get("file");
  if (!file || typeof file.arrayBuffer !== "function") return jsonError("فایل انتخاب نشده است.");
  const allowed = new Map([
    ["image/jpeg","jpg"],["image/png","png"],["image/webp","webp"],["image/avif","avif"],
    ["video/mp4","mp4"],["video/webm","webm"],
  ]);
  const ext = allowed.get(file.type);
  if (!ext) return jsonError("فرمت فایل پشتیبانی نمی‌شود.");
  if (file.size > 30 * 1024 * 1024) return jsonError("حجم فایل نباید بیشتر از ۳۰ مگابایت باشد.");
  const path = new Date().toISOString().slice(0,10) + "/" + crypto.randomUUID() + "." + ext;
  const bytes = Buffer.from(await file.arrayBuffer());
  const response = await fetch(auth.cfg.url + "/storage/v1/object/maxicar-campaign-media/" + path, {
    method: "POST",
    headers: { apikey: auth.cfg.service, Authorization: "Bearer " + auth.cfg.service, "Content-Type": file.type, "x-upsert": "false" },
    body: bytes,
    cache: "no-store",
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) return jsonError(data.message || "بارگذاری رسانه ناموفق بود.", 503);
  const mediaUrl = auth.cfg.url + "/storage/v1/object/public/maxicar-campaign-media/" + path;
  return Response.json({ url: mediaUrl, media_type: file.type.startsWith("video/") ? "video" : "image" }, { headers: { "Cache-Control": "no-store" } });
}
