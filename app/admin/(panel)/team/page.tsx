import { requireAdminSession, getAdminTeam } from "@/app/actions/admin-auth";
import { redirect } from "next/navigation";
import TeamClient from "./TeamClient";
import type { AdminRole } from "@/lib/admin-session";

export default async function TeamPage() {
  const admin = await requireAdminSession();

  // SUPPORT has no access to team management
  if (admin.role === "SUPPORT") redirect("/admin");

  const members = await getAdminTeam();

  return (
    <div className="p-4 md:p-8 pt-14 md:pt-8">
      <TeamClient
        members={members}
        actorId={admin.id}
        actorRole={admin.role as AdminRole}
      />
    </div>
  );
}
