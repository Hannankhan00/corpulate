"use client";

import { useState, useTransition, useActionState, useEffect } from "react";
import ReactCountryFlag from "react-country-flag";
import {
  addServiceCountryState,
  updateServiceCountryState,
  deleteServiceCountryState,
  toggleServiceCountryState,
  addServiceCountryDoc,
  deleteServiceCountryDoc,
  setServiceCountryField,
  addServiceCompanyType,
  updateServiceCompanyType,
  toggleServiceCompanyType,
  deleteServiceCompanyType,
} from "@/app/actions/admin-services";
import type { OnboardingField } from "@/app/generated/prisma/client";

// ── Types ─────────────────────────────────────────────────────

type State = {
  id: string;
  name: string;
  abbr: string | null;
  isFeatured: boolean;
  badge: string | null;
  description: string | null;
  pros: string | null;
  fee: number | null;
  isActive: boolean;
};

type Doc = {
  id: string;
  name: string;
  description: string | null;
  isRequired: boolean;
};

type FieldConfig = {
  id: string;
  fieldKey: OnboardingField;
  isRequired: boolean;
};

type CompanyType = {
  id: string;
  slug: string;
  name: string;
  fullName: string;
  description: string | null;
  isPopular: boolean;
  isActive: boolean;
  sortOrder: number;
};

type Country = {
  id: string;
  name: string;
  isoCode: string;
  isActive: boolean;
  states: State[];
  documents: Doc[];
  fields: FieldConfig[];
  companyTypes: CompanyType[];
};

// ── Field metadata ────────────────────────────────────────────

const ALL_FIELDS: { key: OnboardingField; label: string; desc: string }[] = [
  { key: "DATE_OF_BIRTH",   label: "Date of Birth",    desc: "User's date of birth" },
  { key: "FATHER_NAME",     label: "Father's Name",    desc: "Father's full name" },
  { key: "MOTHER_NAME",     label: "Mother's Name",    desc: "Mother's full name" },
  { key: "ADDRESS",         label: "Address",          desc: "Residential address" },
  { key: "PASSPORT_NUMBER", label: "Passport Number",  desc: "Valid passport number" },
  { key: "NATIONAL_ID",     label: "National ID",      desc: "Government-issued national ID" },
  { key: "SSN",             label: "SSN",              desc: "Social Security Number" },
  { key: "TAX_ID",          label: "Tax ID",           desc: "Tax identification number" },
];

// ── Tab navigation ────────────────────────────────────────────

type Tab = "states" | "documents" | "fields" | "companyTypes";

// ── States tab ────────────────────────────────────────────────

function AddStateForm({ countryId, onDone }: { countryId: string; onDone: () => void }) {
  const [state, action, pending] = useActionState(addServiceCountryState, null);

  useEffect(() => {
    if (state && "ok" in state) {
      onDone();
    }
  }, [state, onDone]);

  return (
    <form action={action} className="space-y-3 mt-4">
      <input type="hidden" name="countryId" value={countryId} />
      {state && "error" in state && <p className="text-red-400 text-xs">{state.error}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="col-span-2">
          <label className="block text-xs text-white/45 mb-1 uppercase tracking-wide">State / Region Name</label>
          <input name="name" placeholder="e.g. Wyoming" required className="w-full h-9 rounded-lg bg-[#111] border border-white/15 px-3 text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-white/40" />
        </div>
        <div>
          <label className="block text-xs text-white/45 mb-1 uppercase tracking-wide">Abbreviation</label>
          <input name="abbr" placeholder="WY" maxLength={4} className="w-full h-9 rounded-lg bg-[#111] border border-white/15 px-3 text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-white/40" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs text-white/45 mb-1 uppercase tracking-wide">Badge (optional)</label>
          <input name="badge" placeholder="Most Popular" className="w-full h-9 rounded-lg bg-[#111] border border-white/15 px-3 text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-white/40" />
        </div>
        <div>
          <label className="block text-xs text-white/45 mb-1 uppercase tracking-wide">Extra Fee ($)</label>
          <input name="fee" type="number" min={0} placeholder="Leave blank for free" className="w-full h-9 rounded-lg bg-[#111] border border-white/15 px-3 text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-white/40" />
        </div>
        <div className="flex items-end pb-1.5">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" name="isFeatured" value="true" className="accent-violet-500 w-4 h-4" />
            <span className="text-sm text-white/60">Featured</span>
          </label>
        </div>
      </div>
      <div>
        <label className="block text-xs text-white/45 mb-1 uppercase tracking-wide">Description</label>
        <textarea name="description" rows={2} placeholder="Brief description shown to users…" className="w-full rounded-lg bg-[#111] border border-white/15 px-3 py-2 text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-white/40 resize-none" />
      </div>
      <div>
        <label className="block text-xs text-white/45 mb-1 uppercase tracking-wide">Pros (one per line)</label>
        <textarea name="pros" rows={3} placeholder={"No state income tax\nStrong privacy laws\nLow annual fees"} className="w-full rounded-lg bg-[#111] border border-white/15 px-3 py-2 text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-white/40 resize-none" />
      </div>
      <div className="flex gap-2 justify-end pt-1">
        <button type="button" onClick={onDone} className="px-3 py-1.5 rounded-lg text-sm text-white/50 hover:text-white cursor-pointer" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)" }}>Cancel</button>
        <button type="submit" disabled={pending} className="px-3 py-1.5 rounded-lg text-sm font-semibold text-white cursor-pointer disabled:opacity-50" style={{ background: "linear-gradient(90deg,#9452E8,#FF5B62)" }}>
          {pending ? "Saving…" : "Add State"}
        </button>
      </div>
    </form>
  );
}

