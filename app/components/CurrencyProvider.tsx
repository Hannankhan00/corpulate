"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type Currency = "USD" | "PKR";

type CurrencyContextType = {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
};

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>("USD");

  useEffect(() => {
    // Try to load from localStorage on mount
    const saved = localStorage.getItem("corpulate_currency") as Currency;
    if (saved && (saved === "USD" || saved === "PKR")) {
      setCurrencyState(saved);
    }
  }, []);

  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency);
    localStorage.setItem("corpulate_currency", newCurrency);
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
}
