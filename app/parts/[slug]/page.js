import ProductDetail from "./ProductDetail";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  return {
    title: "جزئیات قطعه | ماکسیکار",
    description: "بررسی قیمت، مشخصات و وضعیت قطعات نیسان در ماکسیکار.",
    robots: { index: false, follow: false },
  };
}

export default async function PartPage({ params }) {
  const { slug } = await params;
  return <ProductDetail slug={slug} />;
}
