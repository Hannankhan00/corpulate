"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function savePersonalInfo(_prev: unknown, formData: FormData) {
  const session = await getSession();
  if (!session?.userId) redirect("/");

  await prisma.user.update({
    where: { id: session.userId },
    data: {
      phone:          (formData.get("phone") as string) || null,
      streetAddress:  (formData.get("streetAddress") as string) || null,
      city:           (formData.get("city") as string) || null,
      province:       (formData.get("province") as string) || null,
      postalCode:     (formData.get("postalCode") as string) || null,
      addressCountry: (formData.get("addressCountry") as string) || null,
    },
  });

  const country = (formData.get("country") as string) || "uk";
  redirect(`/onboarding/company-type?country=${country}`);
}

export async function simulatePayment(applicationId: string) {
  const session = await getSession();
  if (!session?.userId) redirect("/");
  await prisma.application.update({
    where: { id: applicationId, userId: session.userId },
    data: { isPaid: true },
  });
  revalidatePath("/dashboard");
}

export async function submitApplicationInfo(_prev: unknown, formData: FormData) {
  const session = await getSession();
  if (!session?.userId) redirect("/");

  const applicationId = formData.get("applicationId") as string;

  // Verify the application belongs to this user
  const app = await prisma.application.findUnique({
    where: { id: applicationId, userId: session.userId },
  });
  if (!app) return { error: "Application not found." };

  // Save KYC text fields to User
  const str = (key: string) => (formData.get(key) as string | null)?.trim() || null;
  await prisma.user.update({
    where: { id: session.userId },
    data: {
      dateOfBirth:    str("dateOfBirth"),
      fatherName:     str("fatherName"),
      motherName:     str("motherName"),
      passportNumber: str("passportNumber"),
      nationalId:     str("nationalId"),
      ssn:            str("ssn"),
      taxId:          str("taxId"),
      streetAddress:  str("address") || undefined,
    },
  });

  // Save uploaded documents
  const docNames = formData.getAll("docName") as string[];
  for (const docName of docNames) {
    const key = `doc_${docName.replace(/\s+/g, "_")}`;
    const file = formData.get(key) as File | null;
    if (file && file.size > 0) {
      const fileData = Buffer.from(await file.arrayBuffer());
      // Delete any previous upload for the same doc on this application
      await prisma.applicationDocument.deleteMany({
        where: { applicationId, docName },
      });
      await prisma.applicationDocument.create({
        data: {
          applicationId,
          docName,
          fileName: file.name,
          mimeType: file.type || "application/octet-stream",
          fileSize: file.size,
          fileData,
        },
      });
    }
  }

  await prisma.application.update({
    where: { id: applicationId },
    data: { infoSubmitted: true },
  });

  revalidatePath("/dashboard");
  return { ok: true };
}

export async function submitApplication(_state: unknown, formData: FormData) {
  const session = await getSession();
  if (!session?.userId) redirect("/");
  await prisma.application.create({
    data: {
      userId: session.userId,
      companyName:  (formData.get("companyName") as string) || null,
      companyName2: (formData.get("companyName2") as string) || null,
      companyName3: (formData.get("companyName3") as string) || null,
      description:  (formData.get("description") as string) || null,
      industry: (formData.get("industry") as string) || null,
      revenue: (formData.get("revenue") as string) || null,
      website: (formData.get("website") as string) || null,
      companyType: (formData.get("companyType") as string) || null,
      plan: (formData.get("plan") as string) || null,
      billingPeriod: (formData.get("billingPeriod") as string) || null,
      state: (formData.get("state") as string) || null,
      country: (formData.get("country") as string) || "uk",
      status: "pending",
    },
  });
  redirect("/dashboard");
}
