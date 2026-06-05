import { getAllPromoCodes } from "@/app/actions/promo";
import PromoCodesClient from "./PromoCodesClient";

export default async function PromoCodesPage() {
  const codes = await getAllPromoCodes();
  return <PromoCodesClient codes={codes} />;
}
