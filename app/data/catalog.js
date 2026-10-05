export const cars = [
  { slug: "maxima", name: "نیسان ماکسیما", en: "NISSAN MAXIMA", years: "مدل‌های مختلف", intro: "قطعات یدکی نیسان ماکسیما؛ از موتور و گیربکس تا بدنه، برق و داخل کابین." },
  { slug: "murano", name: "نیسان مورانو", en: "NISSAN MURANO", years: "مدل‌های مختلف", intro: "جست‌وجوی قطعات نیسان مورانو بر اساس سیستم خودرو و نام قطعه." },
  { slug: "teana", name: "نیسان تیانا", en: "NISSAN TEANA", years: "مدل‌های مختلف", intro: "دسترسی ساختاریافته به قطعات نیسان تیانا با امکان استعلام مشخصات و موجودی." },
];

export const systems = [
  { slug: "engine", name: "موتور و متعلقات", terms: ["موتور", "engine", "موتور فن بخاری"] },
  { slug: "transmission", name: "گیربکس", terms: ["گیربکس", "transmission"] },
  { slug: "suspension", name: "تعلیق و جلوبندی", terms: ["جلوبندی", "تعلیق", "suspension"] },
  { slug: "steering", name: "فرمان و هیدرولیک", terms: ["فرمان", "هیدرولیک", "steering"] },
  { slug: "brakes", name: "ترمز", terms: ["ترمز", "brake"] },
  { slug: "electrical", name: "برق و الکترونیک", terms: ["برق", "الکترونیک", "electrical"] },
  { slug: "cooling", name: "خنک‌کاری", terms: ["رادیاتور", "خنک‌کاری", "cooling"] },
  { slug: "ac-heater", name: "کولر و بخاری", terms: ["کولر", "بخاری", "فن بخاری", "heater", "ac"] },
  { slug: "fuel", name: "سوخت و انژکتور", terms: ["سوخت", "انژکتور", "fuel"] },
  { slug: "exhaust", name: "اگزوز", terms: ["اگزوز", "exhaust"] },
  { slug: "body", name: "بدنه", terms: ["بدنه", "body"] },
  { slug: "lighting", name: "چراغ و روشنایی", terms: ["چراغ", "هدلایت", "headlight", "lighting"] },
  { slug: "mirrors-glass", name: "آینه و شیشه", terms: ["آینه", "شیشه", "mirror", "glass"] },
  { slug: "interior", name: "داخل کابین", terms: ["کابین", "داشبورد", "داخل", "interior"] },
  { slug: "audio", name: "صوتی و تصویری", terms: ["صوتی", "مانیتور", "audio"] },
  { slug: "safety", name: "ایمنی", terms: ["ایمنی", "airbag", "کیسه هوا"] },
  { slug: "service", name: "مصرفی و سرویس", terms: ["سرویس", "مصرفی", "فیلتر"] },
];

export const products = [
  { slug: "maxima-heater-blower-motor", name: "موتور فن بخاری ماکسیما", car: "maxima", carName: "ماکسیما", system: "ac-heater", condition: "کارکرده", status: "استعلام موجودی", partNumber: "برای ثبت کد فنی نیاز به بررسی دارد", note: "نمونه نمایشی برای بررسی مسیر خرید؛ موجودی و مشخصات نهایی باید تأیید شوند.", aliases: ["فن بخاری", "موتور دمنده", "blower motor", "heater fan"] },
  { slug: "maxima-ichiko-headlamp", name: "چراغ جلو ماکسیما ایچیکو", car: "maxima", carName: "ماکسیما", system: "lighting", condition: "کارکرده", status: "استعلام موجودی", partNumber: "برای ثبت کد فنی نیاز به بررسی دارد", note: "در قطعه کارکرده، عکس همان قطعه و وضعیت پایه‌ها و طلق باید پیش از سفارش بررسی شود.", aliases: ["هدلایت", "چراغ جلو", "headlight", "چراغ ماکسیما"] },
  { slug: "maxima-power-steering-hose", name: "شلنگ فشار قوی هیدرولیک فرمان ماکسیما", car: "maxima", carName: "ماکسیما", system: "steering", condition: "کارکرده", status: "استعلام موجودی", partNumber: "برای ثبت کد فنی نیاز به بررسی دارد", note: "پیش از سفارش، تطبیق مدل خودرو و نوع شلنگ باید بررسی شود.", aliases: ["شلنگ هیدرولیک", "شلنگ فرمان", "power steering hose"] },
  { slug: "maxima-heater-module", name: "ماژول بخاری ماکسیما", car: "maxima", carName: "ماکسیما", system: "ac-heater", condition: "کارکرده", status: "استعلام موجودی", partNumber: "برای ثبت کد فنی نیاز به بررسی دارد", note: "نمونه نمایشی؛ وضعیت موجودی، شماره قطعه و سازگاری باید تأیید شود.", aliases: ["کنترل بخاری", "پنل بخاری", "heater control"] },
];

export function normalize(value = "") {
  return value.toLocaleLowerCase("fa").replace(/[يى]/g, "ی").replace(/ك/g, "ک").replace(/[\u200c\s\-_.]/g, "");
}

export function searchCatalog(query = "") {
  const q = normalize(query.trim());
  if (!q) return [];
  return products.filter((p) => normalize([p.name, p.carName, p.partNumber, p.condition, ...p.aliases].join(" ")).includes(q)
    || normalize(q).split("").length > 0 && p.aliases.some((alias) => normalize(alias).includes(q)));
}
