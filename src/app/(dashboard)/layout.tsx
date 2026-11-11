"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { LanguageProvider } from "@/components/layout/LanguageContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => {
        if (!res.ok) {
          // If unauthenticated in production, can redirect; in dev, set default admin
          setCurrentUser({
            id: 1,
            username: "admin",
            fullName: "Super Administrator",
            role: "super_admin",
          });
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data?.user) {
          setCurrentUser(data.user);
        }
      })
      .catch(() => {
        setCurrentUser({
          id: 1,
          username: "admin",
          fullName: "Super Administrator",
          role: "super_admin",
        });
      });
  }, []);

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
