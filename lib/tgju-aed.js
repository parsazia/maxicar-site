const TGJU_AED_URL = "https://gem.tgju.org/profile/price_aed";

function normalizeDigits(value) {
  return String(value).replace(/[۰-۹]/g, (d) => "۰۱۲۳۴۵۶۷۸۹".indexOf(d))
    .replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d));
}

export async function getAedRate() {
  const response = await fetch(TGJU_AED_URL, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; MaxicarPricing/1.0)", "Accept-Language": "fa-IR,fa;q=0.9,en;q=0.5" },
    cache: "no-store",
    signal: AbortSignal.timeout(12000),
  });
  if (!response.ok) throw new Error(`دریافت نرخ درهم از TGJU ناموفق بود (HTTP ${response.status}).`);
  const html = await response.text();
  const text = normalizeDigits(html.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/&nbsp;|&#160;/gi, " ").replace(/&amp;/gi, "&").replace(/\s+/g, " "));
  const match = text.match(/در حال حاضر قیمت هر درهم امارات\s*([0-9][0-9,٬. ]*)\s*ریال/i);
  if (!match) throw new Error("قیمت درهم در صفحه TGJU با قالب مورد انتظار پیدا نشد؛ هیچ قیمتی تغییر داده نشد.");
  const rial = Number(match[1].replace(/[,.٬ ]/g, ""));
  if (!Number.isFinite(rial) || rial < 10000 || rial > 10000000) throw new Error("نرخ استخراج‌شده از TGJU خارج از محدوده معتبر است.");
  return {
    source: TGJU_AED_URL,
    sourceRateRial: rial,
    rateToman: rial / 10,
    fetchedAt: new Date().toISOString(),
    currency: "AED",
  };
}
