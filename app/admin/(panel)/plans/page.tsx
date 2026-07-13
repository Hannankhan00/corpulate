import { getSubscriptionPlans } from "@/app/actions/admin-services";
import PlansClient from "./PlansClient";

export default async function PlansPage() {
  const plans = await getSubscriptionPlans();
  return <PlansClient plans={plans} />;
}
