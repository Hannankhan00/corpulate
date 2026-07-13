"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";
import { createPaymentIntent, finalizeApplication } from "@/app/actions/payment";
import { validatePromoCode } from "@/app/actions/promo";
import { submitBankTransferProof } from "@/app/actions/bankTransfer";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const PAGE_BG =
  "radial-gradient(ellipse 60% 80% at 0% 50%, rgba(13,100,139,0.45) 0%, rgba(6,6,6,0) 55%), radial-gradient(ellipse 50% 70% at 100% 30%, rgba(65,18,38,0.55) 0%, rgba(6,6,6,0) 55%), #070707";

const CARD_BASE_STYLE = {
  background: "linear-gradient(135deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.01) 100%)",
  backdropFilter: "blur(20px)",
  border: "1px solid rgba(255, 255, 255, 0.07)",
  transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
};

const STRIPE_APPEARANCE = {
  theme: "night" as const,
  variables: {
    colorPrimary: "#8B5CF6",
    colorBackground: "#12152E",
    colorText: "#ffffff",
    colorDanger: "#FF5B62",
    fontFamily: "inherit",
    borderRadius: "12px",
    spacingUnit: "4px",
  },
  rules: {
    ".Input": { border: "1px solid rgba(255,255,255,0.08)", padding: "14px 16px", background: "#1C1F3E" },
    ".Input:focus": { border: "1px solid rgba(139,92,246,0.6)", boxShadow: "0 0 0 3px rgba(139,92,246,0.15)" },
    ".Label": { color: "rgba(255,255,255,0.5)", fontSize: "11px", fontWeight: "700", letterSpacing: "0.08em", textTransform: "uppercase" },
    ".Tab": { border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)" },
    ".Tab--selected": { border: "1px solid rgba(139,92,246,0.5)", background: "rgba(139,92,246,0.12)" },
  },
};

type ServiceTheme = {
  themeColor: string;
  gradient: string;
  glowColor: string;
};

const THEMES: Record<string, ServiceTheme> = {
  "website-development": {
    themeColor: "#8B5CF6",
    gradient: "linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)",
    glowColor: "rgba(139, 92, 246, 0.25)",
  },
  "itin-filing": {
    themeColor: "#06B6D4",
    gradient: "linear-gradient(135deg, #06B6D4 0%, #3B82F6 100%)",
    glowColor: "rgba(6, 182, 212, 0.25)",
  },
  "ein-filing": {
    themeColor: "#10B981",
    gradient: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
    glowColor: "rgba(16, 185, 129, 0.25)",
  },
  "trademark-registration": {
    themeColor: "#EC4899",
    gradient: "linear-gradient(135deg, #EC4899 0%, #F43F5E 100%)",
    glowColor: "rgba(236, 72, 153, 0.25)",
  },
};

const DEFAULT_THEME: ServiceTheme = {
  themeColor: "#9452E8",
  gradient: "linear-gradient(135deg, #9452E8 0%, #FF5B62 100%)",
  glowColor: "rgba(148, 82, 232, 0.25)",
};

const CheckIcon = ({ color }: { color: string }) => (
  <span 
    className="shrink-0 w-4 h-4 rounded-full flex items-center justify-center"
    style={{ background: `${color}15`, border: `1px solid ${color}35` }}
  >
    <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={3} className="w-2 h-2">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  </span>
);

type AppliedPromo = { discountAmount: number; discountLabel: string; code: string };

type Props = {
  user: { firstName: string; email: string };
  plan: {
    slug: string;
    name: string;
    price: number;
    description: string;
    features: string[];
  };
  defaultCountry: string;
  defaultType: string;
  bankDetails: {
    bankName: string;
    accountName: string;
    accountNumber: string;
    sortCode: string;
    iban: string;
    swift: string;
    reference: string;
    notes: string | null;
  } | null;
};

// ── Copy Field Component ──────────────────────────────────────────
function CopyField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-white/[0.02] border border-white/[0.05] mb-2">
      <div>
        <p className="text-[10px] text-white/40 uppercase tracking-wider">{label}</p>
        <p className="text-sm font-semibold text-white/90 mt-0.5 select-all">{value}</p>
      </div>
      <button
        type="button"
        onClick={copy}
        className="text-[11px] font-bold text-brand-cyan hover:text-white transition-colors cursor-pointer px-2.5 py-1 rounded"
        style={{ background: "rgba(6,182,212,0.12)", border: "1px solid rgba(6,182,212,0.2)" }}
      >
        {copied ? "Copied!" : "Copy"}
      </button>
    </div>
  );
}

