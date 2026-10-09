import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ChevronLeft, ShieldCheck, Wrench, ClipboardCheck } from "lucide-react";
import { getProduct, listProducts } from "../../../lib/mixin";

export const dynamic = "force-dynamic";

async function loadProduct(slug) {
  if (!/^\d+$/.test(String(slug))) return null;
  try {
    return await getProduct(slug);
  } catch (error) {
    if (error.status === 404) return null;
    throw error;
  }
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = await loadProduct(slug).catch(() => null);
  return {
    title: product ? product.name + " | ماکسیکار" : "قطعه یدکی | ماکسیکار",
    description: product ? product.name + "؛ بررسی قیمت، مشخصات و وضعیت قطعه در ماکسیکار." : "اطلاعات قطعه یدکی در ماکسیکار.",
    robots: { index: false, follow: false },
  };
}

export default async function PartPage({ params }) {
  const { slug } = await params;
  const product = await loadProduct(slug);
  if (!product) notFound();

  const category = product.category || "قطعات نیسان";
  let related = [];
  try {
    const result = await listProducts({ page: 1, pageSize: 12, search: "" });
    related = result.products.filter((item) => String(item.id) !== String(product.id) && item.category && item.category === product.category).slice(0, 3);
  } catch {
    related = [];
  }
  const price = product.price !== null && product.price !== undefined && product.price !== "" && Number.isFinite(Number(product.price))
    ? Number(product.price).toLocaleString("fa-IR") + " تومان"
    : "برای قیمت روز استعلام بگیرید";

  return <main className="innerPage">
    <header className="innerHeader"><div className="container innerHeaderRow"><Link href="/" className="brand"><span className="brandSymbol"><span>M</span></span><span className="brandWords"><b>ماکسیکار</b><small>مرجع تخصصی قطعات نیسان</small></span></Link><Link href="/" className="backHome"><ArrowLeft size={16}/> بازگشت به جست‌وجوی قطعات</Link></div></header>
    <div className="container breadcrumbs"><Link href="/">صفحه اصلی</Link><ChevronLeft size={14}/><span>{category}</span><ChevronLeft size={14}/><span>{product.name}</span></div>
    <section className="container productDetail">
      <div className="detailVisual">
        <span className="partNumber">MAXICAR / PART {product.id}</span>
        {product.imageUrl ? <img src={product.imageUrl} alt={product.name} style={{width:"100%",maxHeight:360,objectFit:"contain",borderRadius:12}}/> : <div className="detailIcon"><Wrench size={76} strokeWidth={1}/></div>}
        <span className="conditionBadge">{product.condition || "وضعیت نیازمند استعلام"}</span>
        <small>{product.imageUrl ? "تصویر دریافت‌شده از اطلاعات محصول" : "برای دریافت عکس واقعی این قطعه از فروشگاه استعلام بگیرید"}</small>
      </div>
      <div className="detailContent">
        <span className="eyebrow">{product.carName || "قطعات نیسان"} / {category}</span>
        <h1>{product.name}</h1>
        <div className="statusPill"><span/> {product.status}</div>
        <h2 style={{fontSize:"1.35rem",margin:"16px 0"}}>{price}</h2>
        {product.description ? <p className="detailIntro">{product.description}</p> : <p className="detailIntro">اطلاعات زیر مستقیماً از فروشگاه دریافت شده‌اند. پیش از سفارش، سازگاری قطعه با مدل خودرو و موجودی نهایی را تأیید کنید.</p>}
        <div className="specTable">
          <div><span>شناسه محصول</span><b>{product.id}</b></div>
          <div><span>خودرو / گروه</span><b>{product.carName || category}</b></div>
          <div><span>وضعیت قطعه</span><b>{product.condition || "ثبت نشده"}</b></div>
          <div><span>شماره فنی</span><b>{product.partNumber || "در اطلاعات دریافتی ثبت نشده"}</b></div>
          {product.brand && <div><span>برند</span><b>{product.brand}</b></div>}
        </div>
        <div className="detailWarning"><ShieldCheck size={20}/><span>قیمت و وضعیت موجودی را پیش از پرداخت از ماکسیکار تأیید کنید؛ وضعیت درج‌شده جایگزین تأیید سفارش نیست.</span></div>
        <a className="primaryLink" href="/#contact"><ClipboardCheck size={17}/> راهنمای استعلام این قطعه</a>
        <p className="demoNotice">این صفحه از API واقعی فروشگاه داده دریافت می‌کند. ثبت سفارش و پرداخت در این نسخه فعال نیست.</p>
      </div>
    </section>
    {related.length > 0 && <section className="container innerSection"><div className="sectionTitle"><div><span className="eyebrow">ادامه جست‌وجو</span><h2>قطعات مرتبط</h2></div></div><div className="simpleProductList">{related.map((item) => <Link href={"/parts/" + item.id} key={item.id}><span className="listWrench"><Wrench size={18}/></span><span><b>{item.name}</b><small>{item.condition || "استعلام وضعیت"} · {item.price !== null && item.price !== undefined ? Number(item.price).toLocaleString("fa-IR") + " تومان" : "استعلام قیمت"}</small></span><ChevronLeft size={17}/></Link>)}</div></section>}
    <footer className="innerFooter"><div className="container footerBottom"><span>ماکسیکار · قطعات نیسان</span><Link href="/">بازگشت به صفحه اصلی</Link></div></footer>
  </main>;
}
