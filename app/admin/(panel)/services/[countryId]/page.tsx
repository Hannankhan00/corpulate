import { notFound } from "next/navigation";
import { getServiceCountry } from "@/app/actions/admin-services";
import CountryConfigClient from "./CountryConfigClient";

export default async function CountryConfigPage({
  params,
}: {
  params: Promise<{ countryId: string }>;
}) {
  const { countryId } = await params;
  const country = await getServiceCountry(countryId);
  if (!country) notFound();
  return <CountryConfigClient country={country} />;
}
