"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ReactCountryFlag from "react-country-flag";
import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";
import PostPaymentModal from "./PostPaymentModal";
import type { AppSummary, PendingInfoData } from "./page";

// ── Icons ─────────────────────────────────────────────────────

const BellIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" width={18} height={18}>
    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
  </svg>
);

const PowerIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" width={18} height={18}>
    <path d="M18.36 6.64A9 9 0 1112 3" /><path d="M12 2v10" />
  </svg>
);

// ── Illustrations ─────────────────────────────────────────────

const StartCompanyIllustration = () => (
  <svg viewBox="0 0 340 200" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
    <ellipse cx="170" cy="120" rx="130" ry="80" fill="rgba(124,58,237,0.12)" />
    <rect x="42" y="105" width="44" height="75" rx="3" fill="#2E1065" />
    <rect x="47" y="112" width="13" height="10" rx="1" fill="#06B6D4" fillOpacity="0.7" />
    <rect x="65" y="112" width="13" height="10" rx="1" fill="#06B6D4" fillOpacity="0.4" />
    <rect x="47" y="128" width="13" height="10" rx="1" fill="#fff" fillOpacity="0.18" />
    <rect x="65" y="128" width="13" height="10" rx="1" fill="#06B6D4" fillOpacity="0.7" />
    <rect x="47" y="144" width="13" height="10" rx="1" fill="#06B6D4" fillOpacity="0.5" />
    <rect x="65" y="144" width="13" height="10" rx="1" fill="#fff" fillOpacity="0.18" />
    <rect x="110" y="48" width="60" height="132" rx="4" fill="#3B0764" />
    <rect x="114" y="54" width="52" height="120" rx="2" fill="#4C1D95" />
    <rect x="117" y="57" width="46" height="4" rx="1" fill="#06B6D4" fillOpacity="0.5" />
    <rect x="117" y="67" width="46" height="4" rx="1" fill="#06B6D4" fillOpacity="0.3" />
    <rect x="117" y="77" width="46" height="4" rx="1" fill="#06B6D4" fillOpacity="0.5" />
    <rect x="117" y="87" width="46" height="4" rx="1" fill="#06B6D4" fillOpacity="0.3" />
    <rect x="118" y="96" width="10" height="8" rx="1" fill="#06B6D4" fillOpacity="0.8" />
    <rect x="133" y="96" width="10" height="8" rx="1" fill="#fff" fillOpacity="0.25" />
    <rect x="148" y="96" width="10" height="8" rx="1" fill="#06B6D4" fillOpacity="0.8" />
    <circle cx="140" cy="42" r="5" fill="#FDE68A" />
    <path d="M135 52q5-7 10 0v4h-10z" fill="#10B981" />
    <rect x="192" y="72" width="52" height="108" rx="3" fill="#2E1065" />
    <rect x="196" y="78" width="44" height="96" rx="2" fill="#4C1D95" />
    <rect x="199" y="82" width="38" height="3" rx="1" fill="#06B6D4" fillOpacity="0.45" />
    <circle cx="82" cy="122" r="11" fill="#FDE68A" />
    <path d="M68 142q14-14 28 0v28H68z" fill="#059669" />
    <line x1="20" y1="182" x2="320" y2="182" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
  </svg>
);

const BuyServiceIllustration = () => (
  <svg viewBox="0 0 340 200" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
    <ellipse cx="170" cy="115" rx="125" ry="80" fill="rgba(124,58,237,0.12)" />
    <path d="M60 180 Q30 120 55 60 Q85 90 60 180z" fill="#065F46" />
    <path d="M280 180 Q310 120 285 55 Q255 88 280 180z" fill="#065F46" />
    <circle cx="170" cy="108" r="13" fill="#FDE68A" />
    <path d="M155 130q15-14 30 0v32H155z" fill="#7C3AED" />
    <path d="M155 138L120 112" stroke="#FDE68A" strokeWidth="5" strokeLinecap="round" />
    <circle cx="118" cy="110" r="5" fill="#FDE68A" />
    <path d="M185 138L218 112" stroke="#FDE68A" strokeWidth="5" strokeLinecap="round" />
    <circle cx="220" cy="110" r="5" fill="#FDE68A" />
    <line x1="20" y1="182" x2="320" y2="182" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
  </svg>
);

// ── Types ─────────────────────────────────────────────────────

export type ServiceCountryOption = {
  isoCode: string;
  name: string;
};

