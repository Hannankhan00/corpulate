import { requireAdminSession } from "@/app/actions/admin-auth";
import { getPendingTransfers } from "@/app/actions/bankTransfer";
import TransfersClient from "./TransfersClient";

export default async function TransfersPage() {
  await requireAdminSession();
  const transfers = await getPendingTransfers();
  return <TransfersClient initialTransfers={transfers} />;
}
