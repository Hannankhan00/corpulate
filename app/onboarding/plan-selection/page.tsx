import { getActivePlans } from "@/app/actions/admin-services";
import PlanSelectionClient from "./PlanSelectionClient";

export default async function PlanSelectionPage({
  searchParams,
}: {
  searchParams: Promise<{ country?: string; type?: string }>;
}) {
  const { country = "uk", type = "llc" } = await searchParams;
  const plans = await getActivePlans();

  return <PlanSelectionClient country={country} type={type} plans={plans} />;
}