// ── Country Modal ─────────────────────────────────────────────

function CountryModal({
  countries,
  selected,
  onSelect,
  onSave,
  onClose,
  mode,
}: {
  countries: ServiceCountryOption[];
  selected: string;
  onSelect: (isoCode: string) => void;
  onSave: () => void;
  onClose: () => void;
  mode: "start" | "change";
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="relative w-full max-w-120 rounded-[20px] overflow-hidden"
        style={{ background: "#111118", border: "1px solid rgba(255,255,255,0.10)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/8">
          <h2 className="font-bold text-white text-[15px]">
            {mode === "start" ? "Select Incorporation Country" : "Change Country"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" width={14} height={14}>
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Flag illustration of selected */}
        <div className="flex justify-center pt-6 pb-2">
          <div className="relative flex items-center justify-center" style={{ width: 144, height: 144 }}>
            <div className="absolute inset-0 rounded-full" style={{ background: "radial-gradient(circle, rgba(148,82,232,0.18) 0%, transparent 70%)" }} />
            <div className="absolute rounded-full" style={{ inset: "14px", background: "rgba(148,82,232,0.08)", border: "1px solid rgba(148,82,232,0.15)" }} />
            <div className="absolute rounded-full" style={{ inset: "28px", background: "linear-gradient(135deg, #0d0d1a 0%, #1a1a2e 100%)", border: "1px solid rgba(255,255,255,0.10)" }} />
            <ReactCountryFlag
              countryCode={selected}
              svg
              style={{ position: "relative", width: "58px", height: "58px", borderRadius: "10px", boxShadow: "0 6px 24px rgba(0,0,0,0.55)", border: "1.5px solid rgba(255,255,255,0.18)" }}
            />
          </div>
        </div>

        {/* Body */}
        <div className="px-6 pb-2 text-center">
          <p className="font-semibold text-white text-[15px] mb-2">
            {mode === "start"
              ? "Where would you like to register your company?"
              : "Are you sure you want to change the country you will be transacting in?"}
          </p>
          <p className="text-xs text-white/45 leading-relaxed">
            Choose the one that suits you among the countries that Corpulate serves.
            {mode === "change" && " Please note that you cannot change countries after purchasing a service."}
          </p>
        </div>

        {/* Country cards */}
        <div className="grid grid-cols-2 gap-3 px-6 py-5">
          {countries.map((c) => {
            const active = selected === c.isoCode;
            return (
              <button
                key={c.isoCode}
                type="button"
                onClick={() => onSelect(c.isoCode)}
                className="flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-150 cursor-pointer"
                style={{
                  background: active ? "rgba(148,82,232,0.15)" : "rgba(255,255,255,0.04)",
                  border: active ? "1.5px solid rgba(148,82,232,0.55)" : "1px solid rgba(255,255,255,0.10)",
                }}
              >
                <ReactCountryFlag countryCode={c.isoCode} svg style={{ width: "2em", height: "2em", borderRadius: "4px", flexShrink: 0 }} />
                <span className="font-semibold text-sm text-white flex-1 text-left">{c.name}</span>
                <div
                  className="w-4 h-4 rounded-full shrink-0 flex items-center justify-center"
                  style={{
                    border: active ? "none" : "1.5px solid rgba(255,255,255,0.25)",
                    background: active ? "linear-gradient(135deg,#9452E8,#FF5B62)" : "transparent",
                  }}
                >
                  {active && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Save button */}
        <div className="px-6 pb-6">
          <button
            type="button"
            onClick={onSave}
            className="w-full h-12 rounded-xl font-bold text-white text-sm cursor-pointer transition-opacity hover:opacity-90"
            style={{ background: "linear-gradient(90deg, #9452E8 12.5%, #C64CD3 29.3%, #E945A8 45.7%, #FF4AB3 61%, #FF5480 76%, #FF5B62 91.3%)" }}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Dashboard Client ──────────────────────────────────────────

const PAGE_BG =
  "radial-gradient(ellipse 60% 80% at 0% 50%, rgba(13,100,139,0.45) 0%, rgba(6,6,6,0) 55%), radial-gradient(ellipse 50% 70% at 100% 30%, rgba(65,18,38,0.55) 0%, rgba(6,6,6,0) 55%), #070707";

export default function DashboardClient({
  firstName,
  serviceCountries,
  applications,
  pendingInfoData,
}: {
  firstName: string;
  serviceCountries: ServiceCountryOption[];
  applications: AppSummary[];
  pendingInfoData: PendingInfoData | null;
}) {
  const router = useRouter();
  const [activeIso, setActiveIso]     = useState(serviceCountries[0]?.isoCode ?? "GB");
  const [modalOpen, setModalOpen]     = useState(false);
  const [modalMode, setModalMode]     = useState<"start" | "change">("start");
  const [pendingIso, setPendingIso]   = useState(activeIso);

  const activeMeta = serviceCountries.find((c) => c.isoCode === activeIso) ?? serviceCountries[0];
  const isUS = activeIso === "US";
  const shortName = activeIso === "GB" ? "UK" : activeIso;
  const entityLabel = isUS ? "LLC" : activeIso === "GB" ? "Ltd company" : "company";
  const filingDesc  = isUS
    ? "EIN application, and state filing"
    : activeIso === "GB"
    ? "Companies House filing, and HMRC setup"
    : "local filing and registration";

  function openModal(mode: "start" | "change") {
    setPendingIso(activeIso);
    setModalMode(mode);
    setModalOpen(true);
  }

  function handleSave() {
    setActiveIso(pendingIso);
    setModalOpen(false);
    if (modalMode === "start") {
      router.push(`/onboarding/personal-info?country=${pendingIso.toLowerCase()}`);
    }
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: PAGE_BG }}>
      <Sidebar countryCode={activeIso} activeItem="home" />

      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        {/* Welcome bar */}
        <Header firstName={firstName} />

        {/* Info banner */}
        <div className="flex flex-wrap items-center gap-3 rounded-[15px] px-4 md:px-5 py-4 mb-6" style={{ background: "rgba(83,83,83,0.49)", boxShadow: "5px 5px 4px 2px rgba(0,0,0,0.5)" }}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: "rgba(109,40,217,0.35)", border: "1px solid rgba(139,92,246,0.4)" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#C4B5FD" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" width={14} height={14}>
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="8.5" strokeWidth={2.5} />
              <line x1="12" y1="12" x2="12" y2="16" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-fg">
              You are currently taking action for {activeMeta?.name ?? activeIso}.
            </p>
            <p className="text-xs mt-0.5" style={{ color: "#C4B5FD" }}>
              If you want to change the country, click the button on the right.
            </p>
          </div>
          <button
            type="button"
            onClick={() => openModal("change")}
            className="flex items-center gap-2 px-3 md:px-4 py-2 border border-white rounded-[10px] text-sm text-white hover:bg-white/10 transition-colors duration-150 cursor-pointer"
            style={{ background: "#1a1a1c" }}
          >
            <ReactCountryFlag countryCode={activeIso} svg style={{ width: "1.4em", height: "1.4em", borderRadius: "3px" }} />
            <span>{activeMeta?.name ?? activeIso}</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={14} height={14}>
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Service cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="rounded-[15px] overflow-hidden flex flex-col" style={{ background: "rgba(83,83,83,0.49)", boxShadow: "5px 5px 4px 2px rgba(0,0,0,0.5)" }}>
            <div className="h-40 md:h-52 flex items-end justify-center px-4 pt-4 rounded-[30px] mx-2 mt-2" style={{ background: "linear-gradient(90deg, rgba(214,68,167,0.8) 6.25%, rgba(159,77,188,0.8) 36%, rgba(159,77,188,0.8) 69%, rgba(174,73,196,0.5) 94%)" }}>
              <StartCompanyIllustration />
            </div>
            <div className="px-6 py-5 flex flex-col flex-1">
              <h3 className="font-bold text-white text-lg leading-snug mb-2">I don&apos;t have a company. I want to register one.</h3>
              <p className="text-sm leading-relaxed mb-5" style={{ color: "#B4B4D4" }}>
                Register your {shortName} {entityLabel} entirely online in days. We handle the paperwork, registered agent, {filingDesc} so you can focus on building your business.
              </p>
              <button
                type="button"
                onClick={() => openModal("start")}
                className="self-start px-6 py-2.5 rounded-full text-sm font-semibold cursor-pointer text-white border border-[#9f4dbc]"
                style={{ background: "linear-gradient(90deg, #9452E8 12.5%, #C64CD3 29.3%, #E945A8 45.7%, #FF4AB3 61%, #FF5480 76%, #FF5B62 91.3%)" }}
              >
                Start a Company
              </button>
            </div>
          </div>

          <div className="rounded-[15px] overflow-hidden flex flex-col" style={{ background: "rgba(83,83,83,0.49)", boxShadow: "5px 5px 4px 2px rgba(0,0,0,0.5)" }}>
            <div className="h-40 md:h-52 flex items-end justify-center px-4 pt-4 rounded-[30px] mx-2 mt-2" style={{ background: "linear-gradient(90deg, rgba(214,68,167,0.8) 6.25%, rgba(159,77,188,0.8) 36%, rgba(159,77,188,0.8) 69%, rgba(174,73,196,0.5) 94%)" }}>
              <BuyServiceIllustration />
            </div>
            <div className="px-6 py-5 flex flex-col flex-1">
              <h3 className="font-bold text-white text-lg leading-snug mb-2">I have a company. I want to purchase services.</h3>
              <p className="text-sm leading-relaxed mb-5" style={{ color: "#B4B4D4" }}>
                Access bookkeeping, tax management, business banking, registered address, and trademark services for your existing {shortName} company, all from one dashboard.
              </p>
              <button
                type="button"
                onClick={() => router.push("/dashboard/services")}
                className="self-start px-6 py-2.5 rounded-full text-sm font-semibold cursor-pointer text-white border border-[#9f4dbc] hover:opacity-90 active:scale-[0.98] transition-all"
                style={{ background: "linear-gradient(90deg, #9452E8 12.5%, #C64CD3 29.3%, #E945A8 45.7%, #FF4AB3 61%, #FF5480 76%, #FF5B62 91.3%)" }}
              >
                Buy Service
              </button>
            </div>
          </div>
        </div>

        {/* Applications */}
        {applications.length > 0 && (
          <div className="mt-6">
            <p className="text-xs font-bold uppercase tracking-widest text-white/40 mb-3">Your Applications</p>
            <div className="flex flex-col gap-3">
              {applications.map((app) => {
                const iso = app.country.toUpperCase();
                const date = new Date(app.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

                return (
                  <div
                    key={app.id}
                    className="flex flex-wrap items-center gap-3 rounded-xl px-4 md:px-5 py-4"
                    style={{ background: "rgba(83,83,83,0.35)", border: "1px solid rgba(255,255,255,0.08)" }}
                  >
                    <ReactCountryFlag countryCode={iso} svg style={{ width: "2em", height: "2em", borderRadius: "4px", flexShrink: 0 }} />

                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-white truncate">{app.companyName ?? "Unnamed Company"}</p>
                      <p className="text-xs text-white/40 mt-0.5">{date}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      {/* Status badge */}
                      <span
                        className="text-[11px] font-bold uppercase px-2.5 py-1 rounded-full"
                        style={
                          app.status === "approved"
                            ? { background: "rgba(16,185,129,0.12)", color: "#34D399" }
                            : app.status === "rejected"
                            ? { background: "rgba(239,68,68,0.12)", color: "#F87171" }
                            : { background: "rgba(251,191,36,0.10)", color: "#FCD34D" }
                        }
                      >
                        {app.status}
                      </span>

                      {/* Info submitted tag */}
                      {app.infoSubmitted && (
                        <span
                          className="text-[11px] font-bold uppercase px-2.5 py-1 rounded-full"
                          style={{ background: "rgba(148,82,232,0.12)", color: "#C4B5FD" }}
                        >
                          Info Submitted
                        </span>
                      )}

                      {/* Paid but not yet submitted */}
                      {app.isPaid && !app.infoSubmitted && (
                        <span
                          className="text-[11px] font-bold uppercase px-2.5 py-1 rounded-full"
                          style={{ background: "rgba(234,88,12,0.12)", color: "#FB923C" }}
                        >
                          Awaiting Info
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {modalOpen && (
        <CountryModal
          countries={serviceCountries}
          selected={pendingIso}
          onSelect={setPendingIso}
          onSave={handleSave}
          onClose={() => setModalOpen(false)}
          mode={modalMode}
        />
      )}

      {pendingInfoData && (
        <PostPaymentModal
          applicationId={pendingInfoData.appId}
          companyName={pendingInfoData.companyName}
          countryName={pendingInfoData.countryName}
          fields={pendingInfoData.fields}
          documents={pendingInfoData.documents}
          user={pendingInfoData.user}
        />
      )}
    </div>
  );
}
