"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  createAdminSession,
  deleteAdminSession,
  getAdminSession,
  type AdminRole,
} from "@/lib/admin-session";

export type AdminAuthState =
  | { errors?: Record<string, string[]>; message?: string }
  | undefined;

const ROLE_RANK: Record<AdminRole, number> = {
  SUPER_ADMIN: 3,
  ADMIN: 2,
  SUPPORT: 1,
};

// ─── Auth ──────────────────────────────────────────────────────────────────

export async function adminLogin(
  _state: AdminAuthState,
  formData: FormData
): Promise<AdminAuthState> {
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;

  if (!email || !password) return { message: "Email and password are required." };

  const admin = await prisma.adminUser.findUnique({ where: { email } });
  if (!admin || !admin.isActive) return { message: "Invalid credentials." };

  const valid = await bcrypt.compare(password, admin.passwordHash);
  if (!valid) return { message: "Invalid credentials." };

  await createAdminSession(admin.id, admin.role as AdminRole);
  redirect("/admin");
}

export async function adminLogout() {
  await deleteAdminSession();
  redirect("/admin/login");
}

// ─── Session guard ─────────────────────────────────────────────────────────

export async function requireAdminSession(minRole: AdminRole = "SUPPORT") {
  const session = await getAdminSession();
  if (!session?.adminId) redirect("/admin/login");

  const admin = await prisma.adminUser.findUnique({
    where: { id: session.adminId },
    select: { id: true, name: true, email: true, role: true, isActive: true },
  });

  if (!admin || !admin.isActive) redirect("/admin/login");
  if (ROLE_RANK[admin.role as AdminRole] < ROLE_RANK[minRole]) redirect("/admin");

  return admin;
}

// ─── Team management ───────────────────────────────────────────────────────

export async function getAdminTeam() {
  const session = await getAdminSession();
  if (!session?.adminId) redirect("/admin/login");

  return prisma.adminUser.findMany({
    orderBy: [{ role: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdById: true,
      createdAt: true,
    },
  });
}

export async function createAdminMember(
  _prev: AdminAuthState,
  formData: FormData
): Promise<AdminAuthState> {
  const session = await getAdminSession();
  if (!session?.adminId) redirect("/admin/login");

  const actor = await prisma.adminUser.findUnique({
    where: { id: session.adminId },
    select: { id: true, role: true, isActive: true },
  });
  if (!actor || !actor.isActive) redirect("/admin/login");
  if (ROLE_RANK[actor.role as AdminRole] < ROLE_RANK["ADMIN"]) {
    return { message: "Insufficient permissions." };
  }

  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;
  const role = formData.get("role") as AdminRole;

  const errors: Record<string, string[]> = {};
  if (!name || name.length < 2) errors.name = ["Must be at least 2 characters."];
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    errors.email = ["Invalid email address."];
  if (!password || password.length < 8)
    errors.password = ["Must be at least 8 characters."];
  if (!["SUPER_ADMIN", "ADMIN", "SUPPORT"].includes(role))
    errors.role = ["Invalid role."];

  // ADMIN can only create SUPPORT accounts
  if (actor.role === "ADMIN" && role !== "SUPPORT") {
    errors.role = ["You can only create Support accounts."];
  }

  if (Object.keys(errors).length > 0) return { errors };

  const existing = await prisma.adminUser.findUnique({ where: { email } });
  if (existing)
    return { errors: { email: ["An account with this email already exists."] } };

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.adminUser.create({
    data: { name, email, passwordHash, role, createdById: actor.id },
  });

  revalidatePath("/admin/team");
  return { message: "success" };
}

export async function updateAdminMember(
  _prev: AdminAuthState,
  formData: FormData
): Promise<AdminAuthState> {
  const session = await getAdminSession();
  if (!session?.adminId) redirect("/admin/login");

  const actor = await prisma.adminUser.findUnique({
    where: { id: session.adminId },
    select: { id: true, role: true, isActive: true },
  });
  if (!actor || !actor.isActive || actor.role !== "SUPER_ADMIN") {
    return { message: "Insufficient permissions." };
  }

  const id = formData.get("id") as string;
  const role = formData.get("role") as AdminRole;
  const isActive = formData.get("isActive") === "true";

  if (id === actor.id) return { message: "You cannot modify your own account here." };
  if (!["SUPER_ADMIN", "ADMIN", "SUPPORT"].includes(role))
    return { message: "Invalid role." };

  await prisma.adminUser.update({ where: { id }, data: { role, isActive } });
  revalidatePath("/admin/team");
  return { message: "success" };
}
