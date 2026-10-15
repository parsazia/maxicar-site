import CarParts from "../../CarParts";
import { cars, systems } from "../../../data/catalog";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { car: carSlug, system: systemSlug } = await params;
  const car = cars.find((item) => item.slug === carSlug);
  const system = systems.find((item) => item.slug === systemSlug);
  return { title: car && system ? system.name + " " + car.name + " | ماکسیکار" : "دسته‌بندی قطعات | ماکسیکار", description: "قطعات واقعی فروشگاه برای " + (car?.name || "نیسان") + " در گروه " + (system?.name || "قطعات یدکی") + "." };
}

export default async function SystemPage({ params }) {
  const { car, system } = await params;
  if (!cars.some((item) => item.slug === car) || !systems.some((item) => item.slug === system)) notFound();
  return <CarParts slug={car} systemSlug={system} />;
}
