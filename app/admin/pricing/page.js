"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const inputStyle = { width: "100%", boxSizing: "border-box", padding: "12px", border: "1px solid #cbd5e1", borderRadius: 10, font: "inherit", direction: "ltr" };
const buttonStyle = { padding: "11px 16px", border: 0, borderRadius: 10, background: "#145a86", color: "white", font: "inherit", fontWeight: 700, cursor: "pointer" };

function digits(value) {
  return String(value).replace(/[۰-۹]/g, d => "۰۱۲۳۴۵۶۷۸۹".indexOf(d)).replace(/[٠-٩]/g, d => "٠١٢٣٤٥٦٧٨٩".indexOf(d));
}
function parseRows(value) {
  const lines = value.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
  const items = [];
  for (const line of lines) {
    const match = line.match(/^\s*([0-9۰-۹٠-٩]+)[\t,;، ]+(.+?)\s*$/);
    if (!match) throw new Error("هر خط باید شامل شناسه محصول و قیمت پایه درهم باشد؛ نمونه: 153, 120");
    const id = digits(match[1]).trim();
    const amount = digits(match[2]).replace(/[\s,٬]/g, "");
    const basePriceAed = Number(amount);
    if (!/^\d+$/.test(id) || !Number.isFinite(basePriceAed) || basePriceAed <= 0) throw new Error("خط نامعتبر: " + line);
    items.push({ id, basePriceAed });
  }
  if (!items.length) throw new Error("حداقل یک محصول وارد کنید.");
  if (items.length > 100) throw new Error("در هر اجرا حداکثر ۱۰۰ محصول مجاز است.");
  if (new Set(items.map(x => x.id)).size !== items.length) throw new Error("شناسه تکراری وجود دارد؛ هر محصول را فقط یک‌بار وارد کنید.");
  return items;
}
function toman(value) {
  if (value === null || value === undefined || value === "") return "—";
  return Number(value).toLocaleString("fa-IR") + " تومان";
}

