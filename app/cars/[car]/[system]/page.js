import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ChevronLeft, Wrench } from "lucide-react";
import { cars, systems, products } from "../../../data/catalog";

export function generateStaticParams() { return cars.flatMap((car) => systems.map((system) => ({ car: car.slug, system: system.slug }))); }

export async function generateMetadata({ params }) {
  const { car: carSlug, system: systemSlug } = await params;
  const car = cars.find((item) => item.slug === carSlug);
  const system = systems.find((item) => item.slug === systemSlug);
  return { title: car && system ? system.name + " " + car.name + " | ماکسیکار" : "دسته‌بندی قطعات | ماکسیکار", description: "دسته‌بندی نمونه قطعات " + (car?.name || "نیسان") + " در گروه " + (system?.name || "قطعات یدکی") + "." };
}

export default async function SystemPage({ params }) {
  const { car: carSlug, system: systemSlug } = await params;
  const car = cars.find((item) => item.slug === carSlug);
  const system = systems.find((item) => item.slug === systemSlug);
  if (!car || !system) notFound();
  const matches = products.filter((p) => p.car === car.slug && p.system === system.slug);
  return <main className="innerPage"><header className="innerHeader"><div className="container innerHeaderRow"><Link href="/" className="brand"><span className="brandSymbol"><span>M</span></span><span className="brandWords"><b>ماکسیکار</b><small>مرجع تخصصی قطعات نیسان</small></span></Link><Link href={"/cars/" + car.slug} className="backHome"><ArrowLeft size={16}/> بازگشت به {car.name.replace("نیسان ", "")}</Link></div></header>
    <div className="container breadcrumbs"><Link href="/">صفحه اصلی</Link><ChevronLeft size={14}/><Link href={"/cars/" + car.slug}>{car.name}</Link><ChevronLeft size={14}/><span>{system.name}</span></div>
    <section className="container systemHero"><span className="eyebrow">{car.en} / PART SYSTEM</span><h1>{system.name} {car.name.replace("نیسان ", "")}</h1><p>قطعات این گروه را بر اساس نام، شماره فنی و مشخصات خودرو بررسی کن. قبل از خرید، سازگاری قطعه باید تأیید شود.</p></section>
    <section className="container innerSection"><div className="sectionTitle"><div><span className="eyebrow">فهرست قطعات</span><h2>قطعات این گروه</h2></div></div>{matches.length ? <div className="simpleProductList">{matches.map((p) => <Link href={"/parts/" + p.slug} key={p.slug}><span className="listWrench"><Wrench size={18}/></span><span><b>{p.name}</b><small>{p.condition} · {p.status}</small></span><ChevronLeft size={17}/></Link>)}</div> : <div className="emptyState">برای این خودرو و گروه، هنوز قطعه‌ای در داده‌های آزمایشی ثبت نشده است. این به معنی ناموجود بودن قطعه در انبار نیست.</div>}<Link className="secondaryLink" href="/#search">جست‌وجوی همه نمونه‌ها <ArrowLeft size={16}/></Link><p className="demoNotice">داده‌های این صفحه نمونه هستند و هنوز از انبار یا سامانه مدیریت موجودی دریافت نمی‌شوند.</p></section>
    <footer className="innerFooter"><div className="container footerBottom"><span>ماکسیکار · قطعات نیسان</span><Link href="/">بازگشت به صفحه اصلی</Link></div></footer>
  </main>;
}
