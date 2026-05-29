"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import Sidebar from "@/app/components/Sidebar";

const PAGE_BG =
  "radial-gradient(ellipse 60% 80% at 0% 50%, rgba(13,100,139,0.45) 0%, rgba(6,6,6,0) 55%), radial-gradient(ellipse 50% 70% at 100% 30%, rgba(65,18,38,0.55) 0%, rgba(6,6,6,0) 55%), #070707";

const STEPS = [
  { id: 1, label: "Personal Information", href: "/onboarding/personal-info" },
  { id: 2, label: "Company Type",         href: "/onboarding/company-type" },
  { id: 3, label: "Plan Selection",       href: "/onboarding/plan-selection" },
  { id: 4, label: "State Selection",      href: "/onboarding/state-selection" },
  { id: 5, label: "Company Information",  href: "/onboarding/company-info" },
];

const COMPANY_TYPES = [
  {
    id: "llc",
    name: "LLC",
    full: "Limited Liability Company",
    desc: "The most popular choice for small businesses. Combines personal liability protection with pass-through taxation.",
    popular: true,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" width={28} height={28}>
        <rect x="2" y="7" width="20" height="14" rx="2" />
        <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" />
      </svg>
    ),
  },
  {
    id: "ltd",
    name: "LTD",
    full: "Private Limited Company",
    desc: "The standard UK business structure. Shareholders' liability is limited to the value of their shares.",
    popular: false,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" width={28} height={28}>
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        <path d="M9 22V12h6v10" />
      </svg>
    ),
  },
  {
    id: "ccorp",
    name: "C-Corp",
    full: "C Corporation",
    desc: "Best for raising venture capital. Allows unlimited shareholders and multiple stock classes.",
    popular: false,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" width={28} height={28}>
        <circle cx="12" cy="12" r="10" />
        <path d="M15 9.354a4 4 0 100 5.292" />
      </svg>
    ),
  },
  {
    id: "llp",
    name: "LLP",
    full: "Limited Liability Partnership",
    desc: "Ideal for professional services firms. Partners have limited liability while maintaining a partnership structure.",
    popular: false,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" width={28} height={28}>
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
  },
  {
    id: "sole",
    name: "Sole Trader",
    full: "Sole Proprietorship",
    desc: "The simplest structure. You run your business as an individual and keep all profits, but you are personally liable.",
    popular: false,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" width={28} height={28}>
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
  {
    id: "dao",
    name: "DAO LLC",
    full: "Decentralized Autonomous Org",
    desc: "A modern structure for Web3 and blockchain projects. Available in Wyoming and Tennessee.",
    popular: false,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" width={28} height={28}>
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.93 4.93l2.12 2.12M16.95 16.95l2.12 2.12M4.93 19.07l2.12-2.12M16.95 7.05l2.12-2.12" />
      </svg>
    ),
  },
];

