"use client";

import { useState } from "react";
import { ArrowLeft, MessageCircle, ShieldCheck } from "lucide-react";

const WA = "989939161210";

export default function ImportRequestForm() {
  const [product, setProduct] = useState("");
  const [details, setDetails] = useState("");
  const [quantity, setQuantity] = useState("");
  const [destination, setDestination] = useState("ایران");
  const [notes, setNotes] = useState("");

  function submitRequest(event) {
    event.preventDefault();
    if (!product.trim()) return;
    const message = [
      "سلام، برای تأمین کالا از طریق ماکسیکار درخواست دارم.",
      "",
      "نام کالا: " + product.trim(),
      "لینک یا مشخصات: " + (details.trim() || "ذکر نشده"),
      "تعداد: " + (quantity.trim() || "ذکر نشده"),
      "مقصد تحویل: " + destination,
      "توضیحات: " + (notes.trim() || "ذکر نشده")
    ].join("\n");
    window.open("https://wa.me/" + WA + "?text=" + encodeURIComponent(message), "_blank", "noopener,noreferrer");
  }

  return <div className="requestBox">
    <div>
      <span className="eyebrow">ثبت درخواست تأمین</span>
      <h2>چه کالایی می‌خواهی؟</h2>
      <p>مشخصات را وارد کن تا متن درخواست در واتساپ آماده شود. ارسال نهایی با تأیید خودت انجام می‌شود.</p>
      <a className="requestChannel requestWhatsAppLink" href={"https://wa.me/" + WA + "?text=" + encodeURIComponent("سلام، برای تأمین کالا از طریق ماکسیکار راهنمایی می‌خواهم.")} target="_blank" rel="noreferrer">
        <MessageCircle size={20}/><span><b>ارتباط مستقیم در واتساپ</b><small>۰۹۹۳ ۹۱۶ ۱۲۱۰</small></span><ArrowLeft size={16}/>
      </a>
    </div>
    <form className="requestFields" onSubmit={submitRequest}>
      <label>نام کالا یا محصول *<input required value={product} onChange={e=>setProduct(e.target.value)} placeholder="مثلاً دستگاه، قطعه یا کالای مصرفی"/></label>
      <label>لینک یا مشخصات کالا<input value={details} onChange={e=>setDetails(e.target.value)} placeholder="لینک فروشنده، برند یا مدل (اختیاری)"/></label>
      <div className="requestFieldRow"><label>تعداد<input value={quantity} onChange={e=>setQuantity(e.target.value)} placeholder="مثلاً ۲۰ عدد"/></label><label>مقصد تحویل<select value={destination} onChange={e=>setDestination(e.target.value)}><option>ایران</option><option>کشور دیگر</option></select></label></div>
      <label>توضیحات تکمیلی<textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder="بودجه تقریبی، زمان موردنیاز یا مشخصات مهم" rows={3}/></label>
      <div className="requestDisclaimer"><ShieldCheck size={15}/> ثبت درخواست به معنی تضمین تأمین نیست؛ ابتدا امکان انجام سفارش بررسی می‌شود.</div>
      <button className="primaryLink requestSubmit" type="submit">ادامه و ارسال از طریق واتساپ <ArrowLeft size={16}/></button>
    </form>
  </div>;
}