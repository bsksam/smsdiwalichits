"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "@/components/layout/LanguageContext";
import { formatINR, formatDate, getStatusBadge } from "@/lib/utils";
import { getWhatsAppShareUrl, generateDueReminderWhatsAppMessage } from "@/lib/whatsapp";
import {
  CalendarCheck,
  Search,
  Filter,
  CheckCircle,
  Clock,
  AlertTriangle,
  Receipt,
  Share2,
  Printer,
  ChevronRight,
} from "lucide-react";
import { QuickPaymentModal } from "@/components/ui/QuickPaymentModal";

export default function InstallmentsPage() {
  const { t, language } = useLanguage();
  const [installments, setInstallments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [schemeFilter, setSchemeFilter] = useState("");
  const [schemes, setSchemes] = useState<any[]>([]);
  const [quickPayOpen, setQuickPayOpen] = useState(false);

  const fetchInstallments = async () => {
    try {
      let url = "/api/installments?";
      if (statusFilter) url += `status=${statusFilter}&`;
      if (schemeFilter) url += `schemeId=${schemeFilter}&`;

      const res = await fetch(url);
      const data = await res.json();
      setInstallments(data.installments || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch("/api/schemes")
      .then((res) => res.json())
      .then((data) => setSchemes(data.schemes || []));
  }, []);

  useEffect(() => {
    fetchInstallments();
  }, [statusFilter, schemeFilter]);

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">
            {t.installments}
          </h1>
          <p className="text-xs text-slate-500">
            {language === "ta"
              ? "மாதாந்திர தவணை அட்டவணை, நிலுவை மற்றும் வசூல் தாள்கள்"
              : "Track monthly installments, dues, pending schedules and collection sheets"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 px-3.5 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all"
          >
            <Printer className="h-4 w-4 text-slate-600" />
            <span>{language === "ta" ? "வசூல் பட்டியல் அச்சிடு" : "Print Collection Sheet"}</span>
          </button>

          <button
            onClick={() => setQuickPayOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-md shadow-amber-500/25 transition-all"
          >
            <Receipt className="h-4 w-4" />
            <span>{t.quickPayment}</span>
          </button>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          { key: "pending", label: language === "ta" ? "நிலுவையில் உள்ளவை" : "Pending", count: null },
          { key: "paid", label: language === "ta" ? "செலுத்தப்பட்டவை" : "Paid", count: null },
          { key: "overdue", label: language === "ta" ? "தாமதமான தவணைகள்" : "Overdue", count: null },
          { key: "", label: language === "ta" ? "அனைத்து தவணைகளும்" : "All", count: null },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              statusFilter === tab.key
                ? "bg-brand-blue text-white shadow-md shadow-blue-900/20"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            {tab.label}
          </button>
        ))}

        {/* Scheme dropdown */}
        <select
          value={schemeFilter}
          onChange={(e) => setSchemeFilter(e.target.value)}
          className="ml-auto px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl font-medium"
        >
          <option value="">{language === "ta" ? "அனைத்து திட்டங்களும்" : "All Schemes"}</option>
          {schemes.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} ({formatINR(s.monthly_amount)})
            </option>
          ))}
        </select>
      </div>

      {/* Installments Table */}
      <div className="rounded-3xl border border-slate-200/80 bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Passbook #</th>
                <th className="py-3 px-4">Customer Name</th>
                <th className="py-3 px-4">Scheme</th>
                <th className="py-3 px-4 text-center">Installment #</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Loading installments...
                  </td>
                </tr>
              ) : installments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No installments found for selected filter.
                  </td>
                </tr>
              ) : (
                installments.map((inst) => (
                  <tr key={inst.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-amber-700">
                      {inst.passbook_number}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-800">{inst.customer_name}</div>
                      <div className="text-[10px] text-slate-400">{inst.customer_mobile}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-medium">
                      {inst.scheme_name}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="font-mono font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-800">
                        #{inst.installment_number}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">
                      {formatDate(inst.due_date)}
                    </td>
                    <td className="py-3 px-4 text-right font-extrabold text-slate-900">
                      {formatINR(inst.amount)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(inst.status)}`}>
                        {inst.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {inst.status !== "paid" && (
                          <a
                            href={getWhatsAppShareUrl(
                              inst.customer_mobile,
                              generateDueReminderWhatsAppMessage({
                                customerName: inst.customer_name,
                                schemeName: inst.scheme_name,
                                installmentNumber: inst.installment_number,
                                amount: inst.amount,
                                dueDate: formatDate(inst.due_date),
                                shopName: "ஸ்ரீ லட்சுமி சூப்பர் மார்க்கெட்",
                                shopPhone: "+91 98765 43210",
                              })
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50"
                            title="Send WhatsApp Reminder"
                          >
                            <Share2 className="h-4 w-4" />
                          </a>
                        )}
                        <button
                          onClick={() => setQuickPayOpen(true)}
                          className="px-2 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-[10px] shadow-sm"
                        >
                          Collect
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Pay Modal */}
      {quickPayOpen && (
        <QuickPaymentModal
          isOpen={quickPayOpen}
          onClose={() => setQuickPayOpen(false)}
          onSuccess={() => {
            setQuickPayOpen(false);
            fetchInstallments();
          }}
        />
      )}
    </div>
  );
}
