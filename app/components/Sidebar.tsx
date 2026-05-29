"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import ReactCountryFlag from "react-country-flag";
import { getMe } from "@/app/actions/auth";

// ── Icons ──────────────────────────────────────────────────────

const HomeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" width={18} height={18}>
    <path d="M3 10.5L12 3l9 7.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V10.5z" /><path d="M9 21V12h6v9" />
  </svg>
);

const CompanyIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" width={18} height={18}>
    <rect x="2" y="7" width="20" height="14" rx="1" /><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" />
  </svg>
);

const BookkeepingIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" width={18} height={18}>
    <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
);

const TaxIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" width={18} height={18}>
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path d="M14 2v6h6M9 13h6M9 17h6" />
  </svg>
);

const AddressIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" width={18} height={18}>
    <path d="M12 22s-8-4.5-8-11.8A8 8 0 0112 2a8 8 0 018 8.2c0 7.3-8 11.8-8 11.8z" /><circle cx="12" cy="10" r="3" />
  </svg>
);

const TrademarkIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" width={18} height={18}>
    <circle cx="12" cy="12" r="10" /><path d="M9 8h3.5a2 2 0 010 4H9V8zM9 12l3.5 4" />
  </svg>
);

const BankingIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" width={18} height={18}>
    <rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" />
  </svg>
);

const HubIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" width={18} height={18}>
    <circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.93 4.93l2.12 2.12M16.95 16.95l2.12 2.12M4.93 19.07l2.12-2.12M16.95 7.05l2.12-2.12" />
  </svg>
);

const CampaignsIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" width={18} height={18}>
    <path d="M8 21h8M12 17v4M7 4h10l2 7H5L7 4z" /><path d="M12 11V4" />
  </svg>
);

const SettingsIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" width={18} height={18}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
  </svg>
);

export const ChevronDown = ({ rotated }: { rotated?: boolean }) => (
  <svg
    viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
    width={14} height={14}
    style={{ transform: rotated ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 200ms" }}
  >
    <path d="M6 9l6 6 6-6" />
  </svg>
);

// ── Nav data ───────────────────────────────────────────────────

type NavItem = {
  id: string;
  label: string;
  icon: React.ReactNode;
  href?: string;
  children?: { id: string; label: string; href?: string }[];
};

const NAV_ITEMS: NavItem[] = [
  { id: "home", label: "Home page", icon: <HomeIcon />, href: "/dashboard" },
  {
    id: "my-company", label: "My Company", icon: <CompanyIcon />,
    children: [
      { id: "my-documents", label: "My Documents" },
      { id: "my-information", label: "My Information" },
    ],
  },
  {
    id: "bookkeeping", label: "Bookkeeping", icon: <BookkeepingIcon />,
    children: [
      { id: "pre-accounting", label: "Pre-Accounting" },
    ],
  },
  { id: "tax", label: "Tax Management", icon: <TaxIcon /> },
  { id: "addresses", label: "My Addresses", icon: <AddressIcon /> },
  { id: "trademark", label: "Trademark", icon: <TrademarkIcon /> },
  {
    id: "banking", label: "Banking and Payments", icon: <BankingIcon />,
    children: [
      { id: "open-banking", label: "Open Banking" },
      { id: "my-payments", label: "My Payments" },
    ],
  },
  { id: "hub", label: "Hub", icon: <HubIcon /> },
  { id: "campaigns", label: "Campaigns", icon: <CampaignsIcon /> },
  { id: "settings", label: "Settings", icon: <SettingsIcon /> },
];

// ── Sidebar component ──────────────────────────────────────────

interface SidebarProps {
  countryCode?: string;
  activeItem?: string;
}

export default function Sidebar({
  countryCode = "GB",
  activeItem,
}: SidebarProps) {
  const [expanded, setExpanded] = useState<Set<string>>(
    new Set(["my-company", "bookkeeping", "banking"])
  );
  const [displayName, setDisplayName] = useState<string>("…");

  useEffect(() => {
    getMe().then((user) => {
      if (user) setDisplayName(`${user.firstName} ${user.lastName}`);
    });
  }, []);

  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); } else { next.add(id); }
      return next;
    });

  return (
    <aside
      className="w-52 shrink-0 flex flex-col border-r border-white/6 overflow-y-auto"
      style={{ background: "rgba(26,26,28,0.72)", backdropFilter: "blur(12px)" }}
    >
      {/* Logo */}
      <div className="px-4 pt-5 pb-4 shrink-0">
        <Image src="/assets/logo.png" alt="Corpulate" width={130} height={40} priority style={{ height: "auto" }} />
      </div>

      {/* User dropdown button */}
      <div className="px-3 mb-3 shrink-0">
        <button
          type="button"
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-elevated text-sm text-fg cursor-pointer hover:bg-overlay transition-colors duration-150"
          aria-label="Switch account or country"
        >
          <ReactCountryFlag
            countryCode={countryCode}
            svg
            style={{ width: "1.35em", height: "1.35em", borderRadius: "3px", flexShrink: 0 }}
          />
          <span className="font-medium flex-1 text-left">{displayName}</span>
          <ChevronDown />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 pb-6">
        {NAV_ITEMS.map((item) => {
          const isActive = activeItem === item.id;
          return (
            <div key={item.id}>
              {item.children ? (
                <button
                  type="button"
                  onClick={() => toggle(item.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm cursor-pointer transition-colors duration-150 ${
                    isActive ? "text-fg bg-white/10" : "text-nav-idle-text hover:text-fg hover:bg-white/5"
                  }`}
                >
                  <span className="shrink-0">{item.icon}</span>
                  <span className="flex-1 text-left leading-tight">{item.label}</span>
                  <ChevronDown rotated={expanded.has(item.id)} />
                </button>
              ) : (
                <Link
                  href={item.href ?? "#"}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-colors duration-150 ${
                    isActive ? "text-fg bg-white/10" : "text-nav-idle-text hover:text-fg hover:bg-white/5"
                  }`}
                >
                  <span className="shrink-0">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              )}

              {item.children && expanded.has(item.id) && (
                <div className="ml-4 mb-1">
                  {item.children.map((child) => (
                    <Link
                      key={child.id}
                      href={child.href ?? "#"}
                      className="flex items-center gap-1.5 pl-3 pr-3 py-1.5 text-[13px] rounded-md transition-colors duration-150 text-nav-idle-text hover:text-fg hover:bg-white/5"
                    >
                      <span className="text-[10px] opacity-50 select-none">└─</span>
                      <span>{child.label}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
