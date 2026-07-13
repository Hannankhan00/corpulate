"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";
import { useCurrency } from "@/app/components/CurrencyProvider";
import type { ServicePlan } from "@/app/generated/prisma/client";

// ── Shared Styling Constants ─────────────────────────────────────
const PAGE_BG =
  "radial-gradient(ellipse 60% 80% at 0% 50%, rgba(13,100,139,0.45) 0%, rgba(6,6,6,0) 55%), radial-gradient(ellipse 50% 70% at 100% 30%, rgba(65,18,38,0.55) 0%, rgba(6,6,6,0) 55%), #070707";

const CARD_BASE_STYLE = {
  background: "linear-gradient(135deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.01) 100%)",
  backdropFilter: "blur(20px)",
  border: "1px solid rgba(255, 255, 255, 0.07)",
  transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
};

type ServiceTheme = {
  glowColor: string;
  themeColor: string;
  gradient: string;
  borderHighlight: string;
};

const THEMES: Record<string, ServiceTheme> = {
  "website-development": {
    glowColor: "rgba(139, 92, 246, 0.25)",
    themeColor: "#8B5CF6",
    gradient: "linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)",
    borderHighlight: "rgba(139, 92, 246, 0.4)",
  },
  "itin-filing": {
    glowColor: "rgba(6, 182, 212, 0.25)",
    themeColor: "#06B6D4",
    gradient: "linear-gradient(135deg, #06B6D4 0%, #3B82F6 100%)",
    borderHighlight: "rgba(6, 182, 212, 0.4)",
  },
  "ein-filing": {
    glowColor: "rgba(16, 185, 129, 0.25)",
    themeColor: "#10B981",
    gradient: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
    borderHighlight: "rgba(16, 185, 129, 0.4)",
  },
  "trademark-registration": {
    glowColor: "rgba(236, 72, 153, 0.25)",
    themeColor: "#EC4899",
    gradient: "linear-gradient(135deg, #EC4899 0%, #F43F5E 100%)",
    borderHighlight: "rgba(236, 72, 153, 0.4)",
  },
};

const DEFAULT_THEME: ServiceTheme = {
  glowColor: "rgba(148, 82, 232, 0.25)",
  themeColor: "#9452E8",
  gradient: "linear-gradient(135deg, #9452E8 0%, #FF5B62 100%)",
  borderHighlight: "rgba(148, 82, 232, 0.4)",
};

// ── Service Specific Icons ────────────────────────────────────────
const WebDevIcon = ({ color }: { color: string }) => (
  <div 
    className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300 group-hover:scale-110 shrink-0" 
    style={{ background: `${color}15`, border: `1.5px solid ${color}30` }}
  >
    <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5.5 h-5.5">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
      <line x1="14" y1="4" x2="10" y2="20" />
    </svg>
  </div>
);

const ItinIcon = ({ color }: { color: string }) => (
  <div 
    className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300 group-hover:scale-110 shrink-0" 
    style={{ background: `${color}15`, border: `1.5px solid ${color}30` }}
  >
    <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5.5 h-5.5">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  </div>
);

const EinIcon = ({ color }: { color: string }) => (
  <div 
    className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300 group-hover:scale-110 shrink-0" 
    style={{ background: `${color}15`, border: `1.5px solid ${color}30` }}
  >
    <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5.5 h-5.5">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  </div>
);

const TrademarkIcon = ({ color }: { color: string }) => (
  <div 
    className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300 group-hover:scale-110 shrink-0" 
    style={{ background: `${color}15`, border: `1.5px solid ${color}30` }}
  >
    <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5.5 h-5.5">
      <rect x="3" y="11" width="18" height="10" rx="2" />
      <path d="M12 2C6.5 2 2 6.5 2 12c0 3.5 1.8 6.6 4.5 8.5" />
      <path d="M22 11c0-5.5-4.5-10-10-10" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  </div>
);

const DefaultIcon = ({ color }: { color: string }) => (
  <div 
    className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300 group-hover:scale-110 shrink-0" 
    style={{ background: `${color}15`, border: `1.5px solid ${color}30` }}
  >
    <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5.5 h-5.5">
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  </div>
);

const ServiceIcon = ({ slug, color }: { slug: string; color: string }) => {
  switch (slug) {
    case "website-development":
      return <WebDevIcon color={color} />;
    case "itin-filing":
      return <ItinIcon color={color} />;
    case "ein-filing":
      return <EinIcon color={color} />;
    case "trademark-registration":
      return <TrademarkIcon color={color} />;
    default:
      return <DefaultIcon color={color} />;
  }
};

const CheckIcon = ({ color }: { color: string }) => (
  <span 
    className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
    style={{
      background: `${color}15`,
      border: `1.5px solid ${color}35`
    }}
  >
    <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" className="w-2.5 h-2.5">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  </span>
);

interface ServicesClientProps {
  user: { firstName: string };
  services: ServicePlan[];
  defaultCountry: string;
  defaultType: string;
}