function EditStateForm({ state: s, countryId, onDone }: { state: State; countryId: string; onDone: () => void }) {
  const [result, action, pending] = useActionState(updateServiceCountryState, null);
  const prosValue = s.pros ? (JSON.parse(s.pros) as string[]).join("\n") : "";

  useEffect(() => {
    if (result && "ok" in result) {
      onDone();
    }
  }, [result, onDone]);

  return (
    <form action={action} className="space-y-3 mt-3">
      <input type="hidden" name="id" value={s.id} />
      <input type="hidden" name="countryId" value={countryId} />
      {result && "error" in result && <p className="text-red-400 text-xs">{String(result.error)}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="col-span-2">
          <label className="block text-xs text-white/45 mb-1 uppercase tracking-wide">Name</label>
          <input name="name" defaultValue={s.name} required className="w-full h-9 rounded-lg bg-[#111] border border-white/15 px-3 text-white text-sm focus:outline-none focus:border-white/40" />
        </div>
        <div>
          <label className="block text-xs text-white/45 mb-1 uppercase tracking-wide">Abbr</label>
          <input name="abbr" defaultValue={s.abbr ?? ""} maxLength={4} className="w-full h-9 rounded-lg bg-[#111] border border-white/15 px-3 text-white text-sm focus:outline-none focus:border-white/40" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs text-white/45 mb-1 uppercase tracking-wide">Badge</label>
          <input name="badge" defaultValue={s.badge ?? ""} className="w-full h-9 rounded-lg bg-[#111] border border-white/15 px-3 text-white text-sm focus:outline-none focus:border-white/40" />
        </div>
        <div>
          <label className="block text-xs text-white/45 mb-1 uppercase tracking-wide">Extra Fee ($)</label>
          <input name="fee" type="number" min={0} defaultValue={s.fee ?? ""} placeholder="None" className="w-full h-9 rounded-lg bg-[#111] border border-white/15 px-3 text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-white/40" />
        </div>
        <div className="flex items-end pb-1">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" name="isFeatured" value="true" defaultChecked={s.isFeatured} className="accent-violet-500 w-4 h-4" />
            <span className="text-sm text-white/60">Featured</span>
          </label>
        </div>
      </div>
      <div>
        <label className="block text-xs text-white/45 mb-1 uppercase tracking-wide">Description</label>
        <textarea name="description" rows={2} defaultValue={s.description ?? ""} className="w-full rounded-lg bg-[#111] border border-white/15 px-3 py-2 text-white text-sm focus:outline-none focus:border-white/40 resize-none" />
      </div>
      <div>
        <label className="block text-xs text-white/45 mb-1 uppercase tracking-wide">Pros (one per line)</label>
        <textarea name="pros" rows={3} defaultValue={prosValue} className="w-full rounded-lg bg-[#111] border border-white/15 px-3 py-2 text-white text-sm focus:outline-none focus:border-white/40 resize-none" />
      </div>
      <div className="flex gap-2 justify-end pt-1">
        <button type="button" onClick={onDone} className="px-3 py-1.5 rounded-lg text-sm text-white/50 hover:text-white cursor-pointer" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)" }}>Cancel</button>
        <button type="submit" disabled={pending} className="px-3 py-1.5 rounded-lg text-sm font-semibold text-white cursor-pointer disabled:opacity-50" style={{ background: "linear-gradient(90deg,#9452E8,#FF5B62)" }}>
          {pending ? "Saving…" : "Save"}
        </button>
      </div>
    </form>
  );
}

