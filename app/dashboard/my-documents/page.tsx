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

  const docs = await prisma.userDocument.findMany({
    where: { userId: session.userId },
    orderBy: { uploadedAt: "desc" },
  });

  const formattedDocs = docs.map((d) => ({
    id: d.id,
    name: d.name,
    date: d.uploadedAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    size:
      d.fileSize > 1024 * 1024
        ? `${(d.fileSize / (1024 * 1024)).toFixed(1)} MB`
        : `${(d.fileSize / 1024).toFixed(0)} KB`,
    status: d.status,
    source: d.source as "corpulate" | "user",
  }));

  return <MyDocsClient user={{ firstName: user.firstName }} initialDocuments={formattedDocs} />;
}
