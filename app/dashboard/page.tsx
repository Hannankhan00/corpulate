import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getActiveServiceCountries, getServiceCountryByIso } from "@/app/actions/admin-services";
import DashboardClient from "./DashboardClient";
import type { ServiceCountryOption } from "./DashboardClient";
import type { ModalField, ModalDoc, ModalUser } from "./PostPaymentModal";

const FALLBACK_COUNTRIES: ServiceCountryOption[] = [
  { isoCode: "GB", name: "United Kingdom" },
  { isoCode: "US", name: "United States" },
];

export type AppSummary = {
  id: string;
  companyName: string | null;
  country: string;
  status: string;
  isPaid: boolean;
  infoSubmitted: boolean;
  createdAt: string;
};

export type PendingInfoData = {
  appId: string;
  companyName: string | null;
  countryIso: string;
  countryName: string;
  fields: ModalField[];
  documents: ModalDoc[];
  user: ModalUser;
};

export default async function DashboardPage() {
  const session = await getSession();
  if (!session?.userId) redirect("/");

  const [user, dbCountries, applications] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        firstName:      true,
        dateOfBirth:    true,
        fatherName:     true,
        motherName:     true,
        passportNumber: true,
        nationalId:     true,
        ssn:            true,
        taxId:          true,
        streetAddress:  true,
        city:           true,
        province:       true,
        postalCode:     true,
        addressCountry: true,
      },
    }),
    getActiveServiceCountries(),
    prisma.application.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true, companyName: true, country: true,
        status: true, isPaid: true, infoSubmitted: true, createdAt: true,
      },
    }),
  ]);

  if (!user) redirect("/");

  const serviceCountries: ServiceCountryOption[] =
    dbCountries.length > 0
      ? dbCountries.map((c) => ({ isoCode: c.isoCode, name: c.name }))
      : FALLBACK_COUNTRIES;

  const apps: AppSummary[] = applications.map((a) => ({
    ...a,
    createdAt: a.createdAt.toISOString(),
  }));

  // Find first paid + unsubmitted application to show popup for
  const pendingInfoApp = applications.find((a) => a.isPaid && !a.infoSubmitted);

  let pendingInfoData: PendingInfoData | null = null;

  if (pendingInfoApp) {
    const countryIso = pendingInfoApp.country.toUpperCase();
    const sc = await getServiceCountryByIso(countryIso);
    const countryName =
      sc?.name ??
      serviceCountries.find((c) => c.isoCode === countryIso)?.name ??
      countryIso;

    const combinedAddress = [
      user.streetAddress, user.city, user.province, user.postalCode, user.addressCountry,
    ].filter(Boolean).join(", ");

    pendingInfoData = {
      appId:       pendingInfoApp.id,
      companyName: pendingInfoApp.companyName,
      countryIso,
      countryName,
      fields:      sc?.fields.map((f) => ({ fieldKey: f.fieldKey, isRequired: f.isRequired })) ?? [],
      documents:   sc?.documents.map((d) => ({ name: d.name, description: d.description, isRequired: d.isRequired })) ?? [],
      user: {
        dateOfBirth:    user.dateOfBirth,
        fatherName:     user.fatherName,
        motherName:     user.motherName,
        passportNumber: user.passportNumber,
        nationalId:     user.nationalId,
        ssn:            user.ssn,
        taxId:          user.taxId,
        address:        combinedAddress || null,
      },
    };
  }

  return (
    <DashboardClient
      firstName={user.firstName}
      serviceCountries={serviceCountries}
      applications={apps}
      pendingInfoData={pendingInfoData}
    />
  );
}
