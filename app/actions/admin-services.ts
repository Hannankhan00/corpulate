"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/app/actions/admin-auth";
import type { OnboardingField } from "@/app/generated/prisma/client";

export async function getServiceCountries() {
  await requireAdminSession();
  return prisma.serviceCountry.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { states: true, documents: true, fields: true } },
    },
  });
}

export async function getServiceCountry(id: string) {
  await requireAdminSession();
  return prisma.serviceCountry.findUnique({
    where: { id },
    include: {
      states: { orderBy: [{ isFeatured: "desc" }, { sortOrder: "asc" }, { name: "asc" }] },
      documents: { orderBy: { name: "asc" } },
      fields: { orderBy: { fieldKey: "asc" } },
    },
  });
}

export async function getServiceCountryByIso(isoCode: string) {
  return prisma.serviceCountry.findUnique({
    where: { isoCode: isoCode.toUpperCase() },
    include: {
      states: {
        where: { isActive: true },
        orderBy: [{ isFeatured: "desc" }, { sortOrder: "asc" }, { name: "asc" }],
      },
      documents: { orderBy: { name: "asc" } },
      fields: { orderBy: { fieldKey: "asc" } },
    },
  });
}

export async function getActiveServiceCountries() {
  return prisma.serviceCountry.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });
}

export async function createServiceCountry(_prev: unknown, formData: FormData) {
  await requireAdminSession("ADMIN");
  const name = (formData.get("name") as string).trim();
  const isoCode = (formData.get("isoCode") as string).trim().toUpperCase();
  if (!name || !isoCode) return { error: "Name and ISO code are required." };
  try {
    const country = await prisma.serviceCountry.create({ data: { name, isoCode } });
    revalidatePath("/admin/services");
    revalidatePath("/dashboard");
    return { id: country.id };
  } catch {
    return { error: "A country with that ISO code already exists." };
  }
}

export async function toggleServiceCountry(id: string, isActive: boolean) {
  await requireAdminSession("ADMIN");
  await prisma.serviceCountry.update({ where: { id }, data: { isActive } });
  revalidatePath("/admin/services");
  revalidatePath("/dashboard");
}

export async function deleteServiceCountry(id: string) {
  await requireAdminSession("ADMIN");
  await prisma.serviceCountry.delete({ where: { id } });
  revalidatePath("/admin/services");
  revalidatePath("/dashboard");
}

// ── States ────────────────────────────────────────────────────

export async function addServiceCountryState(_prev: unknown, formData: FormData) {
  await requireAdminSession("ADMIN");
  const countryId   = formData.get("countryId") as string;
  const name        = (formData.get("name") as string).trim();
  const abbr        = (formData.get("abbr") as string | null)?.trim() || null;
  const isFeatured  = formData.get("isFeatured") === "true";
  const badge       = (formData.get("badge") as string | null)?.trim() || null;
  const description = (formData.get("description") as string | null)?.trim() || null;
  const prosRaw     = (formData.get("pros") as string | null)?.trim() || null;
  const pros        = prosRaw
    ? JSON.stringify(prosRaw.split("\n").map((l) => l.trim()).filter(Boolean))
    : null;

  if (!name) return { error: "State name is required." };
  await prisma.serviceCountryState.create({
    data: { countryId, name, abbr, isFeatured, badge, description, pros },
  });
  revalidatePath(`/admin/services/${countryId}`);
  return { ok: true };
}

export async function updateServiceCountryState(_prev: unknown, formData: FormData) {
  await requireAdminSession("ADMIN");
  const id          = formData.get("id") as string;
  const countryId   = formData.get("countryId") as string;
  const name        = (formData.get("name") as string).trim();
  const abbr        = (formData.get("abbr") as string | null)?.trim() || null;
  const isFeatured  = formData.get("isFeatured") === "true";
  const badge       = (formData.get("badge") as string | null)?.trim() || null;
  const description = (formData.get("description") as string | null)?.trim() || null;
  const prosRaw     = (formData.get("pros") as string | null)?.trim() || null;
  const pros        = prosRaw
    ? JSON.stringify(prosRaw.split("\n").map((l) => l.trim()).filter(Boolean))
    : null;

  await prisma.serviceCountryState.update({
    where: { id },
    data: { name, abbr, isFeatured, badge, description, pros },
  });
  revalidatePath(`/admin/services/${countryId}`);
  return { ok: true };
}

export async function deleteServiceCountryState(id: string, countryId: string) {
  await requireAdminSession("ADMIN");
  await prisma.serviceCountryState.delete({ where: { id } });
  revalidatePath(`/admin/services/${countryId}`);
}

export async function toggleServiceCountryState(id: string, countryId: string, isActive: boolean) {
  await requireAdminSession("ADMIN");
  await prisma.serviceCountryState.update({ where: { id }, data: { isActive } });
  revalidatePath(`/admin/services/${countryId}`);
}

// ── Documents ─────────────────────────────────────────────────

export async function addServiceCountryDoc(_prev: unknown, formData: FormData) {
  await requireAdminSession("ADMIN");
  const countryId   = formData.get("countryId") as string;
  const name        = (formData.get("name") as string).trim();
  const description = (formData.get("description") as string | null)?.trim() || null;
  const isRequired  = formData.get("isRequired") === "true";

  if (!name) return { error: "Document name is required." };
  await prisma.serviceCountryDoc.create({ data: { countryId, name, description, isRequired } });
  revalidatePath(`/admin/services/${countryId}`);
  return { ok: true };
}

export async function deleteServiceCountryDoc(id: string, countryId: string) {
  await requireAdminSession("ADMIN");
  await prisma.serviceCountryDoc.delete({ where: { id } });
  revalidatePath(`/admin/services/${countryId}`);
}

// ── Fields ────────────────────────────────────────────────────

export async function setServiceCountryField(
  countryId: string,
  fieldKey: OnboardingField,
  enabled: boolean,
  isRequired: boolean,
) {
  await requireAdminSession("ADMIN");
  if (!enabled) {
    await prisma.serviceCountryField.deleteMany({ where: { countryId, fieldKey } });
  } else {
    await prisma.serviceCountryField.upsert({
      where: { countryId_fieldKey: { countryId, fieldKey } },
      create: { countryId, fieldKey, isRequired },
      update: { isRequired },
    });
  }
  revalidatePath(`/admin/services/${countryId}`);
}
