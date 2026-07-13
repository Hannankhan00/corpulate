import { getServiceCountries } from "@/app/actions/admin-services";
import CountriesClient from "./CountriesClient";

export default async function CountriesPage() {
  const countries = await getServiceCountries();
  return <CountriesClient countries={countries} />;
}
