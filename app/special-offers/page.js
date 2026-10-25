import Link from "next/link";
import { ArrowRight, ArrowLeft, BadgePercent, Tag, Search, CarFront } from "lucide-react";

export const metadata = {
  title: "تخفیفات ویژه ماکسیکار",
  description: "مشاهده پیشنهادها و شرایط تخفیف محصولات ماکسیکار.",
};

export default function SpecialOffersPage() {
  return <main>
    <div className="announcement"><div className="container announcementInner"><span>ماکسیکار | پیشنهادهای ویژه</span><span className="announcementSide">صفحه اختصاصی تخفیفات</span></div></div>
    <header className="siteHeader container">
      <Link href="/" className="brand"><span className="brandSymbol"><span>M</span></span><span className="brandWords"><b>ماکسیکار</b><small>قطعات · واردات · خودرو</small></span></Link>
      <nav className="desktopNav"><Link href="/">صفحه اصلی</Link><Link href="/#sample-parts">فروشگاه قطعات</Link><Link href="/import-trade">واردات قطعات</Link><Link href="/vehicles">خرید و فروش خودرو</Link></nav>
      <Link className="headerAction" href="/#search"><Search size={17}/><span>جست‌وجوی قطعه</span></Link>
    </header>
    <section className="offersHero"><div className="container offersHeroInner"><div><span className="promotionEyebrow"><BadgePercent size={18}/> صفحه پیشنهادهای ماکسیکار</span><h1>تخفیفات ویژه</h1><p>در این صفحه، جزئیات هر پیشنهاد، محصولات مشمول و شرایط استفاده از تخفیف نمایش داده می‌شود.</p><Link className="offersPrimary" href="/#sample-parts">مشاهده محصولات <ArrowLeft size={17}/></Link></div><div className="offersIcon"><Tag size={96} strokeWidth={1.1}/><span>%</span></div></div></section>
    <section className="container offersContent"><div className="offersIntro"><span className="eyebrow">اطلاعات پیشنهادها</span><h2>قبل از استفاده از تخفیف چه چیزی را بررسی کنید؟</h2><p>برای هر تخفیف، اطلاعات مربوط به همان پیشنهاد باید جداگانه بررسی شود. مبلغ یا درصد تخفیف، محصول یا محصولات مشمول، مدت اعتبار و هر شرط دیگری فقط در صورتی نمایش داده می‌شود که برای آن پیشنهاد مشخص شده باشد.</p></div>
      <div className="offersChecklist"><article><span><Tag size={20}/></span><div><b>محصولات مشمول</b><p>بررسی کنید تخفیف مربوط به کدام محصول یا محصولات است.</p></div></article><article><span><BadgePercent size={20}/></span><div><b>میزان تخفیف</b><p>مبلغ یا درصد تخفیف باید در توضیحات همان پیشنهاد درج شود؛ در این طرح عددی از پیش فرض نشده است.</p></div></article><article><span><CarFront size={20}/></span><div><b>سازگاری با خودرو</b><p>پیش از سفارش، مدل خودرو و مشخصات قطعه را با محصول انتخاب‌شده تطبیق دهید.</p></div></article></div>
      <div className="offersNotice"><b>توجه</b><p>جزئیات تخفیف فعال در این نمونه هنوز به داده‌های واقعی پیشنهادها متصل نشده است؛ بنابراین این صفحه مبلغ، درصد یا تاریخ اعتبار تأییدنشده‌ای نمایش نمی‌دهد.</p></div>
      <div className="offersBottom"><div><h2>دنبال قطعه مشخصی هستید؟</h2><p>جست‌وجو را با نام قطعه، مدل خودرو یا کد فنی شروع کنید.</p></div><Link href="/#search" className="offersPrimary">جست‌وجوی قطعه <ArrowLeft size={17}/></Link></div>
    </section>
    <footer><div className="container footerBottom"><Link href="/">بازگشت به صفحه اصلی ماکسیکار</Link><span>ماکسیکار | قطعات · واردات · خودرو</span></div></footer>
  </main>;
}
