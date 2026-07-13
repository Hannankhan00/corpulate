"use client";

import { useState, useActionState } from "react";
import Image from "next/image";
import Link from "next/link";
import ReactCountryFlag from "react-country-flag";
import { signup } from "@/app/actions/auth";

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4.5 h-4.5">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

const EyeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={18} height={18}>
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={18} height={18}>
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

const COUNTRY_CODES = [
  { dialCode: "+92",  isoCode: "PK" },
  { dialCode: "+1",   isoCode: "US" },
  { dialCode: "+44",  isoCode: "GB" },
  { dialCode: "+91",  isoCode: "IN" },
  { dialCode: "+971", isoCode: "AE" },
];

// Tall input with inset label
function TallInput({
  label,
  id,
  name,
  type = "text",
  placeholder,
  autoComplete,
  value,
  onChange,
  rightSlot,
}: {
  label: string;
  id: string;
  name: string;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  rightSlot?: React.ReactNode;
}) {
  return (
    <div
      className="relative h-18.75 rounded-[10px] border border-white flex flex-col justify-center px-4"
      style={{ background: "#1a1a1c" }}
    >
      <label htmlFor={id} className="block text-[11px] text-white/50 mb-0.5 select-none">
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        value={value}
        onChange={onChange}
        className="bg-transparent text-white text-sm placeholder:text-white/25 focus:outline-none w-full pr-8"
      />
      {rightSlot && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50">
          {rightSlot}
        </div>
      )}
    </div>
  );
}

export default function SignupPage() {
  const [state, action, pending] = useActionState(signup, undefined);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm]   = useState(false);
  const [dialCode, setDialCode]     = useState("+92");
  const [isoCode,  setIsoCode]      = useState("PK");
  const [showCountryDrop, setShowCountryDrop] = useState(false);

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6 overflow-y-auto"
      style={{
        background:
          "radial-gradient(ellipse 60% 80% at 0% 50%, rgba(13,100,139,0.45) 0%, rgba(6,6,6,0) 55%), radial-gradient(ellipse 50% 70% at 100% 30%, rgba(65,18,38,0.55) 0%, rgba(6,6,6,0) 55%), #070707",
      }}
    >
      {/* Frosted glass card */}
      <div
        className="w-full max-w-140 rounded-[20px] px-5 py-8 sm:px-10 sm:py-10"
        style={{
          background: "rgba(217,217,217,0.12)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255,255,255,0.15)",
        }}
      >
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Image src="/assets/logo.png" alt="Corpulate" width={140} height={44} priority style={{ width: "auto", height: "auto" }} />
        </div>

        <h1 className="text-center text-2xl font-bold text-white tracking-widest uppercase mb-7">
          Create an Account
        </h1>

        {/* Google OAuth */}
        <div className="mb-5">
          <a
            href="/api/auth/google"
            className="w-full flex items-center justify-center gap-2.5 h-11 rounded-[10px] text-sm font-medium text-white cursor-pointer transition-colors duration-200 hover:bg-white/10"
            style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.15)" }}
          >
            <GoogleIcon />
            Continue with Google
          </a>
          <div className="flex items-center gap-3 mt-4">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs text-white/40 whitespace-nowrap">or sign up with email</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>
        </div>

        <form action={action} className="space-y-3">
          {/* First + Last Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <TallInput label="First Name" id="firstName" name="firstName" placeholder="John" autoComplete="given-name" />
            <TallInput label="Last Name" id="lastName" name="lastName" placeholder="Doe" autoComplete="family-name" />
          </div>

          {/* Email */}
          <TallInput label="Email" id="email" name="email" type="email" placeholder="you@company.com" autoComplete="email" />

          {/* Phone */}
          <div
            className="relative h-18.75 rounded-[10px] border border-white flex items-center"
            style={{ background: "#1a1a1c" }}
          >
            {/* Country selector */}
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => setShowCountryDrop(!showCountryDrop)}
                className="flex items-center gap-1.5 px-4 h-18.25 text-sm text-white cursor-pointer"
              >
                <ReactCountryFlag countryCode={isoCode} svg style={{ width: "1.5em", height: "1.5em", borderRadius: "3px" }} />
                <span className="text-white/60">{dialCode}</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={12} height={12} className="text-white/40">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
              {showCountryDrop && (
                <div
                  className="absolute top-full left-0 mt-1 rounded-lg overflow-hidden z-20 min-w-32.5"
                  style={{ background: "#1a1a1c", border: "1px solid rgba(255,255,255,0.15)" }}
                >
                  {COUNTRY_CODES.map((c) => (
                    <button
                      key={c.dialCode}
                      type="button"
                      onClick={() => { setDialCode(c.dialCode); setIsoCode(c.isoCode); setShowCountryDrop(false); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white hover:bg-white/10 cursor-pointer"
                    >
                      <ReactCountryFlag countryCode={c.isoCode} svg style={{ width: "1.3em", height: "1.3em", borderRadius: "2px" }} />
                      <span className="text-white/60">{c.dialCode}</span>
                      <span className="text-white/40 text-xs">{c.isoCode}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {/* Divider */}
            <div className="w-px h-10 bg-white/20 shrink-0" />
            {/* Phone input */}
            <div className="flex-1 flex flex-col justify-center px-4">
              <label htmlFor="phone" className="block text-[11px] text-white/50 mb-0.5">Phone Number</label>
              <input
                id="phone"
                name="phone"
                type="tel"
                placeholder="Enter mobile number"
                autoComplete="tel"
                className="bg-transparent text-white text-sm placeholder:text-white/25 focus:outline-none w-full"
              />
              <input type="hidden" name="countryCode" value={dialCode} />
            </div>
          </div>

          {/* Password + Confirm */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <TallInput
              label="Password"
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Min. 8 characters"
              autoComplete="new-password"
              rightSlot={
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="cursor-pointer" aria-label="Toggle password">
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              }
            />
            <TallInput
              label="Confirm Password"
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirm ? "text" : "password"}
              placeholder="Re-enter password"
              autoComplete="new-password"
              rightSlot={
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="cursor-pointer" aria-label="Toggle confirm password">
                  {showConfirm ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              }
            />
          </div>

          {/* Errors */}
          {state?.message && (
            <p className="text-[12px] text-red-400">{state.message}</p>
          )}

          {/* Register button */}
          <button
            type="submit"
            disabled={pending}
            className="w-full h-13.5 rounded-[10px] font-bold text-white text-sm tracking-wide cursor-pointer mt-2 transition-opacity duration-150 disabled:opacity-60 disabled:cursor-not-allowed border border-[#9f4dbc]"
            style={{
              background: "linear-gradient(90deg, #9452E8 12.5%, #C64CD3 29.3%, #E945A8 45.7%, #FF4AB3 61%, #FF5480 76%, #FF5B62 91.3%)",
            }}
          >
            {pending ? "Creating Account…" : "Register"}
          </button>
        </form>

        {/* Sign in link */}
        <p className="text-center text-sm text-white/60 mt-5">
          Already have an account?{" "}
          <Link href="/" className="font-semibold underline underline-offset-2" style={{ color: "#ff5b62" }}>
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
