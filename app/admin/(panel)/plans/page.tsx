import { getAllPlans } from "@/app/actions/admin-services";
import PlansClient from "./PlansClient";

export default async function PlansPage() {
  const plans = await getAllPlans();
  return <PlansClient plans={plans} />;
}
