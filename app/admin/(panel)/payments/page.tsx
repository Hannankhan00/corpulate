import Link from "next/link";
import { requireAdminSession } from "@/app/actions/admin-auth";
import { getPaymentsData } from "@/app/actions/admin";

function fmt(cents: number) {
  return (cents / 100).toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function StatCard({ label, value, sub, icon, grad, iconColor }: {
  label: string; value: string; sub?: string;
  icon: React.ReactNode; grad: string; iconColor: string;
}) {
  return (
    <div className="rounded-2xl p-5 flex items-center gap-4" style={{ background: "rgba(26,26,28,0.85)", border: "1px solid rgba(255,255,255,0.07)" }}>
      <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: grad }}>
        <svg viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" width={22} height={22}>{icon}</svg>
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-black text-white leading-none">{value}</p>
        <p className="text-xs text-white/40 mt-1">{label}</p>
        {sub && <p className="text-[10px] text-white/25 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function PayMethodBadge({ method, status }: { method: string | null; status: string | null }) {
  if (method === "bank_transfer") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide"
        style={{ background: "rgba(13,100,139,0.18)", color: "#22D3EE", border: "1px solid rgba(13,100,139,0.3)" }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={10} height={10}><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /></svg>
        Bank
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide"
      style={{ background: "rgba(148,82,232,0.15)", color: "#C084FC", border: "1px solid rgba(148,82,232,0.25)" }}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={10} height={10}><rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>
      Card
    </span>
  );
}

function StatusBadge({ isPaid, method, transferStatus }: { isPaid: boolean; method: string | null; transferStatus: string | null }) {
  if (isPaid) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold"
        style={{ background: "rgba(16,185,129,0.15)", color: "#10B981" }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" width={10} height={10}><path d="M20 6L9 17l-5-5" /></svg>
        Paid
      </span>
    );
  }
  if (method === "bank_transfer" && transferStatus === "pending_review") {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold"
        style={{ background: "rgba(245,158,11,0.15)", color: "#F59E0B" }}>
        Pending
      </span>
    );
  }
  if (method === "bank_transfer" && transferStatus === "rejected") {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold"
        style={{ background: "rgba(239,68,68,0.15)", color: "#F87171" }}>
        Rejected
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold"
      style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.4)" }}>
      Unpaid
    </span>
  );
}

