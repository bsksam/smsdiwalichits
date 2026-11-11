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
    const ws = XLSX.utils.json_to_sheet(reportData.rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Report");
    XLSX.writeFile(wb, `Diwali_Chit_Report_${reportType}.xlsx`);
  };

  const reportOptions = [
    { id: "daily_collection", label: language === "ta" ? "இன்றைய / தினசரி வசூல் அறிக்கை" : "Daily Collection Report" },
    { id: "monthly_collection", label: language === "ta" ? "மாதாந்திர வசூல் அறிக்கை" : "Monthly Collection Report" },
    { id: "scheme_wise", label: language === "ta" ? "திட்டம் வாரியான வசூல் அறிக்கை" : "Scheme-wise Collection Report" },
    { id: "pending_installments", label: language === "ta" ? "நிலுவைத் தவணைகள் பட்டியல்" : "Pending Installments Report" },
    { id: "overdue", label: language === "ta" ? "தாமதமான தவணைகள் அறிக்கை" : "Overdue Defaulters Report" },
    { id: "redemptions", label: language === "ta" ? "பொருட்கள் வழங்கல் அறிக்கை" : "Grocery Redemptions Report" },
    { id: "stock", label: language === "ta" ? "மளிகை இருப்பு & மதிப்பு அறிக்கை" : "Stock Inventory Valuation" },
    { id: "profit_loss", label: language === "ta" ? "வருவாய் & செலவு சுருக்கம் (P&L)" : "Income & Expense (P&L) Summary" },
    { id: "staff_collection", label: language === "ta" ? "பணியாளர் வாரியான வசூல்" : "Staff Collection Performance" },
  ];

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">
            {t.reports}
          </h1>
          <p className="text-xs text-slate-500">
            {language === "ta"
              ? "நிதி அறிக்கைகள், தணிக்கை விவரங்கள் & எக்செல் ஏற்றுமதி"
              : "Financial collection audits, overdue reports, stock valuations and Excel exports"}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={exportToExcel}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all"
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>Export Excel</span>
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 px-3.5 py-2 rounded-xl text-xs font-bold shadow-sm transition-all"
          >
            <Printer className="h-4 w-4" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Report Selector & Date Filter */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-4 rounded-3xl border border-slate-200 shadow-sm text-xs">
        <div>
          <label className="block font-bold text-slate-700 mb-1">Select Report Type</label>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-brand-blue"
          >
            {reportOptions.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1">From Date / Month</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
          />
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1">To Date</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
          />
        </div>
      </div>

      {/* Render Dynamic Report Results */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-4">
        {loading ? (
          <div className="py-12 text-center text-slate-400 text-xs">Generating report...</div>
        ) : reportType === "profit_loss" ? (
          /* Profit and Loss Summary Layout */
          <div className="max-w-xl mx-auto space-y-4 p-6 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
            <h3 className="text-base font-extrabold text-slate-900 border-b pb-2 text-center">
              Supermarket Chit Fund Profit & Loss Summary
            </h3>

            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-slate-200">
                <span className="font-semibold text-slate-700">Total Chit Installments Collected (Income):</span>
                <span className="font-extrabold text-emerald-700 text-sm">
                  {formatINR(reportData?.totalIncome)}
                </span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-slate-200">
                <span className="font-semibold text-slate-700">Total Shop Operating Expenses:</span>
                <span className="font-extrabold text-rose-700 text-sm">
                  - {formatINR(reportData?.totalExpense)}
                </span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-slate-200">
                <span className="font-semibold text-slate-700">Total Grocery Packages Distributed:</span>
                <span className="font-bold text-purple-700 text-sm">
                  {formatINR(reportData?.totalRedemptions)}
                </span>
              </div>

              <div className="flex justify-between items-center pt-3 text-base font-black text-brand-blue">
                <span>Net Cash Operating Profit:</span>
                <span className="text-lg text-emerald-800">
                  {formatINR(reportData?.netProfit)}
                </span>
              </div>
            </div>
          </div>
        ) : (
          /* Standard Rows Table */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase border-b border-slate-200">
                <tr>
                  {reportData?.rows?.[0] &&
                    Object.keys(reportData.rows[0]).map((key) => (
                      <th key={key} className="py-3 px-3 uppercase text-[10px]">
                        {key.replace(/_/g, " ")}
                      </th>
                    ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(!reportData?.rows || reportData.rows.length === 0) ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No records found for the selected period.
                    </td>
                  </tr>
                ) : (
                  reportData.rows.map((row: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50/70">
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