function StateRow({ s, countryId }: { s: State; countryId: string }) {
  const [editing, setEditing] = useState(false);
  const [delPending, startDel] = useTransition();
  const [togPending, startTog] = useTransition();
  const pros: string[] = s.pros ? JSON.parse(s.pros) : [];

  return (
    <div className="p-4 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
      {editing ? (
        <EditStateForm state={s} countryId={countryId} onDone={() => setEditing(false)} />
      ) : (
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              {s.abbr && <span className="text-xs font-black text-white/25">{s.abbr}</span>}
              <span className="font-semibold text-white text-sm">{s.name}</span>
              {s.isFeatured && s.badge && (
                <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded" style={{ background: "linear-gradient(90deg,#9452E8,#FF5B62)", color: "white" }}>{s.badge}</span>
              )}
              {s.fee != null && s.fee > 0 && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: "rgba(251,191,36,0.12)", color: "#FCD34D" }}>+${s.fee} fee</span>
              )}
              {!s.isActive && (
                <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded" style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.3)" }}>Inactive</span>
              )}
            </div>
            {s.description && <p className="text-xs text-white/40 mt-1 leading-relaxed">{s.description}</p>}
            {pros.length > 0 && (
              <ul className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
                {pros.map((p) => (
                  <li key={p} className="flex items-center gap-1 text-[11px] text-white/40">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" width={9} height={9}><path d="M20 6L9 17l-5-5" /></svg>
                    {p}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button type="button" onClick={() => setEditing(true)} className="px-2.5 py-1.5 rounded-lg text-xs text-white/50 hover:text-white cursor-pointer" style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.10)" }}>Edit</button>
            <button
              type="button"
              disabled={togPending}
              onClick={() => startTog(async () => { await toggleServiceCountryState(s.id, countryId, !s.isActive); })}
              className="px-2.5 py-1.5 rounded-lg text-xs cursor-pointer disabled:opacity-50"
              style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.10)", color: s.isActive ? "#F87171" : "#34D399" }}
            >
              {togPending ? "…" : s.isActive ? "Hide" : "Show"}
            </button>
            <button
              type="button"
              disabled={delPending}
              onClick={() => {
                if (!confirm(`Delete ${s.name}?`)) return;
                startDel(async () => { await deleteServiceCountryState(s.id, countryId); });
              }}
              className="px-2.5 py-1.5 rounded-lg text-xs text-red-400 hover:bg-red-500/10 cursor-pointer disabled:opacity-50"
              style={{ border: "1px solid rgba(239,68,68,0.2)" }}
            >
              {delPending ? "…" : "Delete"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function StatesTab({ country }: { country: Country }) {
  const [adding, setAdding] = useState(false);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-white/50">States / regions users can register in for {country.name}.</p>
        {!adding && (
          <button type="button" onClick={() => setAdding(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white cursor-pointer" style={{ background: "linear-gradient(90deg,#9452E8,#FF5B62)" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" width={11} height={11}><path d="M12 5v14M5 12h14" /></svg>
            Add State
          </button>
        )}
      </div>

      {adding && (
        <div className="p-4 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.10)" }}>
          <p className="text-sm font-semibold text-white">New State / Region</p>
          <AddStateForm countryId={country.id} onDone={() => setAdding(false)} />
        </div>
      )}

      {country.states.length === 0 && !adding && (
        <p className="text-center text-white/25 text-sm py-10">No states added yet.</p>
      )}

      {country.states.map((s) => (
        <StateRow key={s.id} s={s} countryId={country.id} />
      ))}
    </div>
  );
}

// ── Documents tab ─────────────────────────────────────────────

function AddDocForm({ countryId, onDone }: { countryId: string; onDone: () => void }) {
  const [state, action, pending] = useActionState(addServiceCountryDoc, null);

  useEffect(() => {
    if (state && "ok" in state) {
      onDone();
    }
  }, [state, onDone]);

  return (
    <form action={action} className="space-y-3 mt-4">
      <input type="hidden" name="countryId" value={countryId} />
      {state && "error" in state && <p className="text-red-400 text-xs">{state.error}</p>}
      <div>
        <label className="block text-xs text-white/45 mb-1 uppercase tracking-wide">Document Name</label>
        <input name="name" placeholder="e.g. Valid Passport" required className="w-full h-9 rounded-lg bg-[#111] border border-white/15 px-3 text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-white/40" />
      </div>
      <div>
        <label className="block text-xs text-white/45 mb-1 uppercase tracking-wide">Description</label>
        <input name="description" placeholder="e.g. Government-issued passport, valid for at least 6 months" className="w-full h-9 rounded-lg bg-[#111] border border-white/15 px-3 text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-white/40" />
      </div>
      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" name="isRequired" value="true" defaultChecked className="accent-violet-500 w-4 h-4" />
        <span className="text-sm text-white/60">Required</span>
      </label>
      <div className="flex gap-2 justify-end pt-1">
        <button type="button" onClick={onDone} className="px-3 py-1.5 rounded-lg text-sm text-white/50 hover:text-white cursor-pointer" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)" }}>Cancel</button>
        <button type="submit" disabled={pending} className="px-3 py-1.5 rounded-lg text-sm font-semibold text-white cursor-pointer disabled:opacity-50" style={{ background: "linear-gradient(90deg,#9452E8,#FF5B62)" }}>
          {pending ? "Saving…" : "Add Document"}
        </button>
      </div>
    </form>
  );
}

function DocRow({ doc, countryId }: { doc: Doc; countryId: string }) {
  const [pending, start] = useTransition();
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(148,82,232,0.15)" }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="#C084FC" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" width={15} height={15}>
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-white">{doc.name}</span>
          {doc.isRequired && (
            <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded" style={{ background: "rgba(239,68,68,0.12)", color: "#F87171" }}>Required</span>
          )}
        </div>
        {doc.description && <p className="text-xs text-white/40 mt-0.5">{doc.description}</p>}
      </div>
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (!confirm(`Delete "${doc.name}"?`)) return;
          start(async () => { await deleteServiceCountryDoc(doc.id, countryId); });
        }}
        className="px-2.5 py-1.5 rounded-lg text-xs text-red-400 hover:bg-red-500/10 cursor-pointer disabled:opacity-50 shrink-0"
        style={{ border: "1px solid rgba(239,68,68,0.2)" }}
      >
        {pending ? "…" : "Delete"}
      </button>
    </div>
  );
}

