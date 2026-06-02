"use client";

import { useState, useTransition, useActionState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ReactCountryFlag from "react-country-flag";
import { createServiceCountry, toggleServiceCountry, deleteServiceCountry } from "@/app/actions/admin-services";

type Country = {
  id: string;
  name: string;
  isoCode: string;
  isActive: boolean;
  _count: { states: number; documents: number; fields: number };
};

function AddCountryForm({ onDone }: { onDone: () => void }) {
  const router = useRouter();
  const [state, action, pending] = useActionState(createServiceCountry, null);

  if (state && "id" in state) {
    router.push(`/admin/services/${state.id}`);
  }

  return (
    <form action={action} className="space-y-4">
      {state && "error" in state && (
        <p className="text-red-400 text-xs">{state.error}</p>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-white/50 mb-1.5 uppercase tracking-wide">Country Name</label>
          <input
            name="name"
            placeholder="e.g. United States"
            required
            className="w-full h-10 rounded-lg bg-[#111] border border-white/15 px-3 text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-white/40 transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs text-white/50 mb-1.5 uppercase tracking-wide">ISO Code (2 letters)</label>
          <input
            name="isoCode"
            placeholder="e.g. US"
            maxLength={2}
            required
            className="w-full h-10 rounded-lg bg-[#111] border border-white/15 px-3 text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-white/40 transition-colors"
            style={{ textTransform: "uppercase" }}
          />
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={onDone}
          className="px-4 py-2 rounded-lg text-sm text-white/50 hover:text-white transition-colors cursor-pointer"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)" }}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={pending}
          className="px-4 py-2 rounded-lg text-sm font-semibold text-white cursor-pointer disabled:opacity-50"
          style={{ background: "linear-gradient(90deg,#9452E8,#FF5B62)" }}
        >
          {pending ? "Adding…" : "Add Country"}
        </button>
      </div>
    </form>
  );
}

function ToggleBtn({ country }: { country: Country }) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => start(async () => { await toggleServiceCountry(country.id, !country.isActive); })}
      className="px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer disabled:opacity-50"
      style={{
        background: "rgba(255,255,255,0.07)",
        border: "1px solid rgba(255,255,255,0.10)",
        color: country.isActive ? "#F87171" : "#34D399",
      }}
    >
      {pending ? "…" : country.isActive ? "Deactivate" : "Activate"}
    </button>
  );
}

function DeleteBtn({ country }: { country: Country }) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!confirm(`Delete ${country.name}? This removes all its states, documents, and field configs.`)) return;
        start(async () => { await deleteServiceCountry(country.id); });
      }}
      className="px-3 py-1.5 rounded-lg text-xs text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer disabled:opacity-50"
      style={{ border: "1px solid rgba(239,68,68,0.2)" }}
    >
      {pending ? "…" : "Delete"}
    </button>
  );
}

export default function ServicesClient({ countries }: { countries: Country[] }) {
  const [adding, setAdding] = useState(false);

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 md:mb-8 pl-10 md:pl-0">
        <div>
          <h1 className="text-2xl font-bold text-white">Service Countries</h1>
          <p className="text-sm text-white/45 mt-1">Manage which countries you offer company registration in.</p>
        </div>
        {!adding && (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white cursor-pointer"
            style={{ background: "linear-gradient(90deg,#9452E8,#FF5B62)" }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" width={14} height={14}>
              <path d="M12 5v14M5 12h14" />
            </svg>
            Add Country
          </button>
        )}
      </div>

      {adding && (
        <div className="rounded-xl p-5 mb-6" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.10)" }}>
          <p className="text-sm font-semibold text-white mb-4">New Country</p>
          <AddCountryForm onDone={() => setAdding(false)} />
        </div>
      )}

      {countries.length === 0 && !adding ? (
        <div className="text-center py-20">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" width={40} height={40} className="mx-auto mb-3 text-white/20">
            <circle cx="12" cy="12" r="10" />
            <path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20" />
          </svg>
          <p className="text-sm text-white/30">No countries configured yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {countries.map((c) => (
            <div
              key={c.id}
              className="flex items-center gap-4 px-5 py-4 rounded-xl"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <div className="shrink-0">
                <ReactCountryFlag
                  countryCode={c.isoCode}
                  svg
                  style={{ width: "2.2em", height: "2.2em", borderRadius: "5px", border: "1px solid rgba(255,255,255,0.12)" }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-white text-sm">{c.name}</span>
                  <span
                    className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
                    style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.3)" }}
                  >
                    {c.isoCode}
                  </span>
                  {c.isActive ? (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded" style={{ background: "rgba(16,185,129,0.15)", color: "#34D399" }}>Active</span>
                  ) : (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded" style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.3)" }}>Inactive</span>
                  )}
                </div>
                <p className="text-xs text-white/35 mt-0.5">
                  {c._count.states} state{c._count.states !== 1 ? "s" : ""} · {c._count.documents} doc{c._count.documents !== 1 ? "s" : ""} · {c._count.fields} field{c._count.fields !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href={`/admin/services/${c.id}`}
                  className="px-3 py-1.5 rounded-lg text-xs text-white/60 hover:text-white transition-colors"
                  style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.10)" }}
                >
                  Configure
                </Link>
                <ToggleBtn country={c} />
                <DeleteBtn country={c} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
