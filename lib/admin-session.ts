import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export type AdminRole = "SUPER_ADMIN" | "ADMIN" | "SUPPORT";

type AdminSessionPayload = {
  adminId: string;
  role: AdminRole;
  expiresAt: Date;
};

const encodedKey = new TextEncoder().encode(
  process.env.ADMIN_SESSION_SECRET ?? process.env.SESSION_SECRET
);

async function encrypt(payload: AdminSessionPayload) {
  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(payload.expiresAt)
    .sign(encodedKey);
}

async function decrypt(token: string | undefined = "") {
  try {
    const { payload } = await jwtVerify(token, encodedKey, {
      algorithms: ["HS256"],
    });
    return payload as unknown as AdminSessionPayload;
  } catch {
    return null;
  }
}

export async function createAdminSession(adminId: string, role: AdminRole) {
  const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000);
  const token = await encrypt({ adminId, role, expiresAt });
  const cookieStore = await cookies();
  cookieStore.set("admin_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    sameSite: "lax",
    path: "/",
  });
}

export async function deleteAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_session");
}

export async function getAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_session")?.value;
  return decrypt(token);
}
