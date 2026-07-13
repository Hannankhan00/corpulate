import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import CheckoutClient from "./CheckoutClient";
import { getPublicBankDetails } from "@/app/actions/bankTransfer";

const ADDON_PRICES: Record<string, number> = {
  "registered-agent":    99,
  "ein":                 49,
  "operating-agreement": 79,
  "annual-report":       149,
};

const ADDON_NAMES: Record<string, string> = {
  "registered-agent":    "Registered Agent Service",
  "ein":                 "EIN / Tax ID Application",
  "operating-agreement": "Operating Agreement",
  "annual-report":       "Annual Report Filing",
};

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{
    country?: string; type?: string; plan?: string; billing?: string;
    state?: string; stateFee?: string; addons?: string;
  }>;
}) {
  const {
    country = "uk", type = "llc", plan: planSlug = "starter",
    billing = "monthly", state = "", stateFee = "0", addons = "",
  } = await searchParams;

  const [planRecord, bankDetails] = await Promise.all([
    prisma.servicePlan.findUnique({ where: { slug: planSlug } }),
    getPublicBankDetails(),
  ]);
  if (!planRecord) redirect("/onboarding/plan-selection");

  const isSubscription = planRecord.isSubscription;

  const planPrice = (isSubscription && billing === "annual")
    ? Math.round(planRecord.monthlyPrice * 12 * (1 - planRecord.annualDiscountPct / 100))
    : planRecord.monthlyPrice;

  const stateFeeNum = parseInt(stateFee) || 0;

  const selectedAddonIds = addons ? addons.split(",").filter(Boolean) : [];
  const addonItems = selectedAddonIds.map((id) => ({
    id,
    name: ADDON_NAMES[id] ?? id,
    price: ADDON_PRICES[id] ?? 0,
  }));
  const addonTotal = addonItems.reduce((s, a) => s + a.price, 0);
  const total = planPrice + stateFeeNum + addonTotal;

  let planFeatures: string[] = [];
  try { planFeatures = JSON.parse(planRecord.features) as string[]; } catch { /* empty */ }

  return (
    <CheckoutClient
      country={country}
      type={type}
      plan={planSlug}
      billing={billing}
      planName={planRecord.name}
      planPrice={planPrice}
      planFeatures={planFeatures}
      state={state || null}
      stateFee={stateFeeNum}
      addonItems={addonItems}
      addonTotal={addonTotal}
      total={total}
      addons={addons}
      bankDetails={bankDetails}
      isSubscription={isSubscription}
    />
  );
}
