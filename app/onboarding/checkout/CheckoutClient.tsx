"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import Sidebar from "@/app/components/Sidebar";
import { createPaymentIntent, finalizeApplication } from "@/app/actions/payment";

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
  planName: string; planPrice: number;
  state: string | null; stateFee: number;
  addonItems: AddonItem[]; addonTotal: number;
  total: number; addons: string;
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

function LineItem({ label, amount, muted, bold }: { label: string; amount: number; muted?: boolean; bold?: boolean }) {
  return (
    <div className={`flex items-center justify-between py-2.5 ${muted ? "" : "border-b border-white/5"}`}>
      <span className={`text-sm ${muted ? "text-white/35" : "text-white/65"}`}>{label}</span>
      <span className={`text-sm ${bold ? "font-bold text-white text-base" : muted ? "text-white/35" : "text-white/80"}`}>
        ${amount}
      </span>
    </div>
  );
}

const STRIPE_ELEMENT_OPTIONS = {
  appearance: {
    theme: "night" as const,
    variables: {
      colorPrimary: "#9452E8",
      colorBackground: "#1a1a1c",
      colorText: "#ffffff",
      colorDanger: "#FF5B62",
      fontFamily: "inherit",
      borderRadius: "10px",
      spacingUnit: "4px",
    },
    rules: {
      ".Input": { border: "1px solid rgba(255,255,255,0.20)", padding: "14px 16px" },
      ".Input:focus": { border: "1px solid rgba(255,255,255,0.50)", boxShadow: "none" },
      ".Label": { color: "rgba(255,255,255,0.50)", fontSize: "11px", fontWeight: "700", letterSpacing: "0.08em", textTransform: "uppercase" },
    },
  },
};

