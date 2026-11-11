"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "./LanguageContext";
import { Logo } from "@/components/ui/Logo";
import {
  LayoutDashboard,
  Users,
  Sparkles,
  CalendarCheck,
  Receipt,
  PackageOpen,
  Boxes,
  Gift,
  FileImage,
  Wallet,
  BarChart3,
  Building2,
  Settings,
  X,
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { t, language } = useLanguage();

  const navItems = [
    { href: "/dashboard", label: t.dashboard, icon: LayoutDashboard, badge: null },
    { href: "/customers", label: t.customers, icon: Users, badge: null },
    { href: "/schemes", label: t.schemes, icon: Sparkles, badge: null },
    { href: "/installments", label: t.installments, icon: CalendarCheck, badge: null },
    { href: "/payments", label: t.payments, icon: Receipt, badge: "Hot" },
    { href: "/groceries", label: t.groceries, icon: PackageOpen, badge: null },
    { href: "/packages", label: t.packages, icon: Boxes, badge: null },
    { href: "/redemptions", label: t.redemptions, icon: Gift, badge: "Diwali" },
    { href: "/poster-generator", label: t.posterGenerator, icon: FileImage, badge: "Tamil A4" },
    { href: "/expenses", label: t.expenses, icon: Wallet, badge: null },
    { href: "/reports", label: t.reports, icon: BarChart3, badge: null },
    { href: "/staff", label: t.staff, icon: Building2, badge: null },
    { href: "/settings", label: t.settings, icon: Settings, badge: null },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container in Photo 2 Maroon & Gold Theme */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-[#2a0006] border-r border-amber-500/20 shadow-2xl transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Top Branding Section */}
        <div className="flex h-20 items-center justify-between px-6 border-b border-amber-500/20 bg-gradient-to-r from-[#38010a] to-[#250005]">
          <Link href="/dashboard" onClick={onClose} className="flex items-center">
            <Logo size="md" />
          </Link>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-amber-200/80 hover:bg-amber-500/10 lg:hidden"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
          <div className="px-3 mb-2 text-[10px] font-extrabold uppercase tracking-widest text-amber-400/60">
            {language === "ta" ? "முதன்மை மெனு" : "MAIN NAVIGATION"}
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`group flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-slate-950 font-black shadow-md shadow-amber-950/40"
                    : "text-amber-100/80 hover:bg-amber-500/10 hover:text-amber-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`h-5 w-5 transition-transform group-hover:scale-110 ${
                      isActive ? "text-slate-950" : "text-amber-400/80 group-hover:text-amber-300"
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`px-2 py-0.5 text-[10px] font-black rounded-full ${
                      isActive
                        ? "bg-slate-950 text-amber-400 border border-slate-900"
                        : "bg-amber-500/20 text-amber-300 border border-amber-400/30"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Bottom Shop Info Banner */}
        <div className="p-4 border-t border-amber-500/20 bg-gradient-to-b from-transparent to-[#1a0004]">
          <div className="rounded-xl border border-amber-500/30 bg-[#360109]/90 p-3 shadow-inner">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold text-amber-300 font-serif">
                {language === "ta" ? "சேலம் தலைமை கிளை" : "Salem Main Branch"}
              </span>
            </div>
            <p className="mt-1 text-[11px] text-amber-100/60 truncate font-mono">
              +91 98765 43210 / 94432 10987
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
