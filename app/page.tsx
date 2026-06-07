"use client";

import { useState, useActionState } from "react";
import Image from "next/image";
import Link from "next/link";
import { login } from "@/app/actions/auth";

const EyeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4.5 h-4.5">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4.5 h-4.5">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4.5 h-4.5">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);


const services = [
  "US LLC & UK LTD company registration",
  "EIN & ITIN filing for non-residents",
  "Business banking with Wise & Payoneer",
];

const stats = [
  { value: "2,000+", label: "Clients worldwide" },
  { value: "50+",    label: "Countries served"  },
  { value: "3",      label: "US · UK · UAE"     },
];

const partners = ["Wise", "Payoneer", "Hostinger", "Inhancers"];

const inputCls =
  "w-full h-11 bg-elevated border border-border-default rounded-lg px-4 text-fg text-sm placeholder:text-fg-muted focus:outline-none focus:border-brand-cyan focus:shadow-[0_0_0_3px_rgba(6,182,212,0.15)] transition-all duration-150";

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, undefined);
  const [showPassword, setShowPassword] = useState(false);
  const [oauthError] = useState(() =>
    typeof window !== "undefined" && new URLSearchParams(window.location.search).get("error")
      ? "Google sign-in failed. Please try again."
      : ""
  );

  return (
    <div className="min-h-screen flex bg-base">

      {/* ── Left branding panel ─────────────────────────── */}
      <div
        className="hidden lg:flex lg:w-[45%] relative overflow-hidden flex-col"
        style={{ background: "linear-gradient(155deg,#0B1120 0%,#101535 55%,#0C0E26 100%)" }}
      >
        {/* Dot-grid texture */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle,rgba(255,255,255,0.07) 1px,transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        {/* Glow blobs */}
        <div className="absolute -top-40 -left-40 w-105 h-105 rounded-full" style={{ background: "radial-gradient(circle,rgba(6,182,212,0.28) 0%,transparent 65%)" }} />
        <div className="absolute -bottom-20 -right-20 w-125 h-125 rounded-full" style={{ background: "radial-gradient(circle,rgba(124,58,237,0.20) 0%,transparent 65%)" }} />
        <div className="absolute top-[55%] left-[40%] w-52 h-52 rounded-full" style={{ background: "radial-gradient(circle,rgba(240,62,138,0.12) 0%,transparent 65%)" }} />

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full p-12">
          <Image src="/assets/logo.png" alt="Corpulate" width={140} height={44} priority style={{ height: "auto" }} />

          <div className="flex-1 flex flex-col justify-center">
            <p className="text-xs font-bold tracking-[0.2em] uppercase text-brand-cyan mb-5">
              Strategy · Success · Growth
            </p>
            <h1 className="text-[2.3rem] font-bold text-white leading-[1.18] mb-4">
              Empowering<br />
              <span className="text-gradient-brand">Global Enterprises</span>
            </h1>
            <p className="text-fg-sub text-[0.93rem] leading-relaxed mb-8 max-w-75">
              From company registration to banking, we handle your entire business setup in the US, UK, and UAE.
            </p>

            {/* Services */}
            <ul className="space-y-3.5 mb-10">
              {services.map((s) => (
                <li key={s} className="flex items-center gap-3 text-fg-sub text-sm">
                  <span
                    className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ background: "rgba(6,182,212,0.14)", border: "1px solid rgba(6,182,212,0.35)" }}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="#06B6D4" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  </span>
                  {s}
                </li>
              ))}
            </ul>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-10">
              {stats.map((s) => (
                <div key={s.label}>
                  <p className="text-xl font-bold text-white">{s.value}</p>
                  <p className="text-[11px] text-fg-muted mt-0.5 leading-tight">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Partners */}
            <div>
              <p className="text-[11px] uppercase tracking-widest text-fg-muted mb-3">Partner integrations</p>
              <div className="flex flex-wrap gap-2">
                {partners.map((p) => (
                  <span
                    key={p}
                    className="px-3 py-1 rounded-full text-xs font-medium text-fg-sub"
                    style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)" }}
                  >
                    {p}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Trust badge */}
          <div
            className="flex items-center gap-3 px-4 py-3.5 rounded-xl"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="#06B6D4" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 shrink-0">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="m9 12 2 2 4-4" />
            </svg>
            <span className="text-xs text-fg-muted">IRS-authorised · Companies House registered · Fully compliant</span>
          </div>
        </div>
      </div>

      {/* ── Right form panel ────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 lg:px-12">
        {/* Mobile-only logo */}
        <div className="lg:hidden mb-8">
          <Image src="/assets/logo.png" alt="Corpulate" width={120} height={38} priority style={{ height: "auto" }} />
        </div>

        <div className="w-full max-w-100">
          <h2 className="text-[1.6rem] font-bold text-white mb-1">Welcome back</h2>
          <p className="text-fg-muted text-sm mb-8">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-gradient-cta font-semibold cursor-pointer">
              Get started free
            </Link>
          </p>

          {/* Social auth */}
          <div className="mb-6">
            <a
              href="/api/auth/google"
              className="w-full flex items-center justify-center gap-2.5 h-11 rounded-lg text-sm font-medium text-fg cursor-pointer transition-colors duration-200 hover:bg-white/[0.07] active:scale-[0.98]"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)" }}
            >
              <GoogleIcon />
              Continue with Google
            </a>
            {oauthError && (
              <p className="text-[11px] text-red-400 mt-2 text-center">{oauthError}</p>
            )}
          </div>

          {/* OR divider */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-border-subtle" />
            <span className="text-xs text-fg-muted whitespace-nowrap">or continue with email</span>
            <div className="flex-1 h-px bg-border-subtle" />
          </div>

          {/* Form */}
          <form action={action} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-fg-sub mb-2">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
                className={inputCls}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="text-sm font-medium text-fg-sub">
                  Password
                </label>
                <Link
                  href="#"
                  className="text-xs text-fg-muted hover:text-fg-sub transition-colors duration-150 cursor-pointer"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className={`${inputCls} pr-11`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center px-3.5 text-fg-muted hover:text-fg-sub transition-colors duration-150 cursor-pointer"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                name="rememberMe"
                type="checkbox"
                className="w-4 h-4 rounded"
                style={{ accentColor: "#06B6D4" }}
              />
              <span className="text-sm text-fg-muted">Remember me for 30 days</span>
            </label>

            {state?.message && (
              <p className="text-[11px] text-red-400">{state.message}</p>
            )}

            <button
              type="submit"
              disabled={pending}
              className="btn-cta w-full h-11 rounded-lg font-semibold text-sm tracking-wide cursor-pointer mt-1 transition-opacity duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {pending ? "Signing in…" : "Sign in to Corpulate"}
            </button>
          </form>

          {/* Bottom trust badges */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <div className="flex items-center gap-1.5 text-[11px] text-fg-muted">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              256-bit SSL
            </div>
            <div className="w-px h-3 bg-border-subtle" />
            <div className="flex items-center gap-1.5 text-[11px] text-fg-muted">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="m9 12 2 2 4-4" />
              </svg>
              IRS Authorised
            </div>
            <div className="w-px h-3 bg-border-subtle" />
            <div className="flex items-center gap-1.5 text-[11px] text-fg-muted">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                <circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-4" />
              </svg>
              Companies House
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
