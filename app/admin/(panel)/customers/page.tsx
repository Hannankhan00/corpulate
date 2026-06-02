import { getAdminApplications } from "@/app/actions/admin";
import CustomerSearch from "./CustomerSearch";

export default async function CustomersPage() {
  const applications = await getAdminApplications();

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6 md:mb-8 pl-10 md:pl-0">
        <h1 className="text-2xl font-bold text-white">Customers</h1>
        <p className="text-sm text-white/40 mt-1">View and manage all customer applications.</p>
      </div>
      <CustomerSearch applications={applications} />
    </div>
  );
}
