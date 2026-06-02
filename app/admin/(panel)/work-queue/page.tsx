import Link from "next/link";
import { getAdminApplications } from "@/app/actions/admin";

type Application = Awaited<ReturnType<typeof getAdminApplications>>[number];

function KanbanCard({ app }: { app: Application }) {
  return (
    <Link
      href={`/admin/customers/${app.id}`}
      className="block rounded-xl p-4 transition-all duration-150 hover:border-white/20 cursor-pointer"
      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)" }}
    >
      <p className="font-semibold text-white text-sm leading-snug mb-1">
        {app.companyName ?? <span className="italic text-white/35">Unnamed</span>}
      </p>
      <p className="text-xs text-white/45 mb-3">
        {app.user.firstName} {app.user.lastName}
      </p>
      <div className="flex items-center gap-2 flex-wrap">
        {app.country && (
          <span className="px-2 py-0.5 rounded text-[10px] font-medium uppercase text-white/50" style={{ background: "rgba(255,255,255,0.07)" }}>
            {app.country}
          </span>
        )}
        {app.plan && (
          <span className="px-2 py-0.5 rounded text-[10px] font-medium capitalize text-white/50" style={{ background: "rgba(255,255,255,0.07)" }}>
            {app.plan}
          </span>
        )}
      </div>
      <p className="text-[10px] text-white/25 mt-3">
        {new Date(app.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
      </p>
    </Link>
  );
}

function KanbanLane({
  title,
  count,
  apps,
  headerColor,
  headerBg,
}: {
  title: string;
  count: number;
  apps: Application[];
  headerColor: string;
  headerBg: string;
}) {
  return (
    <div
      className="flex flex-col rounded-xl overflow-hidden"
      style={{ background: "rgba(26,26,28,0.6)", border: "1px solid rgba(255,255,255,0.07)" }}
    >
      <div className="px-4 py-3 flex items-center justify-between" style={{ background: headerBg, borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <span className="text-sm font-semibold" style={{ color: headerColor }}>{title}</span>
        <span
          className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
          style={{ background: headerColor, color: "#0a0a0a" }}
        >
          {count}
        </span>
      </div>

      <div className="flex-1 p-3 space-y-3 overflow-y-auto" style={{ minHeight: "200px" }}>
        {apps.length === 0 ? (
          <p className="text-xs text-white/20 text-center py-6">No applications</p>
        ) : (
          apps.map((app) => <KanbanCard key={app.id} app={app} />)
        )}
      </div>
    </div>
  );
}

export default async function WorkQueuePage() {
  const all = await getAdminApplications();

  const needsReview = all.filter((a) => a.status === "pending");
  const inProgress  = all.filter((a) => a.status === "in_review" || a.status === "processing");
  const done        = all.filter((a) => a.status === "completed" || a.status === "rejected");

  return (
    <div className="p-4 md:p-8 h-full flex flex-col">
      <div className="mb-6 md:mb-8 shrink-0 pl-10 md:pl-0">
        <h1 className="text-2xl font-bold text-white">Work Queue</h1>
        <p className="text-sm text-white/40 mt-1">Track application progress across all stages.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 flex-1 min-h-0">
        <KanbanLane
          title="Needs Review"
          count={needsReview.length}
          apps={needsReview}
          headerColor="#F59E0B"
          headerBg="rgba(245,158,11,0.08)"
        />
        <KanbanLane
          title="In Progress"
          count={inProgress.length}
          apps={inProgress}
          headerColor="#818CF8"
          headerBg="rgba(99,102,241,0.08)"
        />
        <KanbanLane
          title="Done"
          count={done.length}
          apps={done}
          headerColor="#34D399"
          headerBg="rgba(16,185,129,0.08)"
        />
      </div>
    </div>
  );
}
