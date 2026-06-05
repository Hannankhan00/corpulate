"use client";

import { useState, useTransition } from "react";
import { approveTransfer, rejectTransfer } from "@/app/actions/bankTransfer";

type Screenshot = { id: string; fileName: string; mimeType: string; dataUrl: string } | null;
type Transfer = {
  id: string; companyName: string | null; plan: string | null; amountPaid: number | null;
  transferStatus: string | null; transferNote: string | null; createdAt: string;
  user: { firstName: string; lastName: string; email: string };
  screenshot: Screenshot;
};

const STATUS_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  pending_review: { bg: "rgba(245,158,11,0.15)", color: "#F59E0B", label: "Pending Review" },
  approved:       { bg: "rgba(16,185,129,0.15)",  color: "#10B981", label: "Approved" },
  rejected:       { bg: "rgba(239,68,68,0.15)",   color: "#F87171", label: "Rejected" },
};

function StatusBadge({ status }: { status: string | null }) {
  const s = STATUS_STYLE[status ?? ""] ?? { bg: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.4)", label: status ?? "Unknown" };
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold" style={{ background: s.bg, color: s.color }}>
      {s.label}
    </span>
  );
}

function TransferRow({ transfer, onUpdated }: { transfer: Transfer; onUpdated: (id: string, status: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const [rejectNote, setRejectNote] = useState("");
  const [rejectOpen, setRejectOpen] = useState(false);
  const [approvePending, startApprove] = useTransition();
  const [rejectPending, startReject] = useTransition();

  function handleApprove() {
    startApprove(async () => {
      await approveTransfer(transfer.id);
      onUpdated(transfer.id, "approved");
    });
  }

  function handleReject() {
    startReject(async () => {
      await rejectTransfer(transfer.id, rejectNote);
      onUpdated(transfer.id, "rejected");
      setRejectOpen(false);
    });
  }

  const canAct = transfer.transferStatus === "pending_review";
  const date = new Date(transfer.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  const amount = transfer.amountPaid != null ? `$${(transfer.amountPaid / 100).toFixed(2)}` : "—";

  return (
    <div className="rounded-xl overflow-hidden" style={{ background: "rgba(26,26,28,0.8)", border: "1px solid rgba(255,255,255,0.07)" }}>
      {/* Row header */}
      <button type="button" onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center gap-4 px-5 py-4 text-left cursor-pointer hover:bg-white/[0.02] transition-colors">
        <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-3 items-center min-w-0">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate">{transfer.companyName ?? "Unnamed"}</p>
            <p className="text-[11px] text-white/35 truncate">{transfer.user.firstName} {transfer.user.lastName}</p>
          </div>
          <div className="hidden md:block">
            <p className="text-[11px] text-white/35 uppercase tracking-wide mb-0.5">Amount</p>
            <p className="text-sm font-bold text-white">{amount}</p>
          </div>
          <div className="hidden md:block">
            <p className="text-[11px] text-white/35 uppercase tracking-wide mb-0.5">Submitted</p>
            <p className="text-sm text-white/70">{date}</p>
          </div>
          <div>
            <StatusBadge status={transfer.transferStatus} />
          </div>
        </div>
        <svg viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={16} height={16}
          className="shrink-0 transition-transform duration-200" style={{ transform: expanded ? "rotate(180deg)" : "rotate(0deg)" }}>
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">

            {/* Info panel */}
            <div className="px-5 py-5 space-y-4" style={{ borderRight: "1px solid rgba(255,255,255,0.05)" }}>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Customer",    value: `${transfer.user.firstName} ${transfer.user.lastName}` },
                  { label: "Email",       value: transfer.user.email },
                  { label: "Company",     value: transfer.companyName ?? "—" },
                  { label: "Plan",        value: transfer.plan ?? "—" },
                  { label: "Amount",      value: amount },
                  { label: "Date",        value: date },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-[10px] text-white/30 uppercase tracking-widest mb-0.5">{label}</p>
                    <p className="text-sm text-white/80 break-all">{value}</p>
                  </div>
                ))}
              </div>

              {transfer.transferNote && (
                <div className="px-3 py-2.5 rounded-lg" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.18)" }}>
                  <p className="text-[10px] text-red-400/70 uppercase tracking-widest mb-1">Rejection Note</p>
                  <p className="text-sm text-white/65">{transfer.transferNote}</p>
                </div>
              )}

              {/* Action buttons */}
              {canAct && !rejectOpen && (
                <div className="flex gap-2 pt-1">
                  <button type="button" onClick={handleApprove} disabled={approvePending}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white cursor-pointer disabled:opacity-50 transition-all"
                    style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)", color: "#10B981" }}>
                    {approvePending ? (
                      <svg className="animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={14} height={14}><path d="M21 12a9 9 0 11-6.219-8.56" /></svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" width={14} height={14}><path d="M20 6L9 17l-5-5" /></svg>
                    )}
                    Approve
                  </button>
                  <button type="button" onClick={() => setRejectOpen(true)}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold cursor-pointer transition-all"
                    style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", color: "#F87171" }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={14} height={14}><path d="M18 6L6 18M6 6l12 12" /></svg>
                    Reject
                  </button>
                </div>
              )}

              {canAct && rejectOpen && (
                <div className="space-y-2.5">
                  <textarea
                    value={rejectNote}
                    onChange={e => setRejectNote(e.target.value)}
                    placeholder="Reason for rejection (optional but recommended)..."
                    rows={2}
                    className="w-full rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/20 resize-none focus:outline-none"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(239,68,68,0.3)" }}
                  />
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setRejectOpen(false)}
                      className="flex-1 py-2 rounded-xl text-sm text-white/40 hover:text-white transition-colors cursor-pointer"
                      style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                      Cancel
                    </button>
                    <button type="button" onClick={handleReject} disabled={rejectPending}
                      className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-semibold cursor-pointer disabled:opacity-50"
                      style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", color: "#F87171" }}>
                      {rejectPending ? <svg className="animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={13} height={13}><path d="M21 12a9 9 0 11-6.219-8.56" /></svg> : null}
                      Confirm Reject
                    </button>
                  </div>
                </div>
              )}

              {!canAct && (
                <div className="px-3 py-2 rounded-lg text-xs text-white/30" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  This transfer has already been {transfer.transferStatus === "approved" ? "approved" : "rejected"}.
                </div>
              )}
            </div>

            {/* Screenshot panel */}
            <div className="px-5 py-5">
              <p className="text-[10px] text-white/30 uppercase tracking-widest mb-3">Transfer Screenshot</p>
              {transfer.screenshot ? (
                <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
                  {transfer.screenshot.mimeType.startsWith("image/") ? (
                    <img
                      src={transfer.screenshot.dataUrl}
                      alt="Transfer proof"
                      className="w-full object-contain max-h-72"
                      style={{ background: "#0a0a0c" }}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-2 py-10" style={{ background: "rgba(255,255,255,0.03)" }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" width={28} height={28}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                      <p className="text-sm text-white/40">PDF document</p>
                    </div>
                  )}
                  <div className="px-4 py-3 flex items-center justify-between" style={{ borderTop: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)" }}>
                    <p className="text-xs text-white/35 truncate">{transfer.screenshot.fileName}</p>
                    <a href={transfer.screenshot.dataUrl} download={transfer.screenshot.fileName}
                      className="text-xs text-white/40 hover:text-white transition-colors cursor-pointer px-2.5 py-1 rounded-lg"
                      style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.08)" }}>
                      Download
                    </a>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-2 py-10 rounded-xl" style={{ background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.08)" }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" width={24} height={24}><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
                  <p className="text-sm text-white/25">No screenshot uploaded</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TransfersClient({ initialTransfers }: { initialTransfers: Transfer[] }) {
  const [transfers, setTransfers] = useState(initialTransfers);
  const [filter, setFilter] = useState<"all" | "pending_review" | "approved" | "rejected">("all");

  function handleUpdated(id: string, status: string) {
    setTransfers(prev => prev.map(t => t.id === id ? { ...t, transferStatus: status } : t));
  }

  const filtered = filter === "all" ? transfers : transfers.filter(t => t.transferStatus === filter);
  const counts = {
    all:            transfers.length,
    pending_review: transfers.filter(t => t.transferStatus === "pending_review").length,
    approved:       transfers.filter(t => t.transferStatus === "approved").length,
    rejected:       transfers.filter(t => t.transferStatus === "rejected").length,
  };

  return (
    <div className="p-6 md:p-8">
      <div className="flex items-center gap-3 mb-7 pl-10 md:pl-0">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: "linear-gradient(135deg,rgba(245,158,11,0.25),rgba(251,191,36,0.12))", border: "1px solid rgba(245,158,11,0.3)" }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="#FBBF24" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" width={18} height={18}>
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Bank Transfers</h1>
          <p className="text-xs text-white/35 mt-0.5">Review and approve or reject customer bank transfer submissions.</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1.5 mb-6 flex-wrap">
        {(["all", "pending_review", "approved", "rejected"] as const).map(f => {
          const labels = { all: "All", pending_review: "Pending", approved: "Approved", rejected: "Rejected" };
          const active = filter === f;
          return (
            <button key={f} type="button" onClick={() => setFilter(f)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer"
              style={{
                background: active ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.04)",
                color: active ? "white" : "rgba(255,255,255,0.4)",
                border: active ? "1px solid rgba(255,255,255,0.2)" : "1px solid rgba(255,255,255,0.07)",
              }}>
              {labels[f]}
              <span className="px-1.5 py-0.5 rounded-full text-[10px]"
                style={{ background: active ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.06)" }}>
                {counts[f]}
              </span>
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-20 rounded-xl" style={{ background: "rgba(26,26,28,0.5)", border: "1px dashed rgba(255,255,255,0.07)" }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" width={32} height={32}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
          <p className="text-sm text-white/25">No {filter === "all" ? "" : filter.replace("_", " ")} transfers found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(t => (
            <TransferRow key={t.id} transfer={t} onUpdated={handleUpdated} />
          ))}
        </div>
      )}
    </div>
  );
}
