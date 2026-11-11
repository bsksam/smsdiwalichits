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
} from "lucide-react";

export default function SettingsPage() {
  const { t, language } = useLanguage();
  const [settings, setSettings] = useState<Record<string, string>>({
    shop_name: "ஸ்ரீ லட்சுமி சூப்பர் மார்க்கெட் (SRI LAKSHMI SUPERMARKET)",
    shop_address: "124, Bazaar Main Road, Near Clock Tower, Salem - 636001, Tamil Nadu",
    shop_phone: "+91 98765 43210 / +91 94432 10987",
    shop_gst: "33AABCS1429B1Z8",
    receipt_printer_type: "thermal_80mm",
    whatsapp_payment_template:
      "வணக்கம் {CUSTOMER_NAME}, உங்கள் தீபாவளி சீட்டு {SCHEME_NAME} தவணை எண் {INST_NUM} தொகை ₹{AMOUNT} பெறப்பட்டது. ரசீது: {RECEIPT_NO}. நன்றி! - {SHOP_NAME}",
    whatsapp_reminder_template:
      "அன்புடையீர் {CUSTOMER_NAME}, உங்களின் தீபாவளி சீட்டு {SCHEME_NAME} மாதத் தவணை தொகை ₹{AMOUNT} செலுத்த கடைசி நாள்: {DUE_DATE}. நன்றி! - {SHOP_NAME}",
  });

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.settings) {
          setSettings((prev) => ({ ...prev, ...data.settings }));
        }
      });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg(null);

    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings }),
      });

      if (res.ok) {
        setSuccessMsg("Settings updated successfully!");
        setTimeout(() => setSuccessMsg(null), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-amber-300 font-serif tracking-wide drop-shadow flex items-center gap-2">
            <Settings className="h-6 w-6 text-amber-400" />
            <span>{t.settings}</span>
          </h1>
          <p className="text-xs text-amber-200/70 mt-1">
            {language === "ta"
              ? "கடை விவரங்கள், ரசீது பிரிண்டர், வாட்ஸ்அப் செய்தி வார்ப்புருக்கள் & தரவுத்தள அமைப்புகள்"
              : "Business profile, thermal receipt formatting, WhatsApp templates and Turso SQLite configuration"}
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 gold-gradient-btn text-[#1a0004] px-5 py-2 rounded-xl text-xs sm:text-sm font-black shadow-md transition-all"
        >
          <Save className="h-4 w-4" />
          <span>{saving ? "Saving..." : "Save Settings"}</span>
        </button>
      </div>

      {successMsg && (
        <div className="flex items-center gap-2 p-3 bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-bold">
          <CheckCircle className="h-4 w-4 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        {/* Shop Business Profile */}
        <div className="maroon-card rounded-3xl p-6 shadow-xl space-y-4">
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

        {/* WhatsApp Message Templates */}
        <div className="maroon-card rounded-3xl p-6 shadow-xl space-y-4">
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

        {/* Database & Cloud Architecture Details */}
        <div className="maroon-card rounded-3xl p-6 shadow-xl space-y-4">
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
