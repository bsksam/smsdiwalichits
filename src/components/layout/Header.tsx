"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "./LanguageContext";
import { LanguageSwitcher } from "./LanguageSwitcher";
import {
  Menu,
  Receipt,
  LogOut,
  Calendar,
  ShieldCheck,
} from "lucide-react";
import { QuickPaymentModal } from "@/components/ui/QuickPaymentModal";

interface HeaderProps {
  onToggleSidebar: () => void;
  user?: {
    id: number;
    username: string;
    fullName: string;
    role: string;
  } | null;
}

export function Header({ onToggleSidebar, user }: HeaderProps) {
  const router = useRouter();
  const { t, language } = useLanguage();
  const [isQuickPayOpen, setIsQuickPayOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Today in DD-MM-YYYY
  const today = new Date();
  const todayStr = `${String(today.getDate()).padStart(2, "0")}-${String(today.getMonth() + 1).padStart(2, "0")}-${today.getFullYear()}`;

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch (e) {
      console.error(e);
      router.push("/login");
    }
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-amber-500/25 bg-[#2d0107]/90 px-4 lg:px-8 backdrop-blur shadow-xl">
        {/* Left Side: Mobile Menu Button & Date */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="rounded-xl border border-amber-500/30 p-2 text-amber-300 hover:bg-amber-500/10 lg:hidden"
            aria-label="Toggle menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-amber-200/90 bg-[#3b020c] px-3.5 py-1.5 rounded-full border border-amber-500/30 shadow-inner">
            <Calendar className="h-3.5 w-3.5 text-amber-400" />
            <span className="font-mono">{todayStr}</span>
          </div>
        </div>

        {/* Right Side: Quick Collect, Language Switcher, User Profile, Logout */}
        <div className="flex items-center gap-3">
          {/* Quick Payment Button - Photo 2 Gold Gradient Pill */}
          <button
            onClick={() => setIsQuickPayOpen(true)}
            className="gold-gradient-btn flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all"
          >
            <Receipt className="h-4 w-4" />
            <span className="hidden sm:inline">{t.quickPayment}</span>
            <span className="sm:hidden">வசூல்</span>
          </button>

          {/* Language Switcher */}
          <LanguageSwitcher />

          {/* User Profile */}
          <div className="hidden md:flex items-center gap-2.5 pl-3 border-l border-amber-500/25">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-600 to-yellow-400 text-slate-950 font-black text-xs shadow-md">
              {user?.fullName ? user.fullName[0].toUpperCase() : "A"}
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-bold text-amber-200 leading-tight">
                {user?.fullName || "Administrator"}
              </span>
              <span className="text-[10px] font-black text-amber-400 uppercase flex items-center gap-1 font-mono">
                <ShieldCheck className="h-3 w-3 inline text-amber-400" />
                {user?.role ? user.role.replace("_", " ") : "SUPER ADMIN"}
              </span>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            title={t.logout}
            className="rounded-xl border border-amber-500/30 p-2 text-amber-300/80 hover:bg-rose-950/60 hover:text-rose-400 hover:border-rose-500/50 transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Quick Payment Modal */}
      {isQuickPayOpen && (
        <QuickPaymentModal
          isOpen={isQuickPayOpen}
          onClose={() => setIsQuickPayOpen(false)}
          onSuccess={() => {
            setIsQuickPayOpen(false);
            window.location.reload();
          }}
        />
      )}
    </>
  );
}
