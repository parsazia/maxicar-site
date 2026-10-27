"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const statuses = {pending:"در انتظار بررسی",processing:"در حال بررسی",paid:"پرداخت‌شده",rejected:"ردشده"};
export default function AdminCashbackPage() {
  const [token,setToken] = useState("");
  const [items,setItems] = useState([]);
  const [message,setMessage] = useState("در حال بارگذاری...");
  const [busy,setBusy] = useState("");
  async function load(t) {
    const response = await fetch("/api/admin/cashback/requests?status=all",{headers:{Authorization:"Bearer "+t},cache:"no-store"});
    const data = await response.json();
    if(!response.ok) throw new Error(data.error || "دسترسی مدیر تأیید نشد.");
    setItems(data.requests || data || []); setMessage("");
  }
  useEffect(()=>{const t=localStorage.getItem("maxicar_access_token");if(!t){window.location.href="/login";return;}setToken(t);load(t).catch(e=>setMessage(e.message));},[]);
  async function change(id,status) {
    setBusy(id);setMessage("");
    try {
      const response=await fetch("/api/admin/cashback/requests",{method:"PATCH",headers:{Authorization:"Bearer "+token,"Content-Type":"application/json"},body:JSON.stringify({id,status})});
      const data=await response.json();if(!response.ok)throw new Error(data.error||"تغییر وضعیت ناموفق بود.");
      await load(token);setMessage("وضعیت درخواست به‌روزرسانی شد. انتقال وجه خودکار انجام نمی‌شود؛ پرداخت باید دستی انجام شود.");
    } catch(e){setMessage(e.message);} finally{setBusy("");}
  }
  return <main dir="rtl" style={{maxWidth:1100,margin:"40px auto",padding:"0 18px",color:"#182230"}}>
    <Link href="/" style={{color:"#173d70"}}>← فروشگاه</Link><h1>مدیریت درخواست‌های بازگشت وجه</h1>
    <p>این صفحه فقط برای حساب دارای نقش مدیر قابل استفاده است. وضعیت «پرداخت‌شده» را فقط پس از انجام واقعی پرداخت دستی انتخاب کنید.</p>
    {message&&<p role="status" style={{background:"#f1f5f9",padding:12,borderRadius:8}}>{message}</p>}
    {!items.length?<p>درخواستی برای نمایش وجود ندارد.</p>:<div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse"}}><thead><tr>{["مشتری","مبلغ بازگشت","وضعیت","اقدام"].map(x=><th key={x} style={{textAlign:"right",padding:12,borderBottom:"1px solid #dbe2ea"}}>{x}</th>)}</tr></thead><tbody>{items.map((item,i)=><tr key={item.id||i}><td style={{padding:12,borderBottom:"1px solid #e8edf2"}}>{item.user_id||item.customer_email||"—"}</td><td style={{padding:12,borderBottom:"1px solid #e8edf2"}}>{Number(item.cashback_amount||item.amount||0).toLocaleString("fa-IR")} تومان</td><td style={{padding:12,borderBottom:"1px solid #e8edf2"}}>{statuses[item.status]||item.status}</td><td style={{padding:12,borderBottom:"1px solid #e8edf2"}}><div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{item.status==="pending"&&<button disabled={!!busy} onClick={()=>change(item.id,"processing")}>شروع بررسی</button>}{["pending","processing"].includes(item.status)&&<><button disabled={!!busy} onClick={()=>change(item.id,"rejected")}>رد درخواست</button><button disabled={!!busy} onClick={()=>change(item.id,"paid")}>ثبت پرداخت دستی</button></>}</div></td></tr>)}</tbody></table></div>}
    <style jsx>{`button{padding:8px 12px;border:1px solid #cbd5e1;border-radius:8px;background:#fff;cursor:pointer}button:disabled{opacity:.5}`}</style>
  </main>;
}