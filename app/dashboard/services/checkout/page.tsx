import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getPublicBankDetails } from "@/app/actions/bankTransfer";
import CheckoutClient from "./CheckoutClient";

export default async function ServicesCheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{
    plan?: string;
  }>;
}) {
  const session = await getSession();
  if (!session?.userId) redirect("/");

  const { plan: planSlug = "" } = await searchParams;
  if (!planSlug) redirect("/dashboard/services");

  const [user, planRecord, bankDetails] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.userId } }),
    prisma.servicePlan.findUnique({ where: { slug: planSlug } }),
    getPublicBankDetails(),
  ]);

  if (!user || !planRecord || planRecord.isSubscription) {
    redirect("/dashboard/services");
  }

  let planFeatures: string[] = [];
  try {
    planFeatures = JSON.parse(planRecord.features) as string[];
  } catch {
    planFeatures = [];
  }

  const latestApp = await prisma.application.findFirst({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
  });

  const defaultCountry = latestApp?.country ?? "us";
  const defaultType = latestApp?.companyType ?? "llc";

  return (
    <CheckoutClient
      user={{ firstName: user.firstName, email: user.email }}
      plan={{
        slug: planRecord.slug,
        name: planRecord.name,
        price: planRecord.monthlyPrice,
        description: planRecord.description ?? "",
        features: planFeatures,
      }}
      defaultCountry={defaultCountry}
      defaultType={defaultType}
      bankDetails={bankDetails}
    />
  );
}
