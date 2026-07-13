"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/app/actions/admin-auth";
import { sendNoticeEmail } from "@/lib/email";

export async function createNotice(formData: FormData) {
  await requireAdminSession(); // Ensure admin

  const userId = formData.get("userId") as string;
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;

  if (!userId || !title || !content) {
    throw new Error("Missing required fields");
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");

  await prisma.userNotice.create({
    data: {
      userId,
      title,
      content,
    },
  });

  try {
    await sendNoticeEmail(user.email, title, content);
  } catch (err) {
    console.error("Failed to send email for notice:", err);
    // Even if email fails, notice was created
  }

  revalidatePath("/admin/notices");
  return { ok: true };
}

export async function deleteNotice(id: string) {
  await requireAdminSession();
  
  await prisma.userNotice.delete({
    where: { id },
  });

  revalidatePath("/admin/notices");
  return { ok: true };
}
