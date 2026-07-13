"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function updateContactInfo(formData: FormData) {
  const session = await getSession();
  if (!session?.userId) {
    return { success: false, error: "Unauthorized" };
  }

  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;

  try {
    await prisma.user.update({
      where: { id: session.userId },
      data: {
        email,
        phone,
      },
    });

    revalidatePath("/dashboard/my-information");
    return { success: true };
  } catch (error) {
    console.error("Error updating contact info:", error);
    return { success: false, error: "Failed to update contact info." };
  }
}

export async function updateAddressInfo(formData: FormData) {
  const session = await getSession();
  if (!session?.userId) {
    return { success: false, error: "Unauthorized" };
  }

  const streetAddress = formData.get("streetAddress") as string;
  const city = formData.get("city") as string;
  const province = formData.get("province") as string;
  const postalCode = formData.get("postalCode") as string;
  const addressCountry = formData.get("addressCountry") as string;

  try {
    await prisma.user.update({
      where: { id: session.userId },
      data: {
        streetAddress,
        city,
        province,
        postalCode,
        addressCountry,
      },
    });

    revalidatePath("/dashboard/my-information");
    return { success: true };
  } catch (error) {
    console.error("Error updating address info:", error);
    return { success: false, error: "Failed to update address info." };
  }
}
