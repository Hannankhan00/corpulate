"use client";

import { useState, useTransition, useActionState } from "react";
import { addPlan, updatePlan, togglePlan, deletePlan } from "@/app/actions/admin-services";

type Plan = {
  id: string;
  slug: string;
  name: string;
  monthlyPrice: number;
  annualDiscountPct: number;
  description: string | null;
  features: string;
  isHighlight: boolean;
  isActive: boolean;
  sortOrder: number;
};

const inputCls = "w-full h-9 rounded-lg bg-[#111] border border-white/15 px-3 text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-white/40";

function featuresToText(json: string): string {
  try { return (JSON.parse(json) as string[]).join("\n"); } catch { return ""; }
}

function PlanForm({
  plan,
  onDone,
  action,
  pending,
  error,
  isNew,
}: {
  plan?: Plan;
  onDone: () => void;
  action: (payload: FormData) => void;
  pending: boolean;
  error?: string;
  isNew: boolean;
}) {
  return (
    <form action={action} className="space-y-4">
      {plan && <input type="hidden" name="id" value={plan.id} />}
      {error && <p className="text-red-400 text-xs">{error}</p>}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {isNew && (
          <div>
            <label className="block text-xs text-white/45 mb-1 uppercase tracking-wide">Slug</label>
            <input name="slug" placeholder="e.g. starter" required className={inputCls} />
            <p className="text-[10px] text-white/25 mt-1">Lowercase, no spaces</p>
          </div>
        )}
        <div className={isNew ? "" : "col-span-2"}>
          <label className="block text-xs text-white/45 mb-1 uppercase tracking-wide">Plan Name</label>
          <input name="name" defaultValue={plan?.name} placeholder="e.g. Starter" required className={inputCls} />
        </div>
        <div>
          <label className="block text-xs text-white/45 mb-1 uppercase tracking-wide">Monthly Price ($)</label>
          <input name="monthlyPrice" type="number" min={0} defaultValue={plan?.monthlyPrice ?? 49} required className={inputCls} />
        </div>
        <div>
          <label className="block text-xs text-white/45 mb-1 uppercase tracking-wide">Annual Discount (%)</label>
          <input name="annualDiscountPct" type="number" min={0} max={100} defaultValue={plan?.annualDiscountPct ?? 20} className={inputCls} />
        </div>
        <div>
          <label className="block text-xs text-white/45 mb-1 uppercase tracking-wide">Sort Order</label>
          <input name="sortOrder" type="number" defaultValue={plan?.sortOrder ?? 0} className={inputCls} />
        </div>
      </div>

      <div>
        <label className="block text-xs text-white/45 mb-1 uppercase tracking-wide">Description</label>
        <input name="description" defaultValue={plan?.description ?? ""} placeholder="Short tagline shown under the plan name" className={inputCls} />
      </div>

      <div>
        <label className="block text-xs text-white/45 mb-1 uppercase tracking-wide">Features <span className="normal-case text-white/25">(one per line)</span></label>
        <textarea
          name="features"
          rows={6}
          defaultValue={plan ? featuresToText(plan.features) : ""}
          placeholder={"Company registration\nRegistered agent (1 year)\nEIN / Tax ID application"}
          className="w-full rounded-lg bg-[#111] border border-white/15 px-3 py-2 text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-white/40 resize-none"
        />
      </div>

      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" name="isHighlight" value="true" defaultChecked={plan?.isHighlight} className="accent-violet-500 w-4 h-4" />
        <span className="text-sm text-white/60">Mark as &quot;Most Popular&quot;</span>
      </label>

      <div className="flex gap-2 justify-end pt-1">
        <button type="button" onClick={onDone} className="px-4 py-2 rounded-lg text-sm text-white/50 hover:text-white cursor-pointer" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)" }}>
          Cancel
        </button>
        <button type="submit" disabled={pending} className="px-4 py-2 rounded-lg text-sm font-semibold text-white cursor-pointer disabled:opacity-50" style={{ background: "linear-gradient(90deg,#9452E8,#FF5B62)" }}>
          {pending ? "Saving…" : isNew ? "Add Plan" : "Save Changes"}
        </button>
      </div>
    </form>
  );
}

function AddPlanForm({ onDone }: { onDone: () => void }) {
  const [state, action, pending] = useActionState(addPlan, null);
  if (state && "ok" in state) onDone();

  return (
    <PlanForm
      onDone={onDone}
      action={action}
      pending={pending}
      error={state && "error" in state ? state.error : undefined}
      isNew
    />
  );
}

function EditPlanForm({ plan, onDone }: { plan: Plan; onDone: () => void }) {
  const [state, action, pending] = useActionState(updatePlan, null);
  if (state && "ok" in state) onDone();

  return (
    <PlanForm
      plan={plan}
      onDone={onDone}
      action={action}
      pending={pending}
      error={state && "error" in state ? String(state.error) : undefined}
      isNew={false}
    />
  );
}

