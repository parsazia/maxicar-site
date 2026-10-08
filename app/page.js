"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowUpLeft, Search, CarFront, Wrench, ShieldCheck, PackageCheck, Headphones, ChevronLeft, SlidersHorizontal, CircleHelp } from "lucide-react";
import { cars, systems, products, searchCatalog, normalize } from "./data/catalog";

export default function Home() {
  const [query, setQuery] = useState("");
  const [condition, setCondition] = useState("همه");
  const [selectedSystem, setSelectedSystem] = useState(null);
  const results = useMemo(() => searchCatalog(query).filter((p) => condition === "همه" || p.condition === condition), [query, condition]);
  const carResults = useMemo(() => { const q = normalize(query); if (!q) return []; return cars.filter((car) => [car.name, car.en, car.slug].some((value) => normalize(value).includes(q) || q.includes(normalize(value)))); }, [query]);
  const showResults = query.trim().length > 0;

  return <main>
    <div className="announcement"><div className="container announcementInner"><span>تخصص ما: قطعات نیسان ماکسیما، مورانو و تیانا</span><span className="announcementSide">قبل از سفارش، تطبیق قطعه را بررسی می‌کنیم</span></div></div>
    <header className="siteHeader container">
      <Link href="/" className="brand" aria-label="صفحه اصلی ماکسیکار"><span className="brandSymbol"><span>M</span></span><span className="brandWords"><b>ماکسیکار</b><small>مرجع تخصصی قطعات نیسان</small></span></Link>
      <nav className="desktopNav" aria-label="منوی اصلی"><a href="#cars">انتخاب خودرو</a><a href="#systems">دسته‌بندی قطعات</a><a href="#how">راهنمای خرید</a><a href="#how">راهنمای خرید</a><a href="#sourcing">تأمین و واردات</a><a href="#contact">تماس و استعلام</a></nav>
      <a className="headerAction" href="#search"><Search size={17}/><span>پیدا کردن قطعه</span></a>
    </header>

    <section className="hero">
      <div className="heroGrid container">
        <div className="heroContent">
          <div className="kicker"><span className="kickerDot"/> قطعات نیسان، با مسیر روشن‌تر</div>
          <h1>قطعه درست را<br/><em>ساده‌تر پیدا کن.</em></h1>
          <p className="heroLead">از نام قطعه و کد فنی تا انتخاب خودرو و سیستم؛ مسیر پیدا کردن قطعه را کوتاه و قابل‌فهم کرده‌ایم.</p>
          <div className="searchBox" id="search">
            <Search size={21} className="searchIcon"/>
            <input value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => { if (e.key === "Escape") setQuery(""); }} placeholder="نام قطعه، خودرو یا کد فنی را بنویس..." aria-label="جست‌وجوی قطعه"/>
            {query && <button className="clearSearch" onClick={() => setQuery("")} aria-label="پاک کردن جست‌وجو">×</button>}
            <button className="searchButton" onClick={() => document.getElementById("searchResults")?.scrollIntoView({ behavior: "smooth", block: "nearest" })}>جست‌وجو <ArrowLeft size={17}/></button>
          </div>
          <div className="searchHints"><span>جست‌وجوهای نمونه:</span><button onClick={() => setQuery("فن بخاری ماکسیما")}>فن بخاری ماکسیما</button><button onClick={() => setQuery("هدلایت")}>هدلایت</button><button onClick={() => setQuery("شلنگ هیدرولیک")}>شلنگ هیدرولیک</button></div>
          {showResults && <div className="searchResults" id="searchResults">
            <div className="resultHead"><b>نتایج جست‌وجو</b><span>{results.length + carResults.length} نتیجه نمونه</span></div>
            <div className="conditionTabs" aria-label="فیلتر وضعیت قطعه">{["همه","کارکرده","نو"].map((x) => <button key={x} className={condition === x ? "active" : ""} onClick={() => setCondition(x)}>{x}</button>)}</div>
            {carResults.map((car) => <Link className="searchResult" href={"/cars/" + car.slug} key={"car-" + car.slug}><span className="miniPart"><CarFront size={17}/></span><span className="resultText"><b>{car.name}</b><small>{car.en} · مشاهده گروه‌های قطعات</small></span><ChevronLeft size={18}/></Link>)}{results.map((p) => <Link className="searchResult" href={"/parts/" + p.slug} key={p.slug}><span className="miniPart"><Wrench size={17}/></span><span className="resultText"><b>{p.name}</b><small>{p.carName} · {p.condition} · {p.status}</small></span><ChevronLeft size={18}/></Link>)}{!results.length && !carResults.length && <div className="noResults"><CircleHelp size={19}/><span>در نمونه فعلی نتیجه‌ای پیدا نشد. نام رایج‌تر قطعه یا نام خودرو را امتحان کن.</span></div>}
            <p className="demoNotice">این نتایج برای آزمایش طراحی هستند و هنوز به موجودی واقعی متصل نشده‌اند.</p>
          </div>}
          <div className="heroProof"><span><ShieldCheck size={16}/> تطبیق مشخصات پیش از سفارش</span><span><PackageCheck size={16}/> وضعیت قطعه شفاف</span></div>
        </div>
        <div className="heroVisual" aria-hidden="true">
          <div className="technicalFrame"><div className="frameTop"><span>PARTS / NISSAN</span><span>01 — 03</span></div><div className="orbit orbitOne"/><div className="orbit orbitTwo"/><div className="carSilhouette"><CarFront size={124} strokeWidth={0.85}/></div><div className="visualLabel labelA"><i/> قطعه‌یابی دقیق</div><div className="visualLabel labelB"><i/> سه خانواده خودرو</div><div className="frameBottom"><span>MAXICAR</span><span>ENGINEERED FOR CLARITY</span></div></div>
        </div>
      </div>
      <div className="heroBottomLine"><div className="container"><span>۰۱ / انتخاب خودرو</span><span>۰۲ / انتخاب سیستم</span><span>۰۳ / بررسی قطعه</span><span>۰۴ / استعلام و سفارش</span></div></div>
    </section>

    <section className="section container" id="cars">
      <div className="sectionTitle"><div><span className="eyebrow">از اینجا شروع کن</span><h2>خودروت کدام است؟</h2><p>با انتخاب خودرو، فقط دسته‌بندی‌های مرتبط را ببین.</p></div><span className="sectionCount">۰۳ خودرو <span>●</span></span></div>
      <div className="carGrid">{cars.map((car, i) => <Link href={"/cars/" + car.slug} className="carTile" key={car.slug}><span className="carIndex">0{i + 1}</span><span className="carGlyph"><CarFront size={31} strokeWidth={1.5}/></span><span className="carInfo"><small>{car.en}</small><b>{car.name}</b><span>مشاهده سیستم‌ها و قطعات</span></span><span className="tileArrow"><ArrowUpLeft size={19}/></span></Link>)}</div>
    </section>

    <section className="systemsSection" id="systems"><div className="container section">
      <div className="sectionTitle"><div><span className="eyebrow">مسیر دوم</span><h2>از روی سیستم خودرو پیدا کن</h2><p>اگر نام دقیق قطعه را نمی‌دانی، از گروه فنی شروع کن.</p></div><span className="sectionCount">۱۷ گروه <span>●</span></span></div>
      <div className="systemGrid">{systems.map((system, i) => <button type="button" className="systemTile systemTileButton" key={system.slug} onClick={() => setSelectedSystem(selectedSystem === system.slug ? null : system.slug)} aria-expanded={selectedSystem === system.slug}><span className="systemIndex">{String(i + 1).padStart(2, "0")}</span><span className="systemName">{system.name}</span><ChevronLeft size={17}/></button>)}</div>
      {selectedSystem && <div className="systemChooser"><div><b>خودرو را برای «{systems.find((item) => item.slug === selectedSystem)?.name}» انتخاب کن</b><button type="button" onClick={() => setSelectedSystem(null)} aria-label="بستن انتخاب خودرو">بستن ×</button></div><div className="systemChooserCars">{cars.map((car) => <Link key={car.slug} href={"/cars/" + car.slug + "/" + selectedSystem}>{car.name}<ArrowLeft size={15}/></Link>)}</div></div>}
      <p className="systemFootnote"><SlidersHorizontal size={16}/> ابتدا گروه فنی را انتخاب کن؛ سپس خودرو را مشخص کن تا مسیر درست باز شود.</p>
    </div></section>

    <section className="section container" id="sample-parts">
      <div className="sectionTitle"><div><span className="eyebrow">نمونه مسیر قطعه</span><h2>قطعاتی که می‌توانی جست‌وجو کنی</h2><p>نمونه‌های زیر برای آزمایش مسیر جست‌وجو و نمایش مشخصات‌اند؛ قیمت و موجودی واقعی هنوز وارد نشده است.</p></div></div>
      <div className="partGrid">{products.map((p, i) => <Link className="partCard" href={"/parts/" + p.slug} key={p.slug}><div className="partVisual"><span className="partNumber">PART / 0{i + 1}</span><div className="partIcon"><Wrench size={37} strokeWidth={1.2}/></div><span className="conditionBadge">{p.condition}</span></div><div className="partCardBody"><span className="partMeta">{p.carName} <span>•</span> {p.status}</span><b>{p.name}</b><span className="partDetails">مشاهده مشخصات نمونه <ArrowLeft size={15}/></span></div></Link>)}</div>
    </section>

    <section className="tradeTeaser" id="sourcing"><div className="container tradeTeaserInner"><div><span className="eyebrow">یک خدمت دیگر ماکسیکار</span><h2>تأمین و واردات از دبی</h2><p>اگر قطعه یا کالایی را در دبی پیدا کرده‌ای یا برای کسب‌وکارت به دنبال تأمین هستی، درخواستت را برای ما بفرست تا امکان تأمین و ارسال بررسی شود.</p></div><Link href="/import-trade" className="tradeTeaserLink">مشاهده خدمات تأمین <ArrowLeft size={16}/></Link></div></section>\n\n    <section className="howSection" id="how"><div className="container howInner"><div><span className="eyebrow">خرید با اطلاعات روشن</span><h2>قبل از سفارش،<br/>مشخصات را تطبیق بده.</h2><p>در قطعات خودرو، اسم مشابه همیشه به معنی سازگاری نیست. مدل خودرو، کد فنی، وضعیت ظاهری و عکس همان قطعه باید بررسی شوند.</p></div><div className="howSteps"><div><span>۱</span><div><b>خودرو را انتخاب کن</b><small>ماکسیما، مورانو یا تیانا</small></div></div><div><span>۲</span><div><b>قطعه و مشخصات را بررسی کن</b><small>کد فنی، عکس، وضعیت و سازگاری</small></div></div><div><span>۳</span><div><b>برای موجودی و قیمت استعلام بگیر</b><small>پس از تأیید اطلاعات سفارش را نهایی کن</small></div></div></div></div></section>

    <footer id="contact"><div className="container footerTop"><Link href="/" className="brand footerBrand"><span className="brandSymbol"><span>M</span></span><span className="brandWords"><b>ماکسیکار</b><small>مرجع تخصصی قطعات نیسان</small></span></Link><p>ماکسیما · مورانو · تیانا</p><a href="#search" className="footerSearch">جست‌وجوی قطعه <ArrowLeft size={16}/></a></div><div className="container footerBottom"><span>نسخه آزمایشی طراحی ماکسیکار</span><span>اطلاعات تماس، قیمت و موجودی پس از اتصال داده‌های واقعی تکمیل می‌شوند.</span></div></footer>
    <div className="mobileBottom"><a href="#search"><Search size={18}/><span>جست‌وجو</span></a><a href="#cars"><CarFront size={18}/><span>انتخاب خودرو</span></a><a href="#systems"><Wrench size={18}/><span>دسته‌بندی‌ها</span></a><Link href="/import-trade"><PackageCheck size={18}/><span>تأمین</span></Link><a href="#contact"><Headphones size={18}/><span>استعلام</span></a></div>
  </main>;
}
