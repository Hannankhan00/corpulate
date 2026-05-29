import { requireAdminSession } from "@/app/actions/admin-auth";
import AdminSidebar from "./AdminSidebar";

export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await requireAdminSession();

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#070707" }}>
      <AdminSidebar
        name={admin.name}
        role={admin.role as "SUPER_ADMIN" | "ADMIN" | "SUPPORT"}
      />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
