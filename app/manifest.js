export default function manifest() {
  return {
    id: "/",
    name: "ماکسیکار | مرجع تخصصی قطعات نیسان",
    short_name: "ماکسیکار",
    description: "جست‌وجو و بررسی قطعات نیسان ماکسیما، مورانو و تیانا",
    lang: "fa",
    dir: "rtl",
    start_url: "/",
    scope: "/",
    display: "standalone",
    display_override: ["standalone", "minimal-ui"],
    orientation: "portrait-primary",
    background_color: "#f5f6f7",
    theme_color: "#123d70",
    categories: ["shopping", "automotive"],
    icons: [
      {
        src: "/maxicar-icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any"
      },
      {
        src: "/maxicar-icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable"
      }
    ]
  };
}
