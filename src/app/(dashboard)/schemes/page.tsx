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
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">
            {t.schemes}
          </h1>
          <p className="text-xs text-slate-500">
            {language === "ta"
              ? "தீபாவளி சேமிப்புத் திட்டங்கள், தவணைத் தொகைகள் & போனஸ் அமைப்புகள்"
              : "Manage supermarket chit schemes, monthly dues, grocery bonus and rules"}
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-white px-4 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-amber-500/25 transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>{t.createScheme}</span>
        </button>
      </div>

      {/* Schemes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {schemes.map((s) => {
          const totalContribution = Number(s.monthly_amount) * Number(s.total_months);
          const bonusValue = Number(s.grocery_package_value) - totalContribution;

          return (
            <div
              key={s.id}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:border-amber-300 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <span className="font-mono text-xs font-bold bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full">
                    {s.scheme_code}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(s.status)}`}>
                    {s.status}
                  </span>
                </div>

                <h3 className="text-lg font-black text-brand-blue">
                  {s.tamil_name}
                </h3>
                <h4 className="text-xs font-semibold text-slate-500 mb-4">
                  {s.name}
                </h4>

                {/* Highlight Stats Box */}
                <div className="grid grid-cols-2 gap-3 p-3.5 bg-amber-50/70 rounded-2xl border border-amber-200/80 mb-4">
                  <div>
                    <span className="text-[10px] font-bold text-amber-900 block">Monthly Installment</span>
                    <span className="text-xl font-black text-amber-900">
                      {formatINR(s.monthly_amount)}
                    </span>
                    <span className="text-[10px] text-slate-500 block">x {s.total_months} Months</span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-bold text-emerald-800 block">Grocery Package</span>
                    <span className="text-xl font-black text-emerald-700">
                      {formatINR(s.grocery_package_value)}
                    </span>
                    <span className="text-[10px] text-emerald-600 font-bold block">
                      +₹{bonusValue.toLocaleString("en-IN")} Bonus Value
                    </span>
                  </div>
                </div>

                {/* Scheme Properties */}
                <div className="space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-3">
                  <div className="flex justify-between">
                    <span className="flex items-center gap-1.5 text-slate-500">
                      <Users className="h-3.5 w-3.5 text-brand-blue" />
                      <span>Enrolled Members:</span>
                    </span>
                    <span className="font-bold text-slate-800">{s.enrolled_members_count || 0} Members</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="flex items-center gap-1.5 text-slate-500">
                      <Receipt className="h-3.5 w-3.5 text-emerald-600" />
                      <span>Total Collection:</span>
                    </span>
                    <span className="font-bold text-emerald-700">{formatINR(s.total_collected)}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="flex items-center gap-1.5 text-slate-500">
                      <Calendar className="h-3.5 w-3.5 text-amber-600" />
                      <span>Monthly Due Date:</span>
                    </span>
                    <span className="font-bold text-slate-800">{s.due_day}-ஆம் தேதிக்குள்</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex gap-2">
                <Link
                  href={`/poster-generator?schemeId=${s.id}`}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-xs border border-amber-200 transition-colors"
                >
                  <FileImage className="h-3.5 w-3.5" />
                  <span>{language === "ta" ? "போஸ்டர்" : "Poster"}</span>
                </Link>

                <Link
                  href={`/packages?schemeId=${s.id}`}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-brand-blue hover:bg-blue-800 text-white font-bold text-xs transition-colors"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8">
            <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-brand-blue to-blue-900 text-white">
              <h3 className="text-base font-bold">
                {language === "ta" ? "புதிய தீபாவளி சிட் திட்டம் உருவாக்கு" : "Create New Chit Scheme"}
              </h3>
              <button onClick={() => setIsModalOpen(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleModalSubmit} className="p-6 space-y-4 text-xs">
              {error && (
                <div className="flex items-center gap-2 p-3 bg-rose-50 text-rose-700 rounded-xl border border-rose-200">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    திட்ட பெயர் (Tamil Name) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.tamilName}
                    onChange={(e) => setFormData({ ...formData, tamilName: e.target.value })}
                    placeholder="e.g. தீபாவளி மங்கள திட்டம் (₹700)"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Scheme Name (English) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Diwali Mangala Chit (₹700)"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    மாதத் தவணை (Monthly Amount ₹) *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.monthlyAmount}
                    onChange={(e) => setFormData({ ...formData, monthlyAmount: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-brand-blue"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    கால அளவு (Duration in Months) *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.totalMonths}
                    onChange={(e) => setFormData({ ...formData, totalMonths: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    மளிகை பேக்கேஜ் மதிப்பு (Package Value ₹) *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.groceryPackageValue}
                    onChange={(e) => setFormData({ ...formData, groceryPackageValue: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-emerald-700"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    மாத கடைசி தேதி (Due Day of Month)
                  </label>
                  <input
                    type="number"
                    value={formData.dueDay}
                    onChange={(e) => setFormData({ ...formData, dueDay: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  விதிமுறைகள் (Terms & Conditions - Tamil)
                </label>
                <textarea
                  rows={3}
                  value={formData.termsConditionsTamil}
                  onChange={(e) => setFormData({ ...formData, termsConditionsTamil: e.target.value })}
                  placeholder="மாதம் தோறும் 10-ஆம் தேதிக்குள் செலுத்த வேண்டும்..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 font-bold bg-amber-500 hover:bg-amber-600 text-white rounded-xl shadow-md"
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
