import Link from "next/link";
import { ArrowLeft, PackageSearch, ClipboardList, Headphones, MapPin, ShieldCheck } from "lucide-react";

const services = [
  ["تأمین کالا از دبی", "پیدا کردن و تأمین کالا یا قطعه موردنظر از بازار امارات و بررسی امکان ارسال به ایران."],
  ["تأمین قطعات خودرو", "تخصص اصلی ما در این مسیر، قطعات خودرو و به‌ویژه قطعات نیسان است."],
  ["خرید و ارسال", "درخواست شما بررسی می‌شود و پس از تأیید شرایط، فرآیند خرید و ارسال هماهنگ می‌شود."],
  ["صادرات", "برای کالاهایی که امکان صادرات و ارسال آن‌ها وجود داشته باشد، درخواست شما را بررسی می‌کنیم."]
];

export const metadata = { title: "تأمین و واردات از دبی", description: "خدمات تأمین، خرید و واردات کالا و قطعات از دبی برای مشتریان ماکسیکار." };

export default function ImportTradePage() {
  return <main className="tradePage">
    <header className="innerHeader"><div className="container innerHeaderRow">
      <Link href="/" className="brand"><span className="brandSymbol"><span>M</span></span><span className="brandWords"><b>ماکسیکار</b><small>قطعات نیسان و خدمات تأمین</small></span></Link>
      <Link href="/" className="backHome"><ArrowLeft size={16}/> بازگشت به ماکسیکار</Link>
    </div></header>

    <section className="tradeHero"><div className="container tradeHeroGrid">
      <div><span className="eyebrow">خدمات تأمین و تجارت</span>
        <h1>کالایی را در دبی پیدا کرده‌ای؟<br/><em>تأمینش را به ما بسپار.</em></h1>
        <p>از پیدا کردن و خرید کالا تا هماهنگی ارسال، درخواست شما را بررسی می‌کنیم و امکان تأمین و واردات آن را اعلام می‌کنیم.</p>
        <div className="tradeActions"><a href="#request" className="primaryLink">ثبت درخواست تأمین <ArrowLeft size={16}/></a><Link href="/" className="secondaryLink">مشاهده قطعات نیسان</Link></div>
      </div>
      <div className="tradeDiagram" aria-hidden="true"><div className="tradeNode"><MapPin size={18}/><b>دبی</b><small>تأمین</small></div><div className="tradeLine"><span>بررسی ← خرید ← ارسال</span></div><div className="tradeNode"><MapPin size={18}/><b>مقصد</b><small>تحویل</small></div></div>
    </div></section>

    <section className="container tradeSection"><div className="sectionTitle"><div><span className="eyebrow">چه کاری انجام می‌دهیم؟</span><h2>یک مسیر مشخص برای تأمین</h2><p>این خدمت از فروشگاه قطعات جداست، اما از تجربه واقعی ما در بازار قطعات و تأمین از دبی استفاده می‌کند.</p></div></div>
      <div className="tradeServiceGrid">{services.map(([title,text],i)=><article className="tradeService" key={title}><span>0{i+1}</span><div><b>{title}</b><p>{text}</p></div></article>)}</div>
    </section>

    <section className="tradeDark"><div className="container tradeProcess"><div><span className="eyebrow">فرآیند</span><h2>از درخواست تا پاسخ</h2><p>قبل از هر اقدامی، امکان تأمین، شرایط کالا و مسیر ارسال بررسی می‌شود.</p></div>
      <div className="tradeSteps"><div><span>۱</span><div><b>درخواستت را بفرست</b><small>نام کالا، عکس، لینک یا مشخصات را ارسال کن.</small></div></div><div><span>۲</span><div><b>امکان تأمین بررسی می‌شود</b><small>موجودی، قیمت و شرایط تهیه بررسی می‌شود.</small></div></div><div><span>۳</span><div><b>شرایط را تأیید کن</b><small>پس از توافق، فرآیند خرید و ارسال هماهنگ می‌شود.</small></div></div></div>
    </div></section>

    <section className="container tradeSection" id="request"><div className="requestBox">
      <div><span className="eyebrow">ثبت درخواست</span><h2>برای تأمین چه چیزی کمک می‌خواهی؟</h2><p>فعلاً این فرم نمایشی است؛ در مرحله اتصال اطلاعات واقعی، آن را به مسیر دریافت درخواست ماکسیکار متصل می‌کنیم.</p></div>
      <div className="requestOptions"><div><PackageSearch size={20}/><b>قطعه یا کالای مشخص</b><span>نام، عکس یا لینک کالا را آماده داشته باش.</span></div><div><ClipboardList size={20}/><b>تأمین برای کسب‌وکار</b><span>اگر تعداد یا سفارش دوره‌ای داری، توضیح بده.</span></div><div><Headphones size={20}/><b>استعلام مستقیم</b><span>مسیر تماس بعداً با اطلاعات واقعی مجموعه تکمیل می‌شود.</span></div></div>
    </div></section>

    <footer className="innerFooter"><div className="container footerBottom"><span>ماکسیکار · قطعات نیسان و خدمات تأمین</span><span><ShieldCheck size={13}/> بررسی امکان تأمین پیش از سفارش</span></div></footer>
  </main>;
}