import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";

export default function NotFound() {
  return <main className="innerPage"><div className="container notFound"><span className="eyebrow">404 / صفحه پیدا نشد</span><h1>این مسیر پیدا نشد.</h1><p>ممکن است نشانی اشتباه باشد یا این صفحه هنوز ساخته نشده باشد.</p><div><Link className="primaryLink" href="/"><ArrowRight size={16}/> بازگشت به صفحه اصلی</Link><Link className="secondaryLink" href="/#search"><Search size={16}/> جست‌وجوی قطعه</Link></div></div></main>;
}
