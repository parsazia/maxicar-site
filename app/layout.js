import "./globals.css";

export const metadata = {
  title: "ماکسیکار | قطعات نیسان ماکسیما، مورانو و تیانا",
  description: "مرجع تخصصی قطعات نیسان ماکسیما، مورانو و تیانا؛ جست‌وجوی سریع قطعه، کد فنی و وضعیت موجودی.",
};

export default function RootLayout({ children }) {
  return <html lang="fa" dir="rtl"><body>{children}</body></html>;
}
