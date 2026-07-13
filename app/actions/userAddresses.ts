"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";

export async function addAddress(data: FormData) {
  const session = await getSession();
  if (!session?.userId) throw new Error("Unauthorized");

  const label = data.get("label") as string;
  const streetAddress = data.get("streetAddress") as string;
  const city = data.get("city") as string;
  const province = data.get("province") as string;
  const postalCode = data.get("postalCode") as string;
  const addressCountry = data.get("addressCountry") as string;
  const isDefault = data.get("isDefault") === "on";

  if (!streetAddress || !city || !addressCountry) {
    throw new Error("Missing required fields");
  }

  // If making this default, unset others
  if (isDefault) {
    await prisma.userAddress.updateMany({
      where: { userId: session.userId },
      data: { isDefault: false },
    });
  }

  // If this is the user's first address, make it default automatically
  const existingCount = await prisma.userAddress.count({
    where: { userId: session.userId },
  });

  await prisma.userAddress.create({
    data: {
      userId: session.userId,
      label: label || "Home",
      streetAddress,
      city,
      province,
      postalCode,
      addressCountry,
      isDefault: existingCount === 0 ? true : isDefault,
    },
  });

  revalidatePath("/dashboard/my-addresses");
  revalidatePath("/onboarding/personal-info");
  return { ok: true };
}

export async function deleteAddress(id: string) {
  const session = await getSession();
  if (!session?.userId) throw new Error("Unauthorized");

  const address = await prisma.userAddress.findUnique({ where: { id } });
  if (!address || address.userId !== session.userId) {
    throw new Error("Not found or unauthorized");
  }

  await prisma.userAddress.delete({ where: { id } });

  // If it was default and others remain, make the newest one default
  if (address.isDefault) {
    const nextAddress = await prisma.userAddress.findFirst({
      where: { userId: session.userId },
      orderBy: { createdAt: "desc" },
    });
    if (nextAddress) {
      await prisma.userAddress.update({
        where: { id: nextAddress.id },
        data: { isDefault: true },
      });
    }
  }

  revalidatePath("/dashboard/my-addresses");
  revalidatePath("/onboarding/personal-info");
  return { ok: true };
}