function Stepper({ current }: { current: number }) {
  return (
    <div
      className="w-65 shrink-0 rounded-[15px] p-7 flex flex-col"
      style={{ background: "rgba(20,20,22,0.85)", border: "1px solid rgba(255,255,255,0.07)" }}
    >
      <p className="text-xs font-bold tracking-widest uppercase text-white/40 mb-8">Setup Progress</p>
      <div className="flex flex-col flex-1">
        {STEPS.map((step, i) => {
          const done    = step.id < current;
          const active  = step.id === current;
          const pending = step.id > current;
          return (
            <div key={step.id} className="flex items-start gap-4">
              <div className="flex flex-col items-center">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                  style={{
                    background: active ? "linear-gradient(135deg, #9452E8, #FF5B62)" : done ? "#10B981" : "rgba(255,255,255,0.07)",
                    border: pending ? "1px solid rgba(255,255,255,0.15)" : "none",
                    color: pending ? "rgba(255,255,255,0.3)" : "white",
                  }}
                >
                  {done ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" width={15} height={15}><path d="M20 6L9 17l-5-5" /></svg>
                  ) : step.id}
                </div>
                {i < STEPS.length - 1 && (
                  <div className="w-px mt-1" style={{ height: "36px", background: done ? "#10B981" : "rgba(255,255,255,0.10)" }} />
                )}
              </div>
              <div className="pt-1.5 pb-9">
                <p className="text-sm font-medium leading-tight" style={{ color: active ? "white" : done ? "rgba(255,255,255,0.65)" : "rgba(255,255,255,0.30)" }}>
                  {step.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>
      <button
        type="button"
        className="mt-auto flex items-center gap-2.5 w-full px-4 py-3 rounded-[10px] text-sm text-white/70 hover:text-white transition-colors duration-150 cursor-pointer"
        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)" }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" width={16} height={16}>
          <path d="M3 18v-6a9 9 0 0118 0v6" /><path d="M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3v5zM3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3v5z" />
        </svg>
        <span className="leading-tight">Schedule a meeting with our team</span>
      </button>
    </div>
  );
}

function CompanyTypeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const country = searchParams.get("country") ?? "uk";

  const [selected, setSelected] = useState("llc");

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: PAGE_BG }}>
      <Sidebar countryCode="US" activeItem="home" />

      <main className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center gap-4 rounded-[50px] px-5 py-3.5 shrink-0" style={{ background: "#1a1a1c", boxShadow: "5px 5px 4px 2px rgba(0,0,0,0.3)" }}>
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0" style={{ background: "linear-gradient(135deg,#7C3AED,#06B6D4)" }}>Q</div>
          <div className="flex-1">
            <p className="font-semibold text-fg text-sm">Complete your profile</p>
            <p className="text-xs text-fg-muted mt-0.5">Step 2 of 5: Company Type</p>
          </div>
          <div className="flex gap-2">
            <button type="button" className="w-9 h-9 rounded-full flex items-center justify-center text-white border border-white cursor-pointer hover:bg-white/10 transition-colors" style={{ background: "#1a1a1c" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" width={16} height={16}><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" /></svg>
            </button>
            <Link href="/dashboard" className="w-9 h-9 rounded-full flex items-center justify-center text-white border border-white cursor-pointer hover:bg-white/10 transition-colors" style={{ background: "#1a1a1c" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" width={16} height={16}><path d="M18.36 6.64A9 9 0 1112 3" /><path d="M12 2v10" /></svg>
            </Link>
          </div>
        </div>

        {/* Content */}
        <div className="flex gap-5 flex-1 min-h-0">
          <Stepper current={2} />

          <div className="flex-1 rounded-[15px] p-8 flex flex-col overflow-y-auto" style={{ background: "rgba(83,83,83,0.25)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <h2 className="text-xl font-bold text-white mb-1">Choose Your Company Type</h2>
            <p className="text-sm text-white/50 mb-7">Select the legal structure that best fits your business goals.</p>

            <div className="grid grid-cols-2 gap-3 flex-1">
              {COMPANY_TYPES.map((type) => {
                const isSelected = selected === type.id;
                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setSelected(type.id)}
                    className="relative text-left p-5 rounded-xl transition-all duration-150 cursor-pointer"
                    style={{
                      background: isSelected ? "rgba(148,82,232,0.15)" : "rgba(255,255,255,0.04)",
                      border: isSelected ? "1.5px solid rgba(148,82,232,0.6)" : "1px solid rgba(255,255,255,0.09)",
                    }}
                  >
                    {type.popular && (
                      <span className="absolute top-3 right-3 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full" style={{ background: "linear-gradient(90deg,#9452E8,#FF5B62)", color: "white" }}>
                        Popular
                      </span>
                    )}
                    <div className="mb-3" style={{ color: isSelected ? "#C64CD3" : "rgba(255,255,255,0.4)" }}>
                      {type.icon}
                    </div>
                    <p className="font-bold text-white text-[15px] mb-0.5">{type.name}</p>
                    <p className="text-xs text-white/50 mb-2">{type.full}</p>
                    <p className="text-xs text-white/40 leading-relaxed">{type.desc}</p>
                    {isSelected && (
                      <div className="absolute top-3 left-3 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg,#9452E8,#FF5B62)" }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" width={11} height={11}><path d="M20 6L9 17l-5-5" /></svg>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-6 pt-5 border-t border-white/10">
              <Link href={`/onboarding/personal-info?country=${country}`} className="flex items-center gap-2 px-5 py-2.5 rounded-[10px] text-sm text-white/60 hover:text-white transition-colors cursor-pointer" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)" }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={14} height={14}><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                Back
              </Link>
              <button
                type="button"
                onClick={() => router.push(`/onboarding/plan-selection?country=${country}&type=${selected}`)}
                className="flex items-center gap-2 px-6 py-2.5 rounded-[10px] text-sm font-semibold text-white cursor-pointer border border-[#9f4dbc]"
                style={{ background: "linear-gradient(90deg, #9452E8 12.5%, #C64CD3 29.3%, #E945A8 45.7%, #FF4AB3 61%, #FF5480 76%, #FF5B62 91.3%)" }}
              >
                Next
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={14} height={14}><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function CompanyTypePage() {
  return (
    <Suspense>
      <CompanyTypeContent />
    </Suspense>
  );
}
