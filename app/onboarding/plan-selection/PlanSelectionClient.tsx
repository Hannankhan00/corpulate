"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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

type Plan = {
  id: string;
  slug: string;
  name: string;
  monthlyPrice: number;
  annualDiscountPct: number;
  description: string | null;
  features: string;
  isHighlight: boolean;
};

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
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0" style={{ background: active ? "linear-gradient(135deg,#9452E8,#FF5B62)" : done ? "#10B981" : "rgba(255,255,255,0.07)", border: pending ? "1px solid rgba(255,255,255,0.15)" : "none", color: pending ? "rgba(255,255,255,0.3)" : "white" }}>
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

export default function PlanSelectionClient({
  country,
  type,
  plans,
}: {
  country: string;
  type: string;
  plans: Plan[];
}) {
  const router = useRouter();
  const defaultPlan = plans.find((p) => p.isHighlight)?.slug ?? plans[0]?.slug ?? "";
  const [selected, setSelected] = useState(defaultPlan);
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: PAGE_BG }}>
      <Sidebar countryCode={country.toLowerCase() === "uk" ? "GB" : country.toUpperCase()} activeItem="home" />

      <main className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center gap-4 rounded-[50px] px-5 py-3.5 shrink-0" style={{ background: "#1a1a1c", boxShadow: "5px 5px 4px 2px rgba(0,0,0,0.3)" }}>
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0" style={{ background: "linear-gradient(135deg,#7C3AED,#06B6D4)" }}>Q</div>
          <div className="flex-1">
            <p className="font-semibold text-fg text-sm">Complete your profile</p>
            <p className="text-xs text-fg-muted mt-0.5">Step 3 of 5: Plan Selection</p>
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
          <Stepper current={3} />

          <div className="flex-1 rounded-[15px] p-8 flex flex-col overflow-y-auto" style={{ background: "rgba(83,83,83,0.25)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="flex items-start justify-between mb-7">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Choose Your Plan</h2>
                <p className="text-sm text-white/50">All plans include company registration. Upgrade or downgrade anytime.</p>
              </div>
              {/* Billing toggle */}
              <div className="flex items-center gap-1 p-1 rounded-[10px]" style={{ background: "rgba(255,255,255,0.07)" }}>
                {(["monthly", "annual"] as const).map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setBilling(b)}
                    className="px-4 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer capitalize"
                    style={{ background: billing === b ? "rgba(148,82,232,0.4)" : "transparent", color: billing === b ? "white" : "rgba(255,255,255,0.45)" }}
                  >
                    {b}
                    {b === "annual" && <span className="ml-1 text-[10px] font-bold" style={{ color: "#10B981" }}>Save</span>}
                  </button>
                ))}
              </div>
            </div>

            {plans.length === 0 ? (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-white/30 text-sm">No plans available yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-4 flex-1">
                {plans.map((plan) => {
                  const isSelected = selected === plan.slug;
                  const features: string[] = (() => { try { return JSON.parse(plan.features); } catch { return []; } })();
                  const price = billing === "annual"
                    ? Math.round(plan.monthlyPrice * (1 - plan.annualDiscountPct / 100))
                    : plan.monthlyPrice;

                  return (
                    <button
                      key={plan.slug}
                      type="button"
                      onClick={() => setSelected(plan.slug)}
                      className="relative text-left p-6 rounded-xl flex flex-col transition-all duration-150 cursor-pointer"
                      style={{
                        background: plan.isHighlight && isSelected ? "rgba(148,82,232,0.20)" : isSelected ? "rgba(148,82,232,0.12)" : "rgba(255,255,255,0.04)",
                        border: isSelected ? "1.5px solid rgba(148,82,232,0.6)" : plan.isHighlight ? "1px solid rgba(148,82,232,0.25)" : "1px solid rgba(255,255,255,0.09)",
                      }}
                    >
                      {plan.isHighlight && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide" style={{ background: "linear-gradient(90deg,#9452E8,#FF5B62)", color: "white" }}>
                          Most Popular
                        </div>
                      )}
                      <p className="text-sm font-bold text-white/70 mb-1 uppercase tracking-wide">{plan.name}</p>
                      <div className="flex items-end gap-1 mb-2">
                        <span className="text-3xl font-bold text-white">${price}</span>
                        <span className="text-sm text-white/40 mb-1">/mo</span>
                      </div>
                      {plan.description && <p className="text-xs text-white/40 mb-5">{plan.description}</p>}
                      <ul className="space-y-2 flex-1">
                        {features.map((f) => (
                          <li key={f} className="flex items-start gap-2 text-xs text-white/60">
                            <svg viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" width={12} height={12} className="shrink-0 mt-0.5"><path d="M20 6L9 17l-5-5" /></svg>
                            {f}
                          </li>
                        ))}
                      </ul>
                      {isSelected && (
                        <div className="mt-4 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold text-white" style={{ background: "linear-gradient(90deg,#9452E8,#FF5B62)" }}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" width={12} height={12}><path d="M20 6L9 17l-5-5" /></svg>
                          Selected
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-6 pt-5 border-t border-white/10">
              <Link
                href={`/onboarding/company-type?country=${country}&type=${type}`}
                className="flex items-center gap-2 px-5 py-2.5 rounded-[10px] text-sm text-white/60 hover:text-white transition-colors cursor-pointer"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)" }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={14} height={14}><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                Back
              </Link>
              <button
                type="button"
                disabled={!selected}
                onClick={() => router.push(`/onboarding/state-selection?country=${country}&type=${type}&plan=${selected}&billing=${billing}`)}
                className="flex items-center gap-2 px-6 py-2.5 rounded-[10px] text-sm font-semibold text-white cursor-pointer border border-[#9f4dbc] disabled:opacity-50"
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
