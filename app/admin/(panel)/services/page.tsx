import { getServiceCountries } from "@/app/actions/admin-services";
import ServicesClient from "./ServicesClient";

export default async function ServicesPage() {
  const countries = await getServiceCountries();
  return <ServicesClient countries={countries} />;
}
