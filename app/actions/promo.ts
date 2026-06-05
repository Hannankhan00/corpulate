"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/app/actions/admin-auth";

export async function validatePromoCode(
  code: string,
  subtotalCents: number,
): Promise<
  | { valid: true; discountAmount: number; discountLabel: string; code: string }
  | { valid: false; error: string }
> {
  const promo = await prisma.promoCode.findUnique({
    where: { code: code.trim().toUpperCase() },
  });

  if (!promo || !promo.isActive)
    return { valid: false, error: "Invalid or expired promo code." };
  if (promo.expiresAt && promo.expiresAt < new Date())
    return { valid: false, error: "This promo code has expired." };
  if (promo.maxUses !== null && promo.usedCount >= promo.maxUses)
    return { valid: false, error: "This promo code has reached its usage limit." };

  const subtotalDollars = subtotalCents / 100;
  let discountAmount: number;
  let discountLabel: string;

  if (promo.discountType === "PERCENT") {
    discountAmount = Math.round(subtotalDollars * (promo.discountValue / 100));
    discountLabel = `${promo.discountValue}% off`;
  } else {
    discountAmount = Math.min(promo.discountValue, subtotalDollars);
    discountLabel = `$${promo.discountValue} off`;
  }

  return { valid: true, discountAmount, discountLabel, code: promo.code };
}

export async function redeemPromoCode(code: string) {
  await prisma.promoCode.update({
    where: { code },
    data: { usedCount: { increment: 1 } },
  });
}

export async function getAllPromoCodes() {
  await requireAdminSession();
  return prisma.promoCode.findMany({ orderBy: { createdAt: "desc" } });
}

export async function createPromoCode(_prev: unknown, formData: FormData) {
  await requireAdminSession("ADMIN");
  const code = (formData.get("code") as string).trim().toUpperCase().replace(/\s+/g, "");
  const discountType = formData.get("discountType") as string;
  const discountValue = parseInt(formData.get("discountValue") as string) || 0;
  const maxUsesRaw = (formData.get("maxUses") as string).trim();
  const maxUses = maxUsesRaw ? parseInt(maxUsesRaw) || null : null;
  const expiresAtRaw = (formData.get("expiresAt") as string).trim();
  const expiresAt = expiresAtRaw ? new Date(expiresAtRaw) : null;

  if (!code) return { error: "Code is required." };
  if (!["PERCENT", "FIXED"].includes(discountType)) return { error: "Invalid discount type." };
  if (discountValue <= 0) return { error: "Discount value must be greater than 0." };
  if (discountType === "PERCENT" && discountValue > 100) return { error: "Percentage cannot exceed 100." };

  try {
    await prisma.promoCode.create({ data: { code, discountType, discountValue, maxUses, expiresAt } });
    revalidatePath("/admin/promo-codes");
    return { ok: true };
  } catch {
    return { error: "A promo code with that code already exists." };
  }
}

export async function togglePromoCode(id: string, isActive: boolean) {
  await requireAdminSession("ADMIN");
  await prisma.promoCode.update({ where: { id }, data: { isActive } });
  revalidatePath("/admin/promo-codes");
}

export async function deletePromoCode(id: string) {
  await requireAdminSession("ADMIN");
  await prisma.promoCode.delete({ where: { id } });
  revalidatePath("/admin/promo-codes");
}
