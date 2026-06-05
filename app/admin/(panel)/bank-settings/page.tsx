import { requireAdminSession } from "@/app/actions/admin-auth";
import { getBankDetailsAdmin } from "@/app/actions/bankTransfer";
import BankSettingsClient from "./BankSettingsClient";

export default async function BankSettingsPage() {
  const admin = await requireAdminSession("ADMIN");
  void admin;

  const details = await getBankDetailsAdmin();

  const initial = {
    bankName:      details?.bankName      ?? "",
    accountName:   details?.accountName   ?? "",
    accountNumber: details?.accountNumber ?? "",
    sortCode:      details?.sortCode      ?? "",
    iban:          details?.iban          ?? "",
    swift:         details?.swift         ?? "",
    reference:     details?.reference     ?? "",
    notes:         details?.notes         ?? "",
  };

  return <BankSettingsClient initial={initial} />;
}
