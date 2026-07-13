"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";

export async function markNoticeAsRead(id: string) {
  const session = await getSession();
  if (!session?.userId) throw new Error("Unauthorized");

  const notice = await prisma.userNotice.findUnique({ where: { id } });
  if (!notice || notice.userId !== session.userId) {
    throw new Error("Notice not found or unauthorized");
  }

  if (!notice.isRead) {
    await prisma.userNotice.update({
      where: { id },
      data: { isRead: true },
    });
    revalidatePath("/dashboard/notices");
    revalidatePath("/dashboard"); // in case there's an unread count badge somewhere
  }
}
