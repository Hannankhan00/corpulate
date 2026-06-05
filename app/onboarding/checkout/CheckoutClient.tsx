"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import Sidebar from "@/app/components/Sidebar";
import { createPaymentIntent, finalizeApplication } from "@/app/actions/payment";
import { validatePromoCode } from "@/app/actions/promo";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

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

type AddonItem = { id: string; name: string; price: number };

type Props = {
  country: string; type: string; plan: string; billing: string;
  planName: string; planPrice: number; planFeatures: string[];
  state: string | null; stateFee: number;
  addonItems: AddonItem[]; addonTotal: number;
  total: number; addons: string;
};

type AppliedPromo = { discountAmount: number; discountLabel: string; code: string };

const STRIPE_APPEARANCE = {
  theme: "night" as const,
  variables: {
    colorPrimary: "#9452E8",
    colorBackground: "#0e0e10",
    colorText: "#ffffff",
    colorDanger: "#FF5B62",
    fontFamily: "inherit",
    borderRadius: "10px",
    spacingUnit: "4px",
  },
  rules: {
    ".Input": { border: "1px solid rgba(255,255,255,0.12)", padding: "14px 16px", background: "#0e0e10" },
    ".Input:focus": { border: "1px solid rgba(148,82,232,0.7)", boxShadow: "0 0 0 3px rgba(148,82,232,0.12)" },
    ".Label": { color: "rgba(255,255,255,0.45)", fontSize: "11px", fontWeight: "700", letterSpacing: "0.08em", textTransform: "uppercase" },
    ".Tab": { border: "1px solid rgba(255,255,255,0.10)", background: "rgba(255,255,255,0.04)" },
    ".Tab--selected": { border: "1px solid rgba(148,82,232,0.5)", background: "rgba(148,82,232,0.12)" },
  },
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
                  {done
                    ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" width={15} height={15}><path d="M20 6L9 17l-5-5" /></svg>
                    : step.id}
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

// ── Promo code section ─────────────────────────────────────────────────────

function PromoSection({
  subtotal,
  applied,
  onApplied,
  onRemoved,
}: {
  subtotal: number;
  applied: AppliedPromo | null;
  onApplied: (p: AppliedPromo) => void;
  onRemoved: () => void;
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
        setInput("");
        setOpen(false);
      } else {
        setError(res.error);
      }
    });
  }

  return (
    <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
      {/* Header toggle */}
      <button
        type="button"
        onClick={() => { if (!applied) setOpen((o) => !o); }}
        className="w-full flex items-center justify-between px-6 py-4 text-sm transition-colors cursor-pointer"
        style={{ color: applied ? "#10B981" : "rgba(255,255,255,0.6)" }}
      >
        <div className="flex items-center gap-2.5">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" width={15} height={15}>
            <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
            <line x1="7" y1="7" x2="7.01" y2="7" />
          </svg>
          <span className="font-semibold">
            {applied ? `Promo applied: ${applied.code}` : "Promotion Code"}
          </span>
        </div>
        {applied ? (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onRemoved(); }}
            className="text-[11px] text-white/35 hover:text-white/70 transition-colors cursor-pointer px-2 py-1 rounded"
            style={{ background: "rgba(255,255,255,0.06)" }}
          >
            Remove
          </button>
        ) : (
          <svg
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
            strokeLinecap="round" strokeLinejoin="round" width={14} height={14}
            className="transition-transform duration-200"
            style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        )}
      </button>

      {/* Applied discount row */}
      {applied && (
        <div className="px-6 pb-4 flex items-center justify-between">
          <span className="text-sm text-[#10B981]">{applied.discountLabel}</span>
          <span className="text-sm font-semibold text-[#10B981]">-${applied.discountAmount}</span>
        </div>
      )}

      {/* Input panel */}
      {open && !applied && (
        <div className="px-6 pb-5 space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => { setInput(e.target.value.toUpperCase()); setError(null); }}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), apply())}
              placeholder="Enter your promo code"
              className="flex-1 h-11 rounded-[10px] px-4 text-sm text-white placeholder:text-white/25 focus:outline-none transition-colors"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: error ? "1px solid rgba(255,91,98,0.5)" : "1px solid rgba(255,255,255,0.12)",
              }}
            />
            <button
              type="button"
              onClick={apply}
              disabled={isPending || !input.trim()}
              className="px-5 h-11 rounded-[10px] text-sm font-bold text-white cursor-pointer disabled:opacity-40 transition-all shrink-0"
              style={{ background: "linear-gradient(90deg,#9452E8,#E945A8)", boxShadow: "0 2px 12px rgba(148,82,232,0.3)" }}
            >
              {isPending
                ? <svg className="animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={14} height={14}><path d="M21 12a9 9 0 11-6.219-8.56" /></svg>
                : "Apply"}
            </button>
          </div>
          {error && <p className="text-[11px] text-[#FF5B62] pl-1">{error}</p>}
        </div>
      )}
    </div>
  );
}

