"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "./LanguageContext";
import { LanguageSwitcher } from "./LanguageSwitcher";
import {
  Menu,
  Receipt,
  LogOut,
  User,
  ShieldCheck,
  Calendar,
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
      <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 lg:px-8 backdrop-blur shadow-sm">
        {/* Left Side: Mobile Menu Button & Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 lg:hidden"
            aria-label="Toggle menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-slate-500 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200/60">
            <Calendar className="h-3.5 w-3.5 text-amber-600" />
            <span>{todayStr}</span>
          </div>
        </div>

        {/* Right Side: Quick Collect, Language Switcher, User Profile, Logout */}
        <div className="flex items-center gap-3">
          {/* Quick Payment Button */}
          <button
            onClick={() => setIsQuickPayOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-white px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-amber-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <Receipt className="h-4 w-4" />
            <span className="hidden sm:inline">{t.quickPayment}</span>
            <span className="sm:hidden">வசூல்</span>
          </button>

          {/* Language Switcher */}
          <LanguageSwitcher />

          {/* User Profile */}
          <div className="hidden md:flex items-center gap-2.5 pl-2 border-l border-slate-200">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-blue to-blue-500 text-white font-bold text-xs shadow-sm">
              {user?.fullName ? user.fullName[0].toUpperCase() : "A"}
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-bold text-slate-800 leading-tight">
                {user?.fullName || "Administrator"}
              </span>
              <span className="text-[10px] font-semibold text-amber-700 uppercase flex items-center gap-1">
                <ShieldCheck className="h-3 w-3 inline text-amber-600" />
                {user?.role ? user.role.replace("_", " ") : "SUPER ADMIN"}
              </span>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            title={t.logout}
            className="rounded-xl border border-slate-200 p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-colors"
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
