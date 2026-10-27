"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function CashbackAccountPage() {
  const [token, setToken] = useState("");
  const [items, setItems] = useState([]);
  const [message, setMessage] = useState("در حال بارگذاری...");
  const [busy, setBusy] = useState(false);
  async function load(accessToken) {
    const response = await fetch("/api/cashback/requests", { headers: { Authorization: "Bearer " + accessToken }, cache: "no-store" });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "دریافت اطلاعات ناموفق بود.");
    setItems(data.requests || data || []); setMessage("");
  }
  useEffect(() => {
    const value = localStorage.getItem("maxicar_access_token");
    if (!value) { window.location.href = "/login"; return; }
    setToken(value); load(value).catch(e => setMessage(e.message));
  }, []);
  async function requestRefund() {
    setBusy(true); setMessage("");
    try {
      const response = await fetch("/api/cashback/requests", { method: "POST", headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" }, body: JSON.stringify({}) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "ثبت درخواست انجام نشد.");
      await load(token); setMessage("درخواست شما ثبت شد و پس از بررسی مدیر اطلاع‌رسانی می‌شود.");
    } catch (e) { setMessage(e.message); }
    finally { setBusy(false); }
  }
  function logout() { localStorage.removeItem("maxicar_access_token"); localStorage.removeItem("maxicar_user_email"); window.location.href = "/login"; }
  const statuses = {pending:"در انتظار بررسی",processing:"در حال بررسی",paid:"پرداخت‌شده",rejected:"ردشده"};
  return <main dir="rtl" style={{maxWidth:900,margin:"40px auto",padding:"0 18px",color:"#182230"}}>
    <Link href="/" style={{color:"#173d70"}}>← فروشگاه ماکسیکار</Link>
    <h1>حساب کاربری و بازگشت وجه</h1>
    <p>درخواست بازگشت وجه فقط بر اساس سفارش‌های پرداخت‌شده و تأییدشده محاسبه می‌شود. مبلغ را شما وارد نمی‌کنید؛ سیستم آن را محاسبه می‌کند.</p>
    <button onClick={requestRefund} disabled={busy || !token} style={{background:"#173d70",color:"#fff",border:0,borderRadius:10,padding:"12px 20px",fontSize:15,cursor:"pointer"}}>{busy ? "در حال ثبت..." : "ثبت درخواست بازگشت وجه ماه جاری"}</button>
    <button onClick={logout} style={{marginRight:10,padding:"11px 16px",borderRadius:10,border:"1px solid #cbd5e1",background:"#fff"}}>خروج</button>
    {message && <p role="status" style={{background:"#f1f5f9",padding:12,borderRadius:8,marginTop:16}}>{message}</p>}
    <h2 style={{marginTop:32}}>سابقه درخواست‌ها</h2>
    {!items.length ? <p>درخواستی برای نمایش وجود ندارد.</p> : <div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse"}}><thead><tr>{["تاریخ","مبلغ خرید واجد شرایط","مبلغ بازگشت","وضعیت"].map(x=><th key={x} style={{textAlign:"right",padding:12,borderBottom:"1px solid #dbe2ea"}}>{x}</th>)}</tr></thead><tbody>{items.map((item,i)=><tr key={item.id||i}>{[item.period_month ? new Date(item.period_month).toLocaleDateString("fa-IR") : "—",item.eligible_purchase_toman ?? "—",item.amount_toman ?? "—",statuses[item.status] || item.status || "—"].map((v,j)=><td key={j} style={{padding:12,borderBottom:"1px solid #e8edf2"}}>{typeof v==="number"?v.toLocaleString("fa-IR")+" تومان":v}</td>)}</tr>)}</tbody></table></div>}
  </main>;
}