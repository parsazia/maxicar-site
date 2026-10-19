"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, MapPin, PackageCheck, ShieldCheck } from "lucide-react";

const inputStyle = { width: "100%", boxSizing: "border-box", padding: "12px 14px", border: "1px solid #cbd5e1", borderRadius: 10, font: "inherit", background: "#fff", color: "#0f172a" };

function price(value) {
  if (value === null || value === undefined || value === "" || !Number.isFinite(Number(value))) return "نیازمند استعلام";
  return Number(value).toLocaleString("fa-IR") + " تومان";
}

export default function CheckoutPage() {
  const [product, setProduct] = useState(null);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [province, setProvince] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [shipping, setShipping] = useState("coordination");
  const [note, setNote] = useState("");

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("product");
    if (!id || !/^\d+$/.test(id)) {
      setError("محصول انتخاب‌شده معتبر نیست.");
      setStatus("error");
      return;
    }
    const controller = new AbortController();
    fetch("/api/catalog/products/" + encodeURIComponent(id), { cache: "no-store", signal: controller.signal })
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload?.message || "اطلاعات محصول دریافت نشد.");
        setProduct(payload.product);
        setStatus("ready");
      })
      .catch((e) => {
        if (e.name === "AbortError") return;
        setError(e.message || "دریافت اطلاعات محصول ناموفق بود.");
        setStatus("error");
      });
    return () => controller.abort();
  }, []);

  function continueToConfirmation(event) {
    event.preventDefault();
    if (!product) return;
    const shippingText = shipping === "post" ? "ارسال پستی (هزینه و امکان ارسال باید تأیید شود)" : shipping === "freight" ? "باربری (هزینه و امکان ارسال باید تأیید شود)" : "هماهنگی با ماکسیکار";
    const message = [
      "سلام، می‌خواهم خرید این محصول را از ماکسیکار پیگیری کنم.",
      "محصول: " + product.name,
      "شناسه محصول: " + product.id,
      "قیمت درج‌شده: " + price(product.price),
      "نام و نام خانوادگی: " + name.trim(),
      "شماره تماس: " + phone.trim(),
      "استان: " + province.trim(),
      "شهر: " + city.trim(),
      "نشانی: " + address.trim(),
      "کد پستی: " + (postalCode.trim() || "ثبت نشده"),
      "روش ارسال درخواستی: " + shippingText,
      "توضیحات: " + (note.trim() || "ندارد"),
      "لطفاً موجودی، مبلغ نهایی، هزینه ارسال و روش پرداخت را تأیید کنید. این پیام به معنی ثبت قطعی سفارش یا پرداخت نیست."
    ].join("\n");
    window.open("https://wa.me/989939161210?text=" + encodeURIComponent(message), "_blank", "noopener,noreferrer");
  }

  return <main className="innerPage">
    <header className="innerHeader"><div className="container innerHeaderRow"><Link href="/" className="brand"><span className="brandSymbol"><span>M</span></span><span className="brandWords"><b>ماکسیکار</b><small>مرجع تخصصی قطعات نیسان</small></span></Link><Link href="/" className="backHome"><ArrowRight size={16}/> بازگشت به فروشگاه</Link></div></header>
    <section className="container" style={{maxWidth:980,paddingTop:28,paddingBottom:56}}>
      <div style={{marginBottom:24}}><span className="eyebrow">تکمیل خرید</span><h1 style={{margin:"8px 0",fontSize:"clamp(1.5rem,4vw,2.2rem)"}}>اطلاعات سفارش و ارسال</h1><p className="detailIntro">اطلاعات تحویل را وارد کنید تا جزئیات خرید برای تأیید نهایی به ماکسیکار ارسال شود.</p></div>
      {status === "loading" && <p>در حال دریافت اطلاعات محصول…</p>}
      {status === "error" && <div className="detailWarning"><span>{error}</span><Link href="/">بازگشت به فروشگاه</Link></div>}
      {status === "ready" && product && <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,320px),1fr))",gap:22,alignItems:"start"}}>
        <form onSubmit={continueToConfirmation} style={{display:"grid",gap:18,padding:22,border:"1px solid #dbe4ee",borderRadius:16,background:"#fff"}}>
          <section><h2 style={{fontSize:"1.1rem",margin:"0 0 14px",display:"flex",alignItems:"center",gap:8}}><MapPin size={19}/> مشخصات تحویل</h2><div style={{display:"grid",gap:12}}>
            <label style={{display:"grid",gap:6}}>نام و نام خانوادگی<input required autoComplete="name" value={name} onChange={e=>setName(e.target.value)} placeholder="نام تحویل‌گیرنده" style={inputStyle}/></label>
            <label style={{display:"grid",gap:6}}>شماره تماس<input required autoComplete="tel" inputMode="tel" value={phone} onChange={e=>setPhone(e.target.value)} placeholder="شماره تماس در دسترس" style={inputStyle}/></label>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:10}}><label style={{display:"grid",gap:6}}>استان<input required value={province} onChange={e=>setProvince(e.target.value)} placeholder="استان" style={inputStyle}/></label><label style={{display:"grid",gap:6}}>شهر<input required value={city} onChange={e=>setCity(e.target.value)} placeholder="شهر" style={inputStyle}/></label></div>
            <label style={{display:"grid",gap:6}}>نشانی کامل<input required value={address} onChange={e=>setAddress(e.target.value)} placeholder="خیابان، کوچه، پلاک، واحد" style={inputStyle}/></label>
            <label style={{display:"grid",gap:6}}>کد پستی (اختیاری)<input value={postalCode} onChange={e=>setPostalCode(e.target.value)} inputMode="numeric" placeholder="کد پستی" style={inputStyle}/></label>
          </div></section>
          <section><h2 style={{fontSize:"1.1rem",margin:"0 0 12px",display:"flex",alignItems:"center",gap:8}}><PackageCheck size={19}/> روش ارسال درخواستی</h2><div style={{display:"grid",gap:10}}>
            {[["coordination","هماهنگی با ماکسیکار","روش مناسب پس از بررسی نوع قطعه و مقصد"],["post","ارسال پستی","در صورت امکان ارسال برای این قطعه"],["freight","باربری","برای قطعات حجیم یا سنگین، در صورت امکان"]].map(([value,label,desc])=><label key={value} style={{display:"flex",gap:10,alignItems:"flex-start",padding:12,border:"1px solid "+(shipping===value?"#1769aa":"#dbe4ee"),borderRadius:12,cursor:"pointer"}}><input type="radio" name="shipping" value={value} checked={shipping===value} onChange={()=>setShipping(value)} style={{marginTop:5}}/><span><b>{label}</b><small style={{display:"block",color:"#64748b",marginTop:4}}>{desc}</small></span></label>)}
          </div></section>
          <label style={{display:"grid",gap:6}}>توضیحات سفارش (اختیاری)<textarea rows={3} value={note} onChange={e=>setNote(e.target.value)} placeholder="نکته‌ای درباره تحویل یا قطعه" style={{...inputStyle,resize:"vertical"}}/></label>
          <button type="submit" className="primaryLink" style={{width:"100%",border:0,cursor:"pointer",justifyContent:"center"}}>ادامه و تأیید جزئیات با ماکسیکار <ArrowRight size={17}/></button>
        </form>
        <aside style={{display:"grid",gap:14}}>
          <div style={{padding:22,border:"1px solid #dbe4ee",borderRadius:16,background:"#f8fafc"}}>
            <h2 style={{fontSize:"1.1rem",margin:"0 0 16px"}}>خلاصه سفارش</h2>
            <div style={{display:"flex",gap:12,alignItems:"flex-start"}}><div style={{flex:1}}><b>{product.name}</b><small style={{display:"block",color:"#64748b",marginTop:6}}>شناسه محصول: {product.id}</small></div><b style={{whiteSpace:"nowrap"}}>{price(product.price)}</b></div>
            <div style={{borderTop:"1px solid #dbe4ee",marginTop:16,paddingTop:14,display:"flex",justifyContent:"space-between",gap:12}}><span>هزینه ارسال</span><b>پس از تأیید اعلام می‌شود</b></div>
            <p className="detailIntro" style={{marginTop:14,fontSize:".9rem"}}>مبلغ نهایی پس از تأیید موجودی، قیمت روز و هزینه ارسال مشخص می‌شود.</p>
          </div>
          <div style={{padding:18,border:"1px solid #f0d7a5",borderRadius:14,background:"#fffbeb"}}>
            <h3 style={{fontSize:"1rem",margin:"0 0 8px",display:"flex",alignItems:"center",gap:8}}><ShieldCheck size={18}/> وضعیت پرداخت</h3>
            <p style={{margin:0,lineHeight:1.9,fontSize:".92rem"}}>درگاه پرداخت آنلاین هنوز به این نسخه متصل نشده است. با ادامه، اطلاعات سفارش برای تأیید موجودی، مبلغ نهایی، ارسال و روش پرداخت در واتساپ آماده می‌شود؛ هنوز پولی دریافت نمی‌شود و سفارش قطعی نیست.</p>
          </div>
          <Link href={"/parts/"+product.id} style={{textDecoration:"none",color:"#1769aa",display:"inline-flex",alignItems:"center",gap:8}}>بازگشت به صفحه محصول</Link>
        </aside>
      </div>}
    </section>
    <footer className="innerFooter"><div className="container footerBottom"><span>ماکسیکار · قطعات نیسان</span><Link href="/">بازگشت به صفحه اصلی</Link></div></footer>
  </main>;
}
