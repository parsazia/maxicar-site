import CarParts from "../CarParts";
import { cars } from "../../data/catalog";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { car: slug } = await params;
  const car = cars.find((item) => item.slug === slug);
  return { title: car ? car.name + " | قطعات یدکی ماکسیکار" : "خودرو | ماکسیکار", description: car?.intro || "دسته‌بندی قطعات نیسان در ماکسیکار." };
}

export default async function CarPage({ params }) {
  const { car } = await params;
  if (!cars.some((item) => item.slug === car)) notFound();
  return <CarParts slug={car} />;
}