function DocumentsTab({ country }: { country: Country }) {
  const [adding, setAdding] = useState(false);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-white/50">Documents required from users registering in {country.name}.</p>
        {!adding && (
          <button type="button" onClick={() => setAdding(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white cursor-pointer" style={{ background: "linear-gradient(90deg,#9452E8,#FF5B62)" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" width={11} height={11}><path d="M12 5v14M5 12h14" /></svg>
            Add Document
          </button>
        )}
      </div>

      {adding && (
        <div className="p-4 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.10)" }}>
          <p className="text-sm font-semibold text-white">New Required Document</p>
          <AddDocForm countryId={country.id} onDone={() => setAdding(false)} />
        </div>
      )}

      {country.documents.length === 0 && !adding && (
        <p className="text-center text-white/25 text-sm py-10">No documents configured yet.</p>
      )}

      {country.documents.map((doc) => (
        <DocRow key={doc.id} doc={doc} countryId={country.id} />
      ))}
    </div>
  );
}

// ── Fields tab ────────────────────────────────────────────────

function FieldRow({
  meta,
  current,
  countryId,
}: {
  meta: { key: OnboardingField; label: string; desc: string };
  current: FieldConfig | undefined;
  countryId: string;
}) {
  const [pending, start] = useTransition();
  const enabled = !!current;
  const required = current?.isRequired ?? true;

  function toggle(newEnabled: boolean, newRequired: boolean) {
    start(async () => {
      await setServiceCountryField(countryId, meta.key, newEnabled, newRequired);
    });
  }

  return (
    <div
      className="flex items-center gap-4 px-4 py-3 rounded-xl transition-all"
      style={{
        background: enabled ? "rgba(148,82,232,0.08)" : "rgba(255,255,255,0.03)",
        border: enabled ? "1px solid rgba(148,82,232,0.25)" : "1px solid rgba(255,255,255,0.07)",
        opacity: pending ? 0.6 : 1,
      }}
    >
      <button
        type="button"
        disabled={pending}
        onClick={() => toggle(!enabled, required)}
        className="w-10 h-6 rounded-full relative transition-colors cursor-pointer shrink-0"
        style={{ background: enabled ? "linear-gradient(90deg,#9452E8,#FF5B62)" : "rgba(255,255,255,0.12)" }}
        aria-label={enabled ? "Disable field" : "Enable field"}
      >
        <span
          className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all"
          style={{ left: enabled ? "calc(100% - 1.35rem)" : "0.1rem" }}
        />
      </button>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white">{meta.label}</p>
        <p className="text-xs text-white/40">{meta.desc}</p>
      </div>
      {enabled && (
        <label className="flex items-center gap-2 cursor-pointer shrink-0">
          <input
            type="checkbox"
            checked={required}
            disabled={pending}
            onChange={(e) => toggle(true, e.target.checked)}
            className="accent-violet-500 w-4 h-4"
          />
          <span className="text-xs text-white/55">Required</span>
        </label>
      )}
    </div>
  );
}

