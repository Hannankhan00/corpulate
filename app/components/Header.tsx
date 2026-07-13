"use client";

import React, { useState, useRef, useEffect } from "react";
import { useCurrency } from "./CurrencyProvider";

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

const ChevronDownIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={14} height={14}>
    <path d="M6 9l6 6 6-6" />
  </svg>
);

type HeaderProps = {
  firstName: string;
  title?: string;
  subtitle?: string;
};

export default function Header({ firstName, title, subtitle }: HeaderProps) {
  const { currency, setCurrency } = useCurrency();
  const [showCurrencyDrop, setShowCurrencyDrop] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const defaultTitle = `Welcome, ${firstName}`;
  const defaultSubtitle = "Choose the country you want to incorporate in and the services you want to receive.";

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowCurrencyDrop(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div 
      className="flex items-center gap-3 md:gap-4 rounded-[50px] pl-12 pr-4 md:px-5 py-4 mb-4 shrink-0" 
      style={{ background: "#1a1a1c", boxShadow: "5px 5px 4px 2px rgba(0,0,0,0.3)" }}
    >
      <div 
        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0" 
        style={{ background: "linear-gradient(135deg,#7C3AED,#06B6D4)" }}
      >
        {firstName.charAt(0).toUpperCase()}
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-white text-sm">
          {title || defaultTitle}
        </p>
        <p className="text-xs text-white/50 mt-0.5 leading-relaxed">
          {subtitle || defaultSubtitle}
        </p>
      </div>
      
      <div className="flex items-center gap-3 shrink-0">
        {/* Currency Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setShowCurrencyDrop(!showCurrencyDrop)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-white/80 hover:text-white hover:bg-white/10 transition-colors border border-white/10 cursor-pointer"
            style={{ background: "rgba(255,255,255,0.05)" }}
          >
            <span>{currency}</span>
            <ChevronDownIcon />
          </button>
          
          {showCurrencyDrop && (
            <div 
              className="absolute top-full right-0 mt-2 w-24 rounded-xl overflow-hidden z-20 py-1"
              style={{ background: "#1a1a1c", border: "1px solid rgba(255,255,255,0.15)", boxShadow: "0 10px 25px rgba(0,0,0,0.5)" }}
            >
              <button
                type="button"
                onClick={() => { setCurrency("USD"); setShowCurrencyDrop(false); }}
                className={`w-full text-left px-4 py-2 text-xs font-semibold cursor-pointer hover:bg-white/10 transition-colors ${currency === "USD" ? "text-brand-cyan" : "text-white/70"}`}
              >
                USD ($)
              </button>
              <button
                type="button"
                onClick={() => { setCurrency("PKR"); setShowCurrencyDrop(false); }}
                className={`w-full text-left px-4 py-2 text-xs font-semibold cursor-pointer hover:bg-white/10 transition-colors ${currency === "PKR" ? "text-brand-cyan" : "text-white/70"}`}
              >
                PKR (Rs)
              </button>
            </div>
          )}
        </div>

        <div className="w-px h-6 bg-white/10 mx-1" />

        <button 
          type="button" 
          aria-label="Notifications" 
          className="w-10 h-10 rounded-full flex items-center justify-center text-white hover:bg-white/10 transition-colors duration-150 cursor-pointer border border-white/20" 
          style={{ background: "#1a1a1c" }}
        >
          <BellIcon />
        </button>
        <button 
          type="button" 
          aria-label="Sign out" 
          className="w-10 h-10 rounded-full flex items-center justify-center text-white hover:bg-white/10 transition-colors duration-150 cursor-pointer border border-white/20" 
          style={{ background: "#1a1a1c" }}
        >
          <PowerIcon />
        </button>
      </div>
    </div>
  );
}