export default async function PaymentsPage() {
  await requireAdminSession();
  const data = await getPaymentsData();

  const maxMonthRev = Math.max(...data.months.map(m => m.revenue), 1);
  const avgOrder = data.cardCount + data.bankCount > 0
    ? Math.round(data.totalRev / (data.cardCount + data.bankCount))
    : 0;

  return (
    <div className="p-4 md:p-8">
      <div className="mb-7 pl-10 md:pl-0">
        <h1 className="text-2xl font-bold text-white">Revenue & Payments</h1>
        <p className="text-sm text-white/40 mt-1">Track all incoming payments, revenue trends, and transaction history.</p>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-7">
        <StatCard
          label="Total Revenue"
          value={fmt(data.totalRev)}
          sub={`${data.cardCount + data.bankCount} paid transactions`}
          grad="linear-gradient(135deg,rgba(16,185,129,0.25),rgba(5,150,105,0.15))"
          iconColor="#10B981"
          icon={<><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></>}
        />
        <StatCard
          label="Card Revenue"
          value={fmt(data.cardRev)}
          sub={`${data.cardCount} card transactions`}
          grad="linear-gradient(135deg,rgba(148,82,232,0.25),rgba(233,69,168,0.15))"
          iconColor="#C084FC"
          icon={<><rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" /></>}
        />
        <StatCard
          label="Bank Transfer Revenue"
          value={fmt(data.bankRev)}
          sub={`${data.bankCount} approved transfers`}
          grad="linear-gradient(135deg,rgba(13,100,139,0.25),rgba(6,182,212,0.15))"
          iconColor="#22D3EE"
          icon={<><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></>}
        />
        <StatCard
          label="Pending Transfers"
          value={String(data.pendingCount)}
          sub="Awaiting admin review"
          grad={data.pendingCount > 0 ? "linear-gradient(135deg,rgba(245,158,11,0.25),rgba(251,191,36,0.12))" : "rgba(255,255,255,0.05)"}
          iconColor={data.pendingCount > 0 ? "#F59E0B" : "rgba(255,255,255,0.3)"}
          icon={<><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></>}
        />
      </div>

      {/* ── Monthly Revenue ── */}
      <div className="rounded-2xl p-6 mb-7" style={{ background: "rgba(26,26,28,0.85)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-sm font-bold text-white">Monthly Revenue</h2>
            <p className="text-[11px] text-white/35 mt-0.5">Last 6 months</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-white/30 uppercase tracking-widest mb-0.5">Avg order value</p>
            <p className="text-sm font-bold text-white">{fmt(avgOrder)}</p>
          </div>
        </div>
        <div className="flex items-end gap-3 h-36">
          {data.months.map((m, i) => {
            const pct = maxMonthRev > 0 ? (m.revenue / maxMonthRev) * 100 : 0;
            const isLast = i === data.months.length - 1;
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                <div className="w-full flex flex-col items-center justify-end" style={{ height: "100px" }}>
                  {m.revenue > 0 && (
                    <div className="w-full text-center mb-1">
                      <p className="text-[9px] text-white/30 opacity-0 group-hover:opacity-100 transition-opacity">{fmt(m.revenue)}</p>
                    </div>
                  )}
                  <div className="w-full rounded-lg transition-all"
                    style={{
                      height: `${Math.max(pct, m.revenue > 0 ? 4 : 0)}%`,
                      minHeight: m.revenue > 0 ? "6px" : "0",
                      background: isLast
                        ? "linear-gradient(180deg,#9452E8,#E945A8)"
                        : "rgba(255,255,255,0.1)",
                      boxShadow: isLast ? "0 0 12px rgba(148,82,232,0.3)" : "none",
                    }}
                  />
                </div>
                <p className="text-[10px] text-white/35 whitespace-nowrap">{m.label}</p>
                {m.count > 0 && <p className="text-[9px] text-white/20">{m.count} txn</p>}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Transaction table ── */}
      <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(26,26,28,0.85)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <h2 className="text-sm font-bold text-white">All Transactions</h2>
          <span className="text-[11px] text-white/30">{data.transactions.length} total</span>
        </div>

        {data.transactions.length === 0 ? (
          <div className="py-16 flex flex-col items-center gap-3">
            <svg viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" width={32} height={32}><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></svg>
            <p className="text-sm text-white/25">No transactions yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  {["Customer", "Company", "Plan", "Amount", "Method", "Status", "Date", ""].map((h, i) => (
                    <th key={i} className="px-5 py-3 text-left text-[10px] font-bold text-white/30 uppercase tracking-widest whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.transactions.map(tx => (
                  <tr key={tx.id} className="transition-colors hover:bg-white/[0.02]" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <p className="text-sm text-white font-medium">{tx.user.firstName} {tx.user.lastName}</p>
                      <p className="text-[11px] text-white/35 mt-0.5">{tx.user.email}</p>
                    </td>
                    <td className="px-5 py-3.5 text-white/70 max-w-[140px]">
                      <p className="truncate">{tx.companyName ?? <span className="text-white/25 italic">Unnamed</span>}</p>
                      <p className="text-[10px] text-white/25 uppercase mt-0.5">{tx.country}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-white/70 capitalize whitespace-nowrap">{tx.plan ?? "—"}</p>
                      <p className="text-[10px] text-white/25 capitalize mt-0.5">{tx.billingPeriod ?? ""}</p>
                    </td>
                    <td className="px-5 py-3.5 font-bold whitespace-nowrap" style={{ color: tx.isPaid ? "#10B981" : "rgba(255,255,255,0.3)" }}>
                      {tx.amountPaid ? fmt(tx.amountPaid) : "—"}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <PayMethodBadge method={tx.paymentMethod} status={tx.transferStatus} />
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <StatusBadge isPaid={tx.isPaid} method={tx.paymentMethod} transferStatus={tx.transferStatus} />
                    </td>
                    <td className="px-5 py-3.5 text-white/35 text-xs whitespace-nowrap">
                      {new Date(tx.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-5 py-3.5">
                      <Link href={`/admin/customers/${tx.id}`}
                        className="text-xs text-white/35 hover:text-white transition-colors underline underline-offset-2 whitespace-nowrap">
                        View
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
