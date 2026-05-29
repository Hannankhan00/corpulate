"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSession, getSession } from "@/lib/session";

export type AuthState =
  | { errors?: Record<string, string[]>; message?: string }
  | undefined;

export async function signup(
  _state: AuthState,
  formData: FormData
): Promise<AuthState> {
  const firstName = (formData.get("firstName") as string)?.trim();
  const lastName = (formData.get("lastName") as string)?.trim();
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const countryCode = (formData.get("countryCode") as string) ?? "";
  const phone = (formData.get("phone") as string)?.trim();
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  const errors: Record<string, string[]> = {};

  if (!firstName || firstName.length < 2)
    errors.firstName = ["Must be at least 2 characters."];
  if (!lastName || lastName.length < 2)
    errors.lastName = ["Must be at least 2 characters."];
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    errors.email = ["Please enter a valid email."];
  if (!password || password.length < 8)
    errors.password = ["Must be at least 8 characters."];
  if (password !== confirmPassword)
    errors.confirmPassword = ["Passwords do not match."];

  if (Object.keys(errors).length > 0) return { errors };

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing)
    return { errors: { email: ["An account with this email already exists."] } };

  const passwordHash = await bcrypt.hash(password, 12);
  const fullPhone = phone ? `${countryCode}${phone}` : null;

  const user = await prisma.user.create({
    data: { firstName, lastName, email, phone: fullPhone, passwordHash },
  });

  await createSession(user.id);
  redirect("/onboarding/personal-info");
}

export async function getMe(): Promise<{ firstName: string; lastName: string } | null> {
  const session = await getSession();
  if (!session?.userId) return null;
  return prisma.user.findUnique({
    where: { id: session.userId },
    select: { firstName: true, lastName: true },
  });
}

export async function login(
  _state: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;
  const rememberMe = formData.get("rememberMe") === "on";

  if (!email || !password)
    return { message: "Email and password are required." };

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.passwordHash)
    return { message: "Invalid email or password." };

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return { message: "Invalid email or password." };

  await createSession(user.id, rememberMe);
  redirect("/dashboard");
}
