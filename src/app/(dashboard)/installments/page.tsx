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
  Sparkles,
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
          <h1 className="text-xl sm:text-2xl font-black text-amber-300 font-serif tracking-wide drop-shadow flex items-center gap-2">
            <CalendarCheck className="h-6 w-6 text-amber-400" />
            <span>{t.installments}</span>
          </h1>
          <p className="text-xs text-amber-200/70 mt-1">
            {language === "ta"
              ? "மாதாந்திர தவணை அட்டவணை, நிலுவை மற்றும் வசூல் தாள்கள்"
              : "Track monthly installments, dues, pending schedules and collection sheets"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 border border-amber-500/30 bg-[#250005] hover:bg-amber-500/10 text-amber-200 px-3.5 py-2 rounded-xl text-xs font-bold shadow-sm transition-all"
          >
            <Printer className="h-4 w-4 text-amber-400" />
            <span>{language === "ta" ? "வசூல் பட்டியல் அச்சிடு" : "Print Collection Sheet"}</span>
          </button>

          <button
            onClick={() => setQuickPayOpen(true)}
            className="flex items-center gap-2 gold-gradient-btn text-[#1a0004] font-black text-xs px-4 py-2 rounded-xl shadow-md transition-all"
          >
            <Receipt className="h-4 w-4" />
            <span>{t.quickPayment}</span>
          </button>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {[
          { key: "pending", label: language === "ta" ? "நிலுவையில் உள்ளவை" : "Pending" },
          { key: "paid", label: language === "ta" ? "செலுத்தப்பட்டவை" : "Paid" },
          { key: "overdue", label: language === "ta" ? "தாமதமான தவணைகள்" : "Overdue" },
          { key: "", label: language === "ta" ? "அனைத்து தவணைகளும்" : "All" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              statusFilter === tab.key
                ? "gold-gradient-btn text-[#1a0004] shadow-md font-black"
                : "bg-[#250005] text-amber-200/80 border border-amber-500/30 hover:bg-amber-500/10"
            }`}
          >
            {tab.label}
          </button>
        ))}

        {/* Scheme dropdown */}
        <select
          value={schemeFilter}
          onChange={(e) => setSchemeFilter(e.target.value)}
          className="ml-auto px-3 py-2 text-xs bg-[#180003] border border-amber-500/40 rounded-xl font-bold text-amber-200"
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
      <div className="maroon-card rounded-3xl overflow-hidden shadow-xl border border-amber-500/25">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs bg-[#240005]">
            <thead className="bg-[#380109] text-amber-300 font-serif border-b border-amber-500/30">
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
            <tbody className="divide-y divide-amber-500/10">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-amber-300/60 font-serif">
                    Loading installments...
                  </td>
                </tr>
              ) : installments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-amber-300/60 font-serif">
                    No installments found for selected filter.
                  </td>
                </tr>
              ) : (
                installments.map((inst) => (
                  <tr key={inst.id} className="hover:bg-amber-500/5 transition-colors text-amber-100">
                    <td className="py-3 px-4 font-mono font-bold text-amber-400">
                      {inst.passbook_number}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-amber-100">{inst.customer_name}</div>
                      <div className="text-[10px] text-amber-400/60 font-mono">{inst.customer_mobile}</div>
                    </td>
                    <td className="py-3 px-4 text-amber-200/80 font-medium">
                      {inst.scheme_name}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="font-mono font-bold bg-[#1e0004] border border-amber-500/30 px-2 py-0.5 rounded text-amber-300">
                        #{inst.installment_number}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-amber-300/80">
                      {formatDate(inst.due_date)}
                    </td>
                    <td className="py-3 px-4 text-right font-black text-amber-300 text-sm">
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
                            title="Send WhatsApp Payment Reminder"
                            className="p-1.5 rounded-lg text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/40 border border-emerald-500/20"
                          >
                            <Share2 className="h-4 w-4" />
                          </a>
                        )}
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