// ── Stripe Checkout Form ──────────────────────────────────────────
function StripePayForm({
  finalTotal,
  planSlug,
  country,
  companyType,
  promo,
  onBack,
}: {
  finalTotal: number;
  planSlug: string;
  country: string;
  companyType: string;
  promo: AppliedPromo | null;
  onBack: () => void;
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

    const { error: submitErr } = await elements.submit();
    if (submitErr) {
      setError(submitErr.message ?? "Something went wrong.");
      setProcessing(false);
      return;
    }

    const { error: confirmErr, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
    });

    if (confirmErr) {
      setError(confirmErr.message ?? "Payment failed.");
      setProcessing(false);
      return;
    }

    if (paymentIntent?.status === "succeeded") {
      await finalizeApplication({
        companyName: "Standalone Service Purchase",
        country,
        companyType,
        plan: planSlug,
        billingPeriod: "one-off",
        stripePaymentId: paymentIntent.id,
        amountPaid: finalTotal * 100,
        promoCode: promo?.code ?? null,
        discountAmount: promo ? promo.discountAmount * 100 : null,
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
          <svg viewBox="0 0 24 24" fill="none" stroke="#FF5B62" strokeWidth={2} className="w-4 h-4 shrink-0 mt-0.5">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <p className="text-xs text-[#FF5B62]">{error}</p>
        </div>
      )}
      <button
        type="submit"
        disabled={processing || !stripe}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm text-white cursor-pointer disabled:opacity-60 transition-all hover:brightness-110 active:scale-[0.98]"
        style={{
          background: "linear-gradient(90deg, #8B5CF6 0%, #C64CD3 28%, #EC4899 55%, #FF5480 78%, #FF5B62 100%)",
          boxShadow: processing ? "none" : "0 4px 20px rgba(139,92,246,0.3)"
        }}
      >
        {processing ? (
          <>
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path d="M21 12a9 9 0 11-6.219-8.56" />
            </svg>
            Processing...
          </>
        ) : (
          <>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
              <line x1="1" y1="10" x2="23" y2="10" />
            </svg>
            Pay ${finalTotal.toLocaleString()} Now
          </>
        )}
      </button>
      <button
        type="button"
        onClick={onBack}
        className="w-full text-center text-xs text-white/30 hover:text-white/60 transition-colors py-1 cursor-pointer"
      >
        Cancel and return to catalog
      </button>
    </form>
  );
}

