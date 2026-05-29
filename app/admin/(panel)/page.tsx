import Link from "next/link";
import { getAdminStats, getAdminApplications } from "@/app/actions/admin";

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
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold capitalize"
      style={{ background: s.bg, color: s.color }}
    >
      {s.label}
    </span>
  );
}

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div
      className="rounded-xl p-5 flex items-center gap-4"
      style={{ background: "rgba(26,26,28,0.8)", border: "1px solid rgba(255,255,255,0.07)" }}
    >
      <div
        className="w-11 h-11 rounded-lg flex items-center justify-center shrink-0"
        style={{ background: color }}
      >
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-white">{value.toLocaleString()}</p>
        <p className="text-xs text-white/50 mt-0.5">{label}</p>
      </div>
    </div>
  );
}

export default async function AdminOverviewPage() {
  const [stats, applications] = await Promise.all([
    getAdminStats(),
    getAdminApplications(),
  ]);

  const recent = applications.slice(0, 10);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Admin Overview</h1>
        <p className="text-sm text-white/40 mt-1">Monitor applications and user activity across the platform.</p>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total Users"
          value={stats.totalUsers}
          color="rgba(59,130,246,0.25)"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" width={20} height={20}>
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
            </svg>
          }
        />
        <StatCard
          label="Total Applications"
          value={stats.totalApps}
          color="rgba(139,92,246,0.25)"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="#A78BFA" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" width={20} height={20}>
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path d="M14 2v6h6M9 13h6M9 17h6" />
            </svg>
          }
        />
        <StatCard
          label="Pending Review"
          value={stats.pending}
          color="rgba(245,158,11,0.2)"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" width={20} height={20}>
              <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
            </svg>
          }
        />
        <StatCard
          label="Completed"
          value={stats.completed}
          color="rgba(16,185,129,0.2)"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="#34D399" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" width={20} height={20}>
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><path d="M22 4L12 14.01l-3-3" />
            </svg>
          }
        />
      </div>

      <div
        className="rounded-xl overflow-hidden"
        style={{ background: "rgba(26,26,28,0.8)", border: "1px solid rgba(255,255,255,0.07)" }}
      >
        <div className="px-6 py-4 border-b border-white/7 flex items-center justify-between">
          <h2 className="font-semibold text-white text-sm">Recent Applications</h2>
          <Link href="/admin/customers" className="text-xs text-white/40 hover:text-white transition-colors">
            View all
          </Link>
        </div>

        {recent.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-white/30">No applications yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="px-6 py-3 text-left text-[11px] font-semibold text-white/35 uppercase tracking-wide">Company</th>
                  <th className="px-6 py-3 text-left text-[11px] font-semibold text-white/35 uppercase tracking-wide">Owner</th>
                  <th className="px-6 py-3 text-left text-[11px] font-semibold text-white/35 uppercase tracking-wide">Country</th>
                  <th className="px-6 py-3 text-left text-[11px] font-semibold text-white/35 uppercase tracking-wide">Plan</th>
                  <th className="px-6 py-3 text-left text-[11px] font-semibold text-white/35 uppercase tracking-wide">Status</th>
                  <th className="px-6 py-3 text-left text-[11px] font-semibold text-white/35 uppercase tracking-wide">Date</th>
                  <th className="px-6 py-3 text-left text-[11px] font-semibold text-white/35 uppercase tracking-wide"></th>
                </tr>
              </thead>
              <tbody>
                {recent.map((app) => (
                  <tr key={app.id} className="border-b border-white/4 hover:bg-white/3 transition-colors">
                    <td className="px-6 py-3.5 text-white font-medium">
                      {app.companyName ?? <span className="text-white/30 italic">Unnamed</span>}
                    </td>
                    <td className="px-6 py-3.5 text-white/60">
                      {app.user.firstName} {app.user.lastName}
                    </td>
                    <td className="px-6 py-3.5 text-white/60 uppercase text-xs">{app.country}</td>
                    <td className="px-6 py-3.5 text-white/60 capitalize">{app.plan ?? "-"}</td>
                    <td className="px-6 py-3.5"><StatusBadge status={app.status} /></td>
                    <td className="px-6 py-3.5 text-white/40 text-xs">
                      {new Date(app.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-6 py-3.5">
                      <Link
                        href={`/admin/customers/${app.id}`}
                        className="text-xs text-white/40 hover:text-white transition-colors underline underline-offset-2"
                      >
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
