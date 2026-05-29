"use client";

import Image from "next/image";
import { useActionState } from "react";
import { adminLogin } from "@/app/actions/admin-auth";

export default function AdminLoginPage() {
  const [state, formAction, isPending] = useActionState(adminLogin, undefined);

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "#070707" }}
    >
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Image
            src="/assets/logo.png"
            alt="Corpulate"
            width={140}
            height={44}
            priority
            style={{ height: "auto" }}
          />
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-8"
          style={{
            background: "rgba(26,26,28,0.85)",
            border: "1px solid rgba(255,255,255,0.08)",
            backdropFilter: "blur(16px)",
          }}
        >
          {/* Header */}
          <div className="mb-6 text-center">
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest mb-4"
              style={{
                background: "rgba(148,82,232,0.18)",
                color: "#C64CD3",
                border: "1px solid rgba(148,82,232,0.3)",
              }}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.2}
                strokeLinecap="round"
                strokeLinejoin="round"
                width={10}
                height={10}
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              Admin Portal
            </span>
            <h1 className="text-xl font-bold text-white">Sign in to admin</h1>
            <p className="text-sm text-white/40 mt-1">Restricted access. Authorised personnel only.</p>
          </div>

          {/* Error */}
          {state?.message && (
            <div
              className="mb-5 px-4 py-3 rounded-xl text-sm text-red-300"
              style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.2)" }}
            >
              {state.message}
            </div>
          )}

          <form action={formAction} className="flex flex-col gap-4">
            {/* Email */}
            <div>
              <label className="block text-xs text-white/50 mb-2 uppercase tracking-wide">
                Email
              </label>
              <input
                type="email"
                name="email"
                placeholder="admin@example.com"
                autoComplete="email"
                required
                className="w-full h-11 rounded-[10px] px-4 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-white/40 transition-colors"
                style={{
                  background: "#111113",
                  border: "1px solid rgba(255,255,255,0.12)",
                }}
              />
              {state?.errors?.email && (
                <p className="text-xs text-red-400 mt-1">{state.errors.email[0]}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs text-white/50 mb-2 uppercase tracking-wide">
                Password
              </label>
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                autoComplete="current-password"
                required
                className="w-full h-11 rounded-[10px] px-4 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-white/40 transition-colors"
                style={{
                  background: "#111113",
                  border: "1px solid rgba(255,255,255,0.12)",
                }}
              />
              {state?.errors?.password && (
                <p className="text-xs text-red-400 mt-1">{state.errors.password[0]}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full h-11 rounded-[10px] text-sm font-semibold text-white cursor-pointer disabled:opacity-60 transition-opacity flex items-center justify-center gap-2 mt-2"
              style={{
                background:
                  "linear-gradient(90deg, #9452E8 12.5%, #C64CD3 29.3%, #E945A8 45.7%, #FF4AB3 61%, #FF5480 76%, #FF5B62 91.3%)",
              }}
            >
              {isPending ? (
                <>
                  <svg
                    className="animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    width={14}
                    height={14}
                  >
                    <path d="M21 12a9 9 0 11-6.219-8.56" />
                  </svg>
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
