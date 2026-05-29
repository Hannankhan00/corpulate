"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Sidebar from "@/app/components/Sidebar";

export type StateOption = {
  id: string;
  name: string;
  abbr: string | null;
  isFeatured: boolean;
  badge: string | null;
  description: string | null;
  pros: string[];
  fee: number | null;
};

type Props = {
  country: string;
  type: string;
  plan: string;
  billing: string;
  featuredStates: StateOption[];
  allStates: StateOption[];
  defaultSelected: string;
};

const STEPS = [
  { id: 1, label: "Personal Information" },
  { id: 2, label: "Company Type" },
  { id: 3, label: "Plan Selection" },
  { id: 4, label: "State Selection" },
  { id: 5, label: "Company Information" },
  { id: 6, label: "Add-ons" },
  { id: 7, label: "Payment" },
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

export default function StateSelectionClient({
  country, type, plan, billing,
  featuredStates, allStates, defaultSelected,
}: Props) {
  const router = useRouter();
  const [selected, setSelected] = useState(defaultSelected);
  const [search, setSearch]     = useState("");

  const filtered = allStates.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  const selectedState = [...featuredStates, ...allStates].find((s) => s.id === selected);
  const selectedFee   = selectedState?.fee ?? null;

  const PAGE_BG =
    "radial-gradient(ellipse 60% 80% at 0% 50%, rgba(13,100,139,0.45) 0%, rgba(6,6,6,0) 55%), radial-gradient(ellipse 50% 70% at 100% 30%, rgba(65,18,38,0.55) 0%, rgba(6,6,6,0) 55%), #070707";

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: PAGE_BG }}>
      <Sidebar countryCode="US" activeItem="home" />

      <main className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
        <div className="flex items-center gap-4 rounded-[50px] px-5 py-3.5 shrink-0" style={{ background: "#1a1a1c", boxShadow: "5px 5px 4px 2px rgba(0,0,0,0.3)" }}>
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0" style={{ background: "linear-gradient(135deg,#7C3AED,#06B6D4)" }}>Q</div>
          <div className="flex-1">
            <p className="font-semibold text-fg text-sm">Complete your profile</p>
            <p className="text-xs text-fg-muted mt-0.5">Step 4 of 5: State Selection</p>
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
          <Stepper current={4} />

          <div className="flex-1 rounded-[15px] p-8 flex flex-col overflow-y-auto" style={{ background: "rgba(83,83,83,0.25)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <h2 className="text-xl font-bold text-white mb-1">Select Your Formation State</h2>
            <p className="text-sm text-white/50 mb-6">Choose the state where you&apos;d like to register your company. This affects taxes, fees, and regulations.</p>

            {/* Featured states */}
            {featuredStates.length > 0 && (
              <div className="grid grid-cols-2 gap-3 mb-6">
                {featuredStates.map((state) => {
                  const isSelected = selected === state.id;
                  return (
                    <button
                      key={state.id}
                      type="button"
                      onClick={() => setSelected(state.id)}
                      className="relative text-left p-4 rounded-xl transition-all duration-150 cursor-pointer"
                      style={{
                        background: isSelected ? "rgba(148,82,232,0.15)" : "rgba(255,255,255,0.04)",
                        border: isSelected ? "1.5px solid rgba(148,82,232,0.6)" : "1px solid rgba(255,255,255,0.09)",
                      }}
                    >
                      {state.badge && (
                        <span className="absolute top-3 right-3 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full" style={{ background: "linear-gradient(90deg,#9452E8,#FF5B62)", color: "white" }}>
                          {state.badge}
                        </span>
                      )}
                      <div className="flex items-center gap-2 mb-2">
                        {state.abbr && <span className="text-2xl font-black text-white/20">{state.abbr}</span>}
                        <span className="font-bold text-white text-sm">{state.name}</span>
                        {state.fee != null && state.fee > 0 && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded ml-1" style={{ background: "rgba(251,191,36,0.12)", color: "#FCD34D" }}>+${state.fee}</span>
                        )}
                      </div>
                      {state.description && <p className="text-xs text-white/40 mb-3 leading-relaxed">{state.description}</p>}
                      {state.pros.length > 0 && (
                        <ul className="space-y-1">
                          {state.pros.map((pro) => (
                            <li key={pro} className="flex items-start gap-1.5 text-[11px] text-white/50">
                              <svg viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" width={10} height={10} className="shrink-0 mt-0.5"><path d="M20 6L9 17l-5-5" /></svg>
                              {pro}
                            </li>
                          ))}
                        </ul>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Search all states */}
            {allStates.length > 0 && (
              <div className="mb-3">
                <p className="text-xs text-white/40 uppercase tracking-wide mb-2">
                  {featuredStates.length > 0 ? "Or search all states" : "Search states"}
                </p>
                <div className="relative">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={14} height={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30">
                    <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search states…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full h-10 rounded-lg bg-[#1a1a1c] border border-white/15 pl-9 pr-4 text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-white/40 transition-colors"
                  />
                </div>
                {search && (
                  <div className="mt-2 flex flex-wrap gap-2 max-h-30 overflow-y-auto">
                    {filtered.map((s) => {
                      const isSel = selected === s.id;
                      return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => setSelected(s.id)}
                          className="flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium cursor-pointer transition-all duration-150"
                          style={{
                            background: isSel ? "rgba(148,82,232,0.3)" : "rgba(255,255,255,0.07)",
                            border: isSel ? "1px solid rgba(148,82,232,0.6)" : "1px solid rgba(255,255,255,0.10)",
                            color: isSel ? "white" : "rgba(255,255,255,0.6)",
                          }}
                        >
                          {s.name}
                          {s.fee != null && s.fee > 0 && (
                            <span className="text-[10px] font-bold" style={{ color: "#FCD34D" }}>+${s.fee}</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Fee notice when a state with a fee is selected */}
            {selectedFee != null && selectedFee > 0 && (
              <div className="mb-4 flex items-start gap-3 px-4 py-3 rounded-[10px]" style={{ background: "rgba(251,191,36,0.07)", border: "1px solid rgba(251,191,36,0.20)" }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="#FCD34D" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={15} height={15} className="shrink-0 mt-0.5">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <p className="text-xs leading-relaxed" style={{ color: "#FCD34D" }}>
                  <span className="font-bold">Additional state processing fee: +${selectedFee}</span>
                  {" "}— this state requires an additional fee on top of your plan price.
                </p>
              </div>
            )}

            {featuredStates.length === 0 && allStates.length === 0 && (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-white/30 text-sm text-center">No states have been configured for this country yet.</p>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-auto pt-5 border-t border-white/10">
              <Link
                href={`/onboarding/plan-selection?country=${country}&type=${type}&plan=${plan}&billing=${billing}`}
                className="flex items-center gap-2 px-5 py-2.5 rounded-[10px] text-sm text-white/60 hover:text-white transition-colors cursor-pointer"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)" }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={14} height={14}><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                Back
              </Link>
              <button
                type="button"
                onClick={() => router.push(`/onboarding/company-info?country=${country}&type=${type}&plan=${plan}&billing=${billing}&state=${selected}&stateFee=${selectedFee ?? 0}`)}
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
