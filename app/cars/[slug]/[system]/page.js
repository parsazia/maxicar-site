import CarParts from "../../CarParts";

export const dynamic = "force-dynamic";

export default async function CarSystemPage({ params }) {
  const { slug, system } = await params;
  return <CarParts slug={slug} systemSlug={system} />;
}
