import { notFound } from "next/navigation";
import Link from "next/link";
import { getAdminApplication } from "@/app/actions/admin";
import { requireAdminSession } from "@/app/actions/admin-auth";
import StatusForm from "./StatusForm";

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 py-3 border-b border-white/5 last:border-0">
      <span className="text-[11px] text-white/35 uppercase tracking-wide">{label}</span>
      <span className="text-sm text-white/80">{value ?? <span className="text-white/25 italic">Not provided</span>}</span>
    </div>
  );
}

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

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [{ id }, admin] = await Promise.all([params, requireAdminSession()]);
  const app = await getAdminApplication(id);
  if (!app) notFound();

  const canEdit = admin.role === "SUPER_ADMIN" || admin.role === "ADMIN";

  const memberSince = new Date(app.user.createdAt).toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric",
  });
  const submittedAt = new Date(app.createdAt).toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric",
  });

  return (
    <div className="p-8">
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/admin/customers"
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-white/50 hover:text-white transition-colors cursor-pointer"
          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={14} height={14}>
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white">
              {app.companyName ?? "Unnamed Application"}
            </h1>
            <StatusBadge status={app.status} />
          </div>
          <p className="text-sm text-white/40 mt-0.5">Submitted {submittedAt}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-5">
          <div
            className="rounded-xl p-6"
            style={{ background: "rgba(26,26,28,0.8)", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <h2 className="text-sm font-semibold text-white/70 mb-4 uppercase tracking-wide">Company Details</h2>
            <DetailRow label="Company Name (1st Choice)" value={app.companyName} />
            {app.companyName2 && <DetailRow label="Company Name (2nd Choice)" value={app.companyName2} />}
            {app.companyName3 && <DetailRow label="Company Name (3rd Choice)" value={app.companyName3} />}
            <DetailRow label="Company Type" value={app.companyType?.toUpperCase()} />
            <DetailRow label="Industry" value={app.industry} />
            <DetailRow label="Expected Revenue" value={app.revenue} />
            <DetailRow label="Website" value={
              app.website ? (
                <a href={app.website} target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline">
                  {app.website}
                </a>
              ) : null
            } />
            <DetailRow label="Description" value={app.description} />
          </div>

          <div
            className="rounded-xl p-6"
            style={{ background: "rgba(26,26,28,0.8)", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <h2 className="text-sm font-semibold text-white/70 mb-4 uppercase tracking-wide">Registration Details</h2>
            <DetailRow label="Country" value={app.country.toUpperCase()} />
            <DetailRow label="State" value={app.state} />
            <DetailRow label="Plan" value={<span className="capitalize">{app.plan}</span>} />
            <DetailRow label="Billing Period" value={<span className="capitalize">{app.billingPeriod}</span>} />
            <DetailRow label="Application ID" value={<span className="font-mono text-xs text-white/50">{app.id}</span>} />
          </div>

          <div
            className="rounded-xl p-6"
            style={{ background: "rgba(26,26,28,0.8)", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <h2 className="text-sm font-semibold text-white/70 mb-4 uppercase tracking-wide">Applicant Details</h2>
            <DetailRow label="Full Name" value={`${app.user.firstName} ${app.user.lastName}`} />
            <DetailRow label="Email" value={app.user.email} />
            <DetailRow label="Phone" value={app.user.phone} />
            <DetailRow label="Member Since" value={memberSince} />
          </div>
        </div>

        <div className="col-span-1">
          <div
            className="rounded-xl p-6 sticky top-8"
            style={{ background: "rgba(26,26,28,0.8)", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <h2 className="text-sm font-semibold text-white/70 mb-5 uppercase tracking-wide">Manage Application</h2>
            <StatusForm
              applicationId={app.id}
              currentStatus={app.status}
              currentNotes={app.adminNotes}
              canEdit={canEdit}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
