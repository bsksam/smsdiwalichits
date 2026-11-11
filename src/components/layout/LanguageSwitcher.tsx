"use client";

import React from "react";
import { useLanguage } from "./LanguageContext";
import { Languages } from "lucide-react";

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center bg-brand-cream/80 border border-amber-200/80 rounded-full p-0.5 shadow-sm">
      <button
        onClick={() => setLanguage("ta")}
        className={`flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full transition-all duration-200 ${
          language === "ta"
            ? "bg-brand-blue text-white shadow-sm font-bold"
            : "text-slate-700 hover:text-brand-blue"
        }`}
      >
        <span>தமிழ்</span>
      </button>
      <button
        onClick={() => setLanguage("en")}
        className={`flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full transition-all duration-200 ${
          language === "en"
            ? "bg-brand-blue text-white shadow-sm font-bold"
            : "text-slate-700 hover:text-brand-blue"
        }`}
      >
        <span>English</span>
      </button>
    </div>
  );
}
