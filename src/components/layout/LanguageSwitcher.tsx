"use client";

import React from "react";
import { useLanguage } from "./LanguageContext";

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center bg-[#240005] border border-amber-500/30 rounded-full p-0.5 shadow-inner">
      <button
        onClick={() => setLanguage("ta")}
        className={`flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-full transition-all duration-200 ${
          language === "ta"
            ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black shadow-sm"
            : "text-amber-200/70 hover:text-amber-300"
        }`}
      >
        <span>தமிழ்</span>
      </button>
      <button
        onClick={() => setLanguage("en")}
        className={`flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-full transition-all duration-200 ${
          language === "en"
            ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black shadow-sm"
            : "text-amber-200/70 hover:text-amber-300"
        }`}
      >
        <span>English</span>
      </button>
    </div>
  );
}
