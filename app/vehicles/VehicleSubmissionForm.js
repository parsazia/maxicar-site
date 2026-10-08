"use client";

import { useState } from "react";
import { ArrowLeft, MessageCircle, ShieldCheck } from "lucide-react";

const WA = "989939161210";

export default function VehicleSubmissionForm() {
  const [model,setModel] = useState("");
  const [year,setYear] = useState("");
  const [mileage,setMileage] = useState("");
  const [price,setPrice] = useState("");
  const [description,setDescription] = useState("");
  const [contact,setContact] = useState("");

  function submitVehicle(event) {
    event.preventDefault();
    if (!model || !contact.trim()) return;
    const message = [
      "سلام، می‌خواهم خودروی خود را از طریق ماکسیکار برای فروش معرفی کنم.",
      "",
      "مدل خودرو: " + model,
      "سال ساخت: " + (year.trim() || "ذکر نشده"),
      "کارکرد: " + (mileage.trim() || "ذکر نشده"),
      "قیمت پیشنهادی (تومان): " + (price.trim() || "ذکر نشده"),
      "توضیحات و وضعیت خودرو: " + (description.trim() || "ذکر نشده"),
      "شماره تماس فروشنده: " + contact.trim()
    ].join("\n");
    window.open("https://wa.me/" + WA + "?text=" + encodeURIComponent(message), "_blank", "noopener,noreferrer");
  }

  return <form className="vehicleFormPreview" onSubmit={submitVehicle}>
    <label>مدل خودرو *<select required value={model} onChange={e=>setModel(e.target.value)}><option value="" disabled>انتخاب کن</option><option>ماکسیما</option><option>مورانو</option><option>تیانا</option></select></label>
    <div className="requestFieldRow"><label>سال ساخت<input value={year} onChange={e=>setYear(e.target.value)} placeholder="مثلاً ۱۳۹۵"/></label><label>کارکرد<input value={mileage} onChange={e=>setMileage(e.target.value)} placeholder="کیلومتر"/></label></div>
    <label>قیمت پیشنهادی (تومان)<input value={price} onChange={e=>setPrice(e.target.value)} inputMode="numeric" placeholder="قیمت مدنظر فروشنده"/></label>
    <label>توضیحات و وضعیت خودرو<textarea value={description} onChange={e=>setDescription(e.target.value)} rows={3} placeholder="وضعیت بدنه، فنی، تعمیرات و نکات مهم"/></label>
    <label>شماره تماس فروشنده *<input required value={contact} onChange={e=>setContact(e.target.value)} inputMode="tel" placeholder="شماره‌ای که بتوانیم با شما تماس بگیریم"/></label>
    <div className="requestDisclaimer"><ShieldCheck size={15}/> با ثبت درخواست، آگهی هنوز منتشر نمی‌شود؛ تیم ماکسیکار ابتدا اطلاعات را بررسی می‌کند.</div>
    <button className="primaryLink requestSubmit" type="submit">ارسال اطلاعات در واتساپ <ArrowLeft size={16}/></button>
    <a className="vehicleWhatsAppDirect" href={"https://wa.me/"+WA+"?text="+encodeURIComponent("سلام، درباره ثبت خودرو برای فروش در ماکسیکار سؤال دارم.")} target="_blank" rel="noreferrer"><MessageCircle size={16}/> سؤال دارم؛ گفتگو در واتساپ</a>
  </form>;
}