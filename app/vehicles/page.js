import Link from "next/link";
import VehicleSubmissionForm from "./VehicleSubmissionForm";
import { ArrowLeft, CarFront, ClipboardCheck, ShieldCheck, FileText, Headphones, Search, BadgeCheck } from "lucide-react";

export const metadata = {
  title: "خریدوفروش تخصصی خودرو",
  description: "بازار تخصصی خریدوفروش نیسان ماکسیما، مورانو و تیانا با ثبت خودرو، پیگیری درخواست خریدار و امکان کارشناسی در آینده."
};

const initialCars = ["ماکسیما", "مورانو", "تیانا"];

export default function VehicleMarketPage() {
  return <main className="vehicleMarketPage">
    <header className="innerHeader"><div className="container innerHeaderRow">
      <Link href="/" className="brand"><span className="brandSymbol"><span>M</span></span><span className="brandWords"><b>ماکسیکار</b><small>بازار تخصصی خودرو</small></span></Link>
      <Link href="/" className="backHome"><ArrowLeft size={16}/> بازگشت به ماکسیکار</Link>
    </div></header>

    <section className="vehicleMarketHero"><div className="container vehicleMarketHeroInner">
      <div><span className="eyebrow">بازار تخصصی خودرو</span><h1>خریدوفروش خودرو،<br/><em>با شناخت تخصصی‌تر.</em></h1><p>در شروع، فقط ماکسیما، مورانو و تیانا. فروشنده قیمت پیشنهادی خودش را اعلام می‌کند و در آینده، با فراهم شدن کارشناس مستقل و ماهر، امکان ارائه ارزیابی قیمت نیز اضافه می‌شود.</p>
        <div className="tradeActions"><a className="primaryLink" href="#submit-car">ثبت خودرو برای فروش <ArrowLeft size={16}/></a><a className="secondaryLink" href="#listings">مشاهده خودروها</a></div>
      </div>
      <div className="vehicleMarketPanel"><div className="vehicleMarketPanelTop"><CarFront size={22}/><span>شروع تخصصی</span></div><strong>۰۳</strong><b>خانواده خودرو</b><div className="vehicleMarketChips">{initialCars.map((car)=><span key={car}>{car}</span>)}</div><small>مدل‌های دیگر در مراحل بعدی اضافه می‌شوند.</small></div>
    </div></section>

    <section className="container vehicleMarketSection" id="listings">
      <div className="sectionTitle"><div><span className="eyebrow">آگهی‌های فروش</span><h2>خودروهای آماده بررسی</h2><p>در نسخه آزمایشی هنوز آگهی واقعی ثبت نشده است؛ اطلاعات نمونه به‌عنوان آگهی واقعی نمایش داده نمی‌شود.</p></div></div>
      <div className="vehicleEmpty"><span className="vehicleEmptyIcon"><Search size={27}/></span><h3>هنوز خودرویی برای نمایش ثبت نشده است</h3><p>اگر قصد فروش ماکسیما، مورانو یا تیانای خود را دارید، اطلاعات اولیه را ثبت کنید تا پس از راه‌اندازی فرآیند دریافت آگهی با شما تماس بگیریم.</p><a href="#submit-car" className="primaryLink">ثبت خودرو برای فروش <ArrowLeft size={16}/></a></div>
    </section>

    <section className="vehicleMarketTrust"><div className="container vehicleMarketTrustGrid">
      <div><ShieldCheck size={21}/><b>ارتباط از طریق ماکسیکار</b><p>درخواست خریدار و هماهنگی اولیه از مسیر ماکسیکار انجام می‌شود. جزئیات کمیسیون پیش از معرفی طرفین اعلام خواهد شد.</p></div>
      <div><ClipboardCheck size={21}/><b>وضعیت آگهی شفاف</b><p>اطلاعات اعلام‌شده توسط فروشنده، بررسی‌شده و کارشناسی‌شده سه وضعیت متفاوت‌اند و با هم اشتباه گرفته نمی‌شوند.</p></div>
      <div><BadgeCheck size={21}/><b>کارشناسی در مرحله بعد</b><p>تا زمانی که کارشناس واجد شرایط در دسترس نباشد، آگهی‌ها برچسب کارشناسی‌شده نمی‌گیرند.</p></div>
    </div></section>

    <section className="container vehicleMarketSection" id="submit-car"><div className="vehicleSubmitBox">
      <div><span className="eyebrow">برای فروشنده</span><h2>خودروت را برای فروش معرفی کن</h2><p>اطلاعات زیر، فیلدهای پیشنهادی فرم ثبت خودرو هستند. دریافت واقعی آگهی پس از اتصال فرم به سامانه فعال می‌شود.</p><ul><li>مدل، سال ساخت و تیپ</li><li>کارکرد، رنگ و وضعیت بدنه</li><li>وضعیت فنی و سابقه تعمیرات مهم</li><li>قیمت پیشنهادی فروشنده</li><li>عکس‌های واضح از زوایای مختلف</li></ul><div className="vehicleCommissionNote"><FileText size={17}/><span>کمیسیون و شرایط همکاری باید پیش از معرفی خریدار، شفاف و مکتوب تأیید شوند.</span></div></div>
      <VehicleSubmissionForm/>
   </div></section>

    <footer className="innerFooter"><div className="container footerBottom"><span>ماکسیکار · خریدوفروش تخصصی خودرو</span><span>در شروع: ماکسیما · مورانو · تیانا</span></div></footer>
  </main>;
}