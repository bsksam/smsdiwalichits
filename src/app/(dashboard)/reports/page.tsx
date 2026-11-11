"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "@/components/layout/LanguageContext";
import { formatINR, formatDate, getStatusBadge } from "@/lib/utils";
import {
  BarChart3,
  Calendar,
  Download,
  Printer,
  Filter,
  FileSpreadsheet,
  FileText,
  DollarSign,
  TrendingUp,
  Receipt,
  Boxes,
  Gift,
  AlertTriangle,
  Sparkles,
} from "lucide-react";
import * as XLSX from "xlsx";

export default function ReportsPage() {
  const { t, language } = useLanguage();
  const [reportType, setReportType] = useState("daily_collection");
  const [fromDate, setFromDate] = useState(new Date().toISOString().split("T")[0]);
  const [toDate, setToDate] = useState(new Date().toISOString().split("T")[0]);
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const url = `/api/reports?type=${reportType}&fromDate=${fromDate}&toDate=${toDate}`;
      const res = await fetch(url);
      const data = await res.json();
      setReportData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [reportType, fromDate, toDate]);

  const exportToExcel = () => {
    if (!reportData?.rows) return;
    const worksheet = XLSX.utils.json_to_sheet(reportData.rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
    XLSX.writeFile(workbook, `Diwali_Chit_${reportType}_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const reportOptions = [
    { id: "daily_collection", label: language === "ta" ? "தினசரி வசூல் அறிக்கை (Daily Collection)" : "Daily Collection Report" },
    { id: "scheme_wise", label: language === "ta" ? "திட்டம் வாரியான அறிக்கை (Scheme Performance)" : "Scheme-wise Performance" },
    { id: "customer_due", label: language === "ta" ? "நிலுவைத் தவணைகள் பட்டியல் (Defaulters / Due List)" : "Defaulters / Pending Dues List" },
    { id: "grocery_redemption", label: language === "ta" ? "மளிகை விநியோக அறிக்கை (Grocery Redemptions)" : "Grocery Hamper Redemption Report" },
    { id: "profit_loss", label: language === "ta" ? "லாப நஷ்ட சுருக்கம் (P&L Financial Summary)" : "Profit & Loss Operating Summary" },
  ];

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-amber-300 font-serif tracking-wide drop-shadow flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-amber-400" />
            <span>{t.reports}</span>
          </h1>
          <p className="text-xs text-amber-200/70 mt-1">
            {language === "ta"
              ? "நிதி தணிக்கை, வசூல் அறிக்கைகள், நிலுவை தாள்கள் & எக்செல் தரவிறக்கம்"
              : "Financial audits, collection summaries, defaulter lists & Excel exports"}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 border border-amber-500/30 bg-[#250005] hover:bg-amber-500/10 text-amber-200 px-3.5 py-2 rounded-xl text-xs font-bold shadow-sm transition-all"
          >
            <Printer className="h-4 w-4 text-amber-400" />
            <span>Print Report</span>
          </button>

          <button
            onClick={exportToExcel}
            className="flex items-center gap-2 gold-gradient-btn text-[#1a0004] px-4 py-2 rounded-xl text-xs font-black shadow-md transition-all"
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>Download Excel</span>
          </button>
        </div>
      </div>

      {/* Report Selector & Date Filter */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 maroon-card p-4 rounded-3xl shadow-md text-xs">
        <div>
          <label className="block font-bold text-amber-300 mb-1 font-serif">Select Report Type</label>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="w-full px-3 py-2 bg-[#180003] border border-amber-500/40 rounded-xl font-bold text-amber-200"
          >
            {reportOptions.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-bold text-amber-300 mb-1 font-serif">From Date / Month</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="w-full px-3 py-2 bg-[#180003] border border-amber-500/40 rounded-xl font-medium text-amber-100"
          />
        </div>

        <div>
          <label className="block font-bold text-amber-300 mb-1 font-serif">To Date</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="w-full px-3 py-2 bg-[#180003] border border-amber-500/40 rounded-xl font-medium text-amber-100"
          />
        </div>
      </div>

      {/* Render Dynamic Report Results */}
      <div className="maroon-card rounded-3xl p-6 shadow-xl space-y-4 border border-amber-500/25">
        {loading ? (
          <div className="py-12 text-center text-amber-300/60 font-serif text-xs">Generating report...</div>
        ) : reportType === "profit_loss" ? (
          /* Profit and Loss Summary Layout */
          <div className="max-w-xl mx-auto space-y-4 p-6 bg-[#1e0004] rounded-2xl border border-amber-500/30 text-xs">
            <h3 className="text-base font-black text-amber-300 font-serif border-b border-amber-500/20 pb-3 text-center">
              Supermarket Chit Fund Profit & Loss Summary
            </h3>

            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-amber-500/15">
                <span className="font-semibold text-amber-200">Total Chit Installments Collected (Income):</span>
                <span className="font-black text-emerald-400 text-sm font-serif">
                  {formatINR(reportData?.totalIncome)}
                </span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-amber-500/15">
                <span className="font-semibold text-amber-200">Total Shop Operating Expenses:</span>
                <span className="font-black text-rose-400 text-sm font-serif">
                  - {formatINR(reportData?.totalExpense)}
                </span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-amber-500/15">
                <span className="font-semibold text-amber-200">Total Grocery Packages Distributed:</span>
                <span className="font-black text-amber-400 text-sm font-serif">
                  {formatINR(reportData?.totalRedemptions)}
                </span>
              </div>

              <div className="flex justify-between items-center pt-3 text-base font-black text-amber-300 border-t border-amber-500/30">
                <span>Net Cash Operating Profit:</span>
                <span className="text-xl text-emerald-400 font-serif">
                  {formatINR(reportData?.netProfit)}
                </span>
              </div>
            </div>
          </div>
        ) : (
          /* Standard Rows Table */
          <div className="overflow-x-auto rounded-2xl border border-amber-500/20">
            <table className="w-full text-left text-xs bg-[#240005]">
              <thead className="bg-[#380109] text-amber-300 font-serif border-b border-amber-500/30">
                <tr>
                  {reportData?.rows?.[0] &&
                    Object.keys(reportData.rows[0]).map((key) => (
                      <th key={key} className="py-3 px-3 uppercase text-[10px]">
                        {key.replace(/_/g, " ")}
                      </th>
                    ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-500/10">
                {(!reportData?.rows || reportData.rows.length === 0) ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-amber-300/60 font-serif">
                      No records found for the selected period.
                    </td>
                  </tr>
                ) : (
                  reportData.rows.map((row: any, idx: number) => (
                    <tr key={idx} className="hover:bg-amber-500/5 transition-colors text-amber-100">
                      {Object.entries(row).map(([k, val]: any, i) => (
                        <td key={i} className="py-2.5 px-3">
                          {typeof val === "number" && (k.includes("amount") || k.includes("total") || k.includes("price") || k.includes("val"))
                            ? formatINR(val)
                            : String(val ?? "-")}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
