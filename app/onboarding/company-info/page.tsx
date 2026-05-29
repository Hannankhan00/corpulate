"use client";

import { Suspense } from "react";
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

const INDUSTRIES = [
  "Technology & Software",
  "E-commerce & Retail",
  "Finance & FinTech",
  "Healthcare",
  "Real Estate",
  "Marketing & Advertising",
  "Consulting & Professional Services",
  "Manufacturing",
  "Education",
  "Other",
];

const REVENUE_RANGES = [
  "Pre-revenue (just starting)",
  "$1 - $50,000",
  "$50,000 - $250,000",
  "$250,000 - $1,000,000",
  "$1M - $5M",
  "$5M+",
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

const fieldCls = "w-full h-[52px] rounded-[10px] bg-[#1a1a1c] border border-white/20 px-4 text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-white/50 transition-colors";
const labelCls = "block text-xs text-white/50 mb-2 uppercase tracking-wide";

function CompanyInfoContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const country  = searchParams.get("country")  ?? "uk";
  const type     = searchParams.get("type")     ?? "llc";
  const plan     = searchParams.get("plan")     ?? "starter";
  const billing  = searchParams.get("billing")  ?? "monthly";
  const state    = searchParams.get("state")    ?? "";
  const stateFee = searchParams.get("stateFee") ?? "0";

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = {
      companyName:  fd.get("companyName")  as string,
      companyName2: fd.get("companyName2") as string,
      companyName3: fd.get("companyName3") as string,
      description:  fd.get("description") as string,
      industry:     fd.get("industry")    as string,
      revenue:      fd.get("revenue")     as string,
      website:      fd.get("website")     as string,
    };
    sessionStorage.setItem("corpulate_company_info", JSON.stringify(data));
    const q = new URLSearchParams({ country, type, plan, billing, state, stateFee });
    router.push(`/onboarding/add-ons?${q.toString()}`);
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: PAGE_BG }}>
      <Sidebar countryCode={country === "uk" ? "GB" : "US"} activeItem="home" />

      <main className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
        <div className="flex items-center gap-4 rounded-[50px] px-5 py-3.5 shrink-0" style={{ background: "#1a1a1c", boxShadow: "5px 5px 4px 2px rgba(0,0,0,0.3)" }}>
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0" style={{ background: "linear-gradient(135deg,#7C3AED,#06B6D4)" }}>Q</div>
          <div className="flex-1">
            <p className="font-semibold text-fg text-sm">Complete your profile</p>
            <p className="text-xs text-fg-muted mt-0.5">Step 5 of 7: Company Information</p>
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
          <Stepper current={5} />

          <div className="flex-1 rounded-[15px] p-8 flex flex-col overflow-y-auto" style={{ background: "rgba(83,83,83,0.25)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <h2 className="text-xl font-bold text-white mb-1">Company Information</h2>
            <p className="text-sm text-white/50 mb-7">Tell us about your business so we can set everything up correctly.</p>

            <form onSubmit={handleSubmit} className="flex flex-col flex-1">
              <div className="space-y-5 max-w-140 flex-1">
                {/* Company name options */}
                <div>
                  <p className="text-xs font-bold tracking-widest uppercase text-white/50 mb-3">Company Name Preferences</p>
                  <div
                    className="flex items-start gap-3 px-4 py-3 rounded-[10px] mb-4"
                    style={{ background: "rgba(148,82,232,0.08)", border: "1px solid rgba(148,82,232,0.20)" }}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="#9452E8" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={14} height={14} className="shrink-0 mt-0.5">
                      <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    <p className="text-[11px] text-white/50 leading-relaxed">
                      Company names are checked for availability during registration. Providing 2–3 alternatives gives us a backup if your first choice is already taken.
                    </p>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label htmlFor="companyName" className={labelCls}>1st Choice <span className="text-[#FF5B62]">*</span></label>
                      <input id="companyName" name="companyName" type="text" placeholder="Acme Technologies LLC" required className={fieldCls} />
                      <p className="mt-1.5 text-[11px] text-white/30">Must include your entity type (LLC, Ltd, Corp, etc.)</p>
                    </div>
                    <div>
                      <label htmlFor="companyName2" className={labelCls}>2nd Choice <span className="text-white/25 normal-case">(optional)</span></label>
                      <input id="companyName2" name="companyName2" type="text" placeholder="Acme Solutions LLC" className={fieldCls} />
                    </div>
                    <div>
                      <label htmlFor="companyName3" className={labelCls}>3rd Choice <span className="text-white/25 normal-case">(optional)</span></label>
                      <input id="companyName3" name="companyName3" type="text" placeholder="Acme Ventures LLC" className={fieldCls} />
                    </div>
                  </div>
                </div>

                {/* Business description */}
                <div>
                  <label htmlFor="description" className={labelCls}>Business Description</label>
                  <textarea
                    id="description" name="description"
                    placeholder="Briefly describe what your company does and your main products or services..."
                    rows={3}
                    className="w-full rounded-[10px] bg-[#1a1a1c] border border-white/20 px-4 py-3 text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-white/50 transition-colors resize-none"
                  />
                </div>

                {/* Industry + Revenue row */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="industry" className={labelCls}>Industry</label>
                    <select id="industry" name="industry" defaultValue="" className={`${fieldCls} cursor-pointer`} style={{ colorScheme: "dark" }}>
                      <option value="" disabled>Select industry...</option>
                      {INDUSTRIES.map((ind) => (
                        <option key={ind} value={ind} style={{ background: "#1a1a1c" }}>{ind}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="revenue" className={labelCls}>Expected Annual Revenue</label>
                    <select id="revenue" name="revenue" defaultValue="" className={`${fieldCls} cursor-pointer`} style={{ colorScheme: "dark" }}>
                      <option value="" disabled>Select range...</option>
                      {REVENUE_RANGES.map((r) => (
                        <option key={r} value={r} style={{ background: "#1a1a1c" }}>{r}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Website */}
                <div>
                  <label htmlFor="website" className={labelCls}>Website <span className="normal-case text-white/25">(optional)</span></label>
                  <input id="website" name="website" type="url" placeholder="https://yourcompany.com" className={fieldCls} />
                </div>
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between mt-6 pt-5 border-t border-white/10">
                <Link
                  href={
                    state
                      ? `/onboarding/state-selection?country=${country}&type=${type}&plan=${plan}&billing=${billing}`
                      : `/onboarding/plan-selection?country=${country}&type=${type}&plan=${plan}&billing=${billing}`
                  }
                  className="flex items-center gap-2 px-5 py-2.5 rounded-[10px] text-sm text-white/60 hover:text-white transition-colors cursor-pointer"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)" }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={14} height={14}><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                  Back
                </Link>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-2.5 rounded-[10px] text-sm font-semibold text-white cursor-pointer border border-[#9f4dbc]"
                  style={{ background: "linear-gradient(90deg, #9452E8 12.5%, #C64CD3 29.3%, #E945A8 45.7%, #FF4AB3 61%, #FF5480 76%, #FF5B62 91.3%)" }}
                >
                  Next
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={14} height={14}><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function CompanyInfoPage() {
  return (
    <Suspense>
      <CompanyInfoContent />
    </Suspense>
  );
}
