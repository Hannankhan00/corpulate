"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/app/actions/admin-auth";

export async function getAdminStats() {
  await requireAdminSession();
  const [totalUsers, totalApps, pending, inReview, processing, completed, rejected] =
    await Promise.all([
      prisma.user.count(),
      prisma.application.count(),
      prisma.application.count({ where: { status: "pending" } }),
      prisma.application.count({ where: { status: "in_review" } }),
      prisma.application.count({ where: { status: "processing" } }),
      prisma.application.count({ where: { status: "completed" } }),
      prisma.application.count({ where: { status: "rejected" } }),
    ]);
  return { totalUsers, totalApps, pending, inReview, processing, completed, rejected };
}

export async function getAdminApplications(status?: string) {
  await requireAdminSession();
  return prisma.application.findMany({
    where: status && status !== "all" ? { status } : undefined,
    include: {
      user: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          createdAt: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getAdminApplication(id: string) {
  await requireAdminSession();
  return prisma.application.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          createdAt: true,
        },
      },
    },
  });
}

export async function updateApplicationStatus(_prev: unknown, formData: FormData) {
  // SUPPORT cannot update statuses
  await requireAdminSession("ADMIN");
  const id = formData.get("id") as string;
  const status = formData.get("status") as string;
  const adminNotes = formData.get("adminNotes") as string;
  await prisma.application.update({ where: { id }, data: { status, adminNotes } });
  revalidatePath(`/admin/customers/${id}`);
  revalidatePath("/admin");
  revalidatePath("/admin/customers");
  revalidatePath("/admin/work-queue");
}