function FieldsTab({ country }: { country: Country }) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-white/50">
        Toggle which personal information fields appear during onboarding for {country.name} users. Fields left off will not be shown.
      </p>
      <div className="space-y-2">
        {ALL_FIELDS.map((meta) => (
          <FieldRow
            key={meta.key}
            meta={meta}
            current={country.fields.find((f) => f.fieldKey === meta.key)}
            countryId={country.id}
          />
        ))}
      </div>
    </div>
  );
}

// ── Company Types tab ─────────────────────────────────────────

const inputCls = "w-full h-9 rounded-lg bg-[#111] border border-white/15 px-3 text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-white/40";

function AddCompanyTypeForm({ countryId, onDone }: { countryId: string; onDone: () => void }) {
  const [state, action, pending] = useActionState(addServiceCompanyType, null);

  useEffect(() => {
    if (state && "ok" in state) onDone();
  }, [state, onDone]);

  return (
    <form action={action} className="space-y-3 mt-4">
      <input type="hidden" name="countryId" value={countryId} />
      {state && "error" in state && <p className="text-red-400 text-xs">{state.error}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs text-white/45 mb-1 uppercase tracking-wide">Slug</label>
          <input name="slug" placeholder="e.g. llc" required className={inputCls} />
          <p className="text-[10px] text-white/25 mt-1">Lowercase, no spaces</p>
        </div>
        <div>
          <label className="block text-xs text-white/45 mb-1 uppercase tracking-wide">Short Name</label>
          <input name="name" placeholder="e.g. LLC" required className={inputCls} />
        </div>
        <div>
          <label className="block text-xs text-white/45 mb-1 uppercase tracking-wide">Sort Order</label>
          <input name="sortOrder" type="number" defaultValue={0} className={inputCls} />
        </div>
      </div>
      <div>
        <label className="block text-xs text-white/45 mb-1 uppercase tracking-wide">Full Name</label>
        <input name="fullName" placeholder="e.g. Limited Liability Company" required className={inputCls} />
      </div>
      <div>
        <label className="block text-xs text-white/45 mb-1 uppercase tracking-wide">Description</label>
        <textarea name="description" rows={2} placeholder="Brief description shown to users…" className="w-full rounded-lg bg-[#111] border border-white/15 px-3 py-2 text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-white/40 resize-none" />
      </div>
      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" name="isPopular" value="true" className="accent-violet-500 w-4 h-4" />
        <span className="text-sm text-white/60">Mark as Popular</span>
      </label>
      <div className="flex gap-2 justify-end pt-1">
        <button type="button" onClick={onDone} className="px-3 py-1.5 rounded-lg text-sm text-white/50 hover:text-white cursor-pointer" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)" }}>Cancel</button>
        <button type="submit" disabled={pending} className="px-3 py-1.5 rounded-lg text-sm font-semibold text-white cursor-pointer disabled:opacity-50" style={{ background: "linear-gradient(90deg,#9452E8,#FF5B62)" }}>
          {pending ? "Saving…" : "Add Type"}
        </button>
      </div>
    </form>
  );
}