// ── Payment form ───────────────────────────────────────────────────────────

function PayForm({
  finalTotal,
  appData,
  country,
  addons,
  promoCode,
  discountAmount,
}: {
  finalTotal: number;
  appData: Record<string, string | null | undefined>;
  country: string;
  addons: string;
  promoCode: string | null;
  discountAmount: number;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;
    setProcessing(true);
    setError(null);

    const { error: submitError } = await elements.submit();
    if (submitError) { setError(submitError.message ?? "Something went wrong."); setProcessing(false); return; }

    const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
    });

    if (confirmError) { setError(confirmError.message ?? "Payment failed."); setProcessing(false); return; }

    if (paymentIntent?.status === "succeeded") {
      await finalizeApplication({
        companyName:   appData.companyName  as string,
        companyName2:  appData.companyName2  ?? null,
        companyName3:  appData.companyName3  ?? null,
        description:   appData.description   ?? null,
        industry:      appData.industry      ?? null,
        revenue:       appData.revenue       ?? null,
        website:       appData.website       ?? null,
        companyType:   appData.companyType   as string,
        plan:          appData.plan          as string,
        billingPeriod: appData.billingPeriod as string,
        state:         appData.state         ?? null,
        country,
        addons:          addons || null,
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
          <svg viewBox="0 0 24 24" fill="none" stroke="#FF5B62" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={14} height={14} className="shrink-0 mt-0.5">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <p className="text-xs text-[#FF5B62]">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={processing || !stripe}
        className="w-full flex items-center justify-center gap-2.5 py-4 rounded-xl text-sm font-bold text-white cursor-pointer disabled:opacity-60 transition-all"
        style={{
          background: "linear-gradient(90deg,#9452E8 0%,#C64CD3 28%,#E945A8 55%,#FF5480 78%,#FF5B62 100%)",
          boxShadow: processing ? "none" : "0 4px 20px rgba(148,82,232,0.35)",
        }}
      >
        {processing ? (
          <>
            <svg className="animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={16} height={16}><path d="M21 12a9 9 0 11-6.219-8.56" /></svg>
            Processing…
          </>
        ) : (
          <>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={15} height={15}>
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" />
            </svg>
            Pay ${finalTotal} now
          </>
        )}
      </button>

      <div className="flex items-center justify-center gap-4">
        {[
          { icon: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />, label: "256-bit SSL" },
          { icon: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="m9 12 2 2 4-4" /></>, label: "Stripe Secured" },
          { icon: <><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></>, label: "PCI Compliant" },
        ].map(({ icon, label }, i) => (
          <div key={i} className="flex items-center gap-1.5 text-[11px] text-white/25">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={11} height={11}>{icon}</svg>
            {label}
          </div>
        ))}
      </div>
    </form>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

export default function CheckoutClient({
  country, type, plan, billing, planName, planPrice, planFeatures,
  state, stateFee, addonItems, total, addons,
}: Props) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [promo, setPromo] = useState<AppliedPromo | null>(null);
  const cancelRef = useRef(false);

  const [appData] = useState<Record<string, string | null>>(() => {
    if (typeof window === "undefined") return {};
    try {
      const raw = sessionStorage.getItem("corpulate_company_info");
      return raw ? JSON.parse(raw) : {};
    } catch { return {}; }
  });

  const discountAmount = promo?.discountAmount ?? 0;
  const finalTotal = Math.max(0, total - discountAmount);

  async function loadIntent(amountCents: number) {
    setClientSecret(null);
    setLoadError(null);
    try {
      const { clientSecret: cs } = await createPaymentIntent(amountCents);
      if (!cancelRef.current) setClientSecret(cs);
    } catch {
      if (!cancelRef.current) setLoadError("Could not initialize payment. Please refresh.");
    }
  }

  useEffect(() => {
    cancelRef.current = false;
    createPaymentIntent(total * 100)
      .then(({ clientSecret: cs }) => { if (!cancelRef.current) setClientSecret(cs); })
      .catch(() => { if (!cancelRef.current) setLoadError("Could not initialize payment. Please refresh."); });
    return () => { cancelRef.current = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handlePromoApplied(p: AppliedPromo) {
    setPromo(p);
    const newTotal = Math.max(0, total - p.discountAmount);
    await loadIntent(newTotal * 100);
  }

  async function handlePromoRemoved() {
    setPromo(null);
    await loadIntent(total * 100);
  }

  const billingLabel = billing === "annual" ? "Annual" : "Monthly";

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

            {/* ── Order Summary ────────────────────────────── */}
            <div className="w-full xl:w-80 xl:shrink-0 rounded-[18px] flex flex-col overflow-hidden" style={{ background: "rgba(14,14,16,0.92)", border: "1px solid rgba(255,255,255,0.08)" }}>

              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg,rgba(148,82,232,0.3),rgba(255,91,98,0.2))", border: "1px solid rgba(148,82,232,0.3)" }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="#C084FC" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" width={15} height={15}><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 01-8 0" /></svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Purchased Products</h3>
                    <p className="text-[11px] text-white/35 mt-0.5">{planName} · {billingLabel} billing</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md" style={{ background: "rgba(148,82,232,0.15)", color: "#C084FC", border: "1px solid rgba(148,82,232,0.25)" }}>
                  {billingLabel}
                </span>
              </div>

              {/* Paid line items */}
              <div className="px-6 py-2">
                <Row
                  icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" width={14} height={14}><rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" /></svg>}
                  label={`${planName} Plan`}
                  sub={billing === "annual" ? "Billed annually" : "Billed monthly"}
                  value={`$${planPrice}`}
                />
                {stateFee > 0 && state && (
                  <Row
                    icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" width={14} height={14}><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>}
                    label={`${state.replace(/-/g, " ")} State Fee`}
                    sub="Government filing fee"
                    value={`$${stateFee}`}
                  />
                )}
                {addonItems.map((a) => (
                  <Row
                    key={a.id}
                    icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" width={14} height={14}><path d="M12 5v14M5 12h14" /></svg>}
                    label={a.name}
                    sub="Add-on service"
                    value={`$${a.price}`}
                  />
                ))}
              </div>

              {/* Plan features (Free) */}
              {planFeatures.length > 0 && (
                <>
                  <div className="mx-6 my-1" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }} />
                  <div className="px-6 py-2">
                    {planFeatures.map((f) => (
                      <Row
                        key={f}
                        icon={<svg viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" width={13} height={13}><path d="M20 6L9 17l-5-5" /></svg>}
                        label={f}
                        sub="Included in plan"
                        free
                      />
                    ))}
                  </div>
                </>
              )}

              {/* Promo code */}
              <div className="mt-auto">
                <PromoSection
                  subtotal={total}
                  applied={promo}
                  onApplied={handlePromoApplied}
                  onRemoved={handlePromoRemoved}
                />

                {/* Total */}
                <div className="px-6 py-5 flex items-center justify-between" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
                  <div>
                    <p className="text-xs text-white/40 mb-0.5 uppercase tracking-wide font-semibold">Total Amount</p>
                    {promo && (
                      <p className="text-xs text-white/25 line-through">${total}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-black text-white">${finalTotal}</p>
                    {billing === "annual" && <p className="text-[10px] text-white/25 mt-0.5">Billed annually</p>}
                  </div>
                </div>
              </div>

              {/* Back link */}
              <div className="px-6 py-4" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                <Link
                  href={`/onboarding/add-ons?country=${country}&type=${type}&plan=${plan}&billing=${billing}&state=${state ?? ""}&stateFee=${stateFee}&addons=${addons}`}
                  className="flex items-center gap-2 text-sm text-white/35 hover:text-white/65 transition-colors cursor-pointer w-fit"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={13} height={13}><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                  Back to add-ons
                </Link>
              </div>
            </div>

            {/* ── Payment Form ─────────────────────────────── */}
            <div className="w-full xl:flex-1 rounded-[18px] flex flex-col overflow-hidden" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>

              {/* Header */}
              <div className="px-7 pt-6 pb-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="flex items-center justify-between mb-1">
                  <h2 className="text-sm font-bold text-white">Secure Payment</h2>
                  <div className="flex items-center gap-1.5">
                    {/* Card icons */}
                    {[
                      <><rect width="38" height="24" rx="4" fill="#1A1F71" /><path d="M14.5 16.5l2-9h3l-2 9h-3zm6.2 0l2-9h3l-2 9h-3z" fill="#F9A51A"/></>,
                      <><rect width="38" height="24" rx="4" fill="#252525"/><circle cx="14" cy="12" r="7" fill="#EB001B"/><circle cx="24" cy="12" r="7" fill="#F79E1B"/><path d="M19 6.8a7 7 0 010 10.4A7 7 0 0119 6.8z" fill="#FF5F00"/></>,
                    ].map((path, i) => (
                      <div key={i} className="w-8 h-5 rounded overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
                        <svg viewBox="0 0 38 24" fill="none" width={32} height={20}>{path}</svg>
                      </div>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-white/35">Your card details are encrypted and never stored.</p>
              </div>

              {/* Stripe elements */}
              <div className="flex-1 px-7 py-6">
                {loadError && (
                  <div className="flex items-start gap-2.5 px-4 py-3 rounded-[10px] mb-5" style={{ background: "rgba(255,91,98,0.10)", border: "1px solid rgba(255,91,98,0.25)" }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="#FF5B62" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={14} height={14} className="shrink-0 mt-0.5"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                    <p className="text-xs text-[#FF5B62]">{loadError}</p>
                  </div>
                )}

                {!clientSecret && !loadError && (
                  <div className="flex flex-col items-center justify-center h-40 gap-3">
                    <svg className="animate-spin" viewBox="0 0 24 24" fill="none" stroke="rgba(148,82,232,0.5)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={28} height={28}><path d="M21 12a9 9 0 11-6.219-8.56" /></svg>
                    <p className="text-xs text-white/25">Initializing secure payment…</p>
                  </div>
                )}

                {clientSecret && (
                  <Elements stripe={stripePromise} options={{ clientSecret, appearance: STRIPE_APPEARANCE }}>
                    <PayForm
                      finalTotal={finalTotal}
                      discountAmount={discountAmount}
                      promoCode={promo?.code ?? null}
                      appData={{
                        companyName:   appData.companyName  ?? "",
                        companyName2:  appData.companyName2 ?? null,
                        companyName3:  appData.companyName3 ?? null,
                        description:   appData.description  ?? null,
                        industry:      appData.industry     ?? null,
                        revenue:       appData.revenue      ?? null,
                        website:       appData.website      ?? null,
                        companyType:   type,
                        plan,
                        billingPeriod: billing,
                        state:         state ?? null,
                      }}
                      country={country}
                      addons={addons}
                    />
                  </Elements>
                )}
              </div>

              {/* Trust footer */}
              <div className="px-7 py-4" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="flex items-center gap-2.5 px-3.5 py-3 rounded-[10px]" style={{ background: "rgba(16,185,129,0.07)", border: "1px solid rgba(16,185,129,0.15)" }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={13} height={13} className="shrink-0">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="m9 12 2 2 4-4" />
                  </svg>
                  <p className="text-[11px] text-white/40 leading-relaxed">
                    Formation begins within 1–2 business days after payment.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}

// ── Row sub-component ──────────────────────────────────────────────────────

function Row({
  icon, label, sub, value, free,
}: {
  icon: React.ReactNode;
  label: string;
  sub: string;
  value?: string;
  free?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: free ? "rgba(16,185,129,0.12)" : "rgba(255,255,255,0.06)", color: free ? "#10B981" : "rgba(255,255,255,0.4)" }}>
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-sm text-white/80 leading-tight truncate">{label}</p>
          <p className="text-[11px] text-white/30 mt-0.5">{sub}</p>
        </div>
      </div>
      <div className="shrink-0 ml-4">
        {free ? (
          <span className="text-xs font-bold px-2 py-0.5 rounded-md" style={{ background: "rgba(16,185,129,0.15)", color: "#10B981", border: "1px solid rgba(16,185,129,0.2)" }}>
            Free
          </span>
        ) : (
          <span className="text-sm font-semibold text-white/75">{value}</span>
        )}
      </div>
    </div>
  );
}
