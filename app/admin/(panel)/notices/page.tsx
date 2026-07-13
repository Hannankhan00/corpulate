import { prisma } from "@/lib/prisma";
import AdminNoticesClient from "./AdminNoticesClient";

export default async function AdminNoticesPage() {
  const users = await prisma.user.findMany({
    select: { id: true, firstName: true, lastName: true, email: true },
    orderBy: { createdAt: "desc" },
  });

  const notices = await prisma.userNotice.findMany({
    include: {
      user: {
        select: { firstName: true, lastName: true, email: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return <AdminNoticesClient users={users} initialNotices={notices} />;
}
