"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronLeft, Wrench } from "lucide-react";
import { cars, systems, normalize } from "../data/catalog";

export default function CarParts({ slug, systemSlug = "" }) {
  const [items, setItems] = useState([]);
  const [state, setState] = useState("loading");
  const [error, setError] = useState("");
  const car = cars.find((item) => item.slug === slug);
  const system = systems.find((item) => item.slug === systemSlug);

  useEffect(() => {
    const controller = new AbortController();
    Promise.all([1, 2].map(async (page) => {
      const response = await fetch("/api/catalog/products?page=" + page + "&page_size=100", { cache: "no-store", signal: controller.signal });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.message || "دریافت محصولات ناموفق بود.");
      return Array.isArray(payload.products) ? payload.products : [];
    })).then((pages) => {
      setItems(pages.flat().filter((item, index, all) => item.id && all.findIndex((other) => String(other.id) === String(item.id)) === index));
      setState("ready");
    }).catch((e) => {
      if (e.name === "AbortError") return;
      setError(e.message || "اتصال به فروشگاه برقرار نشد.");
      setState("error");
    });
    return () => controller.abort();
  }, [slug]);

  const visibleItems = useMemo(() => items.filter((item) => {
    const carMatch = Array.isArray(item.cars) && item.cars.includes(car?.name.replace("نیسان ", ""));
    const text = normalize([item.name, item.carName, item.category, item.description, ...(item.tags || [])].join(" "));
    const systemMatch = !system || system.terms.some((term) => text.includes(normalize(term)));
    return carMatch && systemMatch;
  }), [items, car, system]);

  if (!car) return <main className="container productDetail"><h1>خودرو پیدا نشد</h1><Link href="/">بازگشت به صفحه اصلی</Link></main>;

  return <main className="innerPage">
    <header className="innerHeader"><div className="container innerHeaderRow"><Link href="/" className="brand"><span className="brandSymbol"><span>M</span></span><span className="brandWords"><b>ماکسیکار</b><small>مرجع تخصصی قطعات نیسان</small></span></Link><Link href="/" className="backHome"><ArrowLeft size={16}/> بازگشت به صفحه اصلی</Link></div></header>
    <section className="container innerSection">
      <div className="breadcrumbs"><Link href="/">صفحه اصلی</Link><ChevronLeft size={14}/><span>{car.name}</span>{system && <><ChevronLeft size={14}/><span>{system.name}</span></>}</div>
      <div className="sectionTitle"><div><span className="eyebrow">کاتالوگ قطعات واقعی فروشگاه</span><h1>{system ? system.name + " " + car.name : "قطعات " + car.name}</h1><p>فقط محصولاتی نمایش داده می‌شوند که نام یا اطلاعات ثبت‌شدهٔ آن‌ها صریحاً به این خودرو اشاره دارد؛ سازگاری قطعه باید پیش از سفارش تأیید شود.</p></div><span className="sectionCount">{state === "ready" ? visibleItems.length + " محصول" : "در حال بارگذاری"}</span></div>
      {state === "loading" && <p>در حال دریافت محصولات از فروشگاه…</p>}
      {state === "error" && <p className="demoNotice">دریافت محصولات ناموفق بود: {error}</p>}
      {state === "ready" && !visibleItems.length && <div className="noResults"><Wrench size={20}/><span>در داده‌های فعلی محصولی با تطبیق صریح برای این خودرو{system ? " و این گروه فنی" : ""} پیدا نشد. این به معنی نبود قطعه در فروشگاه نیست؛ ممکن است اطلاعات دسته‌بندی محصول ناقص باشد.</span></div>}
      <div className="partGrid">{visibleItems.map((item, i) => <Link className="partCard" href={"/parts/" + item.id} key={item.id}><div className="partVisual"><span className="partNumber">PART / {String(i + 1).padStart(2, "0")}</span>{item.imageUrl ? <img src={item.imageUrl} alt={item.name} style={{width:"100%",height:150,objectFit:"contain"}}/> : <div className="partIcon"><Wrench size={37} strokeWidth={1.2}/></div>}<span className="conditionBadge">{item.condition || "استعلام وضعیت"}</span></div><div className="partCardBody"><span className="partMeta">{item.category || car.name} · {item.status}</span><b>{item.name}</b><span className="partDetails">{item.price !== null && item.price !== undefined ? Number(item.price).toLocaleString("fa-IR") + " تومان" : "استعلام قیمت"} <ArrowLeft size={15}/></span></div></Link>)}</div>
      {!system && <div className="systemGrid" style={{marginTop:28}}>{systems.map((item) => <Link className="systemTile" href={"/cars/" + slug + "/" + item.slug} key={item.slug}><span className="systemIndex">{item.slug}</span><span className="systemName">{item.name}</span><ChevronLeft size={17}/></Link>)}</div>}
    </section>
    <footer className="innerFooter"><div className="container footerBottom"><span>ماکسیکار · قطعات نیسان</span><Link href="/">بازگشت به صفحه اصلی</Link></div></footer>
  </main>;
}
