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
          addresses: true,
        },
      },
    },
  });
}

export async function getPaymentsData() {
  await requireAdminSession();

  const apps = await prisma.application.findMany({
    where: { OR: [{ isPaid: true }, { paymentMethod: "bank_transfer" }] },
    include: { user: { select: { firstName: true, lastName: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });

  const paid     = apps.filter(a => a.isPaid && a.amountPaid);
  const totalRev = paid.reduce((s, a) => s + (a.amountPaid ?? 0), 0);
  const cardRev  = paid.filter(a => a.paymentMethod !== "bank_transfer").reduce((s, a) => s + (a.amountPaid ?? 0), 0);
  const bankRev  = paid.filter(a => a.paymentMethod === "bank_transfer").reduce((s, a) => s + (a.amountPaid ?? 0), 0);
  const pending  = apps.filter(a => a.paymentMethod === "bank_transfer" && a.transferStatus === "pending_review").length;

  // last 6 months buckets
  const now = new Date();
  const months: { label: string; revenue: number; count: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const next = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    const label = d.toLocaleDateString("en-GB", { month: "short", year: "2-digit" });
    const bucket = paid.filter(a => {
      const t = new Date(a.createdAt);
      return t >= d && t < next;
    });
    months.push({ label, revenue: bucket.reduce((s, a) => s + (a.amountPaid ?? 0), 0), count: bucket.length });
  }

  return {
    totalRev, cardRev, bankRev, pendingCount: pending,
    cardCount: paid.filter(a => a.paymentMethod !== "bank_transfer").length,
    bankCount:  paid.filter(a => a.paymentMethod === "bank_transfer").length,
    months,
    transactions: apps.map(a => ({
      id:             a.id,
      companyName:    a.companyName,
      plan:           a.plan,
      billingPeriod:  a.billingPeriod,
      country:        a.country,
      amountPaid:     a.amountPaid,
      isPaid:         a.isPaid,
      paymentMethod:  a.paymentMethod,
      transferStatus: a.transferStatus,
      stripePaymentId: a.stripePaymentId,
      createdAt:      a.createdAt.toISOString(),
      user: { firstName: a.user.firstName, lastName: a.user.lastName, email: a.user.email },
    })),
  };
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
