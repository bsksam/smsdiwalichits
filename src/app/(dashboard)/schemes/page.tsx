"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "@/components/layout/LanguageContext";
import { formatINR, formatDate, getStatusBadge } from "@/lib/utils";
import {
  Sparkles,
  Plus,
  Users,
  Receipt,
  FileImage,
  Gift,
  Calendar,
  CheckCircle,
  X,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

export default function SchemesPage() {
  const { t, language } = useLanguage();
  const [schemes, setSchemes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Create Scheme Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    tamilName: "",
    monthlyAmount: 1000,
    totalMonths: 12,
    totalMembers: 100,
    dueDay: 10,
    groceryPackageValue: 14500,
    bonusPercentage: 20,
    redemptionType: "grocery_only",
    termsConditions: "",
    termsConditionsTamil: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSchemes = async () => {
    try {
      const res = await fetch("/api/schemes");
      const data = await res.json();
      setSchemes(data.schemes || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchemes();
  }, []);

  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/schemes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create scheme");
      }

      setIsModalOpen(false);
      fetchSchemes();
    } catch (err: any) {
      setError(err.message || "Failed to create scheme");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-amber-300 font-serif tracking-wide drop-shadow flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-amber-400" />
            <span>{t.schemes}</span>
          </h1>
          <p className="text-xs text-amber-200/70 mt-1">
            {language === "ta"
              ? "தீபாவளி சேமிப்புத் திட்டங்கள், தவணைத் தொகைகள் & போனஸ் அமைப்புகள்"
              : "Manage supermarket chit schemes, monthly dues, grocery bonus and rules"}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/poster-generator"
            className="flex items-center gap-2 bg-[#250005] border border-amber-500/30 hover:bg-amber-500/10 text-amber-200 text-xs font-bold px-3.5 py-2 rounded-xl shadow-sm transition-all"
          >
            <FileImage className="h-4 w-4 text-amber-400" />
            <span>{t.posterGenerator}</span>
          </Link>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 gold-gradient-btn text-[#1a0004] text-xs font-black px-4 py-2 rounded-xl shadow-md transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>{t.createScheme}</span>
          </button>
        </div>
      </div>

      {/* Schemes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {schemes.map((s) => {
          const totalContribution = Number(s.monthly_amount) * Number(s.total_months);
          const bonusVal = Number(s.grocery_package_value) - totalContribution;

          return (
            <div
              key={s.id}
              className="maroon-card rounded-3xl p-6 shadow-xl flex flex-col justify-between hover:border-amber-400/50 transition-all space-y-4"
            >
              <div>
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <span className="font-mono text-[10px] font-bold text-amber-400/80 uppercase tracking-widest block">
                      {s.scheme_code}
                    </span>
                    <h3 className="font-black text-base text-amber-200 font-serif mt-0.5">
                      {language === "ta" && s.tamil_name ? s.tamil_name : s.name}
                    </h3>
                    <p className="text-xs text-amber-300/70">{s.name}</p>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(s.status)}`}>
                    {s.status}
                  </span>
                </div>

                {/* Amount Highlight */}
                <div className="my-4 p-4 rounded-2xl bg-[#1e0004] border border-amber-500/20 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-amber-400/70 tracking-wider block">
                      {language === "ta" ? "மாதத் தவணை" : "Monthly Installment"}
                    </span>
                    <span className="text-2xl font-black text-amber-300 font-serif">
                      {formatINR(s.monthly_amount)}
                    </span>
                    <span className="text-xs text-amber-400/60 font-medium"> / {language === "ta" ? "மாதம்" : "month"}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-amber-400/70 tracking-wider block">
                      {language === "ta" ? "கால அளவு" : "Duration"}
                    </span>
                    <span className="text-base font-black text-amber-200 font-serif">
                      {s.total_months} {language === "ta" ? "மாதங்கள்" : "Months"}
                    </span>
                  </div>
                </div>

                {/* Scheme Metrics */}
                <div className="grid grid-cols-2 gap-3 text-xs mb-3">
                  <div className="p-3 rounded-xl bg-[#240005] border border-amber-500/20">
                    <span className="text-amber-400/70 block font-semibold text-[10px]">Total Contribution</span>
                    <span className="font-bold text-amber-100">{formatINR(totalContribution)}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#240005] border border-amber-500/20">
                    <span className="text-amber-400/70 block font-semibold text-[10px]">Grocery Package Value</span>
                    <span className="font-bold text-amber-400">{formatINR(s.grocery_package_value)}</span>
                  </div>
                </div>

                {bonusVal > 0 && (
                  <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center justify-between">
                    <span>Diwali Bonus Benefit:</span>
                    <span className="font-black font-serif text-amber-400">+{formatINR(bonusVal)} FREE Goods</span>
                  </div>
                )}
              </div>

              {/* Bottom Actions */}
              <div className="pt-3 border-t border-amber-500/20 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-amber-300/80">
                  <Users className="h-4 w-4 text-amber-400" />
                  <span className="font-bold font-mono">{s.enrolled_count || 0}</span>
                  <span>members</span>
                </div>

                <Link
                  href="/packages"
                  className="flex items-center gap-1.5 text-amber-300 hover:text-amber-100 font-bold bg-amber-500/15 border border-amber-500/30 px-3 py-1.5 rounded-xl transition-all"
                >
                  <Gift className="h-3.5 w-3.5" />
                  <span>{language === "ta" ? "மளிகை தொகுப்பு" : "Package"}</span>
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Scheme Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-xl erp-modal-box overflow-hidden my-8 shadow-2xl border border-amber-500/40">
            <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-[#3e010b] via-[#4d0210] to-[#2b0006] text-amber-200 border-b border-amber-500/30">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-400" />
                <h3 className="text-sm font-bold font-serif tracking-wide">
                  {language === "ta" ? "புதிய தீபாவளி சிட் திட்டம் உருவாக்கு" : "Create New Chit Scheme"}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-full p-1 text-amber-400/80 hover:bg-amber-500/10"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleModalSubmit} className="p-6 space-y-4 text-xs bg-[#240005]">
              {error && (
                <div className="flex items-center gap-2 p-3 bg-rose-950/80 text-rose-300 rounded-xl border border-rose-500/40">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-amber-300 mb-1 font-serif">
                    திட்ட பெயர் (Tamil Name) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.tamilName}
                    onChange={(e) => setFormData({ ...formData, tamilName: e.target.value })}
                    placeholder="e.g. தீபாவளி மங்கள திட்டம் (₹700)"
                    className="w-full px-3 py-2 bg-[#180003] border border-amber-500/40 rounded-xl text-amber-100 placeholder-amber-400/40"
                  />
                </div>

                <div>
                  <label className="block font-bold text-amber-300 mb-1 font-serif">
                    Scheme Name (English) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Diwali Mangala Chit (₹700)"
                    className="w-full px-3 py-2 bg-[#180003] border border-amber-500/40 rounded-xl text-amber-100 placeholder-amber-400/40"
                  />
                </div>

                <div>
                  <label className="block font-bold text-amber-300 mb-1 font-serif">
                    மாதத் தவணை (Monthly Amount ₹) *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.monthlyAmount}
                    onChange={(e) => setFormData({ ...formData, monthlyAmount: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-[#180003] border border-amber-500/40 rounded-xl font-bold text-amber-300"
                  />
                </div>

                <div>
                  <label className="block font-bold text-amber-300 mb-1 font-serif">
                    கால அளவு (Duration in Months) *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.totalMonths}
                    onChange={(e) => setFormData({ ...formData, totalMonths: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-[#180003] border border-amber-500/40 rounded-xl font-bold text-amber-100"
                  />
                </div>

                <div>
                  <label className="block font-bold text-amber-300 mb-1 font-serif">
                    மளிகை பேக்கேஜ் மதிப்பு (Package Value ₹) *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.groceryPackageValue}
                    onChange={(e) => setFormData({ ...formData, groceryPackageValue: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-[#180003] border border-amber-500/40 rounded-xl font-bold text-amber-400"
                  />
                </div>

                <div>
                  <label className="block font-bold text-amber-300 mb-1 font-serif">
                    மாத கடைசி தேதி (Due Day of Month)
                  </label>
                  <input
                    type="number"
                    value={formData.dueDay}
                    onChange={(e) => setFormData({ ...formData, dueDay: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-[#180003] border border-amber-500/40 rounded-xl text-amber-100"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-amber-300 mb-1 font-serif">
                  விதிமுறைகள் (Terms & Conditions - Tamil)
                </label>
                <textarea
                  rows={3}
                  value={formData.termsConditionsTamil}
                  onChange={(e) => setFormData({ ...formData, termsConditionsTamil: e.target.value })}
                  placeholder="மாதம் தோறும் 10-ஆம் தேதிக்குள் செலுத்த வேண்டும்..."
                  className="w-full px-3 py-2 bg-[#180003] border border-amber-500/40 rounded-xl text-amber-100 placeholder-amber-400/40"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-amber-500/20">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 font-semibold text-amber-300/80 hover:bg-amber-500/10 rounded-xl border border-amber-500/20 transition-colors"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="gold-gradient-btn px-5 py-2 font-black text-[#1a0004] rounded-xl shadow-md transition-all"
                >
                  {submitting ? "Creating..." : t.createScheme}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
