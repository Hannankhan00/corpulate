"use client";

import { useState, useTransition } from "react";
import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";
import { updateContactInfo, updateAddressInfo } from "@/app/actions/user";

// ── Shared Styling Constants ─────────────────────────────────────
const PAGE_BG =
  "radial-gradient(ellipse 60% 80% at 0% 50%, rgba(13,100,139,0.45) 0%, rgba(6,6,6,0) 55%), radial-gradient(ellipse 50% 70% at 100% 30%, rgba(65,18,38,0.55) 0%, rgba(6,6,6,0) 55%), #070707";

const CARD_STYLE = {
  background: "rgba(83,83,83,0.25)",
  border: "1px solid rgba(255,255,255,0.07)",
};

const BTN_GRADIENT = {
  background: "linear-gradient(90deg, #9452E8 12.5%, #C64CD3 29.3%, #E945A8 45.7%, #FF4AB3 61%, #FF5480 76%, #FF5B62 91.3%)",
  border: "1px solid #9f4dbc",
};

const BTN_SECONDARY = {
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.10)",
};

function inputClass(extra?: string) {
  return `w-full h-12 rounded-[10px] bg-[#1a1a1c] border border-white/20 px-4 text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-white/50 transition-colors ${extra ?? ""}`;
}

// ── Icons ─────────────────────────────────────────────────────

const LockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-white/40 group-hover:text-white/60 transition-colors">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0110 0v4" />
  </svg>
);

const EditIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const UserIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-brand-cyan">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const MailIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-brand-cyan">
    <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const MapPinIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-brand-cyan">
    <path d="M12 22s-8-4.5-8-11.8A8 8 0 0112 2a8 8 0 018 8.2c0 7.3-8 11.8-8 11.8z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-brand-cyan">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

// ── Types ─────────────────────────────────────────────────────

type UserInfo = {
  firstName: string;
  lastName: string;
  dateOfBirth: string | null;
  fatherName: string | null;
  motherName: string | null;
  email: string;
  phone: string | null;
  streetAddress: string | null;
  city: string | null;
  province: string | null;
  postalCode: string | null;
  addressCountry: string | null;
  passportNumber: string | null;
  nationalId: string | null;
  ssn: string | null;
  taxId: string | null;
};

// ── Helper Components ──────────────────────────────────────────

const InfoRow = ({ label, value }: { label: string; value: string | null | undefined }) => (
  <div className="py-3 border-b border-white/10 last:border-0 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
    <span className="text-xs uppercase tracking-wide text-white/50">{label}</span>
    <span className="text-sm text-white">{value || <span className="text-white/30 italic">Not provided</span>}</span>
  </div>
);

const EditableField = ({ label, name, value, type = "text" }: { label: string; name: string; value: string | null | undefined; type?: string }) => (
  <div>
    <label htmlFor={name} className="block text-xs text-white/50 mb-1.5 uppercase tracking-wide">{label}</label>
    <input
      id={name}
      name={name}
      type={type}
      defaultValue={value || ""}
      className={inputClass()}
    />
  </div>
);

