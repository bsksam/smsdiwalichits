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
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-amber-400 border-t-transparent" />
          <p className="text-sm font-semibold text-amber-300">
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

  const pieColors = ["#f59e0b", "#eab308", "#facc15", "#fbbf24", "#d97706"];

  return (
    <div className="space-y-6">
      {/* Welcome Banner in Deep Regal Maroon & Gold */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#4d020e] via-[#660517] to-[#3a0109] p-6 sm:p-8 text-white shadow-2xl border-2 border-amber-500/40">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-400/40 text-amber-300 text-xs font-bold mb-2 uppercase tracking-widest font-mono">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              <span>{language === "ta" ? "தீபாவளி பண்டிகை சிறப்பு சேமிப்பு ERP" : "Diwali Festival Savings ERP"}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-amber-300 font-serif">
              {language === "ta" ? "ஸ்ரீ லட்சுமி சூப்பர் மார்க்கெட்" : "Sri Lakshmi Supermarket"}
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-amber-100/80">
              {language === "ta"
                ? "தீபாவளி சீட்டு மேலாண்மை மற்றும் மளிகைப் பொருள் விநியோக கட்டுப்பாட்டு அறை"
                : "Diwali Chit Fund Management and Grocery Distribution Console"}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setQuickPayOpen(true)}
              className="gold-gradient-btn flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-black transition-all"
            >
              <Receipt className="h-4 w-4" />
              <span>{t.quickPayment}</span>
            </button>

            <Link
              href="/customers"
              className="flex items-center gap-2 bg-[#2a0006] hover:bg-[#3d020d] border border-amber-500/40 text-amber-200 font-bold text-xs sm:text-sm px-4 py-2.5 rounded-full transition-all"
            >
              <PlusCircle className="h-4 w-4 text-amber-400" />
              <span>{t.addCustomer}</span>
            </Link>

            <Link
              href="/poster-generator"
              className="flex items-center gap-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-full shadow-lg transition-all"
            >
              <Sparkles className="h-4 w-4 text-yellow-300" />
              <span>{t.posterGenerator}</span>
            </Link>
          </div>
        </div>

        {/* Collection Target Progress Bar */}
        <div className="mt-6 pt-5 border-t border-amber-500/20">
          <div className="flex justify-between items-center text-xs font-bold mb-1.5">
            <span className="text-amber-200/90 font-serif">
              {language === "ta" ? "இந்த மாத வசூல் இலக்கு முன்னேற்றம்" : "Monthly Collection Performance"}
            </span>
            <span className="text-amber-300 font-mono font-black">{metrics.collectionProgress}% Completed</span>
          </div>
          <div className="w-full bg-[#200004] h-2.5 rounded-full overflow-hidden border border-amber-500/20">
            <div
              className="bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 h-full rounded-full transition-all duration-500 shadow-sm shadow-amber-400/50"
              style={{ width: `${Math.min(100, metrics.collectionProgress || 10)}%` }}
            />
          </div>
        </div>
      </div>

      {/* 10 Dashboard Key Metric Cards in Photo 2 Maroon & Gold */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* 1. Total Customers */}
        <div className="rounded-2xl border border-amber-500/30 bg-[#350109]/90 backdrop-blur-md p-4 shadow-xl hover:border-amber-400/60 transition-all">
          <div className="flex items-center justify-between text-amber-200/70 mb-2">
            <span className="text-xs font-bold">{t.totalCustomers}</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-amber-300 font-serif">{metrics.totalCustomers}</p>
          <span className="text-[10px] text-emerald-400 font-bold mt-1 inline-block">Active Enrolled</span>
        </div>

        {/* 2. Active Members */}
        <div className="rounded-2xl border border-amber-500/30 bg-[#350109]/90 backdrop-blur-md p-4 shadow-xl hover:border-amber-400/60 transition-all">
          <div className="flex items-center justify-between text-amber-200/70 mb-2">
            <span className="text-xs font-bold">{t.activeMembers}</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <CalendarCheck className="h-4 w-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-amber-300 font-serif">{metrics.activeMembers}</p>
          <span className="text-[10px] text-amber-200/60 font-semibold mt-1 inline-block">Passbooks Active</span>
        </div>

        {/* 3. Running Schemes */}
        <div className="rounded-2xl border border-amber-500/30 bg-[#350109]/90 backdrop-blur-md p-4 shadow-xl hover:border-amber-400/60 transition-all">
          <div className="flex items-center justify-between text-amber-200/70 mb-2">
            <span className="text-xs font-bold">{t.totalSchemes}</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Sparkles className="h-4 w-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-amber-300 font-serif">{metrics.runningSchemes}</p>
          <span className="text-[10px] text-amber-400 font-bold mt-1 inline-block">₹700, ₹1000, ₹1500</span>
        </div>

        {/* 4. Today's Collection */}
        <div className="rounded-2xl border border-amber-400/50 bg-[#42040f]/90 backdrop-blur-md p-4 shadow-xl hover:border-amber-400 transition-all">
          <div className="flex items-center justify-between text-amber-300 mb-2">
            <span className="text-xs font-bold">{t.todayCollection}</span>
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-amber-300 font-serif">{formatINR(metrics.todayCollection)}</p>
          <span className="text-[10px] text-emerald-400 font-bold mt-1 inline-block">Today Verified</span>
        </div>

        {/* 5. Monthly Collection */}
        <div className="rounded-2xl border border-amber-500/30 bg-[#350109]/90 backdrop-blur-md p-4 shadow-xl hover:border-amber-400/60 transition-all">
          <div className="flex items-center justify-between text-amber-200/70 mb-2">
            <span className="text-xs font-bold">{t.monthlyCollection}</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Receipt className="h-4 w-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-amber-300 font-serif">{formatINR(metrics.monthlyCollection)}</p>
          <span className="text-[10px] text-amber-400 font-bold mt-1 inline-block">This Month</span>
        </div>

        {/* 6. Pending Collection */}
        <div className="rounded-2xl border border-amber-500/30 bg-[#350109]/90 backdrop-blur-md p-4 shadow-xl hover:border-amber-400/60 transition-all">
          <div className="flex items-center justify-between text-amber-200/70 mb-2">
            <span className="text-xs font-bold">{t.pendingCollection}</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-amber-300 font-serif">{formatINR(metrics.pendingAmount)}</p>
          <span className="text-[10px] text-amber-300/80 font-semibold mt-1 inline-block font-mono">{metrics.pendingCount} Installments</span>
        </div>

        {/* 7. Overdue Payments */}
        <div className="rounded-2xl border border-rose-500/40 bg-[#42040f]/90 backdrop-blur-md p-4 shadow-xl hover:border-rose-400 transition-all">
          <div className="flex items-center justify-between text-rose-300 mb-2">
            <span className="text-xs font-bold">{t.overduePayments}</span>
            <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-rose-300 font-serif">{formatINR(metrics.overdueAmount)}</p>
          <span className="text-[10px] text-rose-400 font-bold mt-1 inline-block font-mono">{metrics.overdueCount} Past Due</span>
        </div>

        {/* 8. Completed Schemes */}
        <div className="rounded-2xl border border-amber-500/30 bg-[#350109]/90 backdrop-blur-md p-4 shadow-xl hover:border-amber-400/60 transition-all">
          <div className="flex items-center justify-between text-amber-200/70 mb-2">
            <span className="text-xs font-bold">{t.completedSchemes}</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Gift className="h-4 w-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-amber-300 font-serif">{metrics.completedSchemes}</p>
          <span className="text-[10px] text-amber-400 font-bold mt-1 inline-block">Ready to Redeem</span>
        </div>

        {/* 9. Upcoming Maturity */}
        <div className="rounded-2xl border border-amber-500/30 bg-[#350109]/90 backdrop-blur-md p-4 shadow-xl hover:border-amber-400/60 transition-all">
          <div className="flex items-center justify-between text-amber-200/70 mb-2">
            <span className="text-xs font-bold">{t.upcomingMaturity}</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <CalendarCheck className="h-4 w-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-amber-300 font-serif">{metrics.upcomingMaturity}</p>
          <span className="text-[10px] text-amber-300/80 font-bold mt-1 inline-block">Next 60 Days</span>
        </div>

        {/* 10. Grocery Stock Value */}
        <div className="rounded-2xl border border-amber-500/30 bg-[#350109]/90 backdrop-blur-md p-4 shadow-xl hover:border-amber-400/60 transition-all">
          <div className="flex items-center justify-between text-amber-200/70 mb-2">
            <span className="text-xs font-bold">{t.groceryStockValue}</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Boxes className="h-4 w-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-amber-300 font-serif">{formatINR(metrics.groceryStockValue)}</p>
          <span className="text-[10px] text-amber-400 font-bold mt-1 inline-block">In Supermarket</span>
        </div>
      </div>

      {/* Charts Section in Maroon Glass */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Collection Trend */}
        <div className="lg:col-span-2 rounded-3xl border border-amber-500/30 bg-[#350109]/90 p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-amber-300 font-serif">
                {language === "ta" ? "மாதாந்திர வசூல் வரைபடம் (Monthly Collection Trend)" : "Monthly Collection Trend"}
              </h3>
              <p className="text-xs text-amber-200/60">Breakdown of collections across months</p>
            </div>
            <span className="text-xs font-mono font-bold bg-amber-500/10 border border-amber-400/30 text-amber-300 px-3 py-1 rounded-full">
              Total: {formatINR(metrics.totalLifetimeCollection)}
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.monthlyCollectionChart || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(212, 175, 55, 0.15)" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#fde047" }} />
                <YAxis tick={{ fontSize: 11, fill: "#fde047" }} tickFormatter={(val) => `₹${val / 1000}k`} />
                <Tooltip
                  formatter={(value: any) => [formatINR(Number(value)), "Collection"]}
                  contentStyle={{ backgroundColor: "#200004", borderRadius: 12, color: "#fef08a", border: "1px solid rgba(212, 175, 55, 0.4)" }}
                />
                <Bar dataKey="amount" fill="#d4af37" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Scheme-wise Collection Breakdown */}
        <div className="rounded-3xl border border-amber-500/30 bg-[#350109]/90 p-6 shadow-xl flex flex-col">
          <div className="mb-4">
            <h3 className="font-extrabold text-sm sm:text-base text-amber-300 font-serif">
              {language === "ta" ? "திட்டம் வாரியான வசூல்" : "Scheme-wise Share"}
            </h3>
            <p className="text-xs text-amber-200/60">Distribution among active schemes</p>
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
                <Tooltip
                  formatter={(value: any) => formatINR(Number(value))}
                  contentStyle={{ backgroundColor: "#200004", borderRadius: 12, color: "#fef08a", border: "1px solid rgba(212, 175, 55, 0.4)" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 space-y-1.5 border-t border-amber-500/20 pt-3">
            {(charts.schemeCollectionChart || []).map((sc: any, idx: number) => (
              <div key={idx} className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: pieColors[idx % pieColors.length] }}
                  />
                  <span className="font-medium text-amber-200/80 truncate max-w-[150px]">
                    {language === "ta" && sc.tamilName ? sc.tamilName : sc.name}
                  </span>
                </div>
                <span className="font-bold text-amber-300 font-mono">{formatINR(sc.amount)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tables Row: Recent Transactions & Installment Reminders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Payment Transactions */}
        <div className="rounded-3xl border border-amber-500/30 bg-[#350109]/90 p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-amber-300 font-serif">
                {language === "ta" ? "சமீபத்திய தவணை வசூல்" : "Recent Payment Collections"}
              </h3>
              <p className="text-xs text-amber-200/60">Last received member contributions</p>
            </div>
            <Link
              href="/payments"
              className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 font-mono"
            >
              <span>{language === "ta" ? "அனைத்தும்" : "View All"}</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#240005] text-amber-300 font-bold uppercase">
                <tr>
                  <th className="py-2.5 px-3 rounded-l-xl">Receipt</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Scheme</th>
                  <th className="py-2.5 px-3 text-right">Amount</th>
                  <th className="py-2.5 px-3 text-center rounded-r-xl">Mode</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-500/10">
                {recentPayments.map((p: any) => (
                  <tr key={p.id} className="hover:bg-amber-500/10 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-amber-400">
                      {p.receiptNumber}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-amber-100">
                      <div>{p.customerName}</div>
                      <div className="text-[10px] text-amber-300/60 font-mono">{p.mobile}</div>
                    </td>
                    <td className="py-2.5 px-3 text-amber-200/80">
                      {p.schemeName} <span className="text-[10px] font-bold text-amber-400">#{p.installmentNumber}</span>
                    </td>
                    <td className="py-2.5 px-3 font-bold text-right text-emerald-400 font-mono">
                      {formatINR(p.amount)}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#200004] text-amber-300 border border-amber-500/30 uppercase">
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
        <div className="rounded-3xl border border-amber-500/30 bg-[#350109]/90 p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-amber-300 font-serif">
                {language === "ta" ? "வரவிருக்கும் தவணைகள் & நினைவூட்டல்" : "Upcoming Due & WhatsApp Reminders"}
              </h3>
              <p className="text-xs text-amber-200/60">Members with pending dues</p>
            </div>
            <Link
              href="/installments"
              className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 font-mono"
            >
              <span>{language === "ta" ? "அனைத்தும்" : "View All"}</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {upcomingReminders.map((rem: any) => (
              <div
                key={rem.id}
                className="flex items-center justify-between p-3 rounded-2xl border border-amber-500/20 bg-[#250005]/70 hover:bg-amber-500/10 transition-all text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-amber-200">{rem.customerName}</span>
                    <span className="text-[10px] bg-amber-500/10 border border-amber-400/30 text-amber-300 font-bold px-2 py-0.5 rounded-full font-mono">
                      Due: {formatDate(rem.dueDate)}
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-200/70 mt-0.5">
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
