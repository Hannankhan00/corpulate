import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import MyInfoClient from "./MyInfoClient";

export default async function MyInformationPage() {
  const session = await getSession();
  if (!session?.userId) redirect("/");

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
  });

  if (!user) redirect("/");

  // Transform User from DB to match UserInfo expected by Client
  const userInfo = {
    firstName: user.firstName,
    lastName: user.lastName,
    dateOfBirth: user.dateOfBirth,
    fatherName: user.fatherName,
    motherName: user.motherName,
    email: user.email,
    phone: user.phone,
    streetAddress: user.streetAddress,
    city: user.city,
    province: user.province,
    postalCode: user.postalCode,
    addressCountry: user.addressCountry,
    passportNumber: user.passportNumber,
    nationalId: user.nationalId,
    ssn: user.ssn,
    taxId: user.taxId,
  };

  return <MyInfoClient user={userInfo} />;
}
