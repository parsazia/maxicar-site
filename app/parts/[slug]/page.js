import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ChevronLeft, ShieldCheck, Wrench, ClipboardCheck } from "lucide-react";
import { products } from "../../data/catalog.js";
import {
  fetchLiveProduct,
  getCarForProduct,
  getDemoProduct,
  getSystemForProduct,
  hasLiveCatalogConfig
} from "../../../lib/catalog.js";

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

async function resolveProduct(slug) {
  if (hasLiveCatalogConfig() && /^\\d+$/.test(String(slug))) {
    try {
      return await fetchLiveProduct(slug);
    } catch {
      return null;
    }
  }
  return getDemoProduct(slug);
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = await resolveProduct(slug);
  return {
    title: product ? product.name + " | ماکسیکار" : "قطعه یدکی | ماکسیکار",
    description: product ? product.name + "؛ بررسی مشخصات، سازگاری و وضعیت استعلام در ماکسیکار." : "اطلاعات قطعه یدکی در ماکسیکار."
  };
}

export default async function PartPage({ params }) {
  const { slug } = await params;
  const product = await resolveProduct(slug);
  if (!product) notFound();

  const liveProduct = hasLiveCatalogConfig() && /^\\d+$/.test(String(slug));
  const car = getCarForProduct(product);
  const system = getSystemForProduct(product);

  return <main className="innerPage">
    <header className="innerHeader"><div className="container innerHeaderRow">
      <Link href="/" className="brand"><span className="brandSymbol"><span>M</span></span><span className="brandWords"><b>ماکسیکار</b><small>مرجع تخصصی قطعات نیسان</small></span></Link>
      <Link href={car.slug ? "/cars/" + car.slug : "/"} className="backHome"><ArrowLeft size={16}/> بازگشت</Link>
    </div></header>
    <div className="container breadcrumbs">
      <Link href="/">صفحه اصلی</Link><ChevronLeft size={14}/>
      {car.slug ? <Link href={"/cars/" + car.slug}>{car.name}</Link> : <span>{car.name}</span>}
      <ChevronLeft size={14}/><span>{system.name}</span><ChevronLeft size={14}/><span>{product.name}</span>
    </div>
    <section className="container productDetail">
      <div className="detailVisual">
        <span className="partNumber">MAXICAR / PART DETAIL</span>
        {product.image ? <img src={product.image} alt={product.name} style={{maxWidth:"100%",maxHeight:"260px",objectFit:"contain"}}/> : <div className="detailIcon"><Wrench size={76} strokeWidth={1}/></div>}
        <span className="conditionBadge">{product.condition || "استعلام وضعیت"}</span>
        {!product.image && <small>تصویر واقعی قطعه پس از دریافت از سامانه نمایش داده می‌شود</small>}
      </div>
      <div className="detailContent">
        <span className="eyebrow">{[car.en, system.name].filter(Boolean).join(" / ")}</span>
        <h1>{product.name}</h1>
        <div className="statusPill"><span/> {product.status || "استعلام موجودی"}</div>
        {typeof product.price === "number" && product.price > 0 ? <h2>{new Intl.NumberFormat("fa-IR").format(product.price)} تومان</h2> : <p>قیمت: استعلام بگیرید</p>}
        <p className="detailIntro">{product.note || "پیش از سفارش، مشخصات، سازگاری با خودرو و موجودی قطعه باید تأیید شود."}</p>
        <div className="specTable">
          <div><span>خودرو</span><b>{car.name}</b></div>
          <div><span>گروه قطعه</span><b>{system.name}</b></div>
          <div><span>وضعیت قطعه</span><b>{product.condition || "استعلام وضعیت"}</b></div>
          <div><span>شماره فنی</span><b>{product.partNumber || "برای ثبت کد فنی نیاز به بررسی دارد"}</b></div>
        </div>
        <div className="detailWarning"><ShieldCheck size={20}/><span>پیش از ثبت سفارش، سازگاری با مدل و سال خودرو و وضعیت همان قطعه را تأیید کن.</span></div>
        <a className="primaryLink" href={"/#contact"}><ClipboardCheck size={17}/> راهنمای استعلام این قطعه</a>
        {liveProduct
          ? <p className="demoNotice">اطلاعات از سامانهٔ محصولات دریافت شده است. پیش از پرداخت یا نهایی‌کردن سفارش، موجودی و قیمت را تأیید کن.</p>
          : <p className="demoNotice">این صفحه نمونهٔ طراحی است و به‌تنهایی تأییدکنندهٔ قیمت، موجودی یا سازگاری قطعه نیست.</p>}
      </div>
    </section>
    <footer className="innerFooter"><div className="container footerBottom"><span>ماکسیکار · قطعات نیسان</span><Link href="/">بازگشت به صفحه اصلی</Link></div></footer>
  </main>;
}
