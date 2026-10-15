import CarParts from "../CarParts";

export const dynamic = "force-dynamic";

export default async function CarPage({ params }) {
  const { slug } = await params;
  return <CarParts slug={slug} />;
}