function EditCompanyTypeForm({ ct, countryId, onDone }: { ct: CompanyType; countryId: string; onDone: () => void }) {
  const [result, action, pending] = useActionState(updateServiceCompanyType, null);

  useEffect(() => {
    if (result && "ok" in result) onDone();
  }, [result, onDone]);

  return (
    <form action={action} className="space-y-3 mt-3">
      <input type="hidden" name="id" value={ct.id} />
      <input type="hidden" name="countryId" value={countryId} />
      {result && "error" in result && <p className="text-red-400 text-xs">{String(result.error)}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs text-white/45 mb-1 uppercase tracking-wide">Short Name</label>
          <input name="name" defaultValue={ct.name} required className={inputCls} />
        </div>
        <div className="col-span-2">
          <label className="block text-xs text-white/45 mb-1 uppercase tracking-wide">Full Name</label>
          <input name="fullName" defaultValue={ct.fullName} required className={inputCls} />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="col-span-2">
          <label className="block text-xs text-white/45 mb-1 uppercase tracking-wide">Description</label>
          <textarea name="description" rows={2} defaultValue={ct.description ?? ""} className="w-full rounded-lg bg-[#111] border border-white/15 px-3 py-2 text-white text-sm focus:outline-none focus:border-white/40 resize-none" />
        </div>
        <div>
          <label className="block text-xs text-white/45 mb-1 uppercase tracking-wide">Sort Order</label>
          <input name="sortOrder" type="number" defaultValue={ct.sortOrder} className={inputCls} />
        </div>
      </div>
      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" name="isPopular" value="true" defaultChecked={ct.isPopular} className="accent-violet-500 w-4 h-4" />
        <span className="text-sm text-white/60">Mark as Popular</span>
      </label>
      <div className="flex gap-2 justify-end pt-1">
        <button type="button" onClick={onDone} className="px-3 py-1.5 rounded-lg text-sm text-white/50 hover:text-white cursor-pointer" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)" }}>Cancel</button>
        <button type="submit" disabled={pending} className="px-3 py-1.5 rounded-lg text-sm font-semibold text-white cursor-pointer disabled:opacity-50" style={{ background: "linear-gradient(90deg,#9452E8,#FF5B62)" }}>
          {pending ? "Saving…" : "Save"}
        </button>
      </div>
    </form>
  );
}

