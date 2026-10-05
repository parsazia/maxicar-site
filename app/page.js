"use client";

import { useMemo, useState } from "react";
import { Search, Phone, ChevronLeft, ShieldCheck, PackageSearch, CarFront } from "lucide-react";

const cars = [
  {name:"ماکسیما", en:"MAXIMA", count:"قطعات و لوازم یدکی"},
  {name:"مورانو", en:"MURANO", count:"قطعات و لوازم یدکی"},
  {name:"تیانا", en:"TEANA", count:"قطعات و لوازم یدکی"},
];

const systems = ["موتور و متعلقات","گیربکس","تعلیق و جلوبندی","فرمان و هیدرولیک","ترمز","برق و الکترونیک","خنک‌کاری","کولر و بخاری","سوخت و انژکتور","بدنه","چراغ و روشنایی","آینه و شیشه","داخل کابین","ایمنی و متعلقات"]; 

const parts = [
  ["موتور فن بخاری ماکسیما","ماکسیما","موجود"],
  ["هدلایت ماکسیما ایچیکو","ماکسیما","موجودی محدود"],
  ["شلنگ فشار قوی هیدرولیک فرمان","ماکسیما","موجود"],
  ["ماژول بخاری ماکسیما","ماکسیما","تماس بگیرید"],
];

export default function Home(){
  const [query,setQuery]=useState("");
  const filtered=useMemo(()=>parts.filter(p=>p.join(" ").includes(query.trim())),[query]);
  return <main>
    <div className="topbar"><div>ارسال به سراسر ایران</div><div>ضمانت اصالت و مشاوره تخصصی</div></div>
    <header className="header container">
      <div className="brand"><div className="brandMark">M</div><div><strong>MAXICAR</strong><span>مرجع تخصصی قطعات نیسان</span></div></div>
      <div className="headerPhone"><Phone size={18}/><span>مشاوره و استعلام قطعه</span></div>
    </header>
    <nav className="nav"><div className="container navInner"><a>صفحه اصلی</a><a>ماکسیما</a><a>مورانو</a><a>تیانا</a><a>راهنمای پیدا کردن قطعه</a><a>تماس با ما</a></div></nav>

    <section className="hero"><div className="container heroInner">
      <div className="heroCopy"><span className="eyebrow">MAXIMA · MURANO · TEANA</span><h1>قطعه موردنظرت رو پیدا کن.</h1><p>نام قطعه، نام خودرو یا کد فنی را جست‌وجو کن؛ مسیر پیدا کردن قطعه باید کوتاه و روشن باشد.</p>
        <div className="search"><Search size={21}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="مثلاً موتور فن ماکسیما یا 26060-8Y025"/><button>جست‌وجو</button></div>
        {query && <div className="results">{filtered.length ? filtered.map((p,i)=><div className="result" key={i}><div><b>{p[0]}</b><small>{p[1]} · {p[2]}</small></div><ChevronLeft size={18}/></div>) : <div className="empty">قطعه‌ای با این عبارت پیدا نشد.</div>}</div>}
      </div>
      <div className="heroCard"><div className="circleLogo">M</div><span>قطعات نیسان</span><b>با تمرکز روی<br/>ماکسیما، مورانو و تیانا</b></div>
    </div></section>

    <section className="container section"><div className="sectionHead"><div><span className="eyebrow blue">انتخاب سریع خودرو</span><h2>اول خودرو را انتخاب کن</h2></div><span className="muted">بعد از آن فقط سیستم و قطعه</span></div>
      <div className="cars">{cars.map((c,i)=><div className="carCard" key={c.name}><div className="carIcon"><CarFront size={34}/></div><div><small>{c.en}</small><h3>{c.name}</h3><p>{c.count}</p></div><ChevronLeft/></div>)}</div>
    </section>

    <section className="systemsWrap"><div className="container section"><div className="sectionHead"><div><span className="eyebrow blue">دسته‌بندی قطعات</span><h2>سیستم خودرو را انتخاب کن</h2></div></div><div className="systemGrid">{systems.map((s,i)=><div className="system" key={s}><span>{String(i+1).padStart(2,"0")}</span><b>{s}</b><ChevronLeft size={16}/></div>)}</div></div></section>

    <section className="container section"><div className="sectionHead"><div><span className="eyebrow blue">نمونه قطعات</span><h2>قطعات موجود</h2></div><a className="all">مشاهده همه <ChevronLeft size={16}/></a></div><div className="productGrid">{parts.map((p,i)=><div className="product" key={i}><div className="productImage"><PackageSearch size={42}/></div><div className="tag">{p[2]}</div><h3>{p[0]}</h3><p>{p[1]}</p><button>مشاهده قطعه</button></div>)}</div></section>

    <section className="trust"><div className="container trustGrid"><div><ShieldCheck/><b>اطلاعات فنی روشن</b><span>کد فنی، خودرو و مشخصات قطعه در ساختار مشخص</span></div><div><PackageSearch/><b>وضعیت موجودی مشخص</b><span>موجود، محدود، سفارشی یا تماس برای استعلام</span></div><div><Search/><b>جست‌وجوی سریع</b><span>نام قطعه، کد فنی و نام‌های رایج</span></div></div></section>
    <footer><div className="container footerInner"><div><strong>MAXICAR</strong><p>مرجع تخصصی قطعات نیسان</p></div><div>ماکسیما · مورانو · تیانا</div><div>maxicar.ir</div></div></footer>
  </main>
}