export default function PricingAdminPage() {
  const [rowsText, setRowsText] = useState("");
  const [rate, setRate] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sandboxStatus, setSandboxStatus] = useState(null);

  useEffect(() => {
    fetch("/api/pricing/status", { cache: "no-store" }).then(r => r.json()).then(setSandboxStatus).catch(() => setSandboxStatus({ canApply: false, message: "وضعیت API آزمایشی قابل بررسی نیست." }));
  }, []);

  async function getRate() {
    const response = await fetch("/api/pricing/rate", { cache: "no-store" });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "دریافت نرخ درهم ناموفق بود.");
    setRate(data);
    return data;
  }

  async function makePreview() {
    setBusy(true); setError(""); setResult(null); setPreview(null);
    try {
      const items = parseRows(rowsText);
      const response = await fetch("/api/pricing/preview", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ items }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "ساخت پیش‌نمایش ناموفق بود.");
      setRate(data.rate); setPreview({ ...data, items });
    } catch (e) { setError(e.message || "خطا در پیش‌نمایش."); }
    finally { setBusy(false); }
  }

  async function makeSavedPreview() {
    setBusy(true); setError(""); setResult(null); setPreview(null);
    try {
      const response = await fetch("/api/pricing/preview", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ useSaved: true }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "محاسبه قیمت‌های ذخیره‌شده ناموفق بود.");
      setRate(data.rate); setPreview({ ...data, items: data.results.filter(item => item.ok).map(item => ({ id: item.id, basePriceAed: item.basePriceAed })) });
    } catch (e) { setError(e.message || "خطا در پیش‌نمایش قیمت‌های ذخیره‌شده."); }
    finally { setBusy(false); }
  }

  async function applyPrices() {
    const valid = preview?.results?.filter(item => item.ok) || [];
    if (!valid.length) { setError("هیچ محصول واجد شرایطی برای اعمال قیمت وجود ندارد."); return; }
    const accepted = window.confirm("تأیید نهایی: قیمت " + valid.length + " محصول در فروشگاه آزمایشی تغییر می‌کند. سایت فعال maxicar.ir تغییر نمی‌کند. ادامه می‌دهید؟");
    if (!accepted) return;
    setBusy(true); setError(""); setResult(null);
    try {
      const response = await fetch("/api/pricing/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirm: true, expectedRateToman: preview.rate.rateToman, items: valid.map(item => ({ id: item.id, basePriceAed: item.basePriceAed })) }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "اعمال قیمت‌ها ناموفق بود.");
      setResult(data);
      setPreview(null);
    } catch (e) { setError(e.message || "اعمال قیمت‌ها ناموفق بود."); }
    finally { setBusy(false); }
  }

  return <main dir="rtl" style={{ minHeight: "100vh", background: "#f3f6fa", color: "#172033", padding: "24px 14px 60px" }}>
    <div style={{ maxWidth: 1050, margin: "0 auto" }}>
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 24 }}>
        <div><div style={{ color: "#17658f", fontWeight: 800, marginBottom: 6 }}>ماکسیکار · محیط آزمایشی</div><h1 style={{ margin: 0, fontSize: "clamp(1.5rem,4vw,2.1rem)" }}>مدیریت قیمت بر پایه درهم</h1></div>
        <Link href="/" style={{ color: "#145a86", fontWeight: 700, textDecoration: "none" }}>بازگشت به فروشگاه</Link>
      </header>
      {sandboxStatus && !sandboxStatus.canApply && <section role="status" style={{ background: "#fff7e6", border: "1px solid #ead29b", borderRadius: 14, padding: 14, marginBottom: 16, lineHeight: 1.9 }}><b>اعمال قیمت فعلاً قفل است.</b><div>{sandboxStatus.message}</div><div>سایت فعال maxicar.ir به‌هیچ‌وجه مقصد نوشتن این ابزار نیست.</div></section>}
      <section style={{ background: "white", border: "1px solid #dce4ed", borderRadius: 16, padding: 18, marginBottom: 16 }}>
        <h2 style={{ fontSize: "1.1rem", marginTop: 0 }}>۱. قیمت پایه محصولات</h2>
        <p style={{ lineHeight: 1.9, marginTop: 0 }}>در هر خط، شناسه محصول و قیمت پایه آن به درهم را وارد کنید. نمونه: <code dir="ltr">153, 120</code>. قیمت درهم باید قیمت پایه‌ای باشد که شما اعلام می‌کنید؛ از قیمت فعلی تومان به‌صورت خودکار استخراج نمی‌شود.</p>
        <textarea value={rowsText} onChange={e => setRowsText(e.target.value)} rows={7} placeholder={"153, 120\n154, 85.5\n155, 240"} style={{ ...inputStyle, direction: "ltr", textAlign: "left", resize: "vertical" }} />
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 }}>
          <button onClick={makePreview} disabled={busy} style={{ ...buttonStyle, opacity: busy ? .65 : 1 }}>{busy ? "در حال پردازش…" : "۲. پیش‌نمایش قیمت‌های واردشده"}</button>
          <button onClick={makeSavedPreview} disabled={busy} style={{ ...buttonStyle, background: "#17633c", opacity: busy ? .65 : 1 }}>{busy ? "در حال پردازش…" : "محاسبه مجدد قیمت‌های ذخیره‌شده"}</button>
          <button onClick={async () => { setError(""); try { await getRate(); } catch(e) { setError(e.message); } }} disabled={busy} style={{ ...buttonStyle, background: "#e8eef4", color: "#203449" }}>بررسی نرخ درهم</button>
        </div>
      </section>
      {rate && <section style={{ background: "white", border: "1px solid #dce4ed", borderRadius: 16, padding: 16, marginBottom: 16 }}>
        <b>نرخ فعلی دریافت‌شده از TGJU</b>
        <p style={{ marginBottom: 4, fontSize: "1.25rem", fontWeight: 800 }}>{toman(rate.rateToman)} برای هر درهم</p>
        <div style={{ color: "#59687a", fontSize: ".9rem", lineHeight: 1.8 }}>نرخ منبع: {Number(rate.sourceRateRial).toLocaleString("fa-IR")} ریال · زمان دریافت: {new Date(rate.fetchedAt).toLocaleString("fa-IR")}</div>
      </section>}
      {error && <div role="alert" style={{ background: "#fff0f0", border: "1px solid #f0b5b5", borderRadius: 12, padding: 14, marginBottom: 16, color: "#8d2020" }}>{error}</div>}
      {preview && <section style={{ background: "white", border: "1px solid #dce4ed", borderRadius: 16, padding: 16, marginBottom: 16 }}>
        <h2 style={{ marginTop: 0, fontSize: "1.1rem" }}>۳. بررسی پیش‌نمایش</h2>
        <p style={{ color: "#59687a", lineHeight: 1.8 }}>فقط محصولات دارای موجودی صریحاً تأییدشده قابل اعمال‌اند. قیمت فروش به مضرب ۵۰٬۰۰۰ تومان رو به بالا گرد می‌شود.</p>
        <div style={{ overflowX: "auto" }}><table style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
          <thead><tr>{["شناسه / محصول","قیمت پایه درهم","قیمت فعلی","قیمت پیشنهادی","وضعیت"].map(h => <th key={h} style={{ textAlign: "right", padding: 10, borderBottom: "1px solid #dce4ed", whiteSpace: "nowrap" }}>{h}</th>)}</tr></thead>
          <tbody>{preview.results.map(item => <tr key={item.id}>
            <td style={{ padding: 10, borderBottom: "1px solid #edf1f5" }}><b>{item.id}</b><div>{item.name || ""}</div></td>
            <td style={{ padding: 10, borderBottom: "1px solid #edf1f5" }}>{item.basePriceAed ?? "—"}</td>
            <td style={{ padding: 10, borderBottom: "1px solid #edf1f5" }}>{toman(item.currentPrice)}</td>
            <td style={{ padding: 10, borderBottom: "1px solid #edf1f5", fontWeight: 800 }}>{item.ok ? toman(item.salePriceToman) : "—"}</td>
            <td style={{ padding: 10, borderBottom: "1px solid #edf1f5", color: item.ok ? "#17633c" : "#a12828" }}>{item.ok ? "قابل اعمال · " + item.stockStatus : item.reason}</td>
          </tr>)}</tbody>
        </table></div>
        <button onClick={applyPrices} disabled={busy || !sandboxStatus?.canApply || !preview.results.some(item => item.ok)} style={{ ...buttonStyle, marginTop: 16, opacity: busy ? .65 : 1 }}>{busy ? "در حال اعمال…" : "۴. تأیید و اعمال قیمت‌های واجد شرایط"}</button>
      </section>}
      {result && <section style={{ background: "white", border: "1px solid #dce4ed", borderRadius: 16, padding: 16 }}>
        <h2 style={{ marginTop: 0 }}>گزارش اجرای قیمت‌گذاری</h2>
        <p>موفق: {result.results.filter(x => x.ok).length} · ناموفق یا ردشده: {result.results.filter(x => !x.ok).length}</p>
        <div style={{ display: "grid", gap: 8 }}>{result.results.map(item => <div key={item.id} style={{ padding: 12, borderRadius: 10, background: item.ok ? "#edf8f1" : "#fff0f0" }}>
          <b>محصول {item.id}{item.name ? " · " + item.name : ""}</b>
          <div>{item.ok ? "قیمت نهایی: " + toman(item.salePriceToman) : item.reason}</div>
        </div>)}</div>
      </section>}
      <footer style={{ marginTop: 22, color: "#59687a", fontSize: ".9rem", lineHeight: 1.9 }}>این ابزار فقط در استقرار آزمایشی فعال است. قیمت پایه درهم در فیلد اختصاصی محصول ذخیره می‌شود؛ اگر ساختار آن در API تأیید نشود، قیمت فروش نباید تغییر کند. سایت فعال maxicar.ir از این صفحه تغییر نمی‌کند.</footer>
    </div>
  </main>;
}
