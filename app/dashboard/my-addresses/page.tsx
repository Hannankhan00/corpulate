import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import MyAddressesClient from "./MyAddressesClient";

export default async function MyAddressesPage() {
  const session = await getSession();
  if (!session?.userId) redirect("/");

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
  });

  if (!user) redirect("/");

  const addresses = await prisma.userAddress.findMany({
    where: { userId: session.userId },
    orderBy: [
      { isDefault: "desc" },
      { createdAt: "desc" },
    ],
  });

  return <MyAddressesClient user={{ firstName: user.firstName }} addresses={addresses} />;
}
