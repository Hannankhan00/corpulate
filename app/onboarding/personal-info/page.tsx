import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import PersonalInfoForm from "./PersonalInfoForm";
import Sidebar from "@/app/components/Sidebar";

const PAGE_BG =
  "radial-gradient(ellipse 60% 80% at 0% 50%, rgba(13,100,139,0.45) 0%, rgba(6,6,6,0) 55%), radial-gradient(ellipse 50% 70% at 100% 30%, rgba(65,18,38,0.55) 0%, rgba(6,6,6,0) 55%), #070707";

const STEPS = [
  { id: 1, label: "Personal Information" },
  { id: 2, label: "Company Type" },
  { id: 3, label: "Plan Selection" },
  { id: 4, label: "State Selection" },
  { id: 5, label: "Company Information" },
  { id: 6, label: "Add-ons" },
  { id: 7, label: "Payment" },
];

function Stepper({ current }: { current: number }) {
  return (
    <div
      className="hidden md:flex w-65 shrink-0 rounded-[15px] p-7 flex-col"
      style={{ background: "rgba(20,20,22,0.85)", border: "1px solid rgba(255,255,255,0.07)" }}
    >
      <p className="text-xs font-bold tracking-widest uppercase text-white/40 mb-8">Setup Progress</p>
      <div className="flex flex-col flex-1">
        {STEPS.map((step, i) => {
          const done    = step.id < current;
          const active  = step.id === current;
          const pending = step.id > current;
          return (
            <div key={step.id} className="flex items-start gap-4">
              <div className="flex flex-col items-center">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                  style={{
                    background: active ? "linear-gradient(135deg, #9452E8, #FF5B62)" : done ? "#10B981" : "rgba(255,255,255,0.07)",
                    border: pending ? "1px solid rgba(255,255,255,0.15)" : "none",
                    color: pending ? "rgba(255,255,255,0.3)" : "white",
                  }}
                >
                  {done ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" width={15} height={15}>
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  ) : step.id}
                </div>
                {i < STEPS.length - 1 && (
                  <div className="w-px mt-1" style={{ height: "36px", background: done ? "#10B981" : "rgba(255,255,255,0.10)" }} />
                )}
              </div>
              <div className="pt-1.5 pb-9">
                <p
                  className="text-sm font-medium leading-tight"
                  style={{ color: active ? "white" : done ? "rgba(255,255,255,0.65)" : "rgba(255,255,255,0.30)" }}
                >
                  {step.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>
      <button
        type="button"
        className="mt-auto flex items-center gap-2.5 w-full px-4 py-3 rounded-[10px] text-sm text-white/70 hover:text-white transition-colors duration-150 cursor-pointer"
        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)" }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" width={16} height={16}>
          <path d="M3 18v-6a9 9 0 0118 0v6" />
          <path d="M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3v5zM3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3v5z" />
        </svg>
        <span className="leading-tight">Schedule a meeting with our team</span>
      </button>
    </div>
  );
}

export default async function PersonalInfoPage({
  searchParams,
}: {
  searchParams: Promise<{ country?: string }>;
}) {
  const session = await getSession();
  if (!session?.userId) redirect("/");

  const { country: countryParam } = await searchParams;
  const country = countryParam ?? "uk";

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      firstName:      true,
      lastName:       true,
      email:          true,
      phone:          true,
      streetAddress:  true,
      city:           true,
      province:       true,
      postalCode:     true,
      addressCountry: true,
    },
  });

  if (!user) redirect("/");

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: PAGE_BG }}>
      <Sidebar countryCode="US" activeItem="home" />

      <main className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col gap-4">
        {/* Header bar */}
        <div
          className="flex items-center gap-3 rounded-[50px] pl-12 pr-4 md:px-5 py-3.5 shrink-0"
          style={{ background: "#1a1a1c", boxShadow: "5px 5px 4px 2px rgba(0,0,0,0.3)" }}
        >
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
            style={{ background: "linear-gradient(135deg,#7C3AED,#06B6D4)" }}
          >
            {user.firstName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <p className="font-semibold text-fg text-sm">Complete your profile</p>
            <p className="text-xs text-fg-muted mt-0.5">Step 1 of 5: Personal Information</p>
          </div>
          <div className="flex gap-2">
            <button type="button" className="w-9 h-9 rounded-full flex items-center justify-center text-white border border-white cursor-pointer hover:bg-white/10 transition-colors" style={{ background: "#1a1a1c" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" width={16} height={16}>
                <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
              </svg>
            </button>
            <Link href="/dashboard" className="w-9 h-9 rounded-full flex items-center justify-center text-white border border-white cursor-pointer hover:bg-white/10 transition-colors" style={{ background: "#1a1a1c" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" width={16} height={16}>
                <path d="M18.36 6.64A9 9 0 1112 3" /><path d="M12 2v10" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Content */}
        <div className="flex gap-5 flex-1 min-h-0">
          <Stepper current={1} />

          <div
            className="flex-1 rounded-[15px] p-4 md:p-8 flex flex-col overflow-hidden"
            style={{ background: "rgba(83,83,83,0.25)", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <h2 className="text-xl font-bold text-white mb-1">Personal Information</h2>
            <p className="text-sm text-white/50 mb-8">
              Please provide your personal details to get started with your company formation.
            </p>

            <PersonalInfoForm country={country} user={user} />
          </div>
        </div>
      </main>
    </div>
  );
}
