"use client";

import { useState, useTransition, useActionState } from "react";
import { createPromoCode, togglePromoCode, deletePromoCode } from "@/app/actions/promo";

type PromoCode = {
  id: string; code: string; discountType: string; discountValue: number;
  maxUses: number | null; usedCount: number; isActive: boolean;
  expiresAt: Date | null; createdAt: Date;
};

const inputCls = "w-full h-9 rounded-lg bg-[#111] border border-white/15 px-3 text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-white/40";
const selectCls = "w-full h-9 rounded-lg bg-[#111] border border-white/15 px-3 text-white text-sm focus:outline-none focus:border-white/40";

function AddPromoForm({ onDone }: { onDone: () => void }) {
  const [state, action, pending] = useActionState(createPromoCode, null);
  if (state && "ok" in state) onDone();

  return (
    <form action={action} className="space-y-4">
      {state && "error" in state && <p className="text-red-400 text-xs">{state.error}</p>}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="col-span-2 md:col-span-1">
          <label className="block text-xs text-white/45 mb-1 uppercase tracking-wide">Code</label>
          <input name="code" placeholder="e.g. LAUNCH20" required className={inputCls} style={{ textTransform: "uppercase" }} />
          <p className="text-[10px] text-white/25 mt-1">Auto-uppercased</p>
        </div>
        <div>
          <label className="block text-xs text-white/45 mb-1 uppercase tracking-wide">Type</label>
          <select name="discountType" required className={selectCls}>
            <option value="PERCENT">Percentage (%)</option>
            <option value="FIXED">Fixed ($)</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-white/45 mb-1 uppercase tracking-wide">Value</label>
          <input name="discountValue" type="number" min={1} placeholder="e.g. 20" required className={inputCls} />
          <p className="text-[10px] text-white/25 mt-1">% or $ amount</p>
        </div>
        <div>
          <label className="block text-xs text-white/45 mb-1 uppercase tracking-wide">Max Uses</label>
          <input name="maxUses" type="number" min={1} placeholder="Unlimited" className={inputCls} />
          <p className="text-[10px] text-white/25 mt-1">Blank = unlimited</p>
        </div>
      </div>

      <div className="max-w-xs">
        <label className="block text-xs text-white/45 mb-1 uppercase tracking-wide">Expires At</label>
        <input name="expiresAt" type="datetime-local" className={inputCls} />
        <p className="text-[10px] text-white/25 mt-1">Blank = no expiry</p>
      </div>

      <div className="flex gap-2 justify-end pt-1">
        <button type="button" onClick={onDone} className="px-4 py-2 rounded-lg text-sm text-white/50 hover:text-white cursor-pointer" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)" }}>
          Cancel
        </button>
        <button type="submit" disabled={pending} className="px-4 py-2 rounded-lg text-sm font-semibold text-white cursor-pointer disabled:opacity-50" style={{ background: "linear-gradient(90deg,#9452E8,#FF5B62)" }}>
          {pending ? "Creating…" : "Create Code"}
        </button>
      </div>
    </form>
  );
}

function UsageBar({ used, max }: { used: number; max: number | null }) {
  if (!max) return null;
  const pct = Math.min(100, (used / max) * 100);
  return (
    <div className="w-full h-1 rounded-full mt-1.5" style={{ background: "rgba(255,255,255,0.08)" }}>
      <div className="h-1 rounded-full transition-all" style={{ width: `${pct}%`, background: pct >= 90 ? "#F87171" : pct >= 60 ? "#FBBF24" : "#10B981" }} />
    </div>
  );
}

