import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ChevronLeft, CarFront, Search } from "lucide-react";
import { cars, systems, products } from "../../data/catalog";

export function generateStaticParams() { return cars.map((car) => ({ car: car.slug })); }

export async function generateMetadata({ params }) {
  const { car: slug } = await params;
  const car = cars.find((item) => item.slug === slug);
  return { title: car ? car.name + " | قطعات یدکی ماکسیکار" : "خودرو | ماکسیکار", description: car?.intro || "دسته‌بندی قطعات نیسان در ماکسیکار." };
}

export default async function CarPage({ params }) {
  const { car: slug } = await params;
  const car = cars.find((item) => item.slug === slug);
  if (!car) notFound();
  const carProducts = products.filter((item) => item.car === car.slug);
  return <main className="innerPage"><header className="innerHeader"><div className="container innerHeaderRow"><Link href="/" className="brand"><span className="brandSymbol"><span>M</span></span><span className="brandWords"><b>ماکسیکار</b><small>مرجع تخصصی قطعات نیسان</small></span></Link><Link href="/" className="backHome"><ArrowLeft size={16}/> صفحه اصلی</Link></div></header>
    <div className="container breadcrumbs"><Link href="/">صفحه اصلی</Link><ChevronLeft size={14}/><span>{car.name}</span></div>
    <section className="carHero container"><div><span className="eyebrow">{car.en}</span><h1>قطعات {car.name.replace("نیسان ", "")}</h1><p>{car.intro}</p><Link className="primaryLink" href="/#search"><Search size={17}/> جست‌وجوی نام یا کد قطعه</Link></div><div className="carHeroIcon"><CarFront size={84} strokeWidth={1}/><span>خودرو / {car.slug.toUpperCase()}</span></div></section>
    <section className="container innerSection"><div className="sectionTitle"><div><span className="eyebrow">انتخاب گروه فنی</span><h2>قطعه در کدام سیستم قرار دارد؟</h2><p>برای دیدن نمونه قطعات و اطلاعات مرتبط، یک گروه را انتخاب کن.</p></div></div><div className="systemGrid innerSystems">{systems.map((system, i) => <Link href={"/cars/" + car.slug + "/" + system.slug} className="systemTile" key={system.slug}><span className="systemIndex">{String(i + 1).padStart(2, "0")}</span><span className="systemName">{system.name}</span><ChevronLeft size={17}/></Link>)}</div></section>
    <section className="container innerSection"><div className="sectionTitle"><div><span className="eyebrow">نمونه‌های قابل جست‌وجو</span><h2>قطعات مرتبط با {car.name.replace("نیسان ", "")}</h2></div></div>{carProducts.length ? <div className="simpleProductList">{carProducts.map((p) => <Link href={"/parts/" + p.slug} key={p.slug}><span className="listWrench">⌁</span><span><b>{p.name}</b><small>{p.condition} · {p.status}</small></span><ChevronLeft size={17}/></Link>)}</div> : <div className="emptyState">هنوز نمونه قطعه‌ای برای این خودرو تعریف نشده است.</div>}<p className="demoNotice">این صفحه نسخه آزمایشی است؛ فهرست واقعی قطعات و موجودی هنوز به سایت متصل نشده است.</p></section>
    <footer className="innerFooter"><div className="container footerBottom"><span>ماکسیکار · قطعات نیسان</span><Link href="/">بازگشت به صفحه اصلی</Link></div></footer>
  </main>;
}
