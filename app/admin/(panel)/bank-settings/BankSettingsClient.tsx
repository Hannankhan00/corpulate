"use client";

import { useActionState, useState } from "react";
import { saveBankDetails } from "@/app/actions/bankTransfer";

type BankData = {
  bankName: string; accountName: string; accountNumber: string;
  sortCode: string; iban: string; swift: string; reference: string; notes: string;
};

const inputCls = "w-full h-10 rounded-lg px-3 text-white text-sm placeholder:text-white/20 focus:outline-none transition-colors"
  + " bg-[#111] border border-white/12 focus:border-white/35";
const textareaCls = "w-full rounded-lg px-3 py-2.5 text-white text-sm placeholder:text-white/20 focus:outline-none transition-colors resize-none"
  + " bg-[#111] border border-white/12 focus:border-white/35";

function FieldGroup({ label, name, value, placeholder, hint }: {
  label: string; name: string; value: string; placeholder?: string; hint?: string;
}) {
  return (
    <div>
      <label className="block text-[11px] text-white/40 uppercase tracking-widest mb-1.5">{label}</label>
      <input name={name} defaultValue={value} placeholder={placeholder} className={inputCls} />
      {hint && <p className="text-[10px] text-white/25 mt-1">{hint}</p>}
    </div>
  );
}

export default function BankSettingsClient({ initial }: { initial: BankData }) {
  const [state, action, pending] = useActionState(
    async (_prev: unknown, fd: FormData) => saveBankDetails(fd),
    null,
  );
  const [saved, setSaved] = useState(false);

  if (state && "ok" in state && !saved) setSaved(true);

  return (
    <div className="p-6 md:p-8 max-w-2xl">
      <div className="flex items-center gap-3 mb-7 pl-10 md:pl-0">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: "linear-gradient(135deg,rgba(13,100,139,0.3),rgba(6,182,212,0.2))", border: "1px solid rgba(13,100,139,0.35)" }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="#22D3EE" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" width={18} height={18}>
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Bank Transfer Settings</h1>
          <p className="text-xs text-white/35 mt-0.5">These details are shown to customers when they choose bank transfer at checkout.</p>
        </div>
      </div>

      {saved && (
        <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl mb-6" style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)" }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" width={15} height={15}><path d="M20 6L9 17l-5-5" /></svg>
          <p className="text-sm text-[#10B981] font-medium">Bank details saved successfully.</p>
        </div>
      )}

      {state && "error" in state && (
        <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl mb-6" style={{ background: "rgba(255,91,98,0.1)", border: "1px solid rgba(255,91,98,0.2)" }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="#FF5B62" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={15} height={15}><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /></svg>
          <p className="text-sm text-[#FF5B62]">{state.error}</p>
        </div>
      )}

      <form action={action}>
        <div className="rounded-xl p-6 space-y-5 mb-5" style={{ background: "rgba(26,26,28,0.8)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <h2 className="text-xs font-semibold text-white/45 uppercase tracking-widest">Account Information</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FieldGroup label="Bank Name" name="bankName" value={initial.bankName} placeholder="e.g. Barclays" />
            <FieldGroup label="Account Name" name="accountName" value={initial.accountName} placeholder="e.g. Corpulate Ltd" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FieldGroup label="Account Number" name="accountNumber" value={initial.accountNumber} placeholder="e.g. 12345678" />
            <FieldGroup label="Sort Code" name="sortCode" value={initial.sortCode} placeholder="e.g. 20-00-00" hint="UK sort code" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FieldGroup label="IBAN" name="iban" value={initial.iban} placeholder="e.g. GB29 NWBK 6016 1331 9268 19" />
            <FieldGroup label="SWIFT / BIC" name="swift" value={initial.swift} placeholder="e.g. BARCGB22" />
          </div>
        </div>

        <div className="rounded-xl p-6 space-y-5 mb-6" style={{ background: "rgba(26,26,28,0.8)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <h2 className="text-xs font-semibold text-white/45 uppercase tracking-widest">Payment Reference</h2>

          <FieldGroup
            label="Reference / Payment Reference"
            name="reference"
            value={initial.reference}
            placeholder="e.g. CORPULATE or your order number"
            hint="Customers are instructed to use this as their transfer reference."
          />

          <div>
            <label className="block text-[11px] text-white/40 uppercase tracking-widest mb-1.5">Additional Notes (optional)</label>
            <textarea name="notes" defaultValue={initial.notes} rows={3}
              placeholder="Any extra instructions shown to the customer (e.g. allowed currencies, processing times)..."
              className={textareaCls} />
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" disabled={pending}
            className="flex items-center gap-2.5 px-6 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer disabled:opacity-50 transition-all"
            style={{ background: "linear-gradient(90deg,#0D648B,#0EA5C9)", boxShadow: pending ? "none" : "0 4px 16px rgba(13,100,139,0.4)" }}>
            {pending ? (
              <><svg className="animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={14} height={14}><path d="M21 12a9 9 0 11-6.219-8.56" /></svg> Saving...</>
            ) : (
              <><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" width={14} height={14}><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg> Save Settings</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
