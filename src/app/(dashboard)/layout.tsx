"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { LanguageProvider } from "@/components/layout/LanguageContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const isPrintCard = pathname?.includes("/print-card");

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    // Printable cards (Passbook / Chit Cards) are accessible to both customers & staff without staff auth redirect
    if (isPrintCard) return;

    fetch("/api/auth/me")
      .then((res) => {
        if (!res.ok) {
          router.push("/login");
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data?.user) {
          setCurrentUser(data.user);
        } else {
          router.push("/login");
        }
      })
      .catch(() => {
        router.push("/login");
      });
  }, [router, isPrintCard]);

  // If viewing/printing a passbook card, render clean standalone view without sidebar/header
  if (isPrintCard) {
    return (
      <LanguageProvider>
        <div className="min-h-screen bg-[#200004] text-[#fef9c3] p-3 sm:p-6">
          {children}
        </div>
      </LanguageProvider>
    );
  }

  return (
    <LanguageProvider>
      <div className="min-h-screen bg-[#250005] text-[#fef9c3] flex">
        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 lg:pl-72">
          <Header
            onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
            user={currentUser}
          />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {children}
          </main>
        </div>
      </div>
    </LanguageProvider>
  );
}
