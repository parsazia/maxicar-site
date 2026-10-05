import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ChevronLeft, ShieldCheck, Wrench, ClipboardCheck } from "lucide-react";
import { cars, systems, products } from "../../data/catalog";

export function generateStaticParams() { return products.map((product) => ({ slug: product.slug })); }

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = products.find((item) => item.slug === slug);
  return { title: product ? product.name + " | ماکسیکار" : "قطعه یدکی | ماکسیکار", description: product ? product.name + "؛ بررسی مشخصات، سازگاری و وضعیت استعلام در ماکسیکار." : "اطلاعات قطعه یدکی در ماکسیکار." };
}

export default async function PartPage({ params }) {
  const { slug } = await params;
  const product = products.find((item) => item.slug === slug);
  if (!product) notFound();
  const car = cars.find((item) => item.slug === product.car);
  const system = systems.find((item) => item.slug === product.system);
  const related = products.filter((item) => item.slug !== product.slug && item.car === product.car).slice(0, 3);
  return <main className="innerPage"><header className="innerHeader"><div className="container innerHeaderRow"><Link href="/" className="brand"><span className="brandSymbol"><span>M</span></span><span className="brandWords"><b>ماکسیکار</b><small>مرجع تخصصی قطعات نیسان</small></span></Link><Link href={"/cars/" + car.slug} className="backHome"><ArrowLeft size={16}/> بازگشت به خودرو</Link></div></header>
    <div className="container breadcrumbs"><Link href="/">صفحه اصلی</Link><ChevronLeft size={14}/><Link href={"/cars/" + car.slug}>{car.name}</Link><ChevronLeft size={14}/><Link href={"/cars/" + car.slug + "/" + system.slug}>{system.name}</Link><ChevronLeft size={14}/><span>{product.name}</span></div>
    <section className="container productDetail"><div className="detailVisual"><span className="partNumber">MAXICAR / PART DETAIL</span><div className="detailIcon"><Wrench size={76} strokeWidth={1}/></div><span className="conditionBadge">{product.condition}</span><small>تصویر قطعه پس از ثبت عکس واقعی نمایش داده می‌شود</small></div><div className="detailContent"><span className="eyebrow">{car.en} / {system.name}</span><h1>{product.name}</h1><div className="statusPill"><span/> {product.status}</div><p className="detailIntro">{product.note}</p><div className="specTable"><div><span>خودرو</span><b>{car.name}</b></div><div><span>گروه قطعه</span><b>{system.name}</b></div><div><span>وضعیت قطعه</span><b>{product.condition}</b></div><div><span>شماره فنی</span><b>{product.partNumber}</b></div></div><div className="detailWarning"><ShieldCheck size={20}/><span>پیش از ثبت سفارش، سازگاری با مدل و سال خودرو و وضعیت همان قطعه را تأیید کن.</span></div><a className="primaryLink" href="/#contact"><ClipboardCheck size={17}/> راهنمای استعلام این قطعه</a><p className="demoNotice">این صفحه نمونه طراحی است. قیمت، موجودی، عکس واقعی و کد فنی هنوز از داده‌های تأییدشده دریافت نمی‌شوند؛ برای خرید واقعی از این صفحه استفاده نکن.</p></div></section>
    {related.length > 0 && <section className="container innerSection"><div className="sectionTitle"><div><span className="eyebrow">ادامه جست‌وجو</span><h2>نمونه قطعات مرتبط</h2></div></div><div className="simpleProductList">{related.map((p) => <Link href={"/parts/" + p.slug} key={p.slug}><span className="listWrench"><Wrench size={18}/></span><span><b>{p.name}</b><small>{p.condition} · {p.status}</small></span><ChevronLeft size={17}/></Link>)}</div></section>}
    <footer className="innerFooter"><div className="container footerBottom"><span>ماکسیکار · قطعات نیسان</span><Link href="/">بازگشت به صفحه اصلی</Link></div></footer>
  </main>;
}
