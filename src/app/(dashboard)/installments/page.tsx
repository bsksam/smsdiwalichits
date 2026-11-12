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
  Phone,
  BookOpen,
} from "lucide-react";
import Link from "next/link";
import { QuickPaymentModal } from "@/components/ui/QuickPaymentModal";

export default function InstallmentsPage() {
  const { t, language } = useLanguage();
  const [installments, setInstallments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending");
  const [schemeFilter, setSchemeFilter] = useState("");
  const [schemes, setSchemes] = useState<any[]>([]);

  // Quick Payment modal state
  const [quickPayOpen, setQuickPayOpen] = useState(false);
  const [selectedInstForPay, setSelectedInstForPay] = useState<any>(null);

  const fetchInstallments = async () => {
    try {
      let url = "/api/installments?";
      if (searchTerm.trim()) url += `search=${encodeURIComponent(searchTerm.trim())}&`;
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
    const timer = setTimeout(() => {
      fetchInstallments();
    }, 250);
    return () => clearTimeout(timer);
  }, [searchTerm, statusFilter, schemeFilter]);

  const handleOpenPay = (inst: any) => {
    setSelectedInstForPay(inst);
    setQuickPayOpen(true);
  };

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
            onClick={() => {
              setSelectedInstForPay(null);
              setQuickPayOpen(true);
            }}
            className="flex items-center gap-2 gold-gradient-btn text-[#1a0004] font-black text-xs px-4 py-2 rounded-xl shadow-md transition-all"
          >
            <Receipt className="h-4 w-4" />
            <span>{t.quickPayment}</span>
          </button>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="maroon-card p-4 rounded-2xl shadow-md space-y-3">
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-amber-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by customer mobile (e.g. 9600901937), name, scheme (1500, 700), or passbook..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-[#180003] border border-amber-500/40 rounded-xl text-amber-100 placeholder-amber-400/40 focus:ring-2 focus:ring-amber-400 font-semibold"
          />
        </div>

        {/* Status Filter Tabs & Scheme Dropdown */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-amber-500/20">
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
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  statusFilter === tab.key
                    ? "gold-gradient-btn text-[#1a0004] shadow-md font-black"
                    : "bg-[#250005] text-amber-200/80 border border-amber-500/30 hover:bg-amber-500/10"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Scheme dropdown */}
          <select
            value={schemeFilter}
            onChange={(e) => setSchemeFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-[#180003] border border-amber-500/40 rounded-xl font-bold text-amber-200"
          >
            <option value="">{language === "ta" ? "அனைத்து திட்டங்களும்" : "All Schemes"}</option>
            {schemes.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({formatINR(s.monthly_amount)})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Installments Table */}
      <div className="maroon-card rounded-3xl overflow-hidden shadow-xl border border-amber-500/25">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs bg-[#240005]">
            <thead className="bg-[#380109] text-amber-300 font-serif border-b border-amber-500/30">
              <tr>
                <th className="py-3 px-4">Passbook #</th>
                <th className="py-3 px-4">Customer Name & Mobile</th>
                <th className="py-3 px-4">Scheme</th>
                <th className="py-3 px-4 text-center">Month #</th>
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
                    No installments found for selected filter or search query.
                  </td>
                </tr>
              ) : (
                installments.map((inst) => (
                  <tr key={inst.id} className="hover:bg-amber-500/5 transition-colors text-amber-100">
                    <td className="py-3 px-4 font-mono font-bold text-amber-400">
                      <Link href={`/customers/${inst.customer_id}`} className="hover:underline">
                        {inst.passbook_number}
                      </Link>
                    </td>
                    <td className="py-3 px-4">
                      <Link href={`/customers/${inst.customer_id}`} className="font-bold text-amber-100 hover:text-amber-300 transition-colors">
                        {inst.customer_name}
                      </Link>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <a href={`tel:${inst.customer_mobile}`} className="text-[10px] text-emerald-400 font-mono hover:underline flex items-center gap-0.5">
                          <Phone className="h-2.5 w-2.5" />
                          <span>{inst.customer_mobile}</span>
                        </a>
                      </div>
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
                        {inst.status !== "paid" ? (
                          <>
                            <button
                              onClick={() => handleOpenPay(inst)}
                              className="px-2.5 py-1 text-[11px] font-bold gold-gradient-btn text-[#1a0004] rounded-lg shadow-sm flex items-center gap-1"
                            >
                              <Receipt className="h-3 w-3" />
                              <span>Collect</span>
                            </button>
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
                              className="p-1 rounded-lg text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/40 border border-emerald-500/20"
                            >
                              <Share2 className="h-4 w-4" />
                            </a>
                          </>
                        ) : (
                          <Link
                            href={`/customers/${inst.customer_id}`}
                            className="p-1 rounded-lg text-amber-300 hover:bg-amber-500/20 border border-amber-500/30"
                            title="View Scheme Ledger"
                          >
                            <BookOpen className="h-3.5 w-3.5" />
                          </Link>
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
          onClose={() => {
            setQuickPayOpen(false);
            setSelectedInstForPay(null);
          }}
          defaultCustomer={selectedInstForPay ? { id: selectedInstForPay.customer_id, full_name: selectedInstForPay.customer_name, mobile: selectedInstForPay.customer_mobile, customer_code: selectedInstForPay.customer_code } : undefined}
          defaultMemberId={selectedInstForPay?.member_id}
          defaultInstallmentId={selectedInstForPay?.id}
          onSuccess={() => {
            setQuickPayOpen(false);
            setSelectedInstForPay(null);
            fetchInstallments();
          }}
        />
      )}
    </div>
  );
}
