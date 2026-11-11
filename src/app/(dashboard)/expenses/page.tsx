"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "@/components/layout/LanguageContext";
import { formatINR, formatDate } from "@/lib/utils";
import {
  Wallet,
  Plus,
  ArrowDownRight,
  ArrowUpRight,
  Calendar,
  Search,
  Filter,
  DollarSign,
  TrendingDown,
  TrendingUp,
  X,
  AlertCircle,
  Sparkles,
} from "lucide-react";

export default function ExpensesPage() {
  const { t, language } = useLanguage();
  const [expenses, setExpenses] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>({ totalIncome: 0, totalExpense: 0, netCashBalance: 0 });
  const [loading, setLoading] = useState(true);

  // Add Expense Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    categoryId: 1,
    amount: 1000,
    expenseDate: new Date().toISOString().split("T")[0],
    paymentMode: "cash",
    recipientName: "",
    description: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchExpenses = async () => {
    try {
      const res = await fetch("/api/expenses");
      const data = await res.json();
      setExpenses(data.expenses || []);
      setCategories(data.categories || []);
      setSummary(data.summary || {});
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to record expense");
      }

      setIsModalOpen(false);
      fetchExpenses();
    } catch (err: any) {
      setError(err.message || "Failed to save expense voucher");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-amber-300 font-serif tracking-wide drop-shadow flex items-center gap-2">
            <Wallet className="h-6 w-6 text-amber-400" />
            <span>{t.expenses}</span>
          </h1>
          <p className="text-xs text-amber-200/70 mt-1">
            {language === "ta"
              ? "சூப்பர் மார்க்கெட் தினசரி செலவுகள், சிட் நிதி வருவாய் & ரொக்கப் பதிவேடு"
              : "Daily expense tracking, petty cash management & chit collection balancing"}
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 gold-gradient-btn text-[#1a0004] text-xs font-black px-4 py-2 rounded-xl shadow-md transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>{language === "ta" ? "புதிய செலவு பதிவு" : "Add Expense Voucher"}</span>
        </button>
      </div>

      {/* Cash Book Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="maroon-card p-5 rounded-3xl shadow-xl space-y-1">
          <div className="flex justify-between items-center text-amber-300/70 text-xs font-bold font-serif">
            <span>Chit Collection Income</span>
            <ArrowUpRight className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 font-serif">
            {formatINR(summary.totalIncome || 0)}
          </div>
          <p className="text-[10px] text-amber-400/60">Verified collections</p>
        </div>

        <div className="maroon-card p-5 rounded-3xl shadow-xl space-y-1">
          <div className="flex justify-between items-center text-amber-300/70 text-xs font-bold font-serif">
            <span>Operating Expenses</span>
            <ArrowDownRight className="h-4 w-4 text-rose-400" />
          </div>
          <div className="text-2xl font-black text-rose-400 font-serif">
            {formatINR(summary.totalExpense || 0)}
          </div>
          <p className="text-[10px] text-amber-400/60">Vouchers paid out</p>
        </div>

        <div className="maroon-card p-5 rounded-3xl shadow-xl space-y-1">
          <div className="flex justify-between items-center text-amber-300/70 text-xs font-bold font-serif">
            <span>Net Drawer Balance</span>
            <Wallet className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-300 font-serif">
            {formatINR(summary.netCashBalance || 0)}
          </div>
          <p className="text-[10px] text-amber-400/60">Live liquidity</p>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="maroon-card rounded-3xl overflow-hidden shadow-xl border border-amber-500/25">
        <div className="p-5 border-b border-amber-500/20">
          <h3 className="font-black text-sm text-amber-300 font-serif">
            {language === "ta" ? "செலவுப் பதிவேடு விவரங்கள்" : "Daily Expense Vouchers Ledger"}
          </h3>
          <p className="text-xs text-amber-200/60">Audited cash disbursements</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs bg-[#240005]">
            <thead className="bg-[#380109] text-amber-300 font-serif border-b border-amber-500/30">
              <tr>
                <th className="py-3 px-4">Voucher No</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Paid To</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Mode</th>
                <th className="py-3 px-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-500/10">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-amber-300/60 font-serif">
                    Loading expenses...
                  </td>
                </tr>
              ) : expenses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-amber-300/60 font-serif">
                    No expense vouchers recorded yet.
                  </td>
                </tr>
              ) : (
                expenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-amber-500/5 transition-colors text-amber-100">
                    <td className="py-3 px-4 font-mono font-bold text-amber-400">
                      {exp.voucher_number}
                    </td>
                    <td className="py-3 px-4 text-amber-200/80">
                      {formatDate(exp.expense_date)}
                    </td>
                    <td className="py-3 px-4 font-bold text-amber-200">
                      {language === "ta" && exp.category_tamil ? exp.category_tamil : exp.category_name}
                    </td>
                    <td className="py-3 px-4 font-semibold text-amber-100">
                      {exp.recipient_name}
                    </td>
                    <td className="py-3 px-4 text-amber-300/70 max-w-xs truncate">
                      {exp.description}
                    </td>
                    <td className="py-3 px-4 uppercase text-[10px] font-bold text-amber-400">
                      {exp.payment_mode}
                    </td>
                    <td className="py-3 px-4 text-right font-black text-rose-400 text-sm font-serif">
                      {formatINR(exp.amount)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Expense Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-md erp-modal-box overflow-hidden shadow-2xl border border-rose-500/40">
            <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-[#4d0210] to-[#2b0006] text-amber-200 border-b border-rose-500/30">
              <div className="flex items-center gap-2">
                <Wallet className="h-5 w-5 text-amber-400" />
                <h3 className="text-sm font-bold font-serif tracking-wide">Add Expense Voucher</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-amber-400/80 hover:text-amber-300 p-1 rounded-lg hover:bg-amber-500/10"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleModalSubmit} className="p-6 space-y-4 text-xs bg-[#240005]">
              {error && (
                <div className="p-3 bg-rose-950/80 text-rose-300 rounded-xl border border-rose-500/40">
                  {error}
                </div>
              )}

              <div>
                <label className="block font-bold text-amber-300 mb-1 font-serif">Expense Category *</label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: Number(e.target.value) })}
                  className="w-full px-3 py-2.5 bg-[#180003] border border-amber-500/40 rounded-xl font-bold text-amber-200"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-amber-300 mb-1 font-serif">Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-[#180003] border border-amber-500/40 rounded-xl font-black text-rose-400"
                  />
                </div>

                <div>
                  <label className="block font-bold text-amber-300 mb-1 font-serif">Payment Mode</label>
                  <select
                    value={formData.paymentMode}
                    onChange={(e) => setFormData({ ...formData, paymentMode: e.target.value })}
                    className="w-full px-3 py-2 bg-[#180003] border border-amber-500/40 rounded-xl font-bold text-amber-200"
                  >
                    <option value="cash">Cash</option>
                    <option value="upi">UPI</option>
                    <option value="bank_transfer">Bank Transfer</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-amber-300 mb-1 font-serif">Paid To (Recipient) *</label>
                <input
                  type="text"
                  required
                  value={formData.recipientName}
                  onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
                  placeholder="e.g. Sri Murugan Printers, Shop Owner"
                  className="w-full px-3 py-2 bg-[#180003] border border-amber-500/40 rounded-xl text-amber-100 placeholder-amber-400/40"
                />
              </div>

              <div>
                <label className="block font-bold text-amber-300 mb-1 font-serif">Expense Purpose / Description *</label>
                <textarea
                  required
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g. Printing 1,000 Diwali chit passbooks and leaflets"
                  className="w-full px-3 py-2 bg-[#180003] border border-amber-500/40 rounded-xl text-amber-100 placeholder-amber-400/40"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-amber-500/20">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 font-semibold text-amber-300/80 hover:bg-amber-500/10 rounded-xl border border-amber-500/20"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 font-bold bg-gradient-to-r from-rose-700 to-rose-900 hover:from-rose-600 hover:to-rose-800 text-white rounded-xl shadow-md"
                >
                  {submitting ? "Recording..." : "Save Voucher"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
