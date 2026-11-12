"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "@/components/layout/LanguageContext";
import {
  Settings,
  Save,
  Building2,
  Phone,
  Printer,
  MessageSquare,
  Database,
  CheckCircle,
  AlertCircle,
  FileText,
  ShieldCheck,
  Sparkles,
  Lock,
  Percent,
  CreditCard,
  Calendar,
  Eye,
  EyeOff,
  AlertTriangle,
  HelpCircle,
} from "lucide-react";

export default function SettingsPage() {
  const { t, language } = useLanguage();
  const [settings, setSettings] = useState<Record<string, string>>({
    shop_name: "ஸ்ரீ லட்சுமி சூப்பர் மார்க்கெட் (SRI LAKSHMI SUPERMARKET)",
    shop_address: "2a PP NAGAR MADURAI, MADURAI - 625016, Tamil Nadu",
    shop_phone: "+91 96009 01937 / +91 91502 80795",
    shop_gst: "33bsops67891zq",
    receipt_printer_type: "thermal_80mm",
    payment_lock_enabled: "false",
    payment_lock_days: "10",
    payment_lock_message:
      "மாதத் தவணை செலுத்தும் காலக்கெடு முடிந்துவிட்டது. தயவுசெய்து கடை மேலாளரை அணுகவும் (Payment window closed for this month. Please visit store counter).",
    interest_calculation_enabled: "true",
    interest_due_day: "5",
    interest_percentage: "2",
    interest_grace_days: "0",
    razorpay_enabled: "false",
    razorpay_key_id: "",
    razorpay_key_secret: "",
    razorpay_merchant_name: "DIWALI CHIT • SUPERMARKET",
    whatsapp_payment_template:
      "வணக்கம் {CUSTOMER_NAME}, உங்கள் தீபாவளி சீட்டு {SCHEME_NAME} தவணை எண் {INST_NUM} தொகை ₹{AMOUNT} பெறப்பட்டது. ரசீது: {RECEIPT_NO}. நன்றி! - {SHOP_NAME}",
    whatsapp_reminder_template:
      "அன்புடையீர் {CUSTOMER_NAME}, உங்களின் தீபாவளி சீட்டு {SCHEME_NAME} மாதத் தவணை தொகை ₹{AMOUNT} செலுத்த கடைசி நாள்: {DUE_DATE}. நன்றி! - {SHOP_NAME}",
  });

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showRazorpaySecret, setShowRazorpaySecret] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.settings) {
          setSettings((prev) => ({ ...prev, ...data.settings }));
        }
      });
  }, []);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    setSuccessMsg(null);

    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings }),
      });

      if (res.ok) {
        setSuccessMsg("Master settings updated successfully!");
        setTimeout(() => setSuccessMsg(null), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // Helper toggle function
  const toggleSetting = (key: string) => {
    const current = settings[key] === "true";
    setSettings((prev) => ({
      ...prev,
      [key]: current ? "false" : "true",
    }));
  };

  // Sample interest calculation for preview
  const sampleAmount = 700;
  const interestPct = parseFloat(settings.interest_percentage || "2") || 0;
  const sampleInterest = Math.round(sampleAmount * (interestPct / 100));
  const sampleTotal = sampleAmount + sampleInterest;

  return (
    <div className="space-y-6 max-w-4xl pb-12">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-amber-300 font-serif tracking-wide drop-shadow flex items-center gap-2">
            <Settings className="h-6 w-6 text-amber-400" />
            <span>Master Settings & Chit Policies</span>
          </h1>
          <p className="text-xs text-amber-200/70 mt-1">
            {language === "ta"
              ? "கடை அமைப்புகள், தவணை பூட்டு நாட்கள், மாத வட்டி கணக்கீடு & Razorpay கட்டண நுழைவு வாயில்"
              : "Business profile, payment lock days, monthly interest calculation, and Razorpay checkout kit"}
          </p>
        </div>

        <button
          onClick={() => handleSave()}
          disabled={saving}
          className="flex items-center gap-2 gold-gradient-btn text-[#1a0004] px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black shadow-lg hover:scale-105 transition-all"
        >
          <Save className="h-4 w-4" />
          <span>{saving ? "Saving Changes..." : "Save Master Settings"}</span>
        </button>
      </div>

      {successMsg && (
        <div className="flex items-center gap-2 p-3.5 bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 rounded-2xl text-xs font-bold animate-in fade-in">
          <CheckCircle className="h-4 w-4 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={(e) => handleSave(e)} className="space-y-6 text-xs">
        {/* 1. PAYMENT LOCK DAYS OPTIONS */}
        <div className="maroon-card rounded-3xl p-6 shadow-xl space-y-5 border border-amber-500/35">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-500/20 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                <Lock className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-extrabold text-amber-300 font-serif">
                  1. தவணை செலுத்தும் பூட்டு நாட்கள் (Payment Lock Days Policy)
                </h2>
                <p className="text-[11px] text-amber-200/70">
                  Control grace period and automatically lock customer online payments after due date
                </p>
              </div>
            </div>

            {/* Enable / Disable Button */}
            <button
              type="button"
              onClick={() => toggleSetting("payment_lock_enabled")}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black transition-all border ${
                settings.payment_lock_enabled === "true"
                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-400/80 shadow-emerald-950/40"
                  : "bg-slate-800/80 text-slate-300 border-slate-700"
              }`}
            >
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  settings.payment_lock_enabled === "true" ? "bg-emerald-400 animate-pulse" : "bg-slate-500"
                }`}
              />
              <span>{settings.payment_lock_enabled === "true" ? "ENABLED (செயலில் உள்ளது)" : "DISABLED (முடக்கப்பட்டது)"}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
            <div>
              <label className="block font-bold text-amber-300 mb-1 font-serif">
                பூட்டு நாட்கள் (Lock Days After Due Date)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="30"
                  value={settings.payment_lock_days || "10"}
                  onChange={(e) => setSettings({ ...settings, payment_lock_days: e.target.value })}
                  className="w-full px-3 py-2 bg-[#180003] border border-amber-500/40 rounded-xl font-mono text-amber-100 font-bold focus:border-amber-400 outline-none"
                />
                <span className="absolute right-3 top-2 text-[11px] text-amber-400/60 font-serif">நாட்கள் (Days)</span>
              </div>
              <p className="text-[10px] text-amber-200/60 mt-1">
                e.g. 5, 10 or 15 days after due date.
              </p>
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-amber-300 mb-1 font-serif">
                பூட்டு அறிவிப்பு செய்தி (Customer Lock Notice Message)
              </label>
              <input
                type="text"
                value={settings.payment_lock_message || ""}
                onChange={(e) => setSettings({ ...settings, payment_lock_message: e.target.value })}
                className="w-full px-3 py-2 bg-[#180003] border border-amber-500/40 rounded-xl text-amber-100 focus:border-amber-400 outline-none text-[11px]"
              />
              <p className="text-[10px] text-amber-200/60 mt-1">
                Shown to customers in portal when online payment window closes.
              </p>
            </div>
          </div>

          {settings.payment_lock_enabled === "true" && (
            <div className="p-3 bg-amber-500/10 rounded-2xl border border-amber-500/30 flex items-start gap-2 text-[11px] text-amber-200">
              <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong>Active Policy:</strong> After monthly due date + <strong>{settings.payment_lock_days || "10"} days</strong>,
                customer online payment in portal will be locked. Customers must visit the store counter or cashier to clear overdue installments.
              </div>
            </div>
          )}
        </div>

        {/* 2. INTEREST CALCULATION & MONTHLY CUT-OFF WINDOW */}
        <div className="maroon-card rounded-3xl p-6 shadow-xl space-y-5 border border-amber-500/35">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-500/20 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                <Percent className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-extrabold text-amber-300 font-serif">
                  2. மாத வட்டி / அபராதக் கணக்கீடு (Monthly Interest & Penalty Calculation)
                </h2>
                <p className="text-[11px] text-amber-200/70">
                  Configure monthly payment cut-off window (1 to 5 or 10) and interest % for late payments
                </p>
              </div>
            </div>

            {/* Enable / Disable Button */}
            <button
              type="button"
              onClick={() => toggleSetting("interest_calculation_enabled")}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black transition-all border ${
                settings.interest_calculation_enabled === "true"
                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-400/80 shadow-emerald-950/40"
                  : "bg-slate-800/80 text-slate-300 border-slate-700"
              }`}
            >
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  settings.interest_calculation_enabled === "true" ? "bg-emerald-400 animate-pulse" : "bg-slate-500"
                }`}
              />
              <span>{settings.interest_calculation_enabled === "true" ? "ENABLED (செயலில் உள்ளது)" : "DISABLED (முடக்கப்பட்டது)"}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
            {/* Cut-off Day Selection: 1 to 5 or 10 */}
            <div>
              <label className="block font-bold text-amber-300 mb-1 font-serif">
                மாத கடைசி தேதி (Monthly Due Window Cut-off Day)
              </label>
              <select
                value={settings.interest_due_day || "5"}
                onChange={(e) => setSettings({ ...settings, interest_due_day: e.target.value })}
                className="w-full px-3 py-2 bg-[#180003] border border-amber-500/40 rounded-xl text-amber-100 font-bold font-mono focus:border-amber-400 outline-none"
              >
                <option value="1">1st of Month (மாதம் 1-ம் தேதி)</option>
                <option value="5">5th of Month (மாதம் 5-ம் தேதி - Recommended)</option>
                <option value="10">10th of Month (மாதம் 10-ம் தேதி - Popular)</option>
                <option value="15">15th of Month (மாதம் 15-ம் தேதி)</option>
                <option value="20">20th of Month (மாதம் 20-ம் தேதி)</option>
              </select>
              <p className="text-[10px] text-amber-200/60 mt-1">
                Payments made after this day incur monthly interest.
              </p>
            </div>

            {/* Interest Percentage */}
            <div>
              <label className="block font-bold text-amber-300 mb-1 font-serif">
                மாத வட்டி விகிதம் (Monthly Interest Rate %)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="25"
                  value={settings.interest_percentage || "2"}
                  onChange={(e) => setSettings({ ...settings, interest_percentage: e.target.value })}
                  className="w-full px-3 py-2 bg-[#180003] border border-amber-500/40 rounded-xl font-mono text-amber-100 font-bold focus:border-amber-400 outline-none"
                />
                <span className="absolute right-3 top-2 text-xs text-amber-400 font-bold">%</span>
              </div>
              <p className="text-[10px] text-amber-200/60 mt-1">
                e.g. 2% or 3% per month on installment.
              </p>
            </div>

            {/* Grace Days */}
            <div>
              <label className="block font-bold text-amber-300 mb-1 font-serif">
                கூடுதல் சலுகை நாட்கள் (Grace Days)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="15"
                  value={settings.interest_grace_days || "0"}
                  onChange={(e) => setSettings({ ...settings, interest_grace_days: e.target.value })}
                  className="w-full px-3 py-2 bg-[#180003] border border-amber-500/40 rounded-xl font-mono text-amber-100 font-bold focus:border-amber-400 outline-none"
                />
                <span className="absolute right-3 top-2 text-[11px] text-amber-400/60 font-serif">Days</span>
              </div>
              <p className="text-[10px] text-amber-200/60 mt-1">
                Days after cut-off before interest applies.
              </p>
            </div>
          </div>

          {/* Live Preview Box */}
          <div className="p-4 bg-[#180003] rounded-2xl border border-amber-500/30 space-y-2">
            <span className="text-[10px] text-amber-400/70 font-serif uppercase tracking-wider font-bold block">
              💡 Live Interest Calculation Preview (நேரடி கணக்கீட்டு மாதிரி):
            </span>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <span className="text-amber-100 font-bold">₹700 Scheme Installment</span> paid after the{" "}
                <strong className="text-amber-300">{settings.interest_due_day || "5"}th</strong> of the month:
              </div>
              <div className="flex items-center gap-2 font-mono">
                <span className="text-amber-200">Base: ₹{sampleAmount}</span>
                <span className="text-amber-400">+</span>
                <span className="text-rose-400 font-bold">Interest ({interestPct}%): ₹{sampleInterest}</span>
                <span className="text-amber-400">=</span>
                <span className="text-amber-300 font-black text-sm bg-black/40 px-2 py-0.5 rounded border border-amber-500/40">
                  Total ₹{sampleTotal}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. RAZORPAY PAYMENT GATEWAY KIT OPTIONS */}
        <div className="maroon-card rounded-3xl p-6 shadow-xl space-y-5 border border-amber-500/35">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-500/20 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-extrabold text-amber-300 font-serif">
                  3. Razorpay கட்டண நுழைவு வாயில் (Razorpay Payment Gateway Kit)
                </h2>
                <p className="text-[11px] text-amber-200/70">
                  Enable Razorpay Standard Checkout for customer payments via Debit/Credit Cards, Net Banking & UPI
                </p>
              </div>
            </div>

            {/* Enable / Disable Button */}
            <button
              type="button"
              onClick={() => toggleSetting("razorpay_enabled")}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black transition-all border ${
                settings.razorpay_enabled === "true"
                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-400/80 shadow-emerald-950/40"
                  : "bg-slate-800/80 text-slate-300 border-slate-700"
              }`}
            >
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  settings.razorpay_enabled === "true" ? "bg-emerald-400 animate-pulse" : "bg-slate-500"
                }`}
              />
              <span>{settings.razorpay_enabled === "true" ? "ENABLED (செயலில் உள்ளது)" : "DISABLED (முடக்கப்பட்டது)"}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            {/* Key ID */}
            <div>
              <label className="block font-bold text-amber-300 mb-1 font-serif">
                Razorpay Key ID
              </label>
              <input
                type="text"
                placeholder="rzp_live_... or rzp_test_..."
                value={settings.razorpay_key_id || ""}
                onChange={(e) => setSettings({ ...settings, razorpay_key_id: e.target.value })}
                className="w-full px-3 py-2 bg-[#180003] border border-amber-500/40 rounded-xl font-mono text-amber-100 font-bold focus:border-amber-400 outline-none"
              />
              <p className="text-[10px] text-amber-200/60 mt-1">
                Public API Key from your Razorpay Dashboard.
              </p>
            </div>

            {/* Key Secret */}
            <div>
              <label className="block font-bold text-amber-300 mb-1 font-serif">
                Razorpay Key Secret
              </label>
              <div className="relative">
                <input
                  type={showRazorpaySecret ? "text" : "password"}
                  placeholder="••••••••••••••••"
                  value={settings.razorpay_key_secret || ""}
                  onChange={(e) => setSettings({ ...settings, razorpay_key_secret: e.target.value })}
                  className="w-full px-3 py-2 bg-[#180003] border border-amber-500/40 rounded-xl font-mono text-amber-100 font-bold focus:border-amber-400 outline-none pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowRazorpaySecret(!showRazorpaySecret)}
                  className="absolute right-3 top-2.5 text-amber-400/70 hover:text-amber-300"
                >
                  {showRazorpaySecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-[10px] text-amber-200/60 mt-1">
                Private Secret Key (stored securely in Turso DB).
              </p>
            </div>

            {/* Merchant Display Name */}
            <div className="sm:col-span-2">
              <label className="block font-bold text-amber-300 mb-1 font-serif">
                வணிகர் காட்சிப் பெயர் (Merchant Name on Checkout Popup)
              </label>
              <input
                type="text"
                value={settings.razorpay_merchant_name || "DIWALI CHIT • SUPERMARKET"}
                onChange={(e) => setSettings({ ...settings, razorpay_merchant_name: e.target.value })}
                className="w-full px-3 py-2 bg-[#180003] border border-amber-500/40 rounded-xl text-amber-100 font-bold focus:border-amber-400 outline-none"
              />
            </div>
          </div>

          <div className="p-4 bg-[#180003] rounded-2xl border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="space-y-1">
              <span className="font-bold text-amber-200 flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-emerald-400" />
                <span>Supported Razorpay Checkout Methods</span>
              </span>
              <p className="text-[11px] text-amber-200/70">
                Google Pay, PhonePe, Paytm UPI, Visa/Mastercard/RuPay Credit & Debit Cards, Net Banking (50+ Banks).
              </p>
            </div>
            <div className="px-3 py-1.5 bg-[#250005] rounded-xl border border-amber-500/30 text-amber-300 font-mono text-[10px] font-bold">
              Status: {settings.razorpay_enabled === "true" && settings.razorpay_key_id ? "READY TO CHARGE" : "NOT CONFIGURED"}
            </div>
          </div>
        </div>

        {/* 4. SUPERMARKET BUSINESS PROFILE */}
        <div className="maroon-card rounded-3xl p-6 shadow-xl space-y-4 border border-amber-500/30">
          <h2 className="text-sm font-extrabold text-amber-300 font-serif border-b border-amber-500/20 pb-3 flex items-center gap-2">
            <Building2 className="h-4 w-4 text-amber-400" />
            <span>சூப்பர் மார்க்கெட் விவரங்கள் (Supermarket Business Profile)</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block font-bold text-amber-300 mb-1 font-serif">வணிகப் பெயர் (Supermarket Name)</label>
              <input
                type="text"
                value={settings.shop_name || ""}
                onChange={(e) => setSettings({ ...settings, shop_name: e.target.value })}
                className="w-full px-3 py-2 bg-[#180003] border border-amber-500/40 rounded-xl font-bold text-amber-100"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-amber-300 mb-1 font-serif">முழு முகவரி (Full Address)</label>
              <input
                type="text"
                value={settings.shop_address || ""}
                onChange={(e) => setSettings({ ...settings, shop_address: e.target.value })}
                className="w-full px-3 py-2 bg-[#180003] border border-amber-500/40 rounded-xl text-amber-100"
              />
            </div>

            <div>
              <label className="block font-bold text-amber-300 mb-1 font-serif">தொடர்பு எண்கள் (Contact Phones)</label>
              <input
                type="text"
                value={settings.shop_phone || ""}
                onChange={(e) => setSettings({ ...settings, shop_phone: e.target.value })}
                className="w-full px-3 py-2 bg-[#180003] border border-amber-500/40 rounded-xl font-mono text-amber-200"
              />
            </div>

            <div>
              <label className="block font-bold text-amber-300 mb-1 font-serif">GSTIN / Registration Number</label>
              <input
                type="text"
                value={settings.shop_gst || ""}
                onChange={(e) => setSettings({ ...settings, shop_gst: e.target.value })}
                className="w-full px-3 py-2 bg-[#180003] border border-amber-500/40 rounded-xl font-mono text-amber-200"
              />
            </div>
          </div>
        </div>

        {/* 5. WHATSAPP MESSAGE TEMPLATES */}
        <div className="maroon-card rounded-3xl p-6 shadow-xl space-y-4 border border-amber-500/30">
          <h2 className="text-sm font-extrabold text-amber-300 font-serif border-b border-amber-500/20 pb-3 flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-emerald-400" />
            <span>வாட்ஸ்அப் செய்தி வார்ப்புருக்கள் (WhatsApp Message Templates)</span>
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block font-bold text-amber-300 mb-1 font-serif">
                தவணை ரசீது செய்தி (Payment Receipt WhatsApp Template)
              </label>
              <textarea
                rows={3}
                value={settings.whatsapp_payment_template || ""}
                onChange={(e) => setSettings({ ...settings, whatsapp_payment_template: e.target.value })}
                className="w-full px-3 py-2 bg-[#180003] border border-amber-500/40 rounded-xl font-mono text-[11px] text-amber-100"
              />
              <span className="text-[10px] text-amber-400/60">
                Variables: &#123;CUSTOMER_NAME&#125;, &#123;SCHEME_NAME&#125;, &#123;INST_NUM&#125;, &#123;AMOUNT&#125;, &#123;RECEIPT_NO&#125;, &#123;SHOP_NAME&#125;
              </span>
            </div>

            <div>
              <label className="block font-bold text-amber-300 mb-1 font-serif">
                மாதத் தவணை நினைவூட்டல் (Installment Due Reminder Template)
              </label>
              <textarea
                rows={3}
                value={settings.whatsapp_reminder_template || ""}
                onChange={(e) => setSettings({ ...settings, whatsapp_reminder_template: e.target.value })}
                className="w-full px-3 py-2 bg-[#180003] border border-amber-500/40 rounded-xl font-mono text-[11px] text-amber-100"
              />
              <span className="text-[10px] text-amber-400/60">
                Variables: &#123;CUSTOMER_NAME&#125;, &#123;SCHEME_NAME&#125;, &#123;AMOUNT&#125;, &#123;DUE_DATE&#125;, &#123;SHOP_NAME&#125;
              </span>
            </div>
          </div>
        </div>

        {/* 6. DATABASE ARCHITECTURE */}
        <div className="maroon-card rounded-3xl p-6 shadow-xl space-y-4 border border-amber-500/30">
          <h2 className="text-sm font-extrabold text-amber-300 font-serif border-b border-amber-500/20 pb-3 flex items-center gap-2">
            <Database className="h-4 w-4 text-amber-400" />
            <span>Database & Cloud Architecture (Turso / libSQL SQLite)</span>
          </h2>

          <div className="space-y-2 text-amber-200/80 text-[11px] leading-relaxed">
            <p>
              <strong className="text-amber-100">Active Database Engine:</strong> SQLite via <code className="text-amber-300 bg-[#1e0004] px-1 py-0.5 rounded">@libsql/client</code> with Drizzle ORM.
            </p>
            <p>
              <strong className="text-amber-100">Live Production Storage:</strong> Persistent cloud SQLite hosted on Turso (<code className="text-amber-300 bg-[#1e0004] px-1 py-0.5 rounded">diwalichit-bsksam.aws-ap-south-1.turso.io</code>).
            </p>
            <p>
              <strong className="text-amber-100">Financial Integrity:</strong> Transaction-safe payments, non-destructive soft deletes, and full immutable audit trails.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
