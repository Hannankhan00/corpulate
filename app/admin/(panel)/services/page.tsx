import { getStandaloneServices } from "@/app/actions/admin-services";
import ServicesClient from "./ServicesClient";

export default async function ServicesPage() {
  const plans = await getStandaloneServices();
  return <ServicesClient plans={plans} />;
}
