import Link from "next/link";
import { ArrowLeft, PackageSearch, ClipboardList, Headphones, MapPin, ShieldCheck, Building2, Truck, SearchCheck } from "lucide-react";

const services = [
  ["تأمین هر نوع کالای قابل واردات", "اگر کالایی برای مصرف شخصی یا کسب‌وکارتان می‌خواهید، مشخصاتش را بفرستید تا امکان تأمین و واردات بررسی شود."],
  ["پیدا کردن تأمین‌کننده", "برای شناسایی کالا و فروشنده مناسب در دبی، درخواست شما را بررسی و شرایط پیشنهادی را اعلام می‌کنیم."],
  ["خرید و هماهنگی ارسال", "پس از توافق بر سر قیمت و شرایط، خرید و هماهنگی ارسال تا تحویل در ایران پیگیری می‌شود."],
  ["تأمین برای شرکت‌ها و عمده‌فروشان", "درخواست‌های تعدادی و تجاری را با توجه به نوع کالا، حجم، وزن و مسیر حمل بررسی می‌کنیم."],
  ["قطعات خودرو؛ حوزه تخصصی ما", "تخصص اصلی ماکسیکار قطعات خودرو، به‌ویژه قطعات نیسان ماکسیما، مورانو و تیاناست؛ اما خدمات تأمین به خودرو محدود نیست."],
  ["بررسی درخواست صادرات", "اگر قصد صادرات کالایی را دارید، جزئیات را بفرستید تا امکان‌پذیری مسیر بررسی شود."]
];

export const metadata = {
  title: "تأمین کالا و واردات از دبی",
  description: "درخواست تأمین کالا از دبی برای افراد، شرکت‌ها و عمده‌فروشان؛ تخصص ماکسیکار در قطعات خودرو است، اما خدمات تأمین به خودرو محدود نیست."
};

export default function ImportTradePage() {
  return <main className="tradePage">
    <header className="innerHeader"><div className="container innerHeaderRow">
      <Link href="/" className="brand"><span className="brandSymbol"><span>M</span></span><span className="brandWords"><b>ماکسیکار</b><small>قطعات نیسان و خدمات تأمین</small></span></Link>
      <Link href="/" className="backHome"><ArrowLeft size={16}/> بازگشت به ماکسیکار</Link>
    </div></header>

    <section className="tradeHero"><div className="container tradeHeroGrid">
      <div><span className="eyebrow">تأمین کالا برای افراد و کسب‌وکارها</span>
        <h1>هر کالایی را که می‌خواهی از دبی تأمین کنی،<br/><em>با ما مطرح کن.</em></h1>
        <p>از پیدا کردن تأمین‌کننده و بررسی قیمت تا خرید و هماهنگی ارسال؛ درخواستت را بررسی می‌کنیم و شرایط قابل انجام را شفاف اعلام می‌کنیم. امکان تأمین هر کالا به نوع محصول، قوانین و مسیر حمل بستگی دارد.</p>
        <div className="tradeActions"><a href="#request" className="primaryLink">ثبت درخواست تأمین <ArrowLeft size={16}/></a><Link href="/" className="secondaryLink">مشاهده قطعات نیسان</Link></div>
        <div className="tradeSpecialty"><ShieldCheck size={17}/><span><b>تخصص ما:</b> قطعات خودرو، به‌ویژه نیسان؛ <b>دامنه خدمات تأمین:</b> محدود به خودرو نیست.</span></div>
      </div>
      <div className="tradeDiagram" aria-label="مسیر تأمین کالا"><div className="tradeNode"><MapPin size={18}/><b>دبی</b><small>جست‌وجو و خرید</small></div><div className="tradeLine"><span>بررسی ← توافق ← ارسال</span></div><div className="tradeNode"><MapPin size={18}/><b>ایران</b><small>تحویل کالا</small></div></div>
    </div></section>

    <section className="container tradeSection"><div className="sectionTitle"><div><span className="eyebrow">خدمات قابل بررسی</span><h2>از قطعات خودرو تا کالاهای دیگر</h2><p>قبل از قبول سفارش، امکان تأمین، شرایط قانونی و هزینه‌های خرید و حمل بررسی می‌شود.</p></div></div>
      <div className="tradeServiceGrid">{services.map(([title,text],i)=><article className="tradeService" key={title}><span>0{i+1}</span><div><b>{title}</b><p>{text}</p></div></article>)}</div>
    </section>

    <section className="tradeDark"><div className="container tradeProcess"><div><span className="eyebrow">فرآیند همکاری</span><h2>اول بررسی، بعد تعهد</h2><p>هزینه و زمان به نوع کالا، تعداد، حجم، وزن، شرایط فروشنده و مسیر حمل بستگی دارد. پیش از تأیید شما، سفارش قطعی تلقی نمی‌شود.</p></div>
      <div className="tradeSteps"><div><span>۱</span><div><b>مشخصات کالا را بفرست</b><small>نام، عکس، لینک، تعداد و مقصد تحویل.</small></div></div><div><span>۲</span><div><b>امکان و هزینه بررسی می‌شود</b><small>قیمت کالا، حمل و شرایط مرتبط مشخص می‌شود.</small></div></div><div><span>۳</span><div><b>پس از توافق اقدام می‌کنیم</b><small>پس از تأیید شرایط، خرید و ارسال هماهنگ می‌شود.</small></div></div></div>
    </div></section>

    <section className="container tradeSection" id="request"><div className="requestBox">
      <div><span className="eyebrow">ثبت درخواست تأمین</span><h2>چه کالایی می‌خواهی؟</h2><p>فرم نهایی پس از اتصال به سامانه دریافت درخواست فعال می‌شود. در نسخه طراحی، این بخش ساختار اطلاعات موردنیاز را نشان می‌دهد.</p><div className="requestChannel"><Headphones size={18}/><span><b>مسیر دوم: واتساپ</b><small>دکمه مستقیم واتساپ پس از ثبت شماره رسمی کسب‌وکار فعال می‌شود.</small></span></div></div>
      <div className="requestFields">
        <label>نام کالا یا محصول<input placeholder="مثلاً دستگاه، قطعه یا کالای مصرفی" /></label>
        <label>لینک یا مشخصات کالا<input placeholder="لینک فروشنده، برند یا مدل (اختیاری)" /></label>
        <div className="requestFieldRow"><label>تعداد<input placeholder="مثلاً ۲۰ عدد" /></label><label>مقصد تحویل<select defaultValue="ایران"><option>ایران</option><option>کشور دیگر</option></select></label></div>
        <label>توضیحات تکمیلی<textarea placeholder="بودجه تقریبی، زمان موردنیاز یا مشخصات مهم" rows={3}/></label>
        <div className="requestDisclaimer"><ShieldCheck size={15}/> ثبت درخواست به معنی تضمین تأمین نیست؛ ابتدا امکان انجام سفارش بررسی می‌شود.</div>
      </div>
    </div></section>

    <footer className="innerFooter"><div className="container footerBottom"><span>ماکسیکار · قطعات نیسان و خدمات تأمین کالا</span><span><ShieldCheck size={13}/> امکان تأمین پیش از سفارش بررسی می‌شود</span></div></footer>
  </main>;
}