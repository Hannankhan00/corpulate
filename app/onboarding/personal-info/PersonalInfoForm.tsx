"use client";

import { useState, useActionState } from "react";
import Link from "next/link";
import ReactCountryFlag from "react-country-flag";
import { savePersonalInfo } from "@/app/actions/application";

const DIAL_CODES = [
  { dialCode: "+92",  isoCode: "PK" },
  { dialCode: "+1",   isoCode: "US" },
  { dialCode: "+44",  isoCode: "GB" },
  { dialCode: "+91",  isoCode: "IN" },
  { dialCode: "+971", isoCode: "AE" },
  { dialCode: "+1",   isoCode: "CA" },
];

type Props = {
  country: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
    streetAddress: string | null;
    city: string | null;
    province: string | null;
    postalCode: string | null;
    addressCountry: string | null;
  };
};

function inputClass(extra?: string) {
  return `w-full h-14 rounded-[10px] bg-[#1a1a1c] border border-white/20 px-4 text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-white/50 transition-colors ${extra ?? ""}`;
}

export default function PersonalInfoForm({ country, user }: Props) {
  const [dialCode, setDialCode] = useState("+92");
  const [isoCode,  setIsoCode]  = useState("PK");
  const [showDrop, setShowDrop] = useState(false);

  const [, action, pending] = useActionState(savePersonalInfo, null);

  return (
    <form action={action} className="flex-1 flex flex-col min-h-0 max-w-130">
      <input type="hidden" name="country" value={country} />

      {/* Scrollable fields */}
      <div className="flex-1 overflow-y-auto scrollbar-thin space-y-5 pr-3 pb-2">
        {/* Name row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-white/50 mb-2 uppercase tracking-wide">First Name</label>
            <input
              type="text" readOnly value={user.firstName}
              className={inputClass("opacity-50 cursor-not-allowed border-white/10")}
            />
          </div>
          <div>
            <label className="block text-xs text-white/50 mb-2 uppercase tracking-wide">Last Name</label>
            <input
              type="text" readOnly value={user.lastName}
              className={inputClass("opacity-50 cursor-not-allowed border-white/10")}
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs text-white/50 mb-2 uppercase tracking-wide">Email Address</label>
          <input
            type="email" readOnly value={user.email}
            className={inputClass("opacity-50 cursor-not-allowed border-white/10")}
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-xs text-white/50 mb-2 uppercase tracking-wide">Phone Number</label>
          <div className="relative flex h-14 rounded-[10px] bg-[#1a1a1c] border border-white/20 overflow-visible focus-within:border-white/50 transition-colors">
            <button
              type="button"
              onClick={() => setShowDrop(!showDrop)}
              className="flex items-center gap-1.5 px-4 text-sm text-white cursor-pointer shrink-0"
            >
              <ReactCountryFlag countryCode={isoCode} svg style={{ width: "1.4em", height: "1.4em", borderRadius: "3px" }} />
              <span className="text-white/60">{dialCode}</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={11} height={11} className="text-white/40">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>
            {showDrop && (
              <div
                className="absolute top-full left-0 mt-1 rounded-lg overflow-hidden z-20 min-w-36"
                style={{ background: "#1a1a1c", border: "1px solid rgba(255,255,255,0.15)" }}
              >
                {DIAL_CODES.map((c) => (
                  <button
                    key={`${c.isoCode}-${c.dialCode}`}
                    type="button"
                    onClick={() => { setDialCode(c.dialCode); setIsoCode(c.isoCode); setShowDrop(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white hover:bg-white/10 cursor-pointer"
                  >
                    <ReactCountryFlag countryCode={c.isoCode} svg style={{ width: "1.3em", height: "1.3em", borderRadius: "2px" }} />
                    <span className="text-white/60 text-xs">{c.dialCode}</span>
                    <span className="text-white/40 text-xs">{c.isoCode}</span>
                  </button>
                ))}
              </div>
            )}
            <div className="w-px h-8 bg-white/20 self-center shrink-0" />
            <input
              name="phone"
              type="tel"
              defaultValue={user.phone ?? ""}
              placeholder="Enter mobile number"
              className="flex-1 bg-transparent px-4 text-white text-sm placeholder:text-white/25 focus:outline-none"
            />
          </div>
        </div>

        {/* Address */}
        <div>
          <p className="text-xs text-white/50 uppercase tracking-wide mb-3">Residential Address</p>
          <div className="space-y-3">
            <div>
              <label htmlFor="streetAddress" className="block text-xs text-white/35 mb-1.5">Street Address</label>
              <input
                id="streetAddress" name="streetAddress" type="text"
                defaultValue={user.streetAddress ?? ""}
                placeholder="e.g. 123 Main Street, Apt 4B"
                className={inputClass()}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="city" className="block text-xs text-white/35 mb-1.5">City</label>
                <input id="city" name="city" type="text" defaultValue={user.city ?? ""} placeholder="e.g. London" className={inputClass()} />
              </div>
              <div>
                <label htmlFor="province" className="block text-xs text-white/35 mb-1.5">State / Province</label>
                <input id="province" name="province" type="text" defaultValue={user.province ?? ""} placeholder="e.g. Ontario" className={inputClass()} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="postalCode" className="block text-xs text-white/35 mb-1.5">Postal / ZIP Code</label>
                <input id="postalCode" name="postalCode" type="text" defaultValue={user.postalCode ?? ""} placeholder="e.g. SW1A 1AA" className={inputClass()} />
              </div>
              <div>
                <label htmlFor="addressCountry" className="block text-xs text-white/35 mb-1.5">Country</label>
                <input id="addressCountry" name="addressCountry" type="text" defaultValue={user.addressCountry ?? ""} placeholder="e.g. United Kingdom" className={inputClass()} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation — always visible at bottom */}
      <div className="shrink-0 flex items-center justify-between pt-5 mt-4 border-t border-white/10">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 px-5 py-2.5 rounded-[10px] text-sm text-white/60 hover:text-white transition-colors cursor-pointer"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)" }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={14} height={14}>
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back
        </Link>
        <button
          type="submit"
          disabled={pending}
          className="flex items-center gap-2 px-6 py-2.5 rounded-[10px] text-sm font-semibold text-white cursor-pointer border border-[#9f4dbc] disabled:opacity-60"
          style={{ background: "linear-gradient(90deg, #9452E8 12.5%, #C64CD3 29.3%, #E945A8 45.7%, #FF4AB3 61%, #FF5480 76%, #FF5B62 91.3%)" }}
        >
          {pending ? "Saving…" : "Next"}
          {!pending && (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={14} height={14}>
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          )}
        </button>
      </div>
    </form>
  );
}
