"use client";

import React, { useState, useTransition } from "react";
import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";
import { addAddress, deleteAddress } from "@/app/actions/userAddresses";
import ReactCountryFlag from "react-country-flag";

const PAGE_BG =
  "radial-gradient(ellipse 60% 80% at 0% 50%, rgba(13,100,139,0.45) 0%, rgba(6,6,6,0) 55%), radial-gradient(ellipse 50% 70% at 100% 30%, rgba(65,18,38,0.55) 0%, rgba(6,6,6,0) 55%), #070707";

const CARD_STYLE = {
  background: "rgba(83,83,83,0.25)",
  border: "1px solid rgba(255,255,255,0.07)",
};

const inputCls = "w-full h-11 bg-elevated border border-border-default rounded-lg px-4 text-fg text-sm placeholder:text-fg-muted focus:outline-none focus:border-brand-cyan focus:shadow-[0_0_0_3px_rgba(6,182,212,0.15)] transition-all duration-150";

type Address = {
  id: string;
  label: string;
  streetAddress: string;
  city: string;
  province: string;
  postalCode: string;
  addressCountry: string;
  isDefault: boolean;
};

export default function MyAddressesClient({ user, addresses }: { user: { firstName: string }, addresses: Address[] }) {
  const [isPending, startTransition] = useTransition();
  const [showAddForm, setShowAddForm] = useState(false);

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to delete this address?")) return;
    startTransition(async () => {
      await deleteAddress(id);
    });
  };

  const handleAddSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      await addAddress(formData);
      setShowAddForm(false);
    });
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: PAGE_BG }}>
      <Sidebar activeItem="addresses" />

      <main className="flex-1 overflow-y-auto p-4 md:p-6 scrollbar-thin">
        <Header 
          firstName={user.firstName} 
          title="My Addresses" 
          subtitle="Manage your saved addresses for company registration and shipping." 
        />

        <div className="w-full mt-6 flex flex-col gap-6 max-w-4xl">
          <div className="rounded-[15px] p-6" style={CARD_STYLE}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-white/10">
              <div>
                <h2 className="text-xl font-bold text-white">Saved Addresses</h2>
                <p className="text-sm text-white/50 mt-1">
                  These addresses can be used to quickly autofill registration forms.
                </p>
              </div>

              {!showAddForm && (
                <button
                  type="button"
                  onClick={() => setShowAddForm(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white cursor-pointer transition-all duration-200 hover:opacity-90 active:scale-95"
                  style={{ background: "linear-gradient(90deg, #9452E8 12.5%, #FF5B62 91.3%)" }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Add New Address
                </button>
              )}
            </div>

            {showAddForm && (
              <form onSubmit={handleAddSubmit} className="mb-8 p-5 rounded-xl border border-white/10 bg-black/20">
                <h3 className="text-lg font-semibold text-white mb-4">Add New Address</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs text-white/50 mb-1.5 uppercase tracking-wide">Label (e.g. Home, Office)</label>
                    <input name="label" required placeholder="Home" className={inputCls} />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs text-white/50 mb-1.5 uppercase tracking-wide">Street Address</label>
                    <input name="streetAddress" required placeholder="123 Main St, Apt 4B" className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-xs text-white/50 mb-1.5 uppercase tracking-wide">City</label>
                    <input name="city" required placeholder="London" className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-xs text-white/50 mb-1.5 uppercase tracking-wide">State / Province</label>
                    <input name="province" required placeholder="Ontario" className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-xs text-white/50 mb-1.5 uppercase tracking-wide">Postal / ZIP Code</label>
                    <input name="postalCode" required placeholder="SW1A 1AA" className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-xs text-white/50 mb-1.5 uppercase tracking-wide">Country</label>
                    <input name="addressCountry" required placeholder="United Kingdom" className={inputCls} />
                  </div>
                </div>

                <label className="flex items-center gap-2 mb-6 cursor-pointer">
                  <input type="checkbox" name="isDefault" className="w-4 h-4 rounded accent-brand-cyan" />
                  <span className="text-sm text-white/70">Set as default address</span>
                </label>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={isPending}
                    className="px-5 py-2 rounded-lg text-sm font-semibold text-white bg-brand-cyan hover:bg-brand-cyan/80 transition-colors disabled:opacity-50"
                  >
                    {isPending ? "Saving..." : "Save Address"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-5 py-2 rounded-lg text-sm font-semibold text-white/70 bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {addresses.length === 0 && !showAddForm ? (
                <div className="col-span-2 py-12 text-center text-white/40">
                  <p>You have no saved addresses yet.</p>
                </div>
              ) : (
                addresses.map((address) => (
                  <div key={address.id} className="relative p-5 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                    {address.isDefault && (
                      <span className="absolute top-4 right-4 text-[10px] uppercase tracking-wider font-bold text-brand-cyan bg-brand-cyan/10 px-2 py-1 rounded-md">
                        Default
                      </span>
                    )}
                    <h4 className="text-white font-semibold text-base mb-2 flex items-center gap-2">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-brand-cyan">
                        <path d="M12 22s-8-4.5-8-11.8A8 8 0 0112 2a8 8 0 018 8.2c0 7.3-8 11.8-8 11.8z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      {address.label}
                    </h4>
                    <p className="text-sm text-white/60 mb-1">{address.streetAddress}</p>
                    <p className="text-sm text-white/60 mb-1">
                      {address.city}, {address.province} {address.postalCode}
                    </p>
                    <p className="text-sm text-white/60 mb-4">{address.addressCountry}</p>
                    
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleDelete(address.id)}
                        disabled={isPending}
                        className="text-xs font-medium text-rose-400 hover:text-rose-300 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
