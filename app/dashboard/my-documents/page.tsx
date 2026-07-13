import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import MyDocsClient from "./MyDocsClient";

export default async function MyDocumentsPage() {
  const session = await getSession();
  if (!session?.userId) redirect("/");

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
  });

  if (!user) redirect("/");

  return <MyDocsClient user={{ firstName: user.firstName }} />;
}
