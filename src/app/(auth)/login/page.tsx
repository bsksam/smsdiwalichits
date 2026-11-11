"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, User, AlertCircle, ArrowRight, Sparkles, ShieldCheck } from "lucide-react";

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
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#260005] relative overflow-hidden">
      {/* Central Radiant Glow (Exact Photo 2 Lighting) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(circle at 50% 45%, #6a081c 0%, #3e010b 45%, #180003 100%)",
        }}
      />

      <div className="w-full max-w-md relative z-10 flex flex-col items-center text-center">
        {/* Top Gold Pill Badge (from Photo 2) */}
        <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 text-amber-300 text-[11px] font-bold tracking-widest uppercase mb-6 shadow-sm">
          <Sparkles className="h-3 w-3 text-amber-400" />
          <span>OFFICIAL DIWALI CHIT PORTAL</span>
        </div>

        {/* Center Golden Framed App Logo (from Photo 2) */}
        <div className="relative mb-6">
          <div className="w-28 h-28 rounded-3xl bg-gradient-to-tr from-[#6a081c] to-[#40020c] p-2.5 shadow-2xl border-2 border-amber-400/80 shadow-amber-950/60 flex items-center justify-center">
            <div className="w-full h-full bg-white rounded-2xl p-1.5 flex items-center justify-center shadow-inner overflow-hidden">
              <img
                src="/logo.png"
                alt="smstreat Logo"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>

        {/* Brand Headings */}
        <h1 className="text-2xl sm:text-3xl font-black text-amber-300 tracking-wide font-serif uppercase drop-shadow">
          DIWALI CHIT
        </h1>
        <p className="text-xs font-bold text-amber-400/90 tracking-widest uppercase mt-1">
          SMSTREAT SUPERMARKET SAVINGS
        </p>
        <p className="text-[11px] text-amber-100/70 mt-1 font-medium">
          Purity, Heritage & Eternal Trust • Salem & Namakkal
        </p>

        {/* Feature Badges from Photo 2 */}
        <div className="flex items-center gap-3 my-5">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full border border-amber-500/30 bg-black/20 text-amber-300 text-[10px] font-bold font-mono">
            <ShieldCheck className="h-3 w-3 text-amber-400" />
            100% Genuine
          </span>
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full border border-amber-500/30 bg-black/20 text-amber-300 text-[10px] font-bold font-mono">
            🛡️ Secured Database
          </span>
        </div>

        {/* Login Form Container in Deep Maroon Glass */}
        <div className="w-full bg-[#350109]/90 backdrop-blur-xl rounded-3xl border border-amber-500/30 p-6 sm:p-8 shadow-2xl text-left">
          {error && (
            <div className="mb-4 flex items-center gap-2 p-3 text-xs bg-rose-950/80 text-rose-300 rounded-xl border border-rose-500/40">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-amber-200 mb-1">
                பயனர்பெயர் (Username)
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-2.5 h-4 w-4 text-amber-400/70" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-[#220005] border border-amber-500/30 rounded-xl text-amber-100 placeholder-amber-200/30 focus:outline-none focus:ring-2 focus:ring-amber-400 font-medium"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-amber-200 mb-1">
                கடவுச்சொல் (Password)
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-2.5 h-4 w-4 text-amber-400/70" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-[#220005] border border-amber-500/30 rounded-xl text-amber-100 placeholder-amber-200/30 focus:outline-none focus:ring-2 focus:ring-amber-400 font-medium"
                  required
                />
              </div>
            </div>

            {/* Gold Action Button matching Photo 2 */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-full gold-gradient-btn flex items-center justify-center gap-2 text-sm tracking-wider uppercase font-black"
              >
                {loading ? (
                  <span>உள்நுழைகிறது...</span>
                ) : (
                  <>
                    <span>ENTER DIWALI CHIT APP</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Quick Demo Credentials */}
          <div className="mt-6 pt-4 border-t border-amber-500/20 text-center">
            <span className="text-[10px] uppercase font-bold text-amber-400/70 tracking-widest block mb-2">
              Quick Demo Access
            </span>
            <div className="grid grid-cols-3 gap-2 text-[10px]">
              <button
                type="button"
                onClick={() => setDemoCreds("admin", "admin123")}
                className="py-1.5 px-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 rounded-lg font-bold border border-amber-500/30 transition-colors"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => setDemoCreds("manager", "staff123")}
                className="py-1.5 px-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 rounded-lg font-bold border border-amber-500/30 transition-colors"
              >
                Manager
              </button>
              <button
                type="button"
                onClick={() => setDemoCreds("cashier", "staff123")}
                className="py-1.5 px-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 rounded-lg font-bold border border-amber-500/30 transition-colors"
              >
                Cashier
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
