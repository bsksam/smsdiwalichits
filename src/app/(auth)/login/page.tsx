"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, User, AlertCircle, ArrowRight, Sparkles, ShieldCheck, Phone, MapPin, UserPlus, Smartphone, Download } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  // Mode: "staff" vs "customer"
  const [loginMode, setLoginMode] = useState<"staff" | "customer">("staff");

  // Customer submode: "login" vs "register"
  const [customerMode, setCustomerMode] = useState<"login" | "register">("login");

  // Staff Credentials
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // Customer Login Credentials
  const [customerMobile, setCustomerMobile] = useState("");
  const [customerPassword, setCustomerPassword] = useState("");

  // Customer Registration Fields
  const [regFullName, setRegFullName] = useState("");
  const [regMobile, setRegMobile] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regAddress, setRegAddress] = useState("");
  const [regCity, setRegCity] = useState("Salem");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Staff Login Submit
  const handleStaffSubmit = async (e: React.FormEvent) => {
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

  // Customer Login Submit
  const handleCustomerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/customer/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mobile: customerMobile,
          password: customerPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Customer login failed");
      }

      router.push("/portal");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Customer login failed");
    } finally {
      setLoading(false);
    }
  };

  // Customer Registration Submit
  const handleCustomerRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/customer/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: regFullName,
          mobile: regMobile,
          password: regPassword,
          address: regAddress,
          city: regCity,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }

      router.push("/portal");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const setDemoCreds = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#260005] relative overflow-hidden font-sans">
      {/* Central Radiant Glow (Exact Photo 2 Lighting) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(circle at 50% 45%, #6a081c 0%, #3e010b 45%, #180003 100%)",
        }}
      />

      <div className="w-full max-w-md relative z-10 flex flex-col items-center text-center">
        {/* Top Gold Pill Badge (from Photo 2) */}
        <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 text-amber-300 text-[11px] font-bold tracking-widest uppercase mb-4 shadow-sm">
          <Sparkles className="h-3 w-3 text-amber-400" />
          <span>OFFICIAL DIWALI CHIT PORTAL</span>
        </div>

        {/* Center Golden Framed App Logo (from Photo 2) */}
        <div className="relative mb-4">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-[#6a081c] to-[#40020c] p-2 shadow-2xl border-2 border-amber-400/80 shadow-amber-950/60 flex items-center justify-center">
            <div className="w-full h-full bg-white rounded-2xl p-1 flex items-center justify-center shadow-inner overflow-hidden">
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
        <p className="text-xs font-bold text-amber-400/90 tracking-widest uppercase mt-0.5">
          SMSTREAT SUPERMARKET SAVINGS
        </p>

        {/* Main Portal Switcher Tabs (Staff vs Customer) */}
        <div className="flex w-full bg-[#200004]/80 p-1 rounded-2xl border border-amber-500/30 my-4 shadow-inner">
          <button
            type="button"
            onClick={() => {
              setLoginMode("staff");
              setError(null);
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              loginMode === "staff"
                ? "gold-gradient-btn text-[#1a0004] font-black shadow-md"
                : "text-amber-300/80 hover:text-amber-100"
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Staff / Admin</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setLoginMode("customer");
              setError(null);
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              loginMode === "customer"
                ? "gold-gradient-btn text-[#1a0004] font-black shadow-md"
                : "text-amber-300/80 hover:text-amber-100"
            }`}
          >
            <User className="h-3.5 w-3.5" />
            <span>Customer Portal</span>
          </button>
        </div>

        {/* Login Form Container in Deep Maroon Glass */}
        <div className="w-full bg-[#350109]/90 backdrop-blur-xl rounded-3xl border border-amber-500/30 p-6 sm:p-7 shadow-2xl text-left">
          {error && (
            <div className="mb-4 flex items-center gap-2 p-3 text-xs bg-rose-950/80 text-rose-300 rounded-xl border border-rose-500/40">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {loginMode === "staff" ? (
            /* Staff / Admin Login Form */
            <form onSubmit={handleStaffSubmit} className="space-y-4">
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
                    className="w-full pl-10 pr-4 py-2.5 text-xs bg-[#220005] border border-amber-500/30 rounded-xl text-amber-100 placeholder-amber-200/30 focus:outline-none focus:ring-2 focus:ring-amber-400 font-medium"
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
                    className="w-full pl-10 pr-4 py-2.5 text-xs bg-[#220005] border border-amber-500/30 rounded-xl text-amber-100 placeholder-amber-200/30 focus:outline-none focus:ring-2 focus:ring-amber-400 font-medium"
                    required
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-full gold-gradient-btn flex items-center justify-center gap-2 text-xs tracking-wider uppercase font-black text-[#1a0004]"
                >
                  {loading ? (
                    <span>உள்நுழைகிறது...</span>
                  ) : (
                    <>
                      <span>ENTER STAFF ERP</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>

              {/* Quick Demo Credentials */}
              <div className="mt-5 pt-3 border-t border-amber-500/20 text-center">
                <span className="text-[10px] uppercase font-bold text-amber-400/70 tracking-widest block mb-2">
                  Staff Demo Logins
                </span>
                <div className="grid grid-cols-3 gap-2 text-[10px]">
                  <button
                    type="button"
                    onClick={() => setDemoCreds("admin", "admin123")}
                    className="py-1.5 px-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 rounded-lg font-bold border border-amber-500/30"
                  >
                    Admin
                  </button>
                  <button
                    type="button"
                    onClick={() => setDemoCreds("manager", "staff123")}
                    className="py-1.5 px-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 rounded-lg font-bold border border-amber-500/30"
                  >
                    Manager
                  </button>
                  <button
                    type="button"
                    onClick={() => setDemoCreds("cashier", "staff123")}
                    className="py-1.5 px-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 rounded-lg font-bold border border-amber-500/30"
                  >
                    Cashier
                  </button>
                </div>
              </div>
            </form>
          ) : customerMode === "login" ? (
            /* Customer Login Form */
            <form onSubmit={handleCustomerLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-amber-200 mb-1">
                  பதிவு செய்யப்பட்ட கைபேசி எண் (Mobile Number)
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-2.5 h-4 w-4 text-amber-400/70" />
                  <input
                    type="tel"
                    value={customerMobile}
                    onChange={(e) => setCustomerMobile(e.target.value)}
                    placeholder="e.g. 9600901937"
                    className="w-full pl-10 pr-4 py-2.5 text-xs bg-[#220005] border border-amber-500/30 rounded-xl text-amber-100 placeholder-amber-200/30 focus:outline-none focus:ring-2 focus:ring-amber-400 font-mono font-bold"
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
                    value={customerPassword}
                    onChange={(e) => setCustomerPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 text-xs bg-[#220005] border border-amber-500/30 rounded-xl text-amber-100 placeholder-amber-200/30 focus:outline-none focus:ring-2 focus:ring-amber-400 font-medium"
                    required
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-full gold-gradient-btn flex items-center justify-center gap-2 text-xs tracking-wider uppercase font-black text-[#1a0004]"
                >
                  {loading ? (
                    <span>சரிபார்க்கிறது...</span>
                  ) : (
                    <>
                      <span>ENTER CUSTOMER PORTAL</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>

              {/* Create Account Link */}
              <div className="mt-4 pt-3 border-t border-amber-500/20 text-center space-y-2">
                <p className="text-[11px] text-amber-200/70">புதிய சந்தாதாரரா? (New to Diwali Chit?)</p>
                <button
                  type="button"
                  onClick={() => {
                    setCustomerMode("register");
                    setError(null);
                  }}
                  className="w-full py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  <span>+ புதிய கணக்கு தொடங்கு & திட்டத்தில் சேர்</span>
                </button>
              </div>
            </form>
          ) : (
            /* Customer Registration Form */
            <form onSubmit={handleCustomerRegister} className="space-y-3.5">
              <div className="text-center pb-1 border-b border-amber-500/20">
                <h3 className="font-bold text-amber-300 text-xs font-serif">
                  புதிய சந்தாதாரர் பதிவு (Customer Registration)
                </h3>
                <p className="text-[10px] text-amber-200/60 mt-0.5">
                  Create your account & immediately join festival chit schemes
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-amber-200 mb-1">
                  முழு பெயர் (Full Name) *
                </label>
                <input
                  type="text"
                  required
                  value={regFullName}
                  onChange={(e) => setRegFullName(e.target.value)}
                  placeholder="e.g. Sambath Kumar"
                  className="w-full px-3 py-2 text-xs bg-[#220005] border border-amber-500/30 rounded-xl text-amber-100 placeholder-amber-200/30 focus:ring-2 focus:ring-amber-400 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-amber-200 mb-1">
                    கைபேசி எண் (Mobile) *
                  </label>
                  <input
                    type="tel"
                    required
                    value={regMobile}
                    onChange={(e) => setRegMobile(e.target.value)}
                    placeholder="9876543210"
                    className="w-full px-3 py-2 text-xs bg-[#220005] border border-amber-500/30 rounded-xl text-amber-100 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-amber-200 mb-1">
                    கடவுச்சொல் (Password) *
                  </label>
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 text-xs bg-[#220005] border border-amber-500/30 rounded-xl text-amber-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-amber-200 mb-1">
                    முகவரி (Address)
                  </label>
                  <input
                    type="text"
                    value={regAddress}
                    onChange={(e) => setRegAddress(e.target.value)}
                    placeholder="Street / Area"
                    className="w-full px-3 py-2 text-xs bg-[#220005] border border-amber-500/30 rounded-xl text-amber-100"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-amber-200 mb-1">
                    ஊர் (City) *
                  </label>
                  <input
                    type="text"
                    required
                    value={regCity}
                    onChange={(e) => setRegCity(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#220005] border border-amber-500/30 rounded-xl text-amber-100 font-semibold"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-full gold-gradient-btn flex items-center justify-center gap-2 text-xs tracking-wider uppercase font-black text-[#1a0004]"
                >
                  {loading ? (
                    <span>பதிவு செய்யப்படுகிறது...</span>
                  ) : (
                    <>
                      <span>CREATE ACCOUNT & ACCESS SCHEMES</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setCustomerMode("login");
                    setError(null);
                  }}
                  className="text-xs text-amber-400 hover:underline font-bold"
                >
                  ஏற்கனவே கணக்கு உள்ளதா? உள்நுழையவும் (Back to Customer Login)
                </button>
              </div>
            </form>
          )}
        </div>

        {/* APK Download Button for Android Users */}
        <div className="mt-5 pt-4 border-t border-amber-500/20 text-center w-full">
          <a
            href="/DIWALI_CHIT_v1.1.0.apk"
            download="DIWALI_CHIT_v1.1.0.apk"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-amber-500/10 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 text-xs font-bold transition-all shadow-lg hover:shadow-amber-500/20 group"
          >
            <Smartphone className="h-4 w-4 text-amber-400 group-hover:scale-110 transition-transform" />
            <span>Android App பதிவிறக்கம் (Download v1.1.0 APK)</span>
            <Download className="h-4 w-4 text-amber-400/80" />
          </a>
          <p className="text-[10px] text-amber-200/50 mt-1 font-mono">
            Version 1.1.0 • Release Ready • Direct Android Install (5.09 MB)
          </p>
        </div>
      </div>
    </div>
  );
}
