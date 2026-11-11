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
      setError(err.message || "Failed to save expense");
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
            {t.expenses}
          </h1>
          <p className="text-xs text-slate-500">
            {language === "ta"
              ? "தினசரி மற்றும் மாதாந்திர செலவுகள் & பணப்புழக்க கணக்கு (Cash Book)"
              : "Track shop operational expenses, vouchers, cash inflows and cash balances"}
          </p>
        </div>

        <button
          onClick={() => {
            setFormData({
              categoryId: categories[0]?.id || 1,
              amount: 500,
              expenseDate: new Date().toISOString().split("T")[0],
              paymentMode: "cash",
              recipientName: "",
              description: "",
            });
            setError(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white px-4 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-rose-900/20 transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>{language === "ta" ? "+ புதிய செலவு பதிவு" : "+ Add Expense Voucher"}</span>
        </button>
      </div>

      {/* Cash Book Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 shadow-sm">
          <div className="flex items-center justify-between text-emerald-800 mb-2">
            <span className="text-xs font-bold uppercase">Total Inflow (Collections)</span>
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-emerald-900">
            {formatINR(summary.totalIncome)}
          </p>
          <span className="text-[10px] text-emerald-700 font-semibold mt-1 inline-block">Chit installment receipts</span>
        </div>

        <div className="rounded-2xl border border-rose-200 bg-rose-50/60 p-4 shadow-sm">
          <div className="flex items-center justify-between text-rose-800 mb-2">
            <span className="text-xs font-bold uppercase">Total Outflow (Expenses)</span>
            <div className="p-2 rounded-xl bg-rose-100 text-rose-700">
              <TrendingDown className="h-4 w-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-rose-900">
            {formatINR(summary.totalExpense)}
          </p>
          <span className="text-[10px] text-rose-700 font-semibold mt-1 inline-block">Voucher payments</span>
        </div>

        <div className="rounded-2xl border border-blue-200 bg-blue-50/60 p-4 shadow-sm">
          <div className="flex items-center justify-between text-brand-blue mb-2">
            <span className="text-xs font-bold uppercase">Net Cash Balance</span>
            <div className="p-2 rounded-xl bg-blue-100 text-brand-blue">
              <Wallet className="h-4 w-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-brand-blue">
            {formatINR(summary.netCashBalance)}
          </p>
          <span className="text-[10px] text-blue-700 font-semibold mt-1 inline-block">Current cash on hand</span>
        </div>
      </div>

      {/* Expenses List */}
      <div className="rounded-3xl border border-slate-200/80 bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Voucher No</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Recipient</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Mode</th>
                <th className="py-3 px-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">Loading expenses...</td>
                </tr>
              ) : expenses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">No expense vouchers recorded.</td>
                </tr>
              ) : (
                expenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-rose-700">
                      {exp.voucher_number}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {formatDate(exp.expense_date)}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-800">
                      {exp.category_name}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-700">
                      {exp.recipient_name}
                    </td>
                    <td className="py-3 px-4 text-slate-600 max-w-xs truncate">
                      {exp.description}
                    </td>
                    <td className="py-3 px-4 uppercase text-[10px] font-bold text-slate-500">
                      {exp.payment_mode}
                    </td>
                    <td className="py-3 px-4 text-right font-extrabold text-rose-700 text-sm">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden font-sans">
            <div className="flex items-center justify-between px-6 py-4 bg-rose-700 text-white">
              <div className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                <h3 className="text-base font-bold">Add Expense Voucher</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleModalSubmit} className="p-6 space-y-4 text-xs">
              {error && (
                <div className="p-3 bg-rose-50 text-rose-700 rounded-xl border border-rose-200">
                  {error}
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">Expense Category *</label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
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
                  <label className="block font-bold text-slate-700 mb-1">Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-black text-rose-700"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Payment Mode</label>
                  <select
                    value={formData.paymentMode}
                    onChange={(e) => setFormData({ ...formData, paymentMode: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  >
                    <option value="cash">Cash</option>
                    <option value="upi">UPI</option>
                    <option value="bank_transfer">Bank Transfer</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Paid To (Recipient) *</label>
                <input
                  type="text"
                  required
                  value={formData.recipientName}
                  onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
                  placeholder="e.g. Sri Murugan Printers, Shop Owner"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Expense Purpose / Description *</label>
                <textarea
                  required
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g. Printing 1,000 Diwali chit passbooks and leaflets"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 font-bold bg-rose-700 hover:bg-rose-800 text-white rounded-xl shadow-md"
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