function PlanCard({ plan }: { plan: Plan }) {
  const [editing, setEditing] = useState(false);
  const [togPending, startTog] = useTransition();
  const [delPending, startDel] = useTransition();

  const features: string[] = (() => { try { return JSON.parse(plan.features); } catch { return []; } })();
  const annualPrice = Math.round(plan.monthlyPrice * (1 - plan.annualDiscountPct / 100));

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        background: plan.isHighlight ? "rgba(148,82,232,0.08)" : "rgba(255,255,255,0.04)",
        border: plan.isHighlight ? "1px solid rgba(148,82,232,0.25)" : "1px solid rgba(255,255,255,0.08)",
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between px-5 pt-5 pb-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-xs font-black text-white/25">{plan.slug}</span>
            <span className="font-bold text-white">{plan.name}</span>
            {plan.isHighlight && (
              <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded" style={{ background: "linear-gradient(90deg,#9452E8,#FF5B62)", color: "white" }}>Most Popular</span>
            )}
            {!plan.isActive && (
              <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded" style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.3)" }}>Hidden</span>
            )}
          </div>
          <div className="flex items-baseline gap-3">
            <span className="text-2xl font-bold text-white">${plan.monthlyPrice}<span className="text-sm font-normal text-white/40">/mo</span></span>
            {plan.annualDiscountPct > 0 && (
              <span className="text-sm text-white/50">${annualPrice}/mo annual <span className="text-[11px] font-bold" style={{ color: "#10B981" }}>(-{plan.annualDiscountPct}%)</span></span>
            )}
          </div>
          {plan.description && <p className="text-xs text-white/40 mt-1">{plan.description}</p>}
        </div>
        <div className="flex items-center gap-1.5 shrink-0 ml-4">
          <button type="button" onClick={() => setEditing(!editing)} className="px-2.5 py-1.5 rounded-lg text-xs text-white/50 hover:text-white cursor-pointer" style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.10)" }}>
            {editing ? "Cancel" : "Edit"}
          </button>
          <button
            type="button" disabled={togPending}
            onClick={() => startTog(async () => { await togglePlan(plan.id, !plan.isActive); })}
            className="px-2.5 py-1.5 rounded-lg text-xs cursor-pointer disabled:opacity-50"
            style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.10)", color: plan.isActive ? "#F87171" : "#34D399" }}
          >
            {togPending ? "…" : plan.isActive ? "Hide" : "Show"}
          </button>
          <button
            type="button" disabled={delPending}
            onClick={() => {
              if (!confirm(`Delete plan "${plan.name}"?`)) return;
              startDel(async () => { await deletePlan(plan.id); });
            }}
            className="px-2.5 py-1.5 rounded-lg text-xs text-red-400 hover:bg-red-500/10 cursor-pointer disabled:opacity-50"
            style={{ border: "1px solid rgba(239,68,68,0.2)" }}
          >
            {delPending ? "…" : "Delete"}
          </button>
        </div>
      </div>

      {/* Features list (collapsed when editing) */}
      {!editing && features.length > 0 && (
        <ul className="px-5 py-3 flex flex-wrap gap-x-6 gap-y-1">
          {features.map((f) => (
            <li key={f} className="flex items-center gap-1.5 text-xs text-white/50">
              <svg viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" width={10} height={10}><path d="M20 6L9 17l-5-5" /></svg>
              {f}
            </li>
          ))}
        </ul>
      )}

      {/* Edit form */}
      {editing && (
        <div className="px-5 py-4">
          <EditPlanForm plan={plan} onDone={() => setEditing(false)} />
        </div>
      )}
    </div>
  );
}

export default function PlansClient({ plans }: { plans: Plan[] }) {
  const [adding, setAdding] = useState(false);

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 md:mb-8 pl-10 md:pl-0">
        <div>
          <h1 className="text-2xl font-bold text-white">Plans</h1>
          <p className="text-sm text-white/45 mt-1">Set pricing, features, and visibility for each onboarding plan.</p>
        </div>
        {!adding && (
          <button type="button" onClick={() => setAdding(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white cursor-pointer" style={{ background: "linear-gradient(90deg,#9452E8,#FF5B62)" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" width={14} height={14}><path d="M12 5v14M5 12h14" /></svg>
            Add Plan
          </button>
        )}
      </div>

      {adding && (
        <div className="rounded-xl p-5 mb-6" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.10)" }}>
          <p className="text-sm font-semibold text-white mb-4">New Plan</p>
          <AddPlanForm onDone={() => setAdding(false)} />
        </div>
      )}

      {plans.length === 0 && !adding ? (
        <p className="text-center text-white/25 text-sm py-16">No plans yet.</p>
      ) : (
        <div className="space-y-4">
          {plans.map((p) => <PlanCard key={p.id} plan={p} />)}
        </div>
      )}
    </div>
  );
}
