"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import Sidebar from "@/app/components/Sidebar";
import { createPaymentIntent, finalizeApplication } from "@/app/actions/payment";
import { validatePromoCode } from "@/app/actions/promo";
import { submitBankTransferProof } from "@/app/actions/bankTransfer";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const PAGE_BG =
  "radial-gradient(ellipse 60% 80% at 0% 50%, rgba(13,100,139,0.45) 0%, rgba(6,6,6,0) 55%), radial-gradient(ellipse 50% 70% at 100% 30%, rgba(65,18,38,0.55) 0%, rgba(6,6,6,0) 55%), #070707";

const STRIPE_APPEARANCE = {
  theme: "night" as const,
  variables: {
    colorPrimary: "#9452E8",
    colorBackground: "#111113",
    colorText: "#ffffff",
    colorDanger: "#FF5B62",
    fontFamily: "inherit",
    borderRadius: "10px",
    spacingUnit: "4px",
  },
  rules: {
    ".Input": { border: "1px solid rgba(255,255,255,0.12)", padding: "14px 16px", background: "#111113" },
    ".Input:focus": { border: "1px solid rgba(148,82,232,0.7)", boxShadow: "0 0 0 3px rgba(148,82,232,0.12)" },
    ".Label": { color: "rgba(255,255,255,0.45)", fontSize: "11px", fontWeight: "700", letterSpacing: "0.08em", textTransform: "uppercase" },
    ".Tab": { border: "1px solid rgba(255,255,255,0.10)", background: "rgba(255,255,255,0.04)" },
    ".Tab--selected": { border: "1px solid rgba(148,82,232,0.5)", background: "rgba(148,82,232,0.12)" },
  },
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

type AddonItem  = { id: string; name: string; price: number };
type AppliedPromo = { discountAmount: number; discountLabel: string; code: string };
type BankDetailsData = {
  bankName: string; accountName: string; accountNumber: string;
  sortCode: string; iban: string; swift: string;
  reference: string; notes: string | null;
} | null;

type Props = {
  country: string; type: string; plan: string; billing: string;
  planName: string; planPrice: number; planFeatures: string[];
  state: string | null; stateFee: number;
  addonItems: AddonItem[]; addonTotal: number;
  total: number; addons: string;
  bankDetails: BankDetailsData;
};

// ── Stepper ────────────────────────────────────────────────────────────────
function Stepper({ current }: { current: number }) {
  return (
    <div className="hidden md:flex w-65 shrink-0 rounded-[15px] p-7 flex-col" style={{ background: "rgba(20,20,22,0.85)", border: "1px solid rgba(255,255,255,0.07)" }}>
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
                  {done ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" width={15} height={15}><path d="M20 6L9 17l-5-5" /></svg>
                  ) : step.id}
                </div>
                {i < STEPS.length - 1 && (
                  <div className="w-px mt-1" style={{ height: 36, background: done ? "#10B981" : "rgba(255,255,255,0.10)" }} />
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
        className="mt-auto flex items-center gap-2.5 w-full px-4 py-3 rounded-[10px] text-sm text-white/70 hover:text-white transition-colors cursor-pointer"
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

// ── Bill row ──────────────────────────────────────────────────────────────
function BillRow({ icon, label, sub, value, free }: {
  icon: React.ReactNode; label: string; sub: string; value?: string; free?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: free ? "rgba(16,185,129,0.12)" : "rgba(255,255,255,0.06)", color: free ? "#10B981" : "rgba(255,255,255,0.4)" }}>
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-sm text-white/80 leading-tight truncate">{label}</p>
          <p className="text-[11px] text-white/30 mt-0.5">{sub}</p>
        </div>
      </div>
      <div className="shrink-0 ml-4">
        {free ? (
          <span className="text-xs font-bold px-2 py-0.5 rounded-md" style={{ background: "rgba(16,185,129,0.15)", color: "#10B981", border: "1px solid rgba(16,185,129,0.2)" }}>Free</span>
        ) : (
          <span className="text-sm font-semibold text-white/75">{value}</span>
        )}
      </div>
    </div>
  );
}

// ── Promo section ─────────────────────────────────────────────────────────
function PromoSection({ subtotal, applied, onApplied, onRemoved }: {
  subtotal: number; applied: AppliedPromo | null;
  onApplied: (p: AppliedPromo) => void; onRemoved: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function apply() {
    if (!input.trim()) return;
    setError(null);
    startTransition(async () => {
      const res = await validatePromoCode(input.trim(), subtotal * 100);
      if (res.valid) {
        onApplied({ discountAmount: res.discountAmount, discountLabel: res.discountLabel, code: res.code });
        setInput(""); setOpen(false);
      } else {
        setError(res.error);
      }
    });
  }

  return (
    <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
      <button type="button"
        onClick={() => { if (!applied) setOpen(o => !o); }}
        className="w-full flex items-center justify-between px-6 py-4 text-sm transition-colors cursor-pointer"
        style={{ color: applied ? "#10B981" : "rgba(255,255,255,0.6)" }}
      >
        <div className="flex items-center gap-2.5">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" width={15} height={15}>
            <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
            <line x1="7" y1="7" x2="7.01" y2="7" />
          </svg>
          <span className="font-semibold">{applied ? `Promo applied: ${applied.code}` : "Promotion Code"}</span>
        </div>
        {applied ? (
          <button type="button" onClick={e => { e.stopPropagation(); onRemoved(); }}
            className="text-[11px] text-white/35 hover:text-white/70 transition-colors cursor-pointer px-2 py-1 rounded"
            style={{ background: "rgba(255,255,255,0.06)" }}>Remove</button>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={14} height={14}
            className="transition-transform duration-200" style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}>
            <path d="M6 9l6 6 6-6" />
          </svg>
        )}
      </button>
      {applied && (
        <div className="px-6 pb-4 flex items-center justify-between">
          <span className="text-sm text-[#10B981]">{applied.discountLabel}</span>
          <span className="text-sm font-semibold text-[#10B981]">-${applied.discountAmount}</span>
        </div>
      )}
      {open && !applied && (
        <div className="px-6 pb-5 space-y-2">
          <div className="flex gap-2">
            <input type="text" value={input}
              onChange={e => { setInput(e.target.value.toUpperCase()); setError(null); }}
              onKeyDown={e => e.key === "Enter" && (e.preventDefault(), apply())}
              placeholder="Enter your promo code"
              className="flex-1 h-11 rounded-[10px] px-4 text-sm text-white placeholder:text-white/25 focus:outline-none transition-colors"
              style={{ background: "rgba(255,255,255,0.05)", border: error ? "1px solid rgba(255,91,98,0.5)" : "1px solid rgba(255,255,255,0.12)" }}
            />
            <button type="button" onClick={apply} disabled={isPending || !input.trim()}
              className="px-5 h-11 rounded-[10px] text-sm font-bold text-white cursor-pointer disabled:opacity-40 transition-all shrink-0"
              style={{ background: "linear-gradient(90deg,#9452E8,#E945A8)", boxShadow: "0 2px 12px rgba(148,82,232,0.3)" }}>
              {isPending ? <svg className="animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={14} height={14}><path d="M21 12a9 9 0 11-6.219-8.56" /></svg> : "Apply"}
            </button>
          </div>
          {error && <p className="text-[11px] text-[#FF5B62] pl-1">{error}</p>}
        </div>
      )}
    </div>
  );
}

// ── Stripe pay form ───────────────────────────────────────────────────────
function StripePayForm({ finalTotal, appData, country, addons, promoCode, discountAmount, onBack }: {
  finalTotal: number; appData: Record<string, string | null | undefined>;
  country: string; addons: string; promoCode: string | null; discountAmount: number;
  onBack: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;
    setProcessing(true); setError(null);

    const { error: submitErr } = await elements.submit();
    if (submitErr) { setError(submitErr.message ?? "Something went wrong."); setProcessing(false); return; }

    const { error: confirmErr, paymentIntent } = await stripe.confirmPayment({ elements, redirect: "if_required" });
    if (confirmErr) { setError(confirmErr.message ?? "Payment failed."); setProcessing(false); return; }

    if (paymentIntent?.status === "succeeded") {
      await finalizeApplication({
        companyName:     appData.companyName  as string,
        companyName2:    appData.companyName2  ?? null,
        companyName3:    appData.companyName3  ?? null,
        description:     appData.description   ?? null,
        industry:        appData.industry      ?? null,
        revenue:         appData.revenue       ?? null,
        website:         appData.website       ?? null,
        companyType:     appData.companyType   as string,
        plan:            appData.plan          as string,
        billingPeriod:   appData.billingPeriod as string,
        state:           appData.state         ?? null,
        country, addons: addons || null,
        stripePaymentId: paymentIntent.id,
        amountPaid:      finalTotal * 100,
        promoCode:       promoCode || null,
        discountAmount:  discountAmount > 0 ? discountAmount * 100 : null,
      });
    } else {
      setError("Payment was not completed. Please try again.");
      setProcessing(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <PaymentElement options={{ layout: "tabs" }} />
      {error && (
        <div className="flex items-start gap-2.5 px-4 py-3 rounded-[10px]" style={{ background: "rgba(255,91,98,0.10)", border: "1px solid rgba(255,91,98,0.25)" }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="#FF5B62" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={14} height={14} className="shrink-0 mt-0.5"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
          <p className="text-xs text-[#FF5B62]">{error}</p>
        </div>
      )}
      <button type="submit" disabled={processing || !stripe}
        className="w-full flex items-center justify-center gap-2.5 py-4 rounded-xl text-sm font-bold text-white cursor-pointer disabled:opacity-60 transition-all"
        style={{ background: "linear-gradient(90deg,#9452E8 0%,#C64CD3 28%,#E945A8 55%,#FF5480 78%,#FF5B62 100%)", boxShadow: processing ? "none" : "0 4px 20px rgba(148,82,232,0.35)" }}>
        {processing ? (
          <><svg className="animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={16} height={16}><path d="M21 12a9 9 0 11-6.219-8.56" /></svg> Processing...</>
        ) : (
          <><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={15} height={15}><rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg> Pay ${finalTotal} now</>
        )}
      </button>
      <button type="button" onClick={onBack}
        className="w-full flex items-center justify-center gap-2 text-sm text-white/30 hover:text-white/60 transition-colors cursor-pointer py-1.5">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={13} height={13}><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
        Back to payment options
      </button>
    </form>
  );
}

// ── Copy field ────────────────────────────────────────────────────────────
function CopyField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  if (!value) return null;

  function copy() {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="flex items-center justify-between px-4 py-3 rounded-[10px] mb-2" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
      <div className="min-w-0">
        <p className="text-[10px] text-white/35 uppercase tracking-wide mb-0.5">{label}</p>
        <p className="text-sm text-white font-mono font-medium truncate">{value}</p>
      </div>
      <button type="button" onClick={copy}
        className="shrink-0 ml-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer"
        style={{
          background: copied ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.07)",
          color: copied ? "#10B981" : "rgba(255,255,255,0.45)",
          border: copied ? "1px solid rgba(16,185,129,0.3)" : "1px solid rgba(255,255,255,0.08)",
        }}>
        {copied ? (
          <><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" width={11} height={11}><path d="M20 6L9 17l-5-5" /></svg> Copied</>
        ) : (
          <><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" width={11} height={11}><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></svg> Copy</>
        )}
      </button>
    </div>
  );
}

// ── Bank transfer step ─────────────────────────────────────────────────────
function BankTransferStep({ bankDetails, finalTotal, appData, country, addons, plan, billing, promoCode, discountAmount, onBack }: {
  bankDetails: NonNullable<BankDetailsData>; finalTotal: number;
  appData: Record<string, string | null | undefined>; country: string; addons: string;
  plan: string; billing: string; promoCode: string | null; discountAmount: number;
  onBack: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => { if (preview) URL.revokeObjectURL(preview); };
  }, [preview]);

  function handleFile(f: File) {
    if (preview) URL.revokeObjectURL(preview);
    setFile(f); setError(null);
    setPreview(f.type.startsWith("image/") ? URL.createObjectURL(f) : null);
  }

  async function handleSubmit() {
    if (!file) { setError("Please upload a screenshot of your bank transfer."); return; }
    setSubmitting(true); setError(null);

    const fd = new FormData();
    fd.append("screenshot",     file);
    fd.append("companyName",    String(appData.companyName    ?? ""));
    fd.append("companyName2",   String(appData.companyName2   ?? ""));
    fd.append("companyName3",   String(appData.companyName3   ?? ""));
    fd.append("description",    String(appData.description    ?? ""));
    fd.append("industry",       String(appData.industry       ?? ""));
    fd.append("revenue",        String(appData.revenue        ?? ""));
    fd.append("website",        String(appData.website        ?? ""));
    fd.append("companyType",    String(appData.companyType    ?? ""));
    fd.append("plan",           plan);
    fd.append("billingPeriod",  billing);
    fd.append("state",          String(appData.state          ?? ""));
    fd.append("country",        country);
    fd.append("addons",         addons);
    fd.append("amountPaid",     String(Math.round(finalTotal * 100)));
    fd.append("promoCode",      promoCode ?? "");
    fd.append("discountAmount", discountAmount > 0 ? String(Math.round(discountAmount * 100)) : "");

    const result = await submitBankTransferProof(fd);
    if (result && "error" in result) {
      setError(result.error);
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Amount + reference banner */}
      <div className="flex items-center justify-between px-5 py-4 rounded-[14px]"
        style={{ background: "linear-gradient(135deg,rgba(13,100,139,0.15),rgba(6,182,212,0.08))", border: "1px solid rgba(13,100,139,0.3)" }}>
        <div>
          <p className="text-[10px] text-cyan-400/60 uppercase tracking-widest mb-1">Transfer exactly</p>
          <p className="text-3xl font-black text-white">${finalTotal}</p>
        </div>
        {bankDetails.reference && (
          <div className="text-right">
            <p className="text-[10px] text-cyan-400/60 uppercase tracking-widest mb-1">Use reference</p>
            <p className="font-mono font-bold text-cyan-400" style={{ fontSize: "1rem" }}>{bankDetails.reference}</p>
          </div>
        )}
      </div>

      {/* Bank account details */}
      <div>
        <p className="text-[10px] text-white/35 uppercase tracking-widest mb-3 px-1">Bank Account Details</p>
        {bankDetails.bankName      && <CopyField label="Bank Name"      value={bankDetails.bankName} />}
        {bankDetails.accountName   && <CopyField label="Account Name"   value={bankDetails.accountName} />}
        {bankDetails.accountNumber && <CopyField label="Account Number" value={bankDetails.accountNumber} />}
        {bankDetails.sortCode      && <CopyField label="Sort Code"      value={bankDetails.sortCode} />}
        {bankDetails.iban          && <CopyField label="IBAN"           value={bankDetails.iban} />}
        {bankDetails.swift         && <CopyField label="SWIFT / BIC"    value={bankDetails.swift} />}
      </div>

      {bankDetails.notes && (
        <div className="px-4 py-3 rounded-[10px]" style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)" }}>
          <p className="text-[10px] text-amber-400/70 uppercase tracking-widest mb-1">Important Note</p>
          <p className="text-sm text-white/70 leading-relaxed">{bankDetails.notes}</p>
        </div>
      )}

      {/* File upload */}
      <div>
        <p className="text-[10px] text-white/35 uppercase tracking-widest mb-3 px-1">Upload Transfer Screenshot</p>
        <input ref={fileInputRef} type="file" accept="image/*,.pdf" className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />

        {!file ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
            className="cursor-pointer flex flex-col items-center justify-center gap-3 py-9 rounded-[14px] transition-all select-none"
            style={{
              background: dragging ? "rgba(13,100,139,0.12)" : "rgba(255,255,255,0.02)",
              border: dragging ? "2px dashed rgba(34,211,238,0.5)" : "2px dashed rgba(255,255,255,0.10)",
            }}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: "rgba(13,100,139,0.2)" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#22D3EE" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" width={22} height={22}>
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-white/65">Drop screenshot here</p>
              <p className="text-xs text-white/25 mt-0.5">or click to browse — JPG, PNG, PDF up to 10 MB</p>
            </div>
          </div>
        ) : (
          <div className="rounded-[14px] overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.10)" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {preview && <img src={preview} alt="Transfer proof" className="w-full max-h-44 object-cover" />}
            {!preview && (
              <div className="flex items-center gap-3 px-4 py-4" style={{ background: "rgba(255,255,255,0.04)" }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="#22D3EE" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" width={20} height={20}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-white/80 truncate">{file.name}</p>
                  <p className="text-xs text-white/35">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
              </div>
            )}
            <div className="flex items-center justify-between px-4 py-3" style={{ borderTop: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)" }}>
              <div className="min-w-0">
                {preview && <p className="text-xs text-white/40 truncate">{file.name}</p>}
                <p className="text-xs text-[#10B981] font-medium">Ready to submit</p>
              </div>
              <button type="button"
                onClick={() => { setFile(null); setPreview(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                className="text-xs text-white/35 hover:text-white/65 transition-colors cursor-pointer px-3 py-1.5 rounded-lg"
                style={{ background: "rgba(255,255,255,0.06)" }}>
                Change
              </button>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-start gap-2.5 px-4 py-3 rounded-[10px]" style={{ background: "rgba(255,91,98,0.10)", border: "1px solid rgba(255,91,98,0.25)" }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="#FF5B62" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={14} height={14} className="shrink-0 mt-0.5"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
          <p className="text-xs text-[#FF5B62]">{error}</p>
        </div>
      )}

      <button type="button" onClick={handleSubmit} disabled={submitting || !file}
        className="w-full flex items-center justify-center gap-2.5 py-4 rounded-xl text-sm font-bold text-white cursor-pointer disabled:opacity-55 transition-all"
        style={{ background: "linear-gradient(90deg,#0D648B,#0EA5C9)", boxShadow: submitting || !file ? "none" : "0 4px 20px rgba(13,100,139,0.5)" }}>
        {submitting ? (
          <><svg className="animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={16} height={16}><path d="M21 12a9 9 0 11-6.219-8.56" /></svg> Submitting...</>
        ) : (
          <><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={15} height={15}><polyline points="22 2 11 13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg> Submit Transfer Proof</>
        )}
      </button>

      <div className="flex items-start gap-2.5 px-4 py-3 rounded-[10px]" style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.12)" }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={13} height={13} className="shrink-0 mt-0.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="m9 12 2 2 4-4" /></svg>
        <p className="text-[11px] text-white/35 leading-relaxed">Your application will be reviewed and activated within 1–2 business days once payment is confirmed by our team.</p>
      </div>

      <button type="button" onClick={onBack}
        className="w-full flex items-center justify-center gap-2 text-sm text-white/30 hover:text-white/55 transition-colors cursor-pointer py-1">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={13} height={13}><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
        Back to payment options
      </button>
    </div>
  );
}

// ── Payment modal ──────────────────────────────────────────────────────────
function PaymentModal({ open, onClose, finalTotal, bankDetails, appData, country, addons, plan, billing, promoCode, discountAmount }: {
  open: boolean; onClose: () => void; finalTotal: number; bankDetails: BankDetailsData;
  appData: Record<string, string | null | undefined>; country: string; addons: string;
  plan: string; billing: string; promoCode: string | null; discountAmount: number;
}) {
  const [step, setStep] = useState<"method" | "card" | "bank">("method");
  const [cardSecret, setCardSecret] = useState<string | null>(null);
  const [cardLoading, setCardLoading] = useState(false);
  const [cardError, setCardError] = useState<string | null>(null);

  async function selectCard() {
    setStep("card"); setCardLoading(true); setCardSecret(null); setCardError(null);
    try {
      const { clientSecret } = await createPaymentIntent(Math.round(finalTotal * 100));
      setCardSecret(clientSecret);
    } catch {
      setCardError("Could not initialize payment. Please try again.");
    } finally {
      setCardLoading(false);
    }
  }

  function goBack() { setStep("method"); setCardSecret(null); setCardError(null); }

  if (!open) return null;

  const titles = { method: "Choose Payment Method", card: "Pay with Card", bank: "Bank Transfer" };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.78)", backdropFilter: "blur(10px)" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <style>{`@keyframes modalIn{from{opacity:0;transform:scale(.96) translateY(8px)}to{opacity:1;transform:scale(1) translateY(0)}}`}</style>
      <div className="relative w-full max-w-md rounded-2xl overflow-hidden flex flex-col"
        style={{ background: "#0f0f11", border: "1px solid rgba(255,255,255,0.10)", boxShadow: "0 30px 80px rgba(0,0,0,0.7)", animation: "modalIn 0.22s cubic-bezier(0.16,1,0.3,1)", maxHeight: "92vh" }}>

        {/* Modal header */}
        <div className="flex items-center justify-between px-5 py-4 shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="flex items-center gap-2.5">
            {step !== "method" && (
              <button type="button" onClick={goBack}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors cursor-pointer">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={14} height={14}><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
              </button>
            )}
            <h2 className="text-sm font-bold text-white">{titles[step]}</h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-white/30 font-mono">${finalTotal}</span>
            <button type="button" onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-white/35 hover:text-white hover:bg-white/10 transition-colors cursor-pointer">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={15} height={15}><path d="M18 6L6 18M6 6l12 12" /></svg>
            </button>
          </div>
        </div>

        {/* Modal body */}
        <div className="overflow-y-auto flex-1">
          {/* ── Method selection ── */}
          {step === "method" && (
            <div className="p-5 space-y-3">
              <div className="flex items-baseline justify-between mb-1">
                <p className="text-sm text-white/50">How would you like to pay?</p>
                <p className="text-xl font-black text-white">${finalTotal}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                {/* Card */}
                <button type="button" onClick={selectCard}
                  className="flex flex-col items-center gap-3 p-5 rounded-2xl transition-all cursor-pointer group"
                  style={{ background: "rgba(148,82,232,0.07)", border: "1px solid rgba(148,82,232,0.22)" }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = "rgba(148,82,232,0.14)"; el.style.border = "1px solid rgba(148,82,232,0.5)"; el.style.transform = "translateY(-1px)"; }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = "rgba(148,82,232,0.07)"; el.style.border = "1px solid rgba(148,82,232,0.22)"; el.style.transform = "translateY(0)"; }}>
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg,rgba(148,82,232,0.25),rgba(233,69,168,0.15))", border: "1px solid rgba(148,82,232,0.25)" }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="#C084FC" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" width={20} height={20}><rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-white">Card</p>
                    <p className="text-[11px] text-white/35 mt-0.5">Instant</p>
                  </div>
                  <div className="flex gap-1">
                    <div className="rounded overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
                      <svg viewBox="0 0 32 20" fill="none" width={26} height={16}><rect width="32" height="20" rx="3" fill="#1A1F71"/><text x="3" y="14" fill="#F9A51A" fontSize="7" fontFamily="sans-serif" fontWeight="bold">VISA</text></svg>
                    </div>
                    <div className="rounded overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
                      <svg viewBox="0 0 32 20" fill="none" width={26} height={16}><rect width="32" height="20" rx="3" fill="#252525"/><circle cx="12" cy="10" r="6" fill="#EB001B"/><circle cx="20" cy="10" r="6" fill="#F79E1B"/><path d="M16 5.5a6 6 0 010 9A6 6 0 0116 5.5z" fill="#FF5F00"/></svg>
                    </div>
                  </div>
                </button>

                {/* Bank transfer */}
                {bankDetails ? (
                  <button type="button" onClick={() => setStep("bank")}
                    className="flex flex-col items-center gap-3 p-5 rounded-2xl transition-all cursor-pointer"
                    style={{ background: "rgba(13,100,139,0.07)", border: "1px solid rgba(13,100,139,0.22)" }}
                    onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = "rgba(13,100,139,0.14)"; el.style.border = "1px solid rgba(13,100,139,0.5)"; el.style.transform = "translateY(-1px)"; }}
                    onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = "rgba(13,100,139,0.07)"; el.style.border = "1px solid rgba(13,100,139,0.22)"; el.style.transform = "translateY(0)"; }}>
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg,rgba(13,100,139,0.25),rgba(6,182,212,0.15))", border: "1px solid rgba(13,100,139,0.25)" }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="#22D3EE" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" width={20} height={20}><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-white">Bank Transfer</p>
                      <p className="text-[11px] text-white/35 mt-0.5">1–2 days</p>
                    </div>
                    <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full" style={{ background: "rgba(13,100,139,0.2)", color: "#22D3EE", border: "1px solid rgba(13,100,139,0.25)" }}>
                      Manual Review
                    </span>
                  </button>
                ) : (
                  <div className="flex flex-col items-center gap-3 p-5 rounded-2xl opacity-35 cursor-not-allowed select-none"
                    style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}>
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.04)" }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" width={20} height={20}><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-white/50">Bank Transfer</p>
                      <p className="text-[11px] text-white/25 mt-0.5">Unavailable</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-center gap-5 pt-2">
                {["256-bit SSL", "PCI Compliant", "Encrypted"].map((l, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-[10px] text-white/18">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={10} height={10}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                    {l}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Card step ── */}
          {step === "card" && (
            <div className="p-5">
              {cardError && (
                <div className="flex items-start gap-2.5 px-4 py-3 rounded-[10px] mb-4" style={{ background: "rgba(255,91,98,0.10)", border: "1px solid rgba(255,91,98,0.25)" }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="#FF5B62" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={14} height={14} className="shrink-0 mt-0.5"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                  <p className="text-xs text-[#FF5B62]">{cardError}</p>
                </div>
              )}
              {cardLoading && (
                <div className="flex flex-col items-center justify-center h-40 gap-3">
                  <svg className="animate-spin" viewBox="0 0 24 24" fill="none" stroke="rgba(148,82,232,0.5)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={28} height={28}><path d="M21 12a9 9 0 11-6.219-8.56" /></svg>
                  <p className="text-xs text-white/25">Initializing secure payment...</p>
                </div>
              )}
              {!cardLoading && cardSecret && (
                <Elements stripe={stripePromise} options={{ clientSecret: cardSecret, appearance: STRIPE_APPEARANCE }}>
                  <StripePayForm
                    finalTotal={finalTotal} discountAmount={discountAmount}
                    promoCode={promoCode} appData={appData} country={country} addons={addons} onBack={goBack}
                  />
                </Elements>
              )}
            </div>
          )}

          {/* ── Bank step ── */}
          {step === "bank" && bankDetails && (
            <div className="p-5">
              <BankTransferStep
                bankDetails={bankDetails} finalTotal={finalTotal}
                appData={appData} country={country} addons={addons}
                plan={plan} billing={billing} promoCode={promoCode} discountAmount={discountAmount}
                onBack={goBack}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────
export default function CheckoutClient({
  country, type, plan, billing, planName, planPrice, planFeatures,
  state, stateFee, addonItems, total, addons, bankDetails,
}: Props) {
  const [promo, setPromo] = useState<AppliedPromo | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalKey, setModalKey] = useState(0);

  const [appData] = useState<Record<string, string | null>>(() => {
    if (typeof window === "undefined") return {};
    try {
      const raw = sessionStorage.getItem("corpulate_company_info");
      return raw ? JSON.parse(raw) : {};
    } catch { return {}; }
  });

  const discountAmount = promo?.discountAmount ?? 0;
  const finalTotal = Math.max(0, total - discountAmount);
  const billingLabel = billing === "annual" ? "Annual" : "Monthly";

  const fullAppData = {
    ...appData,
    companyType:   type,
    plan,
    billingPeriod: billing,
    state:         state ?? null,
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: PAGE_BG }}>
      <Sidebar countryCode={country === "uk" ? "GB" : "US"} activeItem="home" />

      <main className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col gap-4">

        {/* Top progress bar */}
        <div className="flex items-center gap-3 rounded-[50px] pl-12 pr-4 md:px-5 py-3.5 shrink-0" style={{ background: "#1a1a1c", boxShadow: "5px 5px 4px 2px rgba(0,0,0,0.3)" }}>
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0" style={{ background: "linear-gradient(135deg,#7C3AED,#06B6D4)" }}>Q</div>
          <div className="flex-1">
            <p className="font-semibold text-fg text-sm">Complete your profile</p>
            <p className="text-xs text-fg-muted mt-0.5">Step 7 of 7 · Payment</p>
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

        {/* Content row */}
        <div className="flex gap-5 flex-1 min-h-0">
          <Stepper current={7} />

          <div className="flex-1 flex flex-col xl:flex-row gap-5 min-h-0 overflow-y-auto">

            {/* ── Order Summary ── */}
            <div className="w-full xl:flex-1 rounded-[18px] flex flex-col overflow-hidden" style={{ background: "rgba(14,14,16,0.92)", border: "1px solid rgba(255,255,255,0.08)" }}>

              <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg,rgba(148,82,232,0.3),rgba(255,91,98,0.2))", border: "1px solid rgba(148,82,232,0.3)" }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="#C084FC" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" width={15} height={15}><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 01-8 0" /></svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Order Summary</h3>
                    <p className="text-[11px] text-white/35 mt-0.5">{planName} · {billingLabel} billing</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md" style={{ background: "rgba(148,82,232,0.15)", color: "#C084FC", border: "1px solid rgba(148,82,232,0.25)" }}>
                  {billingLabel}
                </span>
              </div>

              <div className="px-6 py-2">
                <BillRow
                  icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" width={14} height={14}><rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" /></svg>}
                  label={`${planName} Plan`}
                  sub={billing === "annual" ? "Billed annually" : "Billed monthly"}
                  value={`$${planPrice}`}
                />
                {stateFee > 0 && state && (
                  <BillRow
                    icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" width={14} height={14}><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>}
                    label={`${state.replace(/-/g, " ")} State Fee`}
                    sub="Government filing fee"
                    value={`$${stateFee}`}
                  />
                )}
                {addonItems.map(a => (
                  <BillRow
                    key={a.id}
                    icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" width={14} height={14}><path d="M12 5v14M5 12h14" /></svg>}
                    label={a.name} sub="Add-on service" value={`$${a.price}`}
                  />
                ))}
              </div>

              {planFeatures.length > 0 && (
                <>
                  <div className="mx-6 my-1" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }} />
                  <div className="px-6 py-2">
                    {planFeatures.map(f => (
                      <BillRow key={f}
                        icon={<svg viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" width={13} height={13}><path d="M20 6L9 17l-5-5" /></svg>}
                        label={f} sub="Included in plan" free
                      />
                    ))}
                  </div>
                </>
              )}

              <div className="mt-auto">
                <PromoSection subtotal={total} applied={promo} onApplied={setPromo} onRemoved={() => setPromo(null)} />
                <div className="px-6 py-5 flex items-center justify-between" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
                  <div>
                    <p className="text-xs text-white/40 mb-0.5 uppercase tracking-wide font-semibold">Total Amount</p>
                    {promo && <p className="text-xs text-white/25 line-through">${total}</p>}
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-black text-white">${finalTotal}</p>
                    {billing === "annual" && <p className="text-[10px] text-white/25 mt-0.5">Billed annually</p>}
                  </div>
                </div>
              </div>

              <div className="px-6 py-4" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                <Link
                  href={`/onboarding/add-ons?country=${country}&type=${type}&plan=${plan}&billing=${billing}&state=${state ?? ""}&stateFee=${stateFee}&addons=${addons}`}
                  className="flex items-center gap-2 text-sm text-white/35 hover:text-white/65 transition-colors cursor-pointer w-fit">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={13} height={13}><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                  Back to add-ons
                </Link>
              </div>
            </div>

            {/* ── Pay card ── */}
            <div className="w-full xl:w-80 xl:shrink-0 rounded-[18px] flex flex-col overflow-hidden" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>

              <div className="px-6 py-5 flex-1 flex flex-col gap-5">
                <div>
                  <h2 className="text-sm font-bold text-white mb-1">Complete Your Order</h2>
                  <p className="text-xs text-white/35">Choose your preferred payment method to get started.</p>
                </div>

                {/* Total display */}
                <div className="px-5 py-4 rounded-[14px] text-center" style={{ background: "linear-gradient(135deg,rgba(148,82,232,0.12),rgba(233,69,168,0.07))", border: "1px solid rgba(148,82,232,0.2)" }}>
                  <p className="text-[11px] text-white/40 uppercase tracking-widest mb-2">Total Due Today</p>
                  {promo && <p className="text-sm text-white/25 line-through mb-0.5">${total}</p>}
                  <p className="text-4xl font-black text-white">${finalTotal}</p>
                  {billing === "annual" && <p className="text-[10px] text-white/30 mt-1.5">Billed annually — save 20%</p>}
                  {promo && <p className="text-xs text-[#10B981] mt-1">You saved ${discountAmount}!</p>}
                </div>

                {/* Pay button */}
                <button
                  type="button"
                  onClick={() => { setModalKey(k => k + 1); setModalOpen(true); }}
                  className="w-full flex items-center justify-center gap-2.5 py-4 rounded-xl text-sm font-bold text-white cursor-pointer transition-all"
                  style={{ background: "linear-gradient(90deg,#9452E8 0%,#C64CD3 28%,#E945A8 55%,#FF5480 78%,#FF5B62 100%)", boxShadow: "0 4px 24px rgba(148,82,232,0.4)" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 32px rgba(148,82,232,0.55)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 24px rgba(148,82,232,0.4)"; }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={16} height={16}><rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>
                  Pay Now
                </button>

                {/* Payment methods accepted */}
                <div className="space-y-2.5">
                  <p className="text-[10px] text-white/25 uppercase tracking-widest text-center">Accepted payment methods</p>
                  <div className="flex items-center justify-center gap-2">
                    {[
                      <><rect width="38" height="24" rx="3" fill="#1A1F71"/><text x="4" y="16" fill="#F9A51A" fontSize="9" fontFamily="sans-serif" fontWeight="bold">VISA</text></>,
                      <><rect width="38" height="24" rx="3" fill="#252525"/><circle cx="14" cy="12" r="7" fill="#EB001B"/><circle cx="24" cy="12" r="7" fill="#F79E1B"/><path d="M19 6.8a7 7 0 010 10.4A7 7 0 0119 6.8z" fill="#FF5F00"/></>,
                    ].map((path, i) => (
                      <div key={i} className="rounded overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
                        <svg viewBox="0 0 38 24" fill="none" width={32} height={20}>{path}</svg>
                      </div>
                    ))}
                    {bankDetails && (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded" style={{ background: "rgba(13,100,139,0.15)", border: "1px solid rgba(13,100,139,0.25)" }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="#22D3EE" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={12} height={12}><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /></svg>
                        <span className="text-[10px] text-cyan-400 font-medium">Bank</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-auto space-y-2">
                  {[
                    { icon: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />, label: "256-bit SSL encryption" },
                    { icon: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="m9 12 2 2 4-4" /></>, label: "Stripe PCI certified" },
                  ].map(({ icon, label }, i) => (
                    <div key={i} className="flex items-center gap-2.5">
                      <svg viewBox="0 0 24 24" fill="none" stroke="rgba(16,185,129,0.6)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={13} height={13}>{icon}</svg>
                      <p className="text-[11px] text-white/30">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>

      <PaymentModal
        key={modalKey}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        finalTotal={finalTotal}
        bankDetails={bankDetails}
        appData={fullAppData}
        country={country}
        addons={addons}
        plan={plan}
        billing={billing}
        promoCode={promo?.code ?? null}
        discountAmount={discountAmount}
      />
    </div>
  );
}