export default function ServicesClient({
  user,
  services,
  defaultCountry,
  defaultType,
}: ServicesClientProps) {
  const router = useRouter();
  const { currency } = useCurrency();
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const conversionRate = 278; // Approximate conversion rate for UI demonstration

  function handlePurchase(slug: string) {
    router.push(`/dashboard/services/checkout?plan=${slug}`);
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: PAGE_BG }}>
      <Sidebar activeItem="services" />

      <main className="flex-1 overflow-y-auto p-4 md:p-6 scrollbar-thin">
        {/* Header Section */}
        <Header
          firstName={user.firstName}
          title="Services Catalog"
          subtitle="Purchase specialized standalone business services tailored to support and protect your brand."
        />

        <div className="w-full mt-10 pb-16">
          {services.length === 0 ? (
            <div className="rounded-[20px] p-12 text-center" style={CARD_BASE_STYLE}>
              <p className="text-white/50 text-lg">No additional services are currently available.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 xl:gap-8 w-full">
              {services.map((service) => {
                let featuresList: string[] = [];
                try {
                  featuresList = JSON.parse(service.features);
                } catch {
                  featuresList = [];
                }

                const theme = THEMES[service.slug] || DEFAULT_THEME;
                const price = service.monthlyPrice;
                const isHovered = hoveredId === service.id;

                const displayPrice = currency === "PKR"
                  ? `Rs ${(price * conversionRate).toLocaleString()}`
                  : `$${price.toLocaleString()}`;

                return (
                  <div
                    key={service.id}
                    onMouseEnter={() => setHoveredId(service.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    className="rounded-[24px] p-7 flex flex-col relative overflow-hidden group cursor-pointer h-full"
                    style={{
                      ...CARD_BASE_STYLE,
                      transform: isHovered ? "translateY(-8px)" : "translateY(0)",
                      border: isHovered 
                        ? `1.5px solid ${theme.themeColor}` 
                        : service.isHighlight 
                        ? `1px solid ${theme.borderHighlight}` 
                        : CARD_BASE_STYLE.border,
                      boxShadow: isHovered
                        ? `0 20px 40px -15px ${theme.glowColor}, 0 0 0 1px ${theme.themeColor}10 inset`
                        : service.isHighlight
                        ? `0 10px 30px -10px ${theme.glowColor}40`
                        : "0 10px 30px rgba(0, 0, 0, 0.4)",
                    }}
                  >
                    {/* Glowing blob effect */}
                    <div 
                      className="absolute -top-12 -right-12 w-36 h-36 rounded-full pointer-events-none transition-all duration-500 group-hover:scale-125"
                      style={{
                        background: `radial-gradient(circle, ${theme.themeColor} 0%, transparent 70%)`,
                        opacity: isHovered ? 0.25 : 0.12,
                        filter: "blur(24px)"
                      }}
                    />

                    {/* Dot grid texture in card */}
                    <div
                      className="absolute inset-0 pointer-events-none opacity-[0.02] group-hover:opacity-[0.04] transition-opacity duration-300"
                      style={{
                        backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
                        backgroundSize: "16px 16px",
                      }}
                    />

                    {service.isHighlight && (
                      <div
                        className="absolute top-0 right-0 text-white text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-bl-xl shadow-lg"
                        style={{ background: theme.gradient }}
                      >
                        Popular
                      </div>
                    )}

                    {/* Service Icon */}
                    <ServiceIcon slug={service.slug} color={theme.themeColor} />

                    <h3 className="text-xl font-bold text-white mb-2 leading-tight tracking-tight group-hover:text-white transition-colors">
                      {service.name}
                    </h3>
                    
                    {service.description && (
                      <p className="text-xs text-white/50 mb-6 min-h-[40px] leading-relaxed group-hover:text-white/60 transition-colors">
                        {service.description}
                      </p>
                    )}

                    <div className="mb-6 pb-6 border-b border-white/8 relative">
                      <div className="flex items-baseline gap-1 mb-2">
                        <span className="text-3xl font-extrabold text-white tracking-tight group-hover:scale-[1.02] transition-transform duration-300 block">
                          {displayPrice}
                        </span>
                      </div>
                      
                      <span 
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-bold tracking-wider uppercase transition-all duration-300"
                        style={{
                          background: isHovered ? `${theme.themeColor}12` : "rgba(255, 255, 255, 0.04)",
                          border: isHovered ? `1px solid ${theme.themeColor}30` : "1px solid rgba(255, 255, 255, 0.08)",
                          color: isHovered ? theme.themeColor : "rgba(255, 255, 255, 0.5)"
                        }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: theme.themeColor }} />
                        One-time purchase
                      </span>
                    </div>

                    <div className="flex-1">
                      <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-4">
                        What&apos;s included
                      </p>
                      <ul className="space-y-3 mb-8">
                        {featuresList.map((feature, i) => (
                          <li key={i} className="flex items-start gap-3 text-xs text-white/70 leading-normal hover:text-white transition-colors duration-200">
                            <CheckIcon color={theme.themeColor} />
                            <span className="font-medium pt-0.5">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <button
                      type="button"
                      onClick={() => handlePurchase(service.slug)}
                      className="w-full py-3.5 rounded-xl font-bold text-xs text-white cursor-pointer transition-all duration-300 active:scale-[0.98] mt-auto flex items-center justify-center gap-1.5 group/btn"
                      style={{
                        background: isHovered ? theme.gradient : "rgba(255, 255, 255, 0.03)",
                        border: isHovered ? "none" : "1px solid rgba(255, 255, 255, 0.12)",
                        boxShadow: isHovered ? `0 8px 24px ${theme.themeColor}40` : "none"
                      }}
                    >
                      <span>Purchase Service</span>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 transition-transform duration-300 group-hover/btn:translate-x-1">
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                      </svg>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