function CompanyTypeRow({ ct, countryId }: { ct: CompanyType; countryId: string }) {
  const [editing, setEditing] = useState(false);
  const [delPending, startDel] = useTransition();
  const [togPending, startTog] = useTransition();

  return (
    <div className="p-4 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
      {editing ? (
        <EditCompanyTypeForm ct={ct} countryId={countryId} onDone={() => setEditing(false)} />
      ) : (
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-black text-white/25">{ct.slug}</span>
              <span className="font-semibold text-white text-sm">{ct.name}</span>
              <span className="text-xs text-white/40">{ct.fullName}</span>
              {ct.isPopular && (
                <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded" style={{ background: "linear-gradient(90deg,#9452E8,#FF5B62)", color: "white" }}>Popular</span>
              )}
              {!ct.isActive && (
                <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded" style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.3)" }}>Hidden</span>
              )}
            </div>
            {ct.description && <p className="text-xs text-white/40 mt-1 leading-relaxed">{ct.description}</p>}
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button type="button" onClick={() => setEditing(true)} className="px-2.5 py-1.5 rounded-lg text-xs text-white/50 hover:text-white cursor-pointer" style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.10)" }}>Edit</button>
            <button
              type="button"
              disabled={togPending}
              onClick={() => startTog(async () => { await toggleServiceCompanyType(ct.id, countryId, !ct.isActive); })}
              className="px-2.5 py-1.5 rounded-lg text-xs cursor-pointer disabled:opacity-50"
              style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.10)", color: ct.isActive ? "#F87171" : "#34D399" }}
            >
              {togPending ? "…" : ct.isActive ? "Hide" : "Show"}
            </button>
            <button
              type="button"
              disabled={delPending}
              onClick={() => {
                if (!confirm(`Delete "${ct.name}"?`)) return;
                startDel(async () => { await deleteServiceCompanyType(ct.id, countryId); });
              }}
              className="px-2.5 py-1.5 rounded-lg text-xs text-red-400 hover:bg-red-500/10 cursor-pointer disabled:opacity-50"
              style={{ border: "1px solid rgba(239,68,68,0.2)" }}
            >
              {delPending ? "…" : "Delete"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function CompanyTypesTab({ country }: { country: Country }) {
  const [adding, setAdding] = useState(false);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-white/50">Company structures offered to clients registering in {country.name}.</p>
        {!adding && (
          <button type="button" onClick={() => setAdding(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white cursor-pointer" style={{ background: "linear-gradient(90deg,#9452E8,#FF5B62)" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" width={11} height={11}><path d="M12 5v14M5 12h14" /></svg>
            Add Type
          </button>
        )}
      </div>

      {adding && (
        <div className="p-4 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.10)" }}>
          <p className="text-sm font-semibold text-white">New Company Type</p>
          <AddCompanyTypeForm countryId={country.id} onDone={() => setAdding(false)} />
        </div>
      )}

      {country.companyTypes.length === 0 && !adding && (
        <p className="text-center text-white/25 text-sm py-10">No company types configured yet.</p>
      )}

      {country.companyTypes.map((ct) => (
        <CompanyTypeRow key={ct.id} ct={ct} countryId={country.id} />
      ))}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────

export default function CountryConfigClient({ country }: { country: Country }) {
  const [tab, setTab] = useState<Tab>("states");

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: "states",       label: "States / Regions",  count: country.states.length },
    { id: "documents",    label: "Required Documents", count: country.documents.length },
    { id: "fields",       label: "Form Fields",        count: country.fields.length },
    { id: "companyTypes", label: "Company Types",      count: country.companyTypes.length },
  ];

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6 md:mb-8 pl-10 md:pl-0">
        <ReactCountryFlag
          countryCode={country.isoCode}
          svg
          style={{ width: "3em", height: "3em", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.15)" }}
        />
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white">{country.name}</h1>
            <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded" style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.3)" }}>{country.isoCode}</span>
            {country.isActive ? (
              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded" style={{ background: "rgba(16,185,129,0.15)", color: "#34D399" }}>Active</span>
            ) : (
              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded" style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.3)" }}>Inactive</span>
            )}
          </div>
          <p className="text-sm text-white/40 mt-0.5">Configure states, documents, form fields, and company types for this country.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 p-1 rounded-xl w-fit" style={{ background: "rgba(255,255,255,0.05)" }}>
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer"
            style={
              tab === t.id
                ? { background: "rgba(148,82,232,0.25)", color: "white", border: "1px solid rgba(148,82,232,0.35)" }
                : { color: "rgba(255,255,255,0.45)", border: "1px solid transparent" }
            }
          >
            {t.label}
            <span
              className="text-[10px] font-bold px-1.5 py-0.5 rounded-md"
              style={{ background: tab === t.id ? "rgba(148,82,232,0.35)" : "rgba(255,255,255,0.08)", color: tab === t.id ? "white" : "rgba(255,255,255,0.35)" }}
            >
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div>
        {tab === "states"       && <StatesTab       country={country} />}
        {tab === "documents"    && <DocumentsTab    country={country} />}
        {tab === "fields"       && <FieldsTab       country={country} />}
        {tab === "companyTypes" && <CompanyTypesTab country={country} />}
      </div>
    </div>
  );
}