// ── Main Checkout Client ──────────────────────────────────────────
export default function CheckoutClient({
  user,
  plan,
  defaultCountry,
  defaultType,
  bankDetails,
}: Props) {
  const router = useRouter();
  const [method, setMethod] = useState<"card" | "bank">("card");
  const [promo, setPromo] = useState<AppliedPromo | null>(null);

  // Bank Transfer states
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [bankError, setBankError] = useState<string | null>(null);
  const [bankSubmitting, setBankSubmitting] = useState(false);

  // Stripe Setup states
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [stripeError, setStripeError] = useState<string | null>(null);

  const theme = THEMES[plan.slug] || DEFAULT_THEME;
  const subtotal = plan.price;
  const discountAmount = promo?.discountAmount ?? 0;
  const finalTotal = Math.max(0, subtotal - discountAmount);

  // Load Payment Intent
  useEffect(() => {
    setClientSecret(null);
    setStripeError(null);
    createPaymentIntent(finalTotal * 100)
      .then((res) => setClientSecret(res.clientSecret))
      .catch((err) => setStripeError(err?.message ?? "Failed to initialize payment gateway."));
  }, [finalTotal]);

  // Promo Code handlers
  const [promoOpen, setPromoOpen] = useState(false);
  const [promoInput, setPromoInput] = useState("");
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoPending, startPromoTransition] = useTransition();

  function applyPromo() {
    if (!promoInput.trim()) return;
    setPromoError(null);
    startPromoTransition(async () => {
      const res = await validatePromoCode(promoInput.trim(), subtotal * 100);
      if (res.valid) {
        setPromo({
          discountAmount: res.discountAmount,
          discountLabel: res.discountLabel,
          code: res.code,
        });
        setPromoInput("");
        setPromoOpen(false);
      } else {
        setPromoError(res.error);
      }
    });
  }

  // File handling for Bank uploader
  function handleFile(f: File) {
    setBankError(null);
    if (!f.type.startsWith("image/") && f.type !== "application/pdf") {
      setBankError("Please upload an image (JPG, PNG) or PDF file.");
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      setBankError("File must be under 10 MB.");
      return;
    }
    setFile(f);
    if (f.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(f);
    } else {
      setPreview(null);
    }
  }

  // Bank Submit handler
  async function handleBankSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      setBankError("Please upload a screenshot of your bank transfer proof.");
      return;
    }
    setBankSubmitting(true);
    setBankError(null);

    const fd = new FormData();
    fd.append("screenshot", file);
    fd.append("companyName", "Standalone Service Purchase");
    fd.append("companyType", "service");
    fd.append("plan", plan.slug);
    fd.append("billingPeriod", "one-off");
    fd.append("country", defaultCountry);
    fd.append("amountPaid", String(finalTotal * 100));
    if (promo) {
      fd.append("promoCode", promo.code);
      fd.append("discountAmount", String(promo.discountAmount * 100));
    }

    try {
      const res = await submitBankTransferProof(fd);
      if (res?.error) {
        setBankError(res.error);
        setBankSubmitting(false);
      }
    } catch {
      setBankError("Submission failed. Please check connection and try again.");
      setBankSubmitting(false);
    }
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: PAGE_BG }}>
      <Sidebar activeItem="services" />

      <main className="flex-1 overflow-y-auto p-4 md:p-6 scrollbar-thin">
        <Header
          firstName={user.firstName}
          title="Service Checkout"
          subtitle={`Secure checkout for ${plan.name} standalone package.`}
        />

        <div className="w-full mt-6 pb-16 flex flex-col lg:flex-row gap-6 max-w-6xl mx-auto">
          {/* Left Side: Payment Form */}
          <div className="flex-1 space-y-6">
            {/* Method Selectors */}
            <div className="rounded-[20px] p-2 flex gap-2" style={{ background: "rgba(255, 255, 255, 0.02)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
              <button
                type="button"
                onClick={() => setMethod("card")}
                className="flex-1 py-3 text-sm font-semibold rounded-xl cursor-pointer transition-all duration-200 flex items-center justify-center gap-2"
                style={{
                  background: method === "card" ? "rgba(255, 255, 255, 0.05)" : "transparent",
                  color: method === "card" ? "#ffffff" : "rgba(255, 255, 255, 0.5)",
                  border: method === "card" ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid transparent"
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                  <rect x="2" y="5" width="20" height="14" rx="2" />
                  <line x1="2" y1="10" x2="22" y2="10" />
                </svg>
                Credit / Debit Card
              </button>
              {bankDetails && (
                <button
                  type="button"
                  onClick={() => setMethod("bank")}
                  className="flex-1 py-3 text-sm font-semibold rounded-xl cursor-pointer transition-all duration-200 flex items-center justify-center gap-2"
                  style={{
                    background: method === "bank" ? "rgba(255, 255, 255, 0.05)" : "transparent",
                    color: method === "bank" ? "#ffffff" : "rgba(255, 255, 255, 0.5)",
                    border: method === "bank" ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid transparent"
                  }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                    <line x1="12" y1="1" x2="12" y2="23" />
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                  Bank Transfer
                </button>
              )}
            </div>

            {/* Content box */}
            <div className="rounded-[24px] p-6 md:p-8" style={CARD_BASE_STYLE}>
              {method === "card" ? (
                <div className="space-y-6">
                  <div className="border-b border-white/5 pb-4 mb-4">
                    <h2 className="text-lg font-bold text-white">Card Payment Details</h2>
                    <p className="text-xs text-white/40 mt-1">Processed securely via Stripe. Your credentials are never stored.</p>
                  </div>
                  {stripeError && (
                    <div className="p-4 rounded-xl text-xs text-[#FF5B62]" style={{ background: "rgba(255,91,98,0.08)", border: "1px solid rgba(255,91,98,0.2)" }}>
                      {stripeError}
                    </div>
                  )}
                  {clientSecret ? (
                    <Elements stripe={stripePromise} options={{ clientSecret, appearance: STRIPE_APPEARANCE }}>
                      <StripePayForm
                        finalTotal={finalTotal}
                        planSlug={plan.slug}
                        country={defaultCountry}
                        companyType={defaultType}
                        promo={promo}
                        onBack={() => router.push("/dashboard/services")}
                      />
                    </Elements>
                  ) : (
                    !stripeError && (
                      <div className="flex flex-col items-center justify-center py-12 gap-3">
                        <svg className="animate-spin w-8 h-8 text-brand-purple" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                          <path d="M21 12a9 9 0 11-6.219-8.56" />
                        </svg>
                        <p className="text-xs text-white/40">Initializing checkout portal...</p>
                      </div>
                    )
                  )}
                </div>
              ) : (
                bankDetails && (
                  <form onSubmit={handleBankSubmit} className="space-y-6">
                    <div className="border-b border-white/5 pb-4 mb-4">
                      <h2 className="text-lg font-bold text-white">Bank Transfer Submission</h2>
                      <p className="text-xs text-white/40 mt-1">Transfer the exact total to the details below and upload the receipt.</p>
                    </div>

                    <div className="space-y-2">
                      {bankDetails.bankName && <CopyField label="Bank Name" value={bankDetails.bankName} />}
                      {bankDetails.accountName && <CopyField label="Account Name" value={bankDetails.accountName} />}
                      {bankDetails.accountNumber && <CopyField label="Account Number" value={bankDetails.accountNumber} />}
                      {bankDetails.sortCode && <CopyField label="Sort Code" value={bankDetails.sortCode} />}
                      {bankDetails.iban && <CopyField label="IBAN" value={bankDetails.iban} />}
                      {bankDetails.swift && <CopyField label="SWIFT / BIC Code" value={bankDetails.swift} />}
                      {bankDetails.reference && <CopyField label="Payment Reference" value={bankDetails.reference} />}
                    </div>

                    {bankDetails.notes && (
                      <div className="p-4 rounded-xl text-xs leading-relaxed text-amber-400/80" style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.2)" }}>
                        <p className="font-bold uppercase tracking-wider mb-1 text-[10px]">Processing Note</p>
                        {bankDetails.notes}
                      </div>
                    )}

                    <div className="space-y-2">
                      <label className="text-[10px] text-white/40 uppercase font-black tracking-widest block">Upload receipt / proof</label>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*,.pdf"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) handleFile(f);
                        }}
                      />
                      {!file ? (
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                          onDragLeave={() => setDragging(false)}
                          onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
                          className="cursor-pointer flex flex-col items-center justify-center gap-3 py-8 rounded-[14px] transition-all select-none border-2 border-dashed border-white/10 hover:border-brand-cyan/50 hover:bg-white/[0.01]"
                          style={{ background: dragging ? "rgba(6,182,212,0.06)" : "transparent" }}
                        >
                          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white/[0.03] border border-white/5">
                            <svg viewBox="0 0 24 24" fill="none" stroke="#06B6D4" strokeWidth={2} className="w-5 h-5">
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                              <polyline points="17 8 12 3 7 8" />
                              <line x1="12" y1="3" x2="12" y2="15" />
                            </svg>
                          </div>
                          <div className="text-center">
                            <p className="text-xs font-semibold text-white/70">Click or drop transfer proof here</p>
                            <p className="text-[10px] text-white/30 mt-0.5">PNG, JPG, PDF up to 10 MB</p>
                          </div>
                        </div>
                      ) : (
                        <div className="rounded-xl overflow-hidden border border-white/10" style={{ background: "rgba(255,255,255,0.02)" }}>
                          {preview && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={preview} alt="Proof preview" className="w-full max-h-40 object-cover" />
                          )}
                          {!preview && (
                            <div className="flex items-center gap-3 p-4">
                              <svg viewBox="0 0 24 24" fill="none" stroke="#06B6D4" strokeWidth={2} className="w-8 h-8 shrink-0">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                <polyline points="14 2 14 8 20 8" />
                              </svg>
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-semibold text-white/80 truncate">{file.name}</p>
                                <p className="text-[10px] text-white/30 mt-0.5">{(file.size / 1024).toFixed(1)} KB</p>
                              </div>
                            </div>
                          )}
                          <div className="flex items-center justify-between px-4 py-3 bg-white/[0.02] border-t border-white/5">
                            <div className="min-w-0">
                              {preview && <p className="text-[10px] text-white/40 truncate">{file.name}</p>}
                              <p className="text-[10px] text-[#10B981] font-bold">Ready to upload</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setFile(null);
                                setPreview(null);
                                if (fileInputRef.current) fileInputRef.current.value = "";
                              }}
                              className="text-[11px] font-bold text-white/40 hover:text-white/80 transition-colors cursor-pointer px-2.5 py-1 rounded bg-white/[0.04] border border-white/10"
                            >
                              Change
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {bankError && (
                      <div className="flex items-start gap-2.5 px-4 py-3 rounded-[10px]" style={{ background: "rgba(255,91,98,0.10)", border: "1px solid rgba(255,91,98,0.25)" }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="#FF5B62" strokeWidth={2} className="w-4 h-4 shrink-0 mt-0.5">
                          <circle cx="12" cy="12" r="10" />
                          <line x1="12" y1="8" x2="12" y2="12" />
                          <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                        <p className="text-xs text-[#FF5B62]">{bankError}</p>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={bankSubmitting}
                      className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm text-white cursor-pointer disabled:opacity-60 transition-all hover:brightness-110 active:scale-[0.98]"
                      style={{
                        background: "linear-gradient(90deg, #8B5CF6 0%, #C64CD3 28%, #EC4899 55%, #FF5480 78%, #FF5B62 100%)",
                        boxShadow: bankSubmitting ? "none" : "0 4px 20px rgba(139,92,246,0.3)"
                      }}
                    >
                      {bankSubmitting ? (
                        <>
                          <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                            <path d="M21 12a9 9 0 11-6.219-8.56" />
                          </svg>
                          Submitting Proof...
                        </>
                      ) : (
                        "Submit Bank Receipt"
                      )}
                    </button>
                  </form>
                )
              )}
            </div>
          </div>

          {/* Right Side: Order Summary */}
          <div className="w-full lg:w-96 space-y-6">
            <div className="rounded-[24px] p-6 relative overflow-hidden" style={CARD_BASE_STYLE}>
              {/* Radial glow background */}
              <div 
                className="absolute -top-16 -right-16 w-44 h-44 rounded-full pointer-events-none"
                style={{
                  background: `radial-gradient(circle, ${theme.themeColor} 0%, transparent 70%)`,
                  opacity: 0.15,
                  filter: "blur(30px)"
                }}
              />

              <h2 className="text-lg font-bold text-white border-b border-white/5 pb-4 mb-4">Order Summary</h2>

              {/* Service details */}
              <div className="mb-6">
                <span 
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black tracking-wider uppercase mb-3"
                  style={{ background: `${theme.themeColor}15`, color: theme.themeColor, border: `1px solid ${theme.themeColor}30` }}
                >
                  Standalone package
                </span>
                <h3 className="text-xl font-bold text-white tracking-tight">{plan.name}</h3>
                <p className="text-xs text-white/50 mt-1.5 leading-relaxed">{plan.description}</p>
              </div>

              {/* Bullet points */}
              <ul className="space-y-2.5 border-t border-b border-white/5 py-4 mb-6">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2.5 text-xs text-white/70">
                    <CheckIcon color={theme.themeColor} />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              {/* Price Details */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-xs text-white/50">
                  <span>Subtotal</span>
                  <span className="font-semibold text-white">${subtotal.toLocaleString()}</span>
                </div>
                {promo && (
                  <div className="flex justify-between text-xs text-[#10B981]">
                    <span>Discount ({promo.code})</span>
                    <span className="font-bold">-${promo.discountAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between items-baseline pt-3 border-t border-white/5">
                  <span className="text-sm font-bold text-white">Total due</span>
                  <span className="text-2xl font-black text-white">${finalTotal.toLocaleString()}</span>
                </div>
              </div>

              {/* Promo validation */}
              <div className="border-t border-white/5 pt-4">
                {promo ? (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-[#10B981]/5 border border-[#10B981]/20">
                    <div>
                      <p className="text-[10px] text-[#10B981] font-bold uppercase tracking-wider">Promo Applied</p>
                      <p className="text-xs font-semibold text-white mt-0.5">{promo.code} (-${promo.discountAmount})</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPromo(null)}
                      className="text-xs text-white/40 hover:text-white/70 transition-colors cursor-pointer px-2 py-1 rounded bg-white/[0.04] border border-white/10"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div>
                    {!promoOpen ? (
                      <button
                        type="button"
                        onClick={() => setPromoOpen(true)}
                        className="text-xs font-bold text-white/50 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
                          <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                          <line x1="7" y1="7" x2="7.01" y2="7" />
                        </svg>
                        Have a promotion code?
                      </button>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={promoInput}
                            onChange={(e) => { setPromoInput(e.target.value.toUpperCase()); setPromoError(null); }}
                            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), applyPromo())}
                            placeholder="PROMOCODE"
                            className="flex-1 h-9 rounded-lg px-3 text-xs text-white placeholder:text-white/20 focus:outline-none transition-colors border border-white/10 bg-white/[0.02]"
                          />
                          <button
                            type="button"
                            onClick={applyPromo}
                            disabled={promoPending || !promoInput.trim()}
                            className="px-4 h-9 rounded-lg text-xs font-bold text-white cursor-pointer disabled:opacity-40 transition-all shrink-0 bg-gradient-to-r from-brand-purple to-brand-cyan"
                          >
                            Apply
                          </button>
                        </div>
                        {promoError && <p className="text-[10px] text-[#FF5B62] pl-1">{promoError}</p>}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
