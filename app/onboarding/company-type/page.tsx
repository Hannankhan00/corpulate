import { getCompanyTypesByIso } from "@/app/actions/admin-services";
import CompanyTypeClient from "./CompanyTypeClient";

export default async function CompanyTypePage({
  searchParams,
}: {
  searchParams: Promise<{ country?: string }>;
}) {
  const { country = "uk" } = await searchParams;
  const isoCode = country.toLowerCase() === "uk" ? "GB" : country.toUpperCase();
  const companyTypes = await getCompanyTypesByIso(isoCode);

  return <CompanyTypeClient country={country} companyTypes={companyTypes} />;
}
