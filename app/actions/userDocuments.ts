"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { uploadFile, getSignedFileUrl } from "@/lib/s3";
import { revalidatePath } from "next/cache";

export async function uploadUserDocument(formData: FormData) {
  const session = await getSession();
  if (!session?.userId) throw new Error("Unauthorized");

  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) throw new Error("No file provided");

  const buffer = Buffer.from(await file.arrayBuffer());
  const mimeType = file.type || "application/octet-stream";
  const fileKey = `users/${session.userId}/documents/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;

  await uploadFile(fileKey, buffer, mimeType);

  await prisma.userDocument.create({
    data: {
      userId: session.userId,
      name: file.name,
      fileName: file.name,
      mimeType,
      fileSize: file.size,
      fileKey,
      source: "user",
      status: "Available",
    },
  });

  revalidatePath("/dashboard/my-documents");
  return { ok: true };
}

export async function deleteUserDocument(documentId: string) {
  const session = await getSession();
  if (!session?.userId) throw new Error("Unauthorized");

  const doc = await prisma.userDocument.findUnique({ where: { id: documentId } });
  if (!doc || doc.userId !== session.userId) throw new Error("Not found or unauthorized");

  // We could also delete the file from S3 here if needed, but we'll leave it for now or assume a bucket lifecycle policy.
  await prisma.userDocument.delete({ where: { id: documentId } });

  revalidatePath("/dashboard/my-documents");
  return { ok: true };
}

export async function getDocumentDownloadUrl(documentId: string) {
  const session = await getSession();
  if (!session?.userId) throw new Error("Unauthorized");

  const doc = await prisma.userDocument.findUnique({ where: { id: documentId } });
  if (!doc || doc.userId !== session.userId) throw new Error("Not found or unauthorized");

  const url = await getSignedFileUrl(doc.fileKey, 3600);
  return url;
}
