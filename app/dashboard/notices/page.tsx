import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import NoticesClient from "./NoticesClient";

export default async function UserNoticesPage() {
  const session = await getSession();
  if (!session?.userId) redirect("/");

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
  });

  if (!user) redirect("/");

  const notices = await prisma.userNotice.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
  });

  return <NoticesClient user={{ firstName: user.firstName }} notices={notices} />;
}
