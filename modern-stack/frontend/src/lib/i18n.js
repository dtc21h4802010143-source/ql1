import React, { createContext, useContext, useState, useMemo } from "react";
import en from "../locales/en.json";
import vi from "../locales/vi.json";

const translations = { en, vi };

const I18nContext = createContext(null);

export const I18nProvider = ({ children }) => {
  const [locale, setLocale] = useState(localStorage.getItem("locale") || "en");

  const t = (key) => {
    const parts = key.split(".");
    const value = parts.reduce((acc, p) => (acc && acc[p] ? acc[p] : null), translations[locale]);
    return value || key;
  };

  const api = useMemo(() => ({ locale, setLocale: (l) => { localStorage.setItem("locale", l); setLocale(l); }, t }), [locale]);

  return React.createElement(I18nContext.Provider, { value: api }, children);
};

export const useTranslation = () => {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useTranslation must be used within I18nProvider");
  return ctx;
};
