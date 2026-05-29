"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import Sidebar from "@/app/components/Sidebar";

const PAGE_BG =
  "radial-gradient(ellipse 60% 80% at 0% 50%, rgba(13,100,139,0.45) 0%, rgba(6,6,6,0) 55%), radial-gradient(ellipse 50% 70% at 100% 30%, rgba(65,18,38,0.55) 0%, rgba(6,6,6,0) 55%), #070707";

const STEPS = [
  { id: 1, label: "Personal Information" },
  { id: 2, label: "Company Type" },
  { id: 3, label: "Plan Selection" },
  { id: 4, label: "State Selection" },
  { id: 5, label: "Company Information" },
  { id: 6, label: "Add-ons" },
  { id: 7, label: "Payment" },
];

const ADDONS = [
  {
    id: "registered-agent",
    name: "Registered Agent Service",
    description: "We act as your registered agent to receive legal documents and official notices on your behalf. Required in most states.",
    price: 99,
    period: "per year",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" width={22} height={22}>
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
  {
    id: "ein",
    name: "EIN / Tax ID Application",
    description: "We file for your Federal Employer Identification Number. Required to open a business bank account and hire employees.",
    price: 49,
    period: "one-time",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" width={22} height={22}>
        <rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" />
      </svg>
    ),
  },
  {
    id: "operating-agreement",
    name: "Operating Agreement",
    description: "A professionally drafted operating agreement defining ownership structure, member roles, and governance rules.",
    price: 79,
    period: "one-time",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" width={22} height={22}>
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14,2 14,8 20,8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10,9 9,9 8,9" />
      </svg>
    ),
  },
  {
    id: "annual-report",
    name: "Annual Report Filing",
    description: "We handle your annual state compliance filings on your behalf so you never miss a deadline or incur penalties.",
    price: 149,
    period: "per year",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" width={22} height={22}>
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
];

function Stepper({ current }: { current: number }) {
  return (
    <div className="w-65 shrink-0 rounded-[15px] p-7 flex flex-col" style={{ background: "rgba(20,20,22,0.85)", border: "1px solid rgba(255,255,255,0.07)" }}>
      <p className="text-xs font-bold tracking-widest uppercase text-white/40 mb-8">Setup Progress</p>
      <div className="flex flex-col flex-1">
        {STEPS.map((step, i) => {
          const done = step.id < current, active = step.id === current, pending = step.id > current;
          return (
            <div key={step.id} className="flex items-start gap-4">
              <div className="flex flex-col items-center">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                  style={{
                    background: active ? "linear-gradient(135deg,#9452E8,#FF5B62)" : done ? "#10B981" : "rgba(255,255,255,0.07)",
                    border: pending ? "1px solid rgba(255,255,255,0.15)" : "none",
                    color: pending ? "rgba(255,255,255,0.3)" : "white",
                  }}
                >
                  {done ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" width={15} height={15}><path d="M20 6L9 17l-5-5" /></svg> : step.id}
                </div>
                {i < STEPS.length - 1 && <div className="w-px mt-1" style={{ height: "36px", background: done ? "#10B981" : "rgba(255,255,255,0.10)" }} />}
              </div>
              <div className="pt-1.5 pb-9">
                <p className="text-sm font-medium leading-tight" style={{ color: active ? "white" : done ? "rgba(255,255,255,0.65)" : "rgba(255,255,255,0.30)" }}>{step.label}</p>
              </div>
            </div>
          );
        })}
      </div>
      <button type="button" className="mt-auto flex items-center gap-2.5 w-full px-4 py-3 rounded-[10px] text-sm text-white/70 hover:text-white transition-colors duration-150 cursor-pointer" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)" }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" width={16} height={16}><path d="M3 18v-6a9 9 0 0118 0v6" /><path d="M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3v5zM3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3v5z" /></svg>
        <span className="leading-tight">Schedule a meeting with our team</span>
      </button>
    </div>
  );
}

function AddOnsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const country  = searchParams.get("country")  ?? "uk";
  const type     = searchParams.get("type")     ?? "llc";
  const plan     = searchParams.get("plan")     ?? "starter";
  const billing  = searchParams.get("billing")  ?? "monthly";
  const state    = searchParams.get("state")    ?? "";
  const stateFee = searchParams.get("stateFee") ?? "0";

  const [selected, setSelected] = useState<Set<string>>(new Set());

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function handleNext() {
    const addons = Array.from(selected).join(",");
    const q = new URLSearchParams({ country, type, plan, billing, state, stateFee, addons });
    router.push(`/onboarding/checkout?${q.toString()}`);
  }

  const selectedTotal = ADDONS.filter((a) => selected.has(a.id)).reduce((s, a) => s + a.price, 0);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: PAGE_BG }}>
      <Sidebar countryCode={country === "uk" ? "GB" : "US"} activeItem="home" />

      <main className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
        <div className="flex items-center gap-4 rounded-[50px] px-5 py-3.5 shrink-0" style={{ background: "#1a1a1c", boxShadow: "5px 5px 4px 2px rgba(0,0,0,0.3)" }}>
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0" style={{ background: "linear-gradient(135deg,#7C3AED,#06B6D4)" }}>Q</div>
          <div className="flex-1">
            <p className="font-semibold text-fg text-sm">Complete your profile</p>
            <p className="text-xs text-fg-muted mt-0.5">Step 6 of 7: Additional Services</p>
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

        <div className="flex gap-5 flex-1 min-h-0">
          <Stepper current={6} />

          <div className="flex-1 rounded-[15px] p-8 flex flex-col overflow-y-auto" style={{ background: "rgba(83,83,83,0.25)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <h2 className="text-xl font-bold text-white mb-1">Additional Services</h2>
            <p className="text-sm text-white/50 mb-6">Enhance your formation package with these optional services. You can skip this step if you don&apos;t need any.</p>

            <div className="grid grid-cols-2 gap-3 mb-6">
              {ADDONS.map((addon) => {
                const isSelected = selected.has(addon.id);
                return (
                  <button
                    key={addon.id}
                    type="button"
                    onClick={() => toggle(addon.id)}
                    className="relative text-left p-5 rounded-xl transition-all duration-150 cursor-pointer"
                    style={{
                      background: isSelected ? "rgba(148,82,232,0.12)" : "rgba(255,255,255,0.04)",
                      border: isSelected ? "1.5px solid rgba(148,82,232,0.55)" : "1px solid rgba(255,255,255,0.09)",
                    }}
                  >
                    {isSelected && (
                      <div className="absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg,#9452E8,#FF5B62)" }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" width={11} height={11}><path d="M20 6L9 17l-5-5" /></svg>
                      </div>
                    )}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: isSelected ? "rgba(148,82,232,0.20)" : "rgba(255,255,255,0.07)", color: isSelected ? "#C084FC" : "rgba(255,255,255,0.5)" }}>
                        {addon.icon}
                      </div>
                      <div>
                        <p className="font-semibold text-white text-sm leading-tight">{addon.name}</p>
                        <p className="text-xs mt-0.5" style={{ color: isSelected ? "#C084FC" : "rgba(255,255,255,0.35)" }}>
                          <span className="font-bold">${addon.price}</span> {addon.period}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-white/40 leading-relaxed">{addon.description}</p>
                  </button>
                );
              })}
            </div>

            {selected.size > 0 && (
              <div className="mb-4 flex items-center justify-between px-4 py-3 rounded-[10px]" style={{ background: "rgba(148,82,232,0.08)", border: "1px solid rgba(148,82,232,0.20)" }}>
                <p className="text-sm text-white/60">{selected.size} service{selected.size > 1 ? "s" : ""} selected</p>
                <p className="text-sm font-bold text-white">+${selectedTotal} added</p>
              </div>
            )}

            <div className="flex items-center justify-between mt-auto pt-5 border-t border-white/10">
              <Link
                href={`/onboarding/company-info?country=${country}&type=${type}&plan=${plan}&billing=${billing}&state=${state}&stateFee=${stateFee}`}
                className="flex items-center gap-2 px-5 py-2.5 rounded-[10px] text-sm text-white/60 hover:text-white transition-colors cursor-pointer"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)" }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={14} height={14}><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                Back
              </Link>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleNext}
                  className="text-sm text-white/50 hover:text-white transition-colors cursor-pointer px-4 py-2.5"
                >
                  Skip
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-[10px] text-sm font-semibold text-white cursor-pointer border border-[#9f4dbc]"
                  style={{ background: "linear-gradient(90deg, #9452E8 12.5%, #C64CD3 29.3%, #E945A8 45.7%, #FF4AB3 61%, #FF5480 76%, #FF5B62 91.3%)" }}
                >
                  {selected.size > 0 ? `Continue with ${selected.size} add-on${selected.size > 1 ? "s" : ""}` : "Continue"}
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={14} height={14}><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function AddOnsPage() {
  return (
    <Suspense>
      <AddOnsContent />
    </Suspense>
  );
}
