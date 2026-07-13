import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getActivePlans } from "@/app/actions/admin-services";
import ServicesClient from "./ServicesClient";

export default async function ServicesPage() {
  const session = await getSession();
  if (!session?.userId) redirect("/");

  const [user, latestApp, plans] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.userId },
    }),
    prisma.application.findFirst({
      where: { userId: session.userId },
      orderBy: { createdAt: "desc" },
    }),
    getActivePlans(false),
  ]);

  if (!user) redirect("/");

  const defaultCountry = latestApp?.country ?? "us";
  const defaultType = latestApp?.companyType ?? "llc";

  return (
    <ServicesClient
      user={{ firstName: user.firstName }}
      services={plans}
      defaultCountry={defaultCountry}
      defaultType={defaultType}
    />
  );
}
