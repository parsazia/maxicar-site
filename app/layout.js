import "./globals.css";
import ServiceWorkerRegister from "./sw-register";

export const metadata = {
  metadataBase: new URL("https://maxicar-site.vercel.app"),
  title: { default: "ماکسیکار | قطعات نیسان ماکسیما، مورانو و تیانا", template: "%s | ماکسیکار" },
  description: "مرجع تخصصی قطعات نیسان ماکسیما، مورانو و تیانا؛ جست‌وجوی قطعه، بررسی مشخصات و استعلام موجودی.",
  applicationName: "ماکسیکار",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [{ url: "/maxicar-icon.svg", type: "image/svg+xml" }]
  },
  appleWebApp: {
    capable: true,
    title: "ماکسیکار",
    statusBarStyle: "default"
  },
  robots: process.env.VERCEL_ENV === "production" ? { index: true, follow: true } : { index: false, follow: false },
};

export const viewport = {
  themeColor: "#123d70",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover"
};

export default function RootLayout({ children }) {
  return (
    <html lang="fa" dir="rtl">
      <body>
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
