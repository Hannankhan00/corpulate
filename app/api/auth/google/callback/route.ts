import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/session";

export async function GET(request: NextRequest) {
  const origin = new URL(request.url).origin;
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  if (error || !code || !state) {
    return NextResponse.redirect(`${origin}/?error=google_auth_failed`);
  }

  const cookieStore = await cookies();
  const storedState = cookieStore.get("oauth_state")?.value;
  cookieStore.delete("oauth_state");

  if (!storedState || storedState !== state) {
    return NextResponse.redirect(`${origin}/?error=invalid_state`);
  }

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: `${origin}/api/auth/google/callback`,
      grant_type: "authorization_code",
    }),
  });

  if (!tokenRes.ok) {
    return NextResponse.redirect(`${origin}/?error=google_auth_failed`);
  }

  const { access_token } = await tokenRes.json();

  const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { Authorization: `Bearer ${access_token}` },
  });

  if (!userInfoRes.ok) {
    return NextResponse.redirect(`${origin}/?error=google_auth_failed`);
  }

  const {
    sub,
    email,
    given_name,
    family_name,
  }: { sub: string; email?: string; given_name?: string; family_name?: string } =
    await userInfoRes.json();

  if (!email) {
    return NextResponse.redirect(`${origin}/?error=google_auth_failed`);
  }

  let isNewUser = false;

  let user = await prisma.user.findFirst({
    where: { OR: [{ provider: "google", providerId: sub }, { email }] },
  });

  if (!user) {
    isNewUser = true;
    user = await prisma.user.create({
      data: {
        firstName: given_name ?? "",
        lastName: family_name ?? "",
        email,
        provider: "google",
        providerId: sub,
      },
    });
  } else if (!user.providerId) {
    await prisma.user.update({
      where: { id: user.id },
      data: { provider: "google", providerId: sub },
    });
  }

  await createSession(user.id);

  return NextResponse.redirect(
    `${origin}${isNewUser ? "/onboarding/personal-info" : "/dashboard"}`
  );
}