function PayForm({ total, appData, country, addons }: {
  total: number;
  appData: Record<string, string | null | undefined>;
  country: string;
  addons: string;
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

    if (confirmError) {
      setError(confirmError.message ?? "Payment failed. Please try again.");
      setProcessing(false);
      return;
    }

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
        addons: addons || null,
        stripePaymentId: paymentIntent.id,
        amountPaid: total * 100,
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
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-[10px] text-sm font-bold text-white cursor-pointer border border-[#9f4dbc] disabled:opacity-60 transition-opacity"
        style={{ background: "linear-gradient(90deg, #9452E8 12.5%, #C64CD3 29.3%, #E945A8 45.7%, #FF4AB3 61%, #FF5480 76%, #FF5B62 91.3%)" }}
      >
        {processing ? (
          <>
            <svg className="animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={16} height={16}><path d="M21 12a9 9 0 11-6.219-8.56" /></svg>
            Processing payment...
          </>
        ) : (
          <>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={16} height={16}>
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" />
            </svg>
            Pay ${total} now
          </>
        )}
      </button>

      <div className="flex items-center justify-center gap-2 text-[11px] text-white/25">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={12} height={12}><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>
        Secured by Stripe. We never store your card details.
      </div>
    </form>
  );
}

export default function CheckoutClient({
  country, type, plan, billing, planName, planPrice,
  state, stateFee, addonItems, addonTotal, total, addons,
}: Props) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [appData, setAppData] = useState<Record<string, string | null>>({});

  const loadIntent = useCallback(async () => {
    try {
      const { clientSecret: cs } = await createPaymentIntent(total * 100);
      setClientSecret(cs);
    } catch {
      setLoadError("Could not initialize payment. Please check your configuration.");
    }
  }, [total]);

  useEffect(() => {
    const raw = sessionStorage.getItem("corpulate_company_info");
    if (raw) {
      try { setAppData(JSON.parse(raw)); } catch { /* ignore */ }
    }
    loadIntent();
  }, [loadIntent]);

  const billingLabel = billing === "annual" ? "Annual total" : "Monthly";

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: PAGE_BG }}>
      <Sidebar countryCode={country === "uk" ? "GB" : "US"} activeItem="home" />

      <main className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
        <div className="flex items-center gap-4 rounded-[50px] px-5 py-3.5 shrink-0" style={{ background: "#1a1a1c", boxShadow: "5px 5px 4px 2px rgba(0,0,0,0.3)" }}>
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0" style={{ background: "linear-gradient(135deg,#7C3AED,#06B6D4)" }}>Q</div>
          <div className="flex-1">
            <p className="font-semibold text-fg text-sm">Complete your profile</p>
            <p className="text-xs text-fg-muted mt-0.5">Step 7 of 7: Payment</p>
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
          <Stepper current={7} />

          <div className="flex-1 flex gap-5 min-h-0 overflow-y-auto">
            {/* Order Summary */}
            <div className="w-80 shrink-0 rounded-[15px] p-6 flex flex-col" style={{ background: "rgba(20,20,22,0.85)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <h3 className="text-sm font-bold text-white/70 uppercase tracking-wide mb-5">Order Summary</h3>

              <div className="flex-1 space-y-0">
                <LineItem label={`${planName} Plan (${billingLabel})`} amount={planPrice} />
                {stateFee > 0 && state && (
                  <LineItem label={`${state.replace(/-/g, " ")} state fee`} amount={stateFee} />
                )}
                {addonItems.map((a) => (
                  <LineItem key={a.id} label={a.name} amount={a.price} />
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/50">Total due today</span>
                  <span className="text-2xl font-black text-white">${total}</span>
                </div>
                {billing === "annual" && (
                  <p className="text-[11px] text-white/30 mt-1.5 text-right">Billed annually</p>
                )}
              </div>

              <div
                className="mt-5 flex items-start gap-2.5 px-3 py-3 rounded-[10px]"
                style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.18)" }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={14} height={14} className="shrink-0 mt-0.5">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="m9 12 2 2 4-4" />
                </svg>
                <p className="text-[11px] text-white/45 leading-relaxed">
                  After payment, our team will begin processing your formation within 1–2 business days.
                </p>
              </div>
            </div>

            {/* Payment Form */}
            <div className="flex-1 rounded-[15px] p-8 flex flex-col" style={{ background: "rgba(83,83,83,0.25)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <h2 className="text-xl font-bold text-white mb-1">Payment Details</h2>
              <p className="text-sm text-white/50 mb-6">Enter your card information to complete your order.</p>

              <div className="flex-1">
                {loadError && (
                  <div className="flex items-start gap-2.5 px-4 py-3 rounded-[10px] mb-4" style={{ background: "rgba(255,91,98,0.10)", border: "1px solid rgba(255,91,98,0.25)" }}>
                    <p className="text-xs text-[#FF5B62]">{loadError}</p>
                  </div>
                )}

                {!clientSecret && !loadError && (
                  <div className="flex items-center justify-center h-32">
                    <svg className="animate-spin" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={24} height={24}><path d="M21 12a9 9 0 11-6.219-8.56" /></svg>
                  </div>
                )}

                {clientSecret && (
                  <Elements
                    stripe={stripePromise}
                    options={{ clientSecret, ...STRIPE_ELEMENT_OPTIONS }}
                  >
                    <PayForm
                      total={total}
                      appData={{
                        companyName:  appData.companyName  ?? "",
                        companyName2: appData.companyName2 ?? null,
                        companyName3: appData.companyName3 ?? null,
                        description:  appData.description  ?? null,
                        industry:     appData.industry     ?? null,
                        revenue:      appData.revenue      ?? null,
                        website:      appData.website      ?? null,
                        companyType:  type,
                        plan,
                        billingPeriod: billing,
                        state:        state ?? null,
                      }}
                      country={country}
                      addons={addons}
                    />
                  </Elements>
                )}
              </div>

              <div className="mt-auto pt-5 border-t border-white/10">
                <Link
                  href={`/onboarding/add-ons?country=${country}&type=${type}&plan=${plan}&billing=${billing}&state=${state ?? ""}&stateFee=${stateFee}&addons=${addons}`}
                  className="flex items-center gap-2 text-sm text-white/40 hover:text-white transition-colors cursor-pointer"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={14} height={14}><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                  Back to add-ons
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
