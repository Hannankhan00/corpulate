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
      _count: { select: { states: true, documents: true, fields: true, companyTypes: true } },
    },
  });
}

export async function getServiceCountry(id: string) {
  await requireAdminSession();
  return prisma.serviceCountry.findUnique({
    where: { id },
    include: {
      states:       { orderBy: [{ isFeatured: "desc" }, { sortOrder: "asc" }, { name: "asc" }] },
      documents:    { orderBy: { name: "asc" } },
      fields:       { orderBy: { fieldKey: "asc" } },
      companyTypes: { orderBy: [{ sortOrder: "asc" }, { name: "asc" }] },
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
  const pros        = prosRaw ? JSON.stringify(prosRaw.split("\n").map((l) => l.trim()).filter(Boolean)) : null;
  const feeRaw      = (formData.get("fee") as string | null)?.trim();
  const fee         = feeRaw ? parseInt(feeRaw) || null : null;

  if (!name) return { error: "State name is required." };
  await prisma.serviceCountryState.create({
    data: { countryId, name, abbr, isFeatured, badge, description, pros, fee },
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
  const pros        = prosRaw ? JSON.stringify(prosRaw.split("\n").map((l) => l.trim()).filter(Boolean)) : null;
  const feeRaw      = (formData.get("fee") as string | null)?.trim();
  const fee         = feeRaw ? parseInt(feeRaw) || null : null;

  await prisma.serviceCountryState.update({
    where: { id },
    data: { name, abbr, isFeatured, badge, description, pros, fee },
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

// ── Plans (public) ────────────────────────────────────────────

export async function getActivePlans() {
  return prisma.servicePlan.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
}

// ── Plans (admin) ─────────────────────────────────────────────

export async function getAllPlans() {
  await requireAdminSession();
  return prisma.servicePlan.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] });
}

export async function addPlan(_prev: unknown, formData: FormData) {
  await requireAdminSession("ADMIN");
  const slug              = (formData.get("slug") as string).trim().toLowerCase().replace(/\s+/g, "-");
  const name              = (formData.get("name") as string).trim();
  const monthlyPrice      = parseInt(formData.get("monthlyPrice") as string) || 0;
  const annualDiscountPct = Math.min(100, Math.max(0, parseInt(formData.get("annualDiscountPct") as string) || 20));
  const description       = (formData.get("description") as string | null)?.trim() || null;
  const featuresRaw       = (formData.get("features") as string | null)?.trim() || "";
  const features          = JSON.stringify(featuresRaw.split("\n").map((l) => l.trim()).filter(Boolean));
  const isHighlight       = formData.get("isHighlight") === "true";
  const sortOrder         = parseInt(formData.get("sortOrder") as string) || 0;

  if (!slug || !name) return { error: "Slug and name are required." };
  try {
    await prisma.servicePlan.create({ data: { slug, name, monthlyPrice, annualDiscountPct, description, features, isHighlight, sortOrder } });
    revalidatePath("/admin/plans");
    revalidatePath("/onboarding/plan-selection");
    return { ok: true };
  } catch {
    return { error: "A plan with that slug already exists." };
  }
}

export async function updatePlan(_prev: unknown, formData: FormData) {
  await requireAdminSession("ADMIN");
  const id                = formData.get("id") as string;
  const name              = (formData.get("name") as string).trim();
  const monthlyPrice      = parseInt(formData.get("monthlyPrice") as string) || 0;
  const annualDiscountPct = Math.min(100, Math.max(0, parseInt(formData.get("annualDiscountPct") as string) || 20));
  const description       = (formData.get("description") as string | null)?.trim() || null;
  const featuresRaw       = (formData.get("features") as string | null)?.trim() || "";
  const features          = JSON.stringify(featuresRaw.split("\n").map((l) => l.trim()).filter(Boolean));
  const isHighlight       = formData.get("isHighlight") === "true";
  const sortOrder         = parseInt(formData.get("sortOrder") as string) || 0;

  await prisma.servicePlan.update({ where: { id }, data: { name, monthlyPrice, annualDiscountPct, description, features, isHighlight, sortOrder } });
  revalidatePath("/admin/plans");
  revalidatePath("/onboarding/plan-selection");
  return { ok: true };
}

export async function togglePlan(id: string, isActive: boolean) {
  await requireAdminSession("ADMIN");
  await prisma.servicePlan.update({ where: { id }, data: { isActive } });
  revalidatePath("/admin/plans");
  revalidatePath("/onboarding/plan-selection");
}

export async function deletePlan(id: string) {
  await requireAdminSession("ADMIN");
  await prisma.servicePlan.delete({ where: { id } });
  revalidatePath("/admin/plans");
  revalidatePath("/onboarding/plan-selection");
}

// ── Company Types (public) ────────────────────────────────────

export async function getCompanyTypesByIso(isoCode: string) {
  return prisma.serviceCompanyType.findMany({
    where: { country: { isoCode: isoCode.toUpperCase() }, isActive: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
}

// ── Fields ────────────────────────────────────────────────────

// ── Company Types (admin) ─────────────────────────────────────

export async function addServiceCompanyType(_prev: unknown, formData: FormData) {
  await requireAdminSession("ADMIN");
  const countryId   = formData.get("countryId") as string;
  const slug        = (formData.get("slug") as string).trim().toLowerCase().replace(/\s+/g, "-");
  const name        = (formData.get("name") as string).trim();
  const fullName    = (formData.get("fullName") as string).trim();
  const description = (formData.get("description") as string | null)?.trim() || null;
  const isPopular   = formData.get("isPopular") === "true";
  const sortOrder   = parseInt(formData.get("sortOrder") as string) || 0;

  if (!slug || !name || !fullName) return { error: "Slug, name, and full name are required." };
  try {
    await prisma.serviceCompanyType.create({
      data: { countryId, slug, name, fullName, description, isPopular, sortOrder },
    });
    revalidatePath(`/admin/services/${countryId}`);
    revalidatePath("/onboarding/company-type");
    return { ok: true };
  } catch {
    return { error: "A company type with that slug already exists for this country." };
  }
}

export async function updateServiceCompanyType(_prev: unknown, formData: FormData) {
  await requireAdminSession("ADMIN");
  const id          = formData.get("id") as string;
  const countryId   = formData.get("countryId") as string;
  const name        = (formData.get("name") as string).trim();
  const fullName    = (formData.get("fullName") as string).trim();
  const description = (formData.get("description") as string | null)?.trim() || null;
  const isPopular   = formData.get("isPopular") === "true";
  const sortOrder   = parseInt(formData.get("sortOrder") as string) || 0;

  await prisma.serviceCompanyType.update({
    where: { id },
    data: { name, fullName, description, isPopular, sortOrder },
  });
  revalidatePath(`/admin/services/${countryId}`);
  revalidatePath("/onboarding/company-type");
  return { ok: true };
}

export async function toggleServiceCompanyType(id: string, countryId: string, isActive: boolean) {
  await requireAdminSession("ADMIN");
  await prisma.serviceCompanyType.update({ where: { id }, data: { isActive } });
  revalidatePath(`/admin/services/${countryId}`);
  revalidatePath("/onboarding/company-type");
}

export async function deleteServiceCompanyType(id: string, countryId: string) {
  await requireAdminSession("ADMIN");
  await prisma.serviceCompanyType.delete({ where: { id } });
  revalidatePath(`/admin/services/${countryId}`);
  revalidatePath("/onboarding/company-type");
}

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
