"use client";

import { useState } from "react";
import Link from "next/link";

type Application = {
  id: string;
  companyName: string | null;
  country: string;
  plan: string | null;
  status: string;
  createdAt: Date;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
};

const STATUS_OPTIONS = [
  { value: "all",        label: "All" },
  { value: "pending",    label: "Pending" },
  { value: "in_review",  label: "In Review" },
  { value: "processing", label: "Processing" },
  { value: "completed",  label: "Completed" },
  { value: "rejected",   label: "Rejected" },
];

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, { bg: string; color: string; label: string }> = {
    pending:    { bg: "rgba(245,158,11,0.15)",  color: "#F59E0B", label: "Pending" },
    in_review:  { bg: "rgba(59,130,246,0.15)",  color: "#60A5FA", label: "In Review" },
    processing: { bg: "rgba(139,92,246,0.15)",  color: "#A78BFA", label: "Processing" },
    completed:  { bg: "rgba(16,185,129,0.15)",  color: "#34D399", label: "Completed" },
    rejected:   { bg: "rgba(239,68,68,0.15)",   color: "#F87171", label: "Rejected" },
  };
  const s = styles[status] ?? { bg: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)", label: status };
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold"
      style={{ background: s.bg, color: s.color }}
    >
      {s.label}
    </span>
  );
}

export default function CustomerSearch({ applications }: { applications: Application[] }) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = applications.filter((app) => {
    const q = query.toLowerCase();
    const matchesQuery =
      !q ||
      (app.companyName ?? "").toLowerCase().includes(q) ||
      app.user.firstName.toLowerCase().includes(q) ||
      app.user.lastName.toLowerCase().includes(q) ||
      app.user.email.toLowerCase().includes(q);
    const matchesStatus = statusFilter === "all" || app.status === statusFilter;
    return matchesQuery && matchesStatus;
  });

  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={14} height={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30">
            <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Search company, name, email..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full h-10 rounded-lg pl-9 pr-4 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/40 transition-colors"
            style={{ background: "rgba(26,26,28,0.8)", border: "1px solid rgba(255,255,255,0.10)" }}
          />
        </div>
        <div className="flex items-center gap-1.5 p-1 rounded-lg" style={{ background: "rgba(26,26,28,0.8)", border: "1px solid rgba(255,255,255,0.07)" }}>
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setStatusFilter(opt.value)}
              className="px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150 cursor-pointer"
              style={{
                background: statusFilter === opt.value ? "rgba(148,82,232,0.35)" : "transparent",
                color: statusFilter === opt.value ? "white" : "rgba(255,255,255,0.4)",
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <span className="text-xs text-white/30 shrink-0">{filtered.length} result{filtered.length !== 1 ? "s" : ""}</span>
      </div>

      <div
        className="rounded-xl overflow-hidden"
        style={{ background: "rgba(26,26,28,0.8)", border: "1px solid rgba(255,255,255,0.07)" }}
      >
        {filtered.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-white/30">No applications match your filters.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="px-6 py-3 text-left text-[11px] font-semibold text-white/35 uppercase tracking-wide">Company</th>
                  <th className="px-6 py-3 text-left text-[11px] font-semibold text-white/35 uppercase tracking-wide">Owner</th>
                  <th className="px-6 py-3 text-left text-[11px] font-semibold text-white/35 uppercase tracking-wide">Email</th>
                  <th className="px-6 py-3 text-left text-[11px] font-semibold text-white/35 uppercase tracking-wide">Country</th>
                  <th className="px-6 py-3 text-left text-[11px] font-semibold text-white/35 uppercase tracking-wide">Plan</th>
                  <th className="px-6 py-3 text-left text-[11px] font-semibold text-white/35 uppercase tracking-wide">Status</th>
                  <th className="px-6 py-3 text-left text-[11px] font-semibold text-white/35 uppercase tracking-wide">Date</th>
                  <th className="px-6 py-3 text-left text-[11px] font-semibold text-white/35 uppercase tracking-wide"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((app) => (
                  <tr key={app.id} className="border-b border-white/4 hover:bg-white/3 transition-colors">
                    <td className="px-6 py-3.5 text-white font-medium">
                      {app.companyName ?? <span className="text-white/30 italic">Unnamed</span>}
                    </td>
                    <td className="px-6 py-3.5 text-white/60">
                      {app.user.firstName} {app.user.lastName}
                    </td>
                    <td className="px-6 py-3.5 text-white/50 text-xs">{app.user.email}</td>
                    <td className="px-6 py-3.5 text-white/60 uppercase text-xs">{app.country}</td>
                    <td className="px-6 py-3.5 text-white/60 capitalize">{app.plan ?? "-"}</td>
                    <td className="px-6 py-3.5"><StatusBadge status={app.status} /></td>
                    <td className="px-6 py-3.5 text-white/40 text-xs">
                      {new Date(app.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-6 py-3.5">
                      <Link
                        href={`/admin/customers/${app.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-white/60 hover:text-white transition-colors cursor-pointer"
                        style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.10)" }}
                      >
                        View
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={11} height={11}>
                          <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