export default function MyInfoClient({ user }: { user: UserInfo }) {
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  
  const [isPendingContact, startTransitionContact] = useTransition();
  const [isPendingAddress, startTransitionAddress] = useTransition();

  const handleContactSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransitionContact(async () => {
      await updateContactInfo(formData);
      setIsEditingContact(false);
    });
  };

  const handleAddressSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransitionAddress(async () => {
      await updateAddressInfo(formData);
      setIsEditingAddress(false);
    });
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: PAGE_BG }}>
      <Sidebar activeItem="my-information" />

      <main className="flex-1 overflow-y-auto p-4 md:p-6 scrollbar-thin">
        {/* Header Section */}
        <Header 
          firstName={user.firstName} 
          title="My Information" 
          subtitle="Manage your personal and contact details. Keep your profile updated for seamless application processing." 
        />

        <div className="w-full mt-6 flex flex-col gap-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Personal Details Card (Locked) */}
            <div className="rounded-[15px] p-6 group" style={CARD_STYLE}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <UserIcon /> Personal Details
                </h2>
                <div title="For security and legal compliance, these details cannot be changed after your initial onboarding. If you need to make a correction, please contact support." className="cursor-help">
                  <LockIcon />
                </div>
              </div>
              <div className="flex flex-col">
                <InfoRow label="First Name" value={user.firstName} />
                <InfoRow label="Last Name" value={user.lastName} />
                <InfoRow label="Date of Birth" value={user.dateOfBirth} />
                <InfoRow label="Father's Name" value={user.fatherName} />
                <InfoRow label="Mother's Name" value={user.motherName} />
              </div>
            </div>

            {/* Contact Information Card (Editable) */}
            <div className="rounded-[15px] p-6" style={CARD_STYLE}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <MailIcon /> Contact Info
                </h2>
                {!isEditingContact && (
                  <button 
                    onClick={() => setIsEditingContact(true)}
                    className="text-white/40 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide"
                  >
                    <EditIcon /> Edit
                  </button>
                )}
              </div>
              
              {isEditingContact ? (
                <form onSubmit={handleContactSubmit} className="flex flex-col gap-4">
                  <EditableField label="Email Address" name="email" value={user.email} type="email" />
                  <EditableField label="Phone Number" name="phone" value={user.phone} type="tel" />
                  
                  <div className="mt-2 flex justify-end gap-3 pt-4 border-t border-white/10">
                    <button 
                      type="button" 
                      onClick={() => setIsEditingContact(false)}
                      className="px-5 py-2.5 rounded-[10px] text-sm text-white/60 hover:text-white transition-colors cursor-pointer"
                      style={BTN_SECONDARY}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      disabled={isPendingContact}
                      className="px-6 py-2.5 rounded-[10px] text-sm font-semibold text-white cursor-pointer disabled:opacity-60 transition-opacity"
                      style={BTN_GRADIENT}
                    >
                      {isPendingContact ? "Saving…" : "Save"}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex flex-col">
                  <InfoRow label="Email Address" value={user.email} />
                  <InfoRow label="Phone Number" value={user.phone} />
                </div>
              )}
            </div>

            {/* Address Card (Editable) */}
            <div className="rounded-[15px] p-6" style={CARD_STYLE}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <MapPinIcon /> Address
                </h2>
                {!isEditingAddress && (
                  <button 
                    onClick={() => setIsEditingAddress(true)}
                    className="text-white/40 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide"
                  >
                    <EditIcon /> Edit
                  </button>
                )}
              </div>

              {isEditingAddress ? (
                <form onSubmit={handleAddressSubmit} className="flex flex-col gap-4">
                  <EditableField label="Street Address" name="streetAddress" value={user.streetAddress} />
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <EditableField label="City" name="city" value={user.city} />
                    <EditableField label="State / Province" name="province" value={user.province} />
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <EditableField label="Postal Code" name="postalCode" value={user.postalCode} />
                    <EditableField label="Country" name="addressCountry" value={user.addressCountry} />
                  </div>
                  
                  <div className="mt-2 flex justify-end gap-3 pt-4 border-t border-white/10">
                    <button 
                      type="button" 
                      onClick={() => setIsEditingAddress(false)}
                      className="px-5 py-2.5 rounded-[10px] text-sm text-white/60 hover:text-white transition-colors cursor-pointer"
                      style={BTN_SECONDARY}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      disabled={isPendingAddress}
                      className="px-6 py-2.5 rounded-[10px] text-sm font-semibold text-white cursor-pointer disabled:opacity-60 transition-opacity"
                      style={BTN_GRADIENT}
                    >
                      {isPendingAddress ? "Saving…" : "Save"}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex flex-col">
                  <InfoRow label="Street Address" value={user.streetAddress} />
                  <InfoRow label="City" value={user.city} />
                  <InfoRow label="State / Province" value={user.province} />
                  <InfoRow label="Postal Code" value={user.postalCode} />
                  <InfoRow label="Country" value={user.addressCountry} />
                </div>
              )}
            </div>

            {/* Identification Details Card (Locked) */}
            <div className="rounded-[15px] p-6 group" style={CARD_STYLE}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <ShieldIcon /> Identification
                </h2>
                <div title="For security and legal compliance, these details cannot be changed after your initial onboarding. If you need to make a correction, please contact support." className="cursor-help">
                  <LockIcon />
                </div>
              </div>
              <div className="flex flex-col">
                <InfoRow label="Passport Number" value={user.passportNumber} />
                <InfoRow label="National ID" value={user.nationalId} />
                <InfoRow label="SSN" value={user.ssn} />
                <InfoRow label="Tax ID" value={user.taxId} />
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
