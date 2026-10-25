"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowUpLeft, Search, CarFront, Wrench, ShieldCheck, PackageCheck, Headphones, ChevronLeft, Tag, Ship, BadgePercent, Truck, CreditCard, Menu, X, CircleHelp } from "lucide-react";
import { cars, systems, products, searchCatalog, normalize } from "./data/catalog";

const serviceCards = [
  { title: "فروشگاه قطعات", text: "جست‌وجو و خرید قطعات نیسان ماکسیما، مورانو و تیانا", action: "مشاهده قطعات", href: "#sample-parts", image: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=900&q=85", icon: Wrench, kind: "parts" },
  { title: "واردات قطعات", text: "ثبت درخواست تأمین قطعه از دبی و بررسی امکان واردات", action: "ثبت درخواست واردات", href: "/import-trade", image: "https://images.unsplash.com/photo-1494412519320-aa613dfb7738?auto=format&fit=crop&w=900&q=85", icon: Ship, kind: "import" },
  { title: "خرید و فروش خودرو", text: "مسیر اختصاصی برای پیگیری خریدوفروش خودرو", action: "مشاهده خودروها", href: "/vehicles", image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=900&q=85", icon: CarFront, kind: "vehicles" },
];

export default function Home() {
  const [query, setQuery] = useState("");
  const [availability, setAvailability] = useState("همه");
  const [selectedSystem, setSelectedSystem] = useState(null);
  const [apiProducts, setApiProducts] = useState([]);
  const [apiState, setApiState] = useState("loading");
  const [apiError, setApiError] = useState("");
  const [mobileMenu, setMobileMenu] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        setApiState("loading");
        const params = new URLSearchParams({ page: "1", page_size: "100" });
        if (query.trim()) params.set("search", query.trim());
        const response = await fetch("/api/catalog/products?" + params.toString(), { signal: controller.signal, cache: "no-store" });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload?.message || "دریافت محصولات ناموفق بود.");
        setApiProducts(Array.isArray(payload.products) ? payload.products : []);
        setApiError("");
        setApiState("ready");
      } catch (error) {
        if (error.name === "AbortError") return;
        setApiProducts([]);
        setApiError(error.message || "اتصال به فروشگاه برقرار نشد.");
        setApiState("error");
      }
    }, 250);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [query]);

  const results = useMemo(() => {
    if (apiState !== "ready") return searchCatalog(query).filter((p) => availability === "همه" || (availability === "ناموجود" ? p.status === "ناموجود" : availability === "قابل استعلام" ? p.status.includes("استعلام") || p.status === "تماس بگیرید" : availability === "موجود" ? p.status.includes("موجود") && p.status !== "ناموجود" : true));
    const q = normalize(query);
    return apiProducts.filter((p) => {
      const conditionMatches = availability === "همه" || (availability === "ناموجود" ? p.status === "ناموجود" : availability === "قابل استعلام" ? p.status.includes("استعلام") || p.status === "تماس بگیرید" : availability === "موجود" ? p.status.includes("موجود") && p.status !== "ناموجود" : true);
      return conditionMatches && (!q || normalize([p.name, p.carName, p.category, p.partNumber].join(" ")).includes(q));
    });
  }, [apiProducts, apiState, query, availability]);
  const carResults = useMemo(() => { const q = normalize(query); if (!q) return []; return cars.filter((car) => [car.name, car.en, car.slug].some((value) => normalize(value).includes(q) || q.includes(normalize(value)))); }, [query]);
  const featured = (apiState === "ready" && apiProducts.length ? apiProducts : products).slice(0, 6);

  return <main>
    <div className="announcement"><div className="container announcementInner"><span>ماکسیکار | پلتفرم جامع خودرو</span><span className="announcementSide">قطعات · واردات · خریدوفروش خودرو</span></div></div>
    <header className="siteHeader container">
      <Link href="/" className="brand" aria-label="صفحه اصلی ماکسیکار"><span className="brandSymbol"><span>M</span></span><span className="brandWords"><b>ماکسیکار</b><small>قطعات · واردات · خودرو</small></span></Link>
      <nav className={"desktopNav " + (mobileMenu ? "mobileNavOpen" : "")} aria-label="منوی اصلی">
        <a href="#sample-parts">فروشگاه قطعات</a><a href="#sourcing">واردات قطعات</a><Link href="/vehicles">خرید و فروش خودرو</Link><Link href="/special-offers">تخفیفات ویژه</Link><a href="#contact">تماس با ما</a>
      </nav>
      <a className="headerAction" href="#search"><Search size={17}/><span>جست‌وجوی قطعه</span></a>
      <button className="menuToggle" aria-label={mobileMenu ? "بستن منو" : "باز کردن منو"} onClick={() => setMobileMenu(!mobileMenu)}>{mobileMenu ? <X size={20}/> : <Menu size={20}/>}</button>
    </header>

    <section className="hero homeHero">
      <div className="heroGrid container">
        <div className="heroContent">
          <div className="kicker"><span className="kickerDot"/> پلتفرم جامع خودرو</div>
          <h1>قطعات، واردات،<br/><em>خرید و فروش خودرو</em></h1>
          <p className="heroLead">سه مسیر مشخص برای نیازهای خودرویی شما؛ از پیدا کردن قطعه تا ثبت درخواست واردات و پیگیری خریدوفروش خودرو.</p>
          <div className="searchBox" id="search">
            <Search size={21} className="searchIcon"/>
            <input value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => { if (e.key === "Escape") setQuery(""); }} placeholder="نام قطعه، مدل خودرو یا کد فنی را بنویس..." aria-label="جست‌وجوی قطعه"/>
            {query && <button className="clearSearch" onClick={() => setQuery("")} aria-label="پاک کردن جست‌وجو">×</button>}
            <button className="searchButton" onClick={() => document.getElementById("searchResults")?.scrollIntoView({ behavior: "smooth", block: "nearest" })}>جست‌وجو <ArrowLeft size={17}/></button>
          </div>
          <div className="searchHints"><span>انتخاب سریع:</span>{cars.map((car) => <Link key={car.slug} href={"/cars/" + car.slug}>{car.name}</Link>)}</div>
          {query.trim() && <div className="searchResults" id="searchResults">
            <div className="resultHead"><b>نتایج جست‌وجو</b><span>{results.length + carResults.length} نتیجه</span></div>
            <div className="conditionTabs">{["همه","موجود","ناموجود","قابل استعلام"].map((x) => <button key={x} className={availability === x ? "active" : ""} onClick={() => setAvailability(x)}>{x}</button>)}</div>
            {carResults.map((car) => <Link className="searchResult" href={"/cars/" + car.slug} key={"car-" + car.slug}><span className="miniPart"><CarFront size={17}/></span><span className="resultText"><b>{car.name}</b><small>{car.en} · مشاهده قطعات</small></span><ChevronLeft size={18}/></Link>)}
            {results.map((p) => <Link className="searchResult" href={p.source === "mixin-api-v4" ? "/parts/" + p.id : "/parts/" + p.slug} key={(p.source || "demo") + "-" + p.slug}><span className="miniPart"><Wrench size={17}/></span><span className="resultText"><b>{p.name}</b><small>{p.carName} · {p.status}{p.price !== undefined && p.price !== null ? " · " + Number(p.price).toLocaleString("fa-IR") + " تومان" : ""}</small></span><ChevronLeft size={18}/></Link>)}
            {!results.length && !carResults.length && <div className="noResults"><CircleHelp size={19}/><span>نتیجه‌ای پیدا نشد؛ نام قطعه یا مدل خودرو را بررسی کن.</span></div>}
            {apiState === "error" && <p className="demoNotice">اتصال زنده در دسترس نیست: {apiError} نمونه‌های نمایشی نشان داده می‌شوند.</p>}
          </div>}
          <div className="heroProof"><span><ShieldCheck size={16}/> بررسی مشخصات قطعه</span><span><PackageCheck size={16}/> نمایش وضعیت موجودی</span><span><Headphones size={16}/> مسیر استعلام</span></div>
        </div>
        <div className="heroVisual heroPhoto" aria-label="خودروهای نیسان"><div className="heroPhotoCaption"><span>MAXICAR</span><b>قطعات · واردات · خودرو</b></div></div>
      </div>
      <div className="heroBottomLine"><div className="container"><span>فروشگاه قطعات</span><span>درخواست واردات</span><span>خریدوفروش خودرو</span></div></div>
    </section>

    <section className="container serviceSection" aria-label="مسیرهای اصلی ماکسیکار">
      <div className="serviceGrid">{serviceCards.map((item) => { const Icon = item.icon; return <article className={"serviceCard service-" + item.kind} key={item.kind}>
        <Link href={item.href} className="serviceImage" style={{backgroundImage: "linear-gradient(0deg,rgba(5,19,31,.92),rgba(5,19,31,.04)),url('" + item.image + "')"}} aria-label={item.title}/>
        <div className="serviceBody"><div className="serviceTitle"><span><Icon size={21}/></span><h2>{item.title}</h2></div><p>{item.text}</p><Link className="serviceLink" href={item.href}>{item.action}<ArrowLeft size={16}/></Link></div>
      </article>; })}</div>
    </section>

    <section className="container promotionSection">
      <Link href="/special-offers" className="promotionBanner" aria-label="مشاهده صفحه تخفیفات ویژه">
        <div className="promotionCopy"><span className="promotionEyebrow"><BadgePercent size={17}/> پیشنهادهای ماکسیکار</span><h2>تخفیفات ویژه</h2><p>پیشنهادها و شرایط تخفیف را در صفحه اختصاصی مشاهده کنید.</p><span className="promotionButton">مشاهده تخفیفات <ArrowLeft size={16}/></span></div>
        <div className="promotionArtwork" aria-hidden="true"><Tag size={110} strokeWidth={1.1}/><span>%</span></div>
      </Link>
    </section>

    <section className="section container" id="sample-parts">
      <div className="sectionTitle"><div><span className="eyebrow">فروشگاه قطعات</span><h2>قطعات منتخب</h2><p>{apiState === "ready" ? "محصولات دریافت‌شده از فروشگاه؛ پیش از سفارش، قیمت و موجودی را بررسی کنید." : "برای پیدا کردن قطعه، از جست‌وجو یا انتخاب مدل خودرو استفاده کنید."}</p></div><Link className="sectionMore" href="/cars/maxima">مشاهده قطعات <ArrowLeft size={16}/></Link></div>
      <div className="partGrid homePartGrid">{featured.map((p, i) => <Link className="partCard" href={p.source === "mixin-api-v4" ? "/parts/" + p.id : "/parts/" + p.slug} key={(p.source || "demo") + "-" + (p.id || p.slug || i)}>
        <div className="partVisual">{p.imageUrl ? <img src={p.imageUrl} alt={p.name} style={{width:"100%",height:150,objectFit:"contain"}}/> : <div className="partIcon"><Wrench size={37} strokeWidth={1.2}/></div>}<span className="conditionBadge">{p.condition || p.status || "استعلام وضعیت"}</span></div>
        <div className="partCardBody"><span className="partMeta">{p.carName || p.category || "قطعات نیسان"}</span><b>{p.name}</b><span className="partDetails">{p.price !== null && p.price !== undefined ? Number(p.price).toLocaleString("fa-IR") + " تومان" : "استعلام قیمت"} <ArrowLeft size={15}/></span></div>
      </Link>)}</div>
    </section>

    <section className="modelBand"><div className="container modelBandInner"><div className="modelBandCopy"><span className="eyebrow">جست‌وجو بر اساس مدل</span><h2>خودروت را انتخاب کن</h2><p>مسیر قطعات را از مدل خودرو شروع کن.</p></div><div className="modelBandCars">{cars.map((car) => <Link href={"/cars/" + car.slug} key={car.slug} className="modelBandCar"><span className="modelCarIcon"><CarFront size={43}/></span><b>{car.name}</b><small>{car.en}</small></Link>)}</div></div></section>

    <section className="benefitStrip"><div className="container benefitGrid"><div><ShieldCheck/><b>اطلاعات روشن</b><small>مشخصات و وضعیت قطعه</small></div><div><Truck/><b>مسیر ارسال</b><small>اطلاعات ارسال هنگام سفارش</small></div><div><Headphones/><b>پشتیبانی</b><small>برای پرسش و استعلام</small></div><div><CreditCard/><b>قیمت قابل بررسی</b><small>بررسی قیمت پیش از سفارش</small></div></div></section>

    <footer id="contact"><div className="container footerTop"><Link href="/" className="brand footerBrand"><span className="brandSymbol"><span>M</span></span><span className="brandWords"><b>ماکسیکار</b><small>قطعات · واردات · خودرو</small></span></Link><div className="footerLinks"><Link href="#sample-parts">فروشگاه قطعات</Link><Link href="/import-trade">واردات قطعات</Link><Link href="/vehicles">خرید و فروش خودرو</Link><Link href="/special-offers">تخفیفات ویژه</Link></div><a href="#search" className="footerSearch">جست‌وجوی قطعه <ArrowLeft size={16}/></a></div><div className="container footerBottom"><span>ماکسیکار | پلتفرم جامع خودرو</span><span>قیمت و موجودی محصولات باید پیش از سفارش بررسی شود.</span></div></footer>
    <div className="mobileBottom"><a href="#search"><Search size={18}/><span>جست‌وجو</span></a><a href="#sample-parts"><Wrench size={18}/><span>قطعات</span></a><Link href="/import-trade"><Ship size={18}/><span>واردات</span></Link><Link href="/vehicles"><CarFront size={18}/><span>خودرو</span></Link><Link href="/special-offers"><Tag size={18}/><span>تخفیف</span></Link></div>
  </main>;
}