function PromoRow({ code }: { code: PromoCode }) {
  const [togPending, startTog] = useTransition();
  const [delPending, startDel] = useTransition();

  const isExpired = code.expiresAt ? new Date(code.expiresAt) < new Date() : false;
  const isExhausted = code.maxUses !== null && code.usedCount >= code.maxUses;
  const fmt = (d: Date) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        background: code.isActive && !isExpired && !isExhausted ? "rgba(148,82,232,0.06)" : "rgba(255,255,255,0.03)",
        border: code.isActive && !isExpired && !isExhausted ? "1px solid rgba(148,82,232,0.20)" : "1px solid rgba(255,255,255,0.07)",
      }}
    >
      <div className="flex items-center gap-4 px-5 py-4 flex-wrap">
        <div className="flex-1 min-w-[160px]">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <code className="text-base font-black tracking-widest text-white">{code.code}</code>
            {!code.isActive && <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded" style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.3)" }}>Disabled</span>}
            {isExpired && <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded" style={{ background: "rgba(239,68,68,0.12)", color: "#F87171" }}>Expired</span>}
            {isExhausted && <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded" style={{ background: "rgba(251,191,36,0.12)", color: "#FBBF24" }}>Limit reached</span>}
          </div>
          <p className="text-xs text-white/35">
            {code.discountType === "PERCENT" ? `${code.discountValue}% off` : `$${code.discountValue} off`}
            {code.expiresAt && ` · Expires ${fmt(code.expiresAt)}`}
          </p>
        </div>

        <div className="w-32 shrink-0">
          <p className="text-xs text-white/40">
            <span className="font-bold text-white">{code.usedCount}</span>
            {code.maxUses !== null ? ` / ${code.maxUses} uses` : " uses"}
          </p>
          <UsageBar used={code.usedCount} max={code.maxUses} />
        </div>

        <div className="hidden md:block shrink-0 text-xs text-white/30">Created {fmt(code.createdAt)}</div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button" disabled={togPending}
            onClick={() => startTog(async () => { await togglePromoCode(code.id, !code.isActive); })}
            className="px-2.5 py-1.5 rounded-lg text-xs cursor-pointer disabled:opacity-50"
            style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.10)", color: code.isActive ? "#F87171" : "#34D399" }}
          >
            {togPending ? "…" : code.isActive ? "Disable" : "Enable"}
          </button>
          <button
            type="button" disabled={delPending}
            onClick={() => { if (!confirm(`Delete "${code.code}"?`)) return; startDel(async () => { await deletePromoCode(code.id); }); }}
            className="px-2.5 py-1.5 rounded-lg text-xs text-red-400 hover:bg-red-500/10 cursor-pointer disabled:opacity-50"
            style={{ border: "1px solid rgba(239,68,68,0.2)" }}
          >
            {delPending ? "…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className="rounded-xl px-5 py-4" style={{ background: accent ? "rgba(148,82,232,0.08)" : "rgba(255,255,255,0.04)", border: accent ? "1px solid rgba(148,82,232,0.20)" : "1px solid rgba(255,255,255,0.07)" }}>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-xs text-white/40 mt-0.5">{label}</p>
    </div>
  );
}

export default function PromoCodesClient({ codes }: { codes: PromoCode[] }) {
  const [adding, setAdding] = useState(false);

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 md:mb-8 pl-10 md:pl-0">
        <div>
          <h1 className="text-2xl font-bold text-white">Promo Codes</h1>
          <p className="text-sm text-white/45 mt-1">Create discount codes for customers during checkout.</p>
        </div>
        {!adding && (
          <button type="button" onClick={() => setAdding(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white cursor-pointer" style={{ background: "linear-gradient(90deg,#9452E8,#FF5B62)" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" width={14} height={14}><path d="M12 5v14M5 12h14" /></svg>
            New Code
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
        <Stat label="Total Codes" value={codes.length} />
        <Stat label="Active Codes" value={codes.filter((c) => c.isActive).length} accent />
        <Stat label="Total Redemptions" value={codes.reduce((s, c) => s + c.usedCount, 0)} />
      </div>

      {adding && (
        <div className="rounded-xl p-5 mb-6" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.10)" }}>
          <p className="text-sm font-semibold text-white mb-4">New Promo Code</p>
          <AddPromoForm onDone={() => setAdding(false)} />
        </div>
      )}

      {codes.length === 0 && !adding ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" width={22} height={22}><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" /></svg>
          </div>
          <p className="text-sm text-white/25">No promo codes yet.</p>
          <button type="button" onClick={() => setAdding(true)} className="text-sm text-white/40 hover:text-white transition-colors cursor-pointer">Create your first code →</button>
        </div>
      ) : (
        <div className="space-y-3">
          {codes.map((c) => <PromoRow key={c.id} code={c} />)}
        </div>
      )}
    </div>
  );
}
