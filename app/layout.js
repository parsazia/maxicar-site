import "./globals.css";

export const metadata = {
  metadataBase: new URL("https://maxicar-site.vercel.app"),
  title: { default: "ماکسیکار | قطعات نیسان ماکسیما، مورانو و تیانا", template: "%s | ماکسیکار" },
  description: "مرجع تخصصی قطعات نیسان ماکسیما، مورانو و تیانا؛ جست‌وجوی قطعه، بررسی مشخصات و استعلام موجودی.",
  applicationName: "ماکسیکار",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }) {
  return <html lang="fa" dir="rtl"><body>{children}</body></html>;
}
