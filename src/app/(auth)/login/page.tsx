"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import { Lock, User, AlertCircle, ArrowRight, Sparkles } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  const setDemoCreds = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-brand-blue to-indigo-950 relative overflow-hidden">
      {/* Decorative Golden Glowing Orbs */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-amber-200/60 p-8 z-10">
        {/* Logo and Headings */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <Logo size="lg" showText={false} />
          </div>
          <h1 className="text-2xl font-extrabold text-brand-blue tracking-tight">
            DIWALI CHIT
          </h1>
          <p className="text-xs font-semibold text-rose-800 uppercase tracking-wider mt-0.5">
            ஸ்ரீ லட்சுமி சூப்பர் மார்க்கெட்
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Supermarket Chit Fund Management ERP
          </p>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 p-3 text-xs bg-rose-50 text-rose-700 rounded-xl border border-rose-200">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              பயனர்பெயர் (Username)
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all font-medium"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              கடவுச்சொல் (Password)
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all font-medium"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-white font-bold text-sm rounded-xl shadow-lg shadow-amber-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span>உள்நுழைகிறது...</span>
            ) : (
              <>
                <span>உள்நுழைய (Sign In)</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Access Bar */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center mb-2 flex items-center justify-center gap-1">
            <Sparkles className="h-3 w-3 text-amber-500" />
            <span>டெமோ பயனர்கள் (Quick Demo Login)</span>
          </p>
          <div className="grid grid-cols-3 gap-2 text-[11px]">
            <button
              type="button"
              onClick={() => setDemoCreds("admin", "admin123")}
              className="py-1.5 px-2 bg-slate-100 hover:bg-amber-100 text-slate-700 rounded-lg text-center font-medium transition-colors"
            >
              Super Admin
            </button>
            <button
              type="button"
              onClick={() => setDemoCreds("manager", "staff123")}
              className="py-1.5 px-2 bg-slate-100 hover:bg-amber-100 text-slate-700 rounded-lg text-center font-medium transition-colors"
            >
              Manager
            </button>
            <button
              type="button"
              onClick={() => setDemoCreds("cashier", "staff123")}
              className="py-1.5 px-2 bg-slate-100 hover:bg-amber-100 text-slate-700 rounded-lg text-center font-medium transition-colors"
            >
              Cashier
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
