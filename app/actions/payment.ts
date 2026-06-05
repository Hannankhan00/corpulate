"use server";

import Stripe from "stripe";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { redeemPromoCode } from "@/app/actions/promo";

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) throw new Error("STRIPE_SECRET_KEY is not set");
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

export async function createPaymentIntent(amountCents: number): Promise<{ clientSecret: string }> {
  const session = await getSession();
  if (!session?.userId) redirect("/");

  const stripe = getStripe();
  const intent = await stripe.paymentIntents.create({
    amount: amountCents,
    currency: "usd",
    automatic_payment_methods: { enabled: true },
  });

  if (!intent.client_secret) throw new Error("Failed to create payment intent");
  return { clientSecret: intent.client_secret };
}

export async function finalizeApplication(data: {
  companyName: string;
  companyName2?: string | null;
  companyName3?: string | null;
  description?: string | null;
  industry?: string | null;
  revenue?: string | null;
  website?: string | null;
  country: string;
  companyType: string;
  plan: string;
  billingPeriod: string;
  state?: string | null;
  addons?: string | null;
  stripePaymentId: string;
  amountPaid: number;
  promoCode?: string | null;
  discountAmount?: number | null;
}) {
  const session = await getSession();
  if (!session?.userId) redirect("/");

  await prisma.application.create({
    data: {
      userId:          session.userId,
      companyName:     data.companyName    || null,
      companyName2:    data.companyName2   || null,
      companyName3:    data.companyName3   || null,
      description:     data.description   || null,
      industry:        data.industry      || null,
      revenue:         data.revenue       || null,
      website:         data.website       || null,
      companyType:     data.companyType,
      plan:            data.plan,
      billingPeriod:   data.billingPeriod,
      state:           data.state         || null,
      country:         data.country,
      addons:          data.addons        || null,
      stripePaymentId: data.stripePaymentId,
      amountPaid:      data.amountPaid,
      promoCode:       data.promoCode     || null,
      discountAmount:  data.discountAmount || null,
      isPaid:          true,
      status:          "pending",
    },
  });

  if (data.promoCode) await redeemPromoCode(data.promoCode);

  redirect("/dashboard");
}
