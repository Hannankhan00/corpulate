"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { requireAdminSession } from "@/app/actions/admin-auth";
import { redirect } from "next/navigation";
import { redeemPromoCode } from "@/app/actions/promo";
import { revalidatePath } from "next/cache";
import { uploadFile, getSignedFileUrl } from "@/lib/s3";

export async function getPublicBankDetails() {
  const d = await prisma.bankDetails.findFirst({ orderBy: { updatedAt: "desc" } });
  if (!d) return null;
  return {
    bankName:      d.bankName,
    accountName:   d.accountName,
    accountNumber: d.accountNumber,
    sortCode:      d.sortCode,
    iban:          d.iban,
    swift:         d.swift,
    reference:     d.reference,
    notes:         d.notes ?? null,
  };
}

export async function submitBankTransferProof(
  formData: FormData,
): Promise<{ error: string } | undefined> {
  const session = await getSession();
  if (!session?.userId) redirect("/");

  const file = formData.get("screenshot") as File | null;
  if (!file || file.size === 0)
    return { error: "Please upload a screenshot of your transfer." };
  if (!file.type.startsWith("image/") && file.type !== "application/pdf")
    return { error: "Please upload an image (JPG, PNG) or PDF file." };
  if (file.size > 10 * 1024 * 1024)
    return { error: "File must be under 10 MB." };

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const get = (k: string) => (formData.get(k) as string | null) ?? null;

  const app = await prisma.application.create({
    data: {
      userId:         session.userId,
      companyName:    get("companyName"),
      companyName2:   get("companyName2"),
      companyName3:   get("companyName3"),
      description:    get("description"),
      industry:       get("industry"),
      revenue:        get("revenue"),
      website:        get("website"),
      companyType:    get("companyType") ?? "llc",
      plan:           get("plan") ?? "starter",
      billingPeriod:  get("billingPeriod") ?? "monthly",
      state:          get("state"),
      country:        get("country") ?? "uk",
      addons:         get("addons"),
      amountPaid:     parseInt(get("amountPaid") ?? "0") || 0,
      promoCode:      get("promoCode"),
      discountAmount: get("discountAmount") ? parseInt(get("discountAmount")!) || null : null,
      paymentMethod:  "bank_transfer",
      transferStatus: "pending_review",
      isPaid:         false,
      status:         "pending",
    },
  });

  const fileKey = `transfers/${app.id}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
  await uploadFile(fileKey, buffer, file.type);

  await prisma.applicationDocument.create({
    data: {
      applicationId: app.id,
      docName:  "transfer_proof",
      fileName: file.name,
      mimeType: file.type,
      fileSize: file.size,
      fileKey,
    },
  });

  const pc = get("promoCode");
  if (pc) await redeemPromoCode(pc);

  redirect("/dashboard");
}

export async function getPendingTransfers() {
  await requireAdminSession();
  const rows = await prisma.application.findMany({
    where: { paymentMethod: "bank_transfer" },
    include: {
      user: true,
      documents: { where: { docName: "transfer_proof" } },
    },
    orderBy: { createdAt: "desc" },
  });

  return await Promise.all(rows.map(async (r) => {
    let screenshotUrl = null;
    if (r.documents[0]) {
      screenshotUrl = await getSignedFileUrl(r.documents[0].fileKey);
    }

    return {
      id:             r.id,
      companyName:    r.companyName,
      plan:           r.plan,
      amountPaid:     r.amountPaid,
      transferStatus: r.transferStatus,
      transferNote:   r.transferNote,
      createdAt:      r.createdAt.toISOString(),
      user: {
        firstName: r.user.firstName,
        lastName:  r.user.lastName,
        email:     r.user.email,
      },
      screenshot: r.documents[0]
        ? {
            id:       r.documents[0].id,
            fileName: r.documents[0].fileName,
            mimeType: r.documents[0].mimeType,
            dataUrl:  screenshotUrl,
          }
        : null,
    };
  }));
}

export async function approveTransfer(appId: string): Promise<{ ok: true }> {
  await requireAdminSession("ADMIN");
  await prisma.application.update({
    where: { id: appId },
    data: { transferStatus: "approved", isPaid: true },
  });
  revalidatePath("/admin/transfers");
  return { ok: true };
}

export async function rejectTransfer(appId: string, note: string): Promise<{ ok: true }> {
  await requireAdminSession("ADMIN");
  await prisma.application.update({
    where: { id: appId },
    data: { transferStatus: "rejected", transferNote: note || null },
  });
  revalidatePath("/admin/transfers");
  return { ok: true };
}

export async function getBankDetailsAdmin() {
  await requireAdminSession();
  return prisma.bankDetails.findFirst({ orderBy: { updatedAt: "desc" } });
}

export async function saveBankDetails(
  formData: FormData,
): Promise<{ ok: true } | { error: string }> {
  await requireAdminSession("ADMIN");
  const get = (k: string) => ((formData.get(k) as string) ?? "").trim();

  const data = {
    bankName:      get("bankName"),
    accountName:   get("accountName"),
    accountNumber: get("accountNumber"),
    sortCode:      get("sortCode"),
    iban:          get("iban"),
    swift:         get("swift"),
    reference:     get("reference"),
    notes:         get("notes") || null,
  };

  const existing = await prisma.bankDetails.findFirst();
  if (existing) {
    await prisma.bankDetails.update({ where: { id: existing.id }, data });
  } else {
    await prisma.bankDetails.create({ data });
  }

  revalidatePath("/admin/bank-settings");
  return { ok: true };
}
