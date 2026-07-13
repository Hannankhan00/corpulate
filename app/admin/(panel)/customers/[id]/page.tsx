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
    <div className="p-4 md:p-8">
      <div className="flex items-center gap-3 mb-6 md:mb-8 pl-10 md:pl-0">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
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

          {app.user.addresses && app.user.addresses.length > 0 && (
            <div
              className="rounded-xl p-6"
              style={{ background: "rgba(26,26,28,0.8)", border: "1px solid rgba(255,255,255,0.07)" }}
            >
              <h2 className="text-sm font-semibold text-white/70 mb-4 uppercase tracking-wide">Saved Addresses</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {app.user.addresses.map((addr) => (
                  <div key={addr.id} className="p-4 rounded-lg bg-white/5 border border-white/10 relative">
                    {addr.isDefault && (
                      <span className="absolute top-3 right-3 text-[10px] text-[#06B6D4] uppercase font-bold tracking-wider">
                        Default
                      </span>
                    )}
                    <p className="font-semibold text-sm text-white mb-1 flex items-center gap-2">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 text-[#06B6D4]">
                        <path d="M12 22s-8-4.5-8-11.8A8 8 0 0112 2a8 8 0 018 8.2c0 7.3-8 11.8-8 11.8z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      {addr.label}
                    </p>
                    <p className="text-xs text-white/60">{addr.streetAddress}</p>
                    <p className="text-xs text-white/60">
                      {addr.city}, {addr.province} {addr.postalCode}
                    </p>
                    <p className="text-xs text-white/60">{addr.addressCountry}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <div
            className="rounded-xl p-6 lg:sticky lg:top-8"
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
