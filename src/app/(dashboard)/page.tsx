"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "@/components/layout/LanguageContext";
import { formatINR, formatDate, getStatusBadge } from "@/lib/utils";
import { getWhatsAppShareUrl, generateDueReminderWhatsAppMessage } from "@/lib/whatsapp";
import {
  Users,
  Sparkles,
  CalendarCheck,
  TrendingUp,
  Clock,
  AlertTriangle,
  Gift,
  Boxes,
  Receipt,
  ArrowUpRight,
  Share2,
  Activity,
  PlusCircle,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from "recharts";
import Link from "next/link";
import { QuickPaymentModal } from "@/components/ui/QuickPaymentModal";

export default function DashboardPage() {
  const { t, language } = useLanguage();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quickPayOpen, setQuickPayOpen] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch("/api/dashboard");
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-amber-500 border-t-transparent" />
          <p className="text-sm font-semibold text-slate-500">
            {language === "ta" ? "தரவுகள் ஏற்றப்படுகின்றன..." : "Loading dashboard..."}
          </p>
        </div>
      </div>
    );
  }

  const metrics = data?.metrics || {};
  const charts = data?.charts || {};
  const recentPayments = data?.recentPayments || [];
  const recentCustomers = data?.recentCustomers || [];
  const upcomingReminders = data?.upcomingReminders || [];
  const recentActivities = data?.recentActivities || [];

  const pieColors = ["#1e3a8a", "#d97706", "#b91c1c", "#10b981", "#8b5cf6"];

  return (
    <div className="space-y-6">
      {/* Welcome Banner with Quick Actions */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-blue via-blue-900 to-indigo-950 p-6 sm:p-8 text-white shadow-xl shadow-blue-950/20">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-bold mb-2">
              <Sparkles className="h-3.5 w-3.5" />
              <span>{language === "ta" ? "தீபாவளி பண்டிகை சிறப்பு சேமிப்பு ERP" : "Diwali Festival Savings ERP"}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {language === "ta" ? "ஸ்ரீ லட்சுமி சூப்பர் மார்க்கெட்" : "Sri Lakshmi Supermarket"}
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-blue-200">
              {language === "ta"
                ? "தீபாவளி சீட்டு மேலாண்மை மற்றும் மளிகைப் பொருள் விநியோக கட்டுப்பாட்டு அறை"
                : "Diwali Chit Fund Management and Grocery Distribution Console"}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setQuickPayOpen(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-lg shadow-amber-500/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <Receipt className="h-4 w-4" />
              <span>{t.quickPayment}</span>
            </button>

            <Link
              href="/customers"
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl transition-all"
            >
              <PlusCircle className="h-4 w-4 text-amber-300" />
              <span>{t.addCustomer}</span>
            </Link>

            <Link
              href="/poster-generator"
              className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-lg shadow-rose-900/30 transition-all"
            >
              <Sparkles className="h-4 w-4 text-amber-200" />
              <span>{t.posterGenerator}</span>
            </Link>
          </div>
        </div>

        {/* Collection Target Progress Bar */}
        <div className="mt-6 pt-5 border-t border-white/10">
          <div className="flex justify-between items-center text-xs font-semibold mb-1.5">
            <span className="text-blue-200">
              {language === "ta" ? "இந்த மாத வசூல் இலக்கு முன்னேற்றம்" : "Monthly Collection Performance"}
            </span>
            <span className="text-amber-400 font-bold">{metrics.collectionProgress}% Completed</span>
          </div>
          <div className="w-full bg-white/10 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-amber-400 to-amber-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, metrics.collectionProgress || 10)}%` }}
            />
          </div>
        </div>
      </div>

      {/* 10 Dashboard Key Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* 1. Total Customers */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold">{t.totalCustomers}</span>
            <div className="p-2 rounded-xl bg-blue-50 text-brand-blue">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-slate-800">{metrics.totalCustomers}</p>
          <span className="text-[10px] text-emerald-600 font-bold mt-1 inline-block">Active Enrolled</span>
        </div>

        {/* 2. Active Members */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold">{t.activeMembers}</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <CalendarCheck className="h-4 w-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-slate-800">{metrics.activeMembers}</p>
          <span className="text-[10px] text-slate-500 font-semibold mt-1 inline-block">Passbooks Active</span>
        </div>

        {/* 3. Running Schemes */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold">{t.totalSchemes}</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Sparkles className="h-4 w-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-slate-800">{metrics.runningSchemes}</p>
          <span className="text-[10px] text-amber-700 font-bold mt-1 inline-block">₹700, ₹1000, ₹1500</span>
        </div>

        {/* 4. Today's Collection */}
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-emerald-800 mb-2">
            <span className="text-xs font-bold">{t.todayCollection}</span>
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-emerald-900">{formatINR(metrics.todayCollection)}</p>
          <span className="text-[10px] text-emerald-700 font-bold mt-1 inline-block">Today Verified</span>
        </div>

        {/* 5. Monthly Collection */}
        <div className="rounded-2xl border border-blue-200 bg-blue-50/40 p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-brand-blue mb-2">
            <span className="text-xs font-bold">{t.monthlyCollection}</span>
            <div className="p-2 rounded-xl bg-blue-100 text-brand-blue">
              <Receipt className="h-4 w-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-brand-blue">{formatINR(metrics.monthlyCollection)}</p>
          <span className="text-[10px] text-blue-700 font-bold mt-1 inline-block">This Month</span>
        </div>

        {/* 6. Pending Collection */}
        <div className="rounded-2xl border border-amber-200 bg-amber-50/40 p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-amber-800 mb-2">
            <span className="text-xs font-bold">{t.pendingCollection}</span>
            <div className="p-2 rounded-xl bg-amber-100 text-amber-700">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-amber-900">{formatINR(metrics.pendingAmount)}</p>
          <span className="text-[10px] text-amber-700 font-semibold mt-1 inline-block">{metrics.pendingCount} Installments</span>
        </div>

        {/* 7. Overdue Payments */}
        <div className="rounded-2xl border border-rose-200 bg-rose-50/40 p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-rose-800 mb-2">
            <span className="text-xs font-bold">{t.overduePayments}</span>
            <div className="p-2 rounded-xl bg-rose-100 text-rose-700">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-rose-900">{formatINR(metrics.overdueAmount)}</p>
          <span className="text-[10px] text-rose-700 font-bold mt-1 inline-block">{metrics.overdueCount} Past Due</span>
        </div>

        {/* 8. Completed Schemes */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold">{t.completedSchemes}</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <Gift className="h-4 w-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-slate-800">{metrics.completedSchemes}</p>
          <span className="text-[10px] text-purple-700 font-bold mt-1 inline-block">Ready to Redeem</span>
        </div>

        {/* 9. Upcoming Maturity */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold">{t.upcomingMaturity}</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <CalendarCheck className="h-4 w-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-slate-800">{metrics.upcomingMaturity}</p>
          <span className="text-[10px] text-indigo-600 font-bold mt-1 inline-block">Next 60 Days</span>
        </div>

        {/* 10. Grocery Stock Value */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold">{t.groceryStockValue}</span>
            <div className="p-2 rounded-xl bg-teal-50 text-teal-600">
              <Boxes className="h-4 w-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-slate-800">{formatINR(metrics.groceryStockValue)}</p>
          <span className="text-[10px] text-teal-700 font-bold mt-1 inline-block">In Supermarket</span>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Collection Trend */}
        <div className="lg:col-span-2 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-slate-800">
                {language === "ta" ? "மாதாந்திர வசூல் வரைபடம் (Monthly Collection Trend)" : "Monthly Collection Trend"}
              </h3>
              <p className="text-xs text-slate-500">Breakdown of collections across months</p>
            </div>
            <span className="text-xs font-mono font-bold bg-blue-50 text-brand-blue px-2.5 py-1 rounded-full">
              Total: {formatINR(metrics.totalLifetimeCollection)}
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.monthlyCollectionChart || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#64748b" }} />
                <YAxis tick={{ fontSize: 11, fill: "#64748b" }} tickFormatter={(val) => `₹${val / 1000}k`} />
                <Tooltip
                  formatter={(value: any) => [formatINR(Number(value)), "Collection"]}
                  contentStyle={{ backgroundColor: "#0f172a", borderRadius: 12, color: "#fff", border: "none" }}
                />
                <Bar dataKey="amount" fill="#1e3a8a" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Scheme-wise Collection Breakdown */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm flex flex-col">
          <div className="mb-4">
            <h3 className="font-extrabold text-sm sm:text-base text-slate-800">
              {language === "ta" ? "திட்டம் வாரியான வசூல்" : "Scheme-wise Share"}
            </h3>
            <p className="text-xs text-slate-500">Distribution among active schemes</p>
          </div>

          <div className="h-52 w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.schemeCollectionChart || []}
                  dataKey="amount"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={75}
                  innerRadius={45}
                  paddingAngle={4}
                >
                  {(charts.schemeCollectionChart || []).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => formatINR(Number(value))} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 space-y-1.5 border-t border-slate-100 pt-3">
            {(charts.schemeCollectionChart || []).map((sc: any, idx: number) => (
              <div key={idx} className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: pieColors[idx % pieColors.length] }}
                  />
                  <span className="font-medium text-slate-700 truncate max-w-[150px]">
                    {language === "ta" && sc.tamilName ? sc.tamilName : sc.name}
                  </span>
                </div>
                <span className="font-bold text-slate-900">{formatINR(sc.amount)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tables Row: Recent Transactions & Installment Reminders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Payment Transactions */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-slate-800">
                {language === "ta" ? "சமீபத்திய தவணை வசூல்" : "Recent Payment Collections"}
              </h3>
              <p className="text-xs text-slate-500">Last received member contributions</p>
            </div>
            <Link
              href="/payments"
              className="text-xs font-bold text-brand-blue hover:text-blue-800 flex items-center gap-1"
            >
              <span>{language === "ta" ? "அனைத்தும்" : "View All"}</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase">
                <tr>
                  <th className="py-2.5 px-3 rounded-l-xl">Receipt</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Scheme</th>
                  <th className="py-2.5 px-3 text-right">Amount</th>
                  <th className="py-2.5 px-3 text-center rounded-r-xl">Mode</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentPayments.map((p: any) => (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-amber-700">
                      {p.receiptNumber}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-800">
                      <div>{p.customerName}</div>
                      <div className="text-[10px] text-slate-400">{p.mobile}</div>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">
                      {p.schemeName} <span className="text-[10px] font-bold text-slate-500">#{p.installmentNumber}</span>
                    </td>
                    <td className="py-2.5 px-3 font-bold text-right text-emerald-700">
                      {formatINR(p.amount)}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 uppercase">
                        {p.paymentMode}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Upcoming Installment Reminders */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-slate-800">
                {language === "ta" ? "வரவிருக்கும் தவணைகள் & நினைவூட்டல்" : "Upcoming Due & WhatsApp Reminders"}
              </h3>
              <p className="text-xs text-slate-500">Members with pending dues</p>
            </div>
            <Link
              href="/installments"
              className="text-xs font-bold text-brand-blue hover:text-blue-800 flex items-center gap-1"
            >
              <span>{language === "ta" ? "அனைத்தும்" : "View All"}</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {upcomingReminders.map((rem: any) => (
              <div
                key={rem.id}
                className="flex items-center justify-between p-3 rounded-2xl border border-slate-100 hover:border-amber-200 bg-slate-50/50 hover:bg-amber-50/30 transition-all text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800">{rem.customerName}</span>
                    <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">
                      Due: {formatDate(rem.dueDate)}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {rem.schemeName} • Installment #{rem.installmentNumber} • {formatINR(rem.amount)}
                  </p>
                </div>

                <a
                  href={getWhatsAppShareUrl(
                    rem.mobile,
                    generateDueReminderWhatsAppMessage({
                      customerName: rem.customerName,
                      schemeName: rem.schemeName,
                      installmentNumber: rem.installmentNumber,
                      amount: rem.amount,
                      dueDate: formatDate(rem.dueDate),
                      shopName: "ஸ்ரீ லட்சுமி சூப்பர் மார்க்கெட்",
                      shopPhone: "+91 98765 43210",
                    })
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] shadow-sm transition-colors"
                >
                  <Share2 className="h-3.5 w-3.5" />
                  <span>WhatsApp</span>
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Payment Modal */}
      {quickPayOpen && (
        <QuickPaymentModal
          isOpen={quickPayOpen}
          onClose={() => setQuickPayOpen(false)}
          onSuccess={() => {
            setQuickPayOpen(false);
            fetchDashboardData();
          }}
        />
      )}
    </div>
  );
}
