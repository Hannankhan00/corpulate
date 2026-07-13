"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { adminLogout } from "@/app/actions/admin-auth";
import type { AdminRole } from "@/lib/admin-session";

const ROLE_LABEL: Record<AdminRole, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
  SUPPORT: "Support",
};

const ROLE_COLOR: Record<AdminRole, { bg: string; color: string; border: string }> = {
  SUPER_ADMIN: {
    bg: "rgba(148,82,232,0.18)",
    color: "#C64CD3",
    border: "rgba(148,82,232,0.3)",
  },
  ADMIN: {
    bg: "rgba(59,130,246,0.18)",
    color: "#60A5FA",
    border: "rgba(59,130,246,0.3)",
  },
  SUPPORT: {
    bg: "rgba(16,185,129,0.15)",
    color: "#34D399",
    border: "rgba(16,185,129,0.25)",
  },
};

const OverviewIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" width={18} height={18}>
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
);

const CustomersIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" width={18} height={18}>
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
  </svg>
);

const WorkQueueIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" width={18} height={18}>
    <path d="M9 11l3 3L22 4" />
    <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
  </svg>
);

const TeamIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" width={18} height={18}>
    <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 00-3-3.87" />
    <path d="M16 3.13a4 4 0 010 7.75" />
  </svg>
);

const CountriesIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" width={18} height={18}>
    <circle cx="12" cy="12" r="10" />
    <path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20" />
  </svg>
);

const ServicesIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" width={18} height={18}>
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </svg>
);

const PlansIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" width={18} height={18}>
    <rect x="2" y="3" width="20" height="14" rx="2" />
    <path d="M8 21h8M12 17v4" />
    <path d="M7 8h.01M11 8h6M7 12h.01M11 12h6" />
  </svg>
);

const PromoIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" width={18} height={18}>
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
    <line x1="7" y1="7" x2="7.01" y2="7" />
  </svg>
);

const MenuIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={20} height={20}>
    <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const XIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={18} height={18}>
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
);

const NoticesIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" width={18} height={18}>
    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
  </svg>
);

const NAV_BASE = [
  { id: "overview",   label: "Overview",    href: "/admin",            icon: <OverviewIcon /> },
  { id: "customers",  label: "Customers",   href: "/admin/customers",  icon: <CustomersIcon /> },
  { id: "work-queue", label: "Work Queue",  href: "/admin/work-queue", icon: <WorkQueueIcon /> },
  { id: "notices",    label: "Notices",     href: "/admin/notices",    icon: <NoticesIcon /> },
];

const NAV_TEAM = {
  id: "team", label: "Team", href: "/admin/team", icon: <TeamIcon />,
};

const NAV_COUNTRIES = {
  id: "countries", label: "Countries", href: "/admin/countries", icon: <CountriesIcon />,
};

const NAV_SERVICES = {
  id: "services", label: "Services", href: "/admin/services", icon: <ServicesIcon />,
};

const NAV_PLANS = {
  id: "plans", label: "Plans", href: "/admin/plans", icon: <PlansIcon />,
};

const NAV_PROMO = {
  id: "promo-codes", label: "Promo Codes", href: "/admin/promo-codes", icon: <PromoIcon />,
};

const NAV_PAYMENTS = {
  id: "payments", label: "Payments", href: "/admin/payments",
  icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" width={18} height={18}>
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
    </svg>
  ),
};

const NAV_TRANSFERS = {
  id: "transfers", label: "Transfers", href: "/admin/transfers",
  icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" width={18} height={18}>
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  ),
};

const NAV_BANK_SETTINGS = {
  id: "bank-settings", label: "Bank Settings", href: "/admin/bank-settings",
  icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" width={18} height={18}>
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
};

export default function AdminSidebar({
  name,
  role,
}: {
  name: string;
  role: AdminRole;
}) {
  const pathname = usePathname();
  const roleStyle = ROLE_COLOR[role];
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems =
    role === "SUPPORT"
      ? [...NAV_BASE, NAV_PAYMENTS, NAV_TRANSFERS]
      : [...NAV_BASE, NAV_COUNTRIES, NAV_PLANS, NAV_SERVICES, NAV_PROMO, NAV_PAYMENTS, NAV_TRANSFERS, NAV_BANK_SETTINGS, NAV_TEAM];

  function isActive(href: string) {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  }

  return (
    <>
      {/* Mobile hamburger trigger */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-60 md:hidden w-9 h-9 flex items-center justify-center rounded-lg text-white transition-colors hover:bg-white/10"
        style={{ background: "rgba(26,26,28,0.9)", border: "1px solid rgba(255,255,255,0.15)" }}
        aria-label="Open navigation"
      >
        <MenuIcon />
      </button>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-55 md:hidden"
          style={{ background: "rgba(0,0,0,0.6)" }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={[
          "flex flex-col border-r border-white/6 overflow-y-auto",
          "fixed inset-y-0 left-0 z-60 w-52 transition-transform duration-300 ease-in-out",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
          "md:relative md:translate-x-0 md:z-auto md:shrink-0",
        ].join(" ")}
        style={{ background: "rgba(26,26,28,0.95)", backdropFilter: "blur(12px)" }}
      >
        {/* Mobile close button */}
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          className="md:hidden absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors z-10"
          aria-label="Close navigation"
        >
          <XIcon />
        </button>

        {/* Logo */}
        <div className="px-4 pt-5 pb-3 shrink-0">
          <Image
            src="/assets/logo.png"
            alt="Corpulate"
            width={130}
            height={40}
            priority
            style={{ width: 130, height: "auto" }}
          />
        </div>

        {/* Admin role badge */}
        <div className="px-4 pb-4 shrink-0">
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest"
            style={{
              background: roleStyle.bg,
              color: roleStyle.color,
              border: `1px solid ${roleStyle.border}`,
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" width={10} height={10}>
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            {ROLE_LABEL[role]}
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 pb-4">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-colors duration-150 mb-0.5 ${
                  active ? "text-white bg-white/10" : "text-white/45 hover:text-white hover:bg-white/5"
                }`}
              >
                <span className="shrink-0">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom: user info + logout */}
        <div className="px-2 pb-3 shrink-0 border-t border-white/6 pt-3">
          {/* Current user */}
          <div className="flex items-center gap-2.5 px-3 py-2 mb-1">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold text-white"
              style={{ background: roleStyle.bg, border: `1px solid ${roleStyle.border}` }}
            >
              {name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-white/80 truncate">{name}</p>
            </div>
          </div>

          {/* Back to app */}
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-white/35 hover:text-white hover:bg-white/5 transition-colors duration-150"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" width={14} height={14}>
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            <span>Back to App</span>
          </Link>

          {/* Logout */}
          <form action={adminLogout}>
            <button
              type="submit"
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-white/35 hover:text-red-400 hover:bg-red-500/8 transition-colors duration-150 cursor-pointer"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" width={14} height={14}>
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              <span>Sign Out</span>
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
