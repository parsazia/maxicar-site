"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronLeft, ShieldCheck, Wrench, ClipboardCheck } from "lucide-react";

function formatPrice(value) {
  if (value === null || value === undefined || value === "" || !Number.isFinite(Number(value))) return "برای قیمت روز استعلام بگیرید";
  return Number(value).toLocaleString("fa-IR") + " تومان";
}

export default function ProductDetail({ slug }) {
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [state, setState] = useState("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      if (!/^\d+$/.test(String(slug))) {
        setState("missing");
        return;
      }
      setState("loading");
      try {
        const response = await fetch("/api/catalog/products/" + encodeURIComponent(slug), {
          signal: controller.signal,
          cache: "no-store",
        });
        const payload = await response.json();
        if (response.status === 404) {
          setState("missing");
          return;
        }
        if (!response.ok) throw new Error(payload?.message || "دریافت اطلاعات محصول ناموفق بود.");
        const item = payload.product;
        setProduct(item);
        setState("ready");

        try {
          const listResponse = await fetch("/api/catalog/products?page=1&page_size=30", {
            signal: controller.signal,
            cache: "no-store",
          });
          if (listResponse.ok) {
            const listPayload = await listResponse.json();
            const items = Array.isArray(listPayload.products) ? listPayload.products : [];
            setRelated(items.filter((candidate) =>
              String(candidate.id) !== String(item.id) &&
              item.category && candidate.category === item.category
            ).slice(0, 3));
          }
        } catch {}
      } catch (e) {
        if (e.name === "AbortError") return;
        setError(e.message || "اتصال به فروشگاه برقرار نشد.");
        setState("error");
      }
    }
    load();
    return () => controller.abort();
  }, [slug]);

  return <main className="innerPage">
    <header className="innerHeader"><div className="container innerHeaderRow"><Link href="/" className="brand"><span className="brandSymbol"><span>M</span></span><span className="brandWords"><b>ماکسیکار</b><small>مرجع تخصصی قطعات نیسان</small></span></Link><Link href="/" className="backHome"><ArrowLeft size={16}/> بازگشت به جست‌وجوی قطعات</Link></div></header>
    {state === "loading" && <section className="container productDetail"><p>در حال دریافت اطلاعات محصول از فروشگاه…</p></section>}
    {state === "error" && <section className="container productDetail"><div className="detailContent"><h1>دریافت اطلاعات محصول ناموفق بود</h1><p className="detailIntro">{error}</p><Link href="/" className="primaryLink"><ArrowLeft size={16}/> بازگشت به جست‌وجو</Link></div></section>}
    {state === "missing" && <section className="container productDetail"><div className="detailContent"><h1>محصول پیدا نشد</h1><p className="detailIntro">این شناسه در فروشگاه موجود نیست یا لینک محصول معتبر نیست.</p><Link href="/" className="primaryLink"><ArrowLeft size={16}/> بازگشت به جست‌وجو</Link></div></section>}
    {state === "ready" && product && <>
      <div className="container breadcrumbs"><Link href="/">صفحه اصلی</Link><ChevronLeft size={14}/><span>{product.category || "قطعات نیسان"}</span><ChevronLeft size={14}/><span>{product.name}</span></div>
      <section className="container productDetail">
        <div className="detailVisual">
          <span className="partNumber">MAXICAR / PART {product.id}</span>
          {product.imageUrl ? <img src={product.imageUrl} alt={product.name} style={{width:"100%",maxHeight:360,objectFit:"contain",borderRadius:12}}/> : <div className="detailIcon"><Wrench size={76} strokeWidth={1}/></div>}
          <span className="conditionBadge">{product.condition || "وضعیت نیازمند استعلام"}</span>
          <small>{product.imageUrl ? "تصویر دریافت‌شده از اطلاعات محصول" : "برای دریافت عکس واقعی این قطعه از فروشگاه استعلام بگیرید"}</small>
        </div>
        <div className="detailContent">
          <span className="eyebrow">{product.carName || "قطعات نیسان"} / {product.category || "گروه ثبت‌نشده"}</span>
          <h1>{product.name}</h1>
          <div className="statusPill"><span/> {product.status}</div>
          <h2 style={{fontSize:"1.35rem",margin:"16px 0"}}>{formatPrice(product.price)}</h2>
          {product.description ? <p className="detailIntro">{product.description}</p> : <p className="detailIntro">اطلاعات محصول از فروشگاه دریافت شده است. پیش از سفارش، سازگاری قطعه با مدل خودرو و موجودی نهایی را تأیید کنید.</p>}
          <div className="specTable">
            <div><span>شناسه محصول</span><b>{product.id}</b></div>
            <div><span>گروه قطعه</span><b>{product.category || "ثبت نشده"}</b></div>
            <div><span>وضعیت قطعه</span><b>{product.condition || "ثبت نشده"}</b></div>
            <div><span>شماره فنی</span><b>{product.partNumber || "در اطلاعات دریافتی ثبت نشده"}</b></div>
            {product.brand && <div><span>برند</span><b>{product.brand}</b></div>}
          </div>
          <div className="detailWarning"><ShieldCheck size={20}/><span>قیمت و وضعیت موجودی را پیش از پرداخت از ماکسیکار تأیید کنید؛ وضعیت درج‌شده جایگزین تأیید سفارش نیست.</span></div>
          <a className="primaryLink" href="/#contact"><ClipboardCheck size={17}/> راهنمای استعلام این قطعه</a>
          <p className="demoNotice">این صفحه از API واقعی فروشگاه داده دریافت می‌کند. ثبت سفارش و پرداخت در این نسخه فعال نیست.</p>
        </div>
      </section>
      {related.length > 0 && <section className="container innerSection"><div className="sectionTitle"><div><span className="eyebrow">ادامه جست‌وجو</span><h2>قطعات مرتبط</h2></div></div><div className="simpleProductList">{related.map((item) => <Link href={"/parts/" + item.id} key={item.id}><span className="listWrench"><Wrench size={18}/></span><span><b>{item.name}</b><small>{item.condition || "استعلام وضعیت"} · {formatPrice(item.price)}</small></span><ChevronLeft size={17}/></Link>)}</div></section>}
    </>}
    <footer className="innerFooter"><div className="container footerBottom"><span>ماکسیکار · قطعات نیسان</span><Link href="/">بازگشت به صفحه اصلی</Link></div></footer>
  </main>;
}
