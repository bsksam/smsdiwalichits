"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "@/components/layout/LanguageContext";
import { formatINR, formatDate, getStatusBadge } from "@/lib/utils";
import { getWhatsAppShareUrl, generatePaymentReceiptWhatsAppMessage } from "@/lib/whatsapp";
import {
  Receipt,
  Search,
  Plus,
  Share2,
  Printer,
  RotateCcw,
  CheckCircle2,
  X,
  CreditCard,
  FileSpreadsheet,
  Eye,
  Download,
} from "lucide-react";
import { QuickPaymentModal } from "@/components/ui/QuickPaymentModal";
import * as XLSX from "xlsx";
import { generatePaymentReceiptPDF, shareOrDownloadPDF, printPDF } from "@/lib/pdf";

export default function PaymentsPage() {
  const { t, language } = useLanguage();
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [paymentModeFilter, setPaymentModeFilter] = useState("");
  const [quickPayOpen, setQuickPayOpen] = useState(false);

  // Selected receipt for detailed viewing/printing
  const [viewingReceipt, setViewingReceipt] = useState<any>(null);
  const [sharingWa, setSharingWa] = useState(false);

  // App Master Settings
  const [appSettings, setAppSettings] = useState<any>({
    shop_name: "ஸ்ரீ லட்சுமி சூப்பர் மார்க்கெட் (SRI LAKSHMI SUPERMARKET)",
    shop_address: "2a PP NAGAR MADURAI, MADURAI - 625016, Tamil Nadu",
    shop_phone: "+91 96009 01937 / +91 91502 80795",
    shop_gst: "33bsops67891zq",
  });

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data?.settings) setAppSettings(data.settings);
      })
      .catch(() => {});
  }, []);

  // Reversal Modal
  const [reversalModalOpen, setReversalModalOpen] = useState(false);
  const [selectedPaymentToReverse, setSelectedPaymentToReverse] = useState<any>(null);
  const [reversalReason, setReversalReason] = useState("");
  const [reversing, setReversing] = useState(false);
  const [reversalError, setReversalError] = useState<string | null>(null);

  const fetchPayments = async () => {
    try {
      let url = `/api/payments?search=${encodeURIComponent(searchTerm)}`;
      if (paymentModeFilter) url += `&paymentMode=${paymentModeFilter}`;
      const res = await fetch(url);
      const data = await res.json();
      setPayments(data.payments || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [searchTerm, paymentModeFilter]);

  const handleOpenReverse = (payment: any) => {
    setSelectedPaymentToReverse(payment);
    setReversalReason("");
    setReversalError(null);
    setReversalModalOpen(true);
  };

  const handleReverseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reversalReason.trim() || reversalReason.trim().length < 5) {
      setReversalError("Please provide a mandatory detailed reason (at least 5 characters).");
      return;
    }
    setReversing(true);
    setReversalError(null);

    try {
      const res = await fetch("/api/payments/reverse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentId: selectedPaymentToReverse.id,
          reason: reversalReason.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Reversal failed");
      }
      setReversalModalOpen(false);
      fetchPayments();
    } catch (err: any) {
      setReversalError(err.message || "Failed to reverse transaction");
    } finally {
      setReversing(false);
    }
  };

  const exportToExcel = () => {
    const exportData = payments.map((p) => ({
      "Receipt Number": p.receipt_number,
      "Customer Name": p.customer_name,
      "Mobile": p.customer_mobile,
      "Scheme Name": p.scheme_name,
      "Installment #": p.installment_number,
      "Amount (₹)": p.total_amount,
      "Payment Mode": p.payment_mode,
      "Reference": p.transaction_ref || "-",
      "Payment Date": formatDate(p.payment_date),
      "Status": p.status,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Collections");
    XLSX.writeFile(workbook, `Diwali_Chit_Receipts_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const handleShareWhatsApp = (p: any) => {
    const msg = generatePaymentReceiptWhatsAppMessage({
      customerName: p.customer_name,
      schemeName: p.scheme_name,
      installmentNumber: p.installment_number,
      amount: p.total_amount,
      paymentMode: p.payment_mode,
      receiptNumber: p.receipt_number,
      paymentDate: formatDate(p.payment_date),
      shopName: appSettings.shop_name?.split("(")[0]?.trim() || "SRI LAKSHMI SUPERMARKET",
      shopPhone: appSettings.shop_phone || "+91 96009 01937",
    });
    const url = getWhatsAppShareUrl(p.customer_mobile, msg);
    window.open(url, "_blank");
  };

  const handleDownloadReceiptPDF = (p: any) => {
    if (!p) return;
    const doc = generatePaymentReceiptPDF(p, appSettings);
    doc.save(`Receipt_${p.receipt_number || "Payment"}.pdf`);
  };

  const handleShareReceiptWhatsAppPDF = async (p: any) => {
    if (!p) return;
    setSharingWa(true);
    try {
      const doc = generatePaymentReceiptPDF(p, appSettings);
      const text = generatePaymentReceiptWhatsAppMessage({
        customerName: p.customer_name,
        schemeName: p.scheme_name,
        installmentNumber: p.installment_number,
        amount: p.total_amount,
        paymentMode: p.payment_mode,
        receiptNumber: p.receipt_number,
        paymentDate: formatDate(p.payment_date),
        shopName: appSettings.shop_name || "SRI LAKSHMI SUPERMARKET",
        shopPhone: appSettings.shop_phone || "+91 96009 01937",
      });

      await shareOrDownloadPDF(
        doc,
        `Receipt_${p.receipt_number || "Payment"}.pdf`,
        `Payment Receipt - ${p.customer_name}`,
        p.customer_mobile,
        text
      );
    } finally {
      setSharingWa(false);
    }
  };

  const handlePrintReceipt = (p: any) => {
    if (!p) return;
    try {
      const doc = generatePaymentReceiptPDF(p, appSettings);
      printPDF(doc);
    } catch {
      window.print();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-amber-300 font-serif tracking-wide drop-shadow flex items-center gap-2">
            <Receipt className="h-6 w-6 text-amber-400" />
            <span>{t.payments}</span>
          </h1>
          <p className="text-xs text-amber-200/70 mt-1">
            {language === "ta"
              ? "தவணை வசூல் பதிவுகள், ரசீது அச்சிடுதல் & வாட்ஸ்அப் பகிர்வு"
              : "Installment collection ledger, official thermal receipts and WhatsApp sharing"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={exportToExcel}
            className="flex items-center gap-2 border border-amber-500/30 bg-[#250005] hover:bg-amber-500/10 text-amber-200 px-3.5 py-2 rounded-xl text-xs font-bold shadow-sm transition-all"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-400" />
            <span>Excel Export</span>
          </button>

          <button
            onClick={() => setQuickPayOpen(true)}
            className="flex items-center gap-2 gold-gradient-btn text-[#1a0004] font-black text-xs sm:text-sm px-4 py-2 rounded-xl shadow-md transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>{t.quickPayment}</span>
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-3 maroon-card p-4 rounded-2xl shadow-md">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-amber-400/60" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={language === "ta" ? "ரசீது, வாடிக்கையாளர் மொபைல், பெயர், திட்டம் (1500, 700), பாஸ்புக்..." : "Search by receipt #, customer mobile, name, scheme (1500, 700), or passbook..."}
            className="w-full pl-10 pr-4 py-2 text-xs bg-[#180003] border border-amber-500/40 rounded-xl text-amber-100 placeholder-amber-400/40 focus:ring-2 focus:ring-amber-400"
          />
        </div>

        <select
          value={paymentModeFilter}
          onChange={(e) => setPaymentModeFilter(e.target.value)}
          className="w-full sm:w-48 px-3 py-2 text-xs bg-[#180003] border border-amber-500/40 rounded-xl font-bold text-amber-200"
        >
          <option value="">All Payment Modes</option>
          <option value="cash">Cash (ரொக்கம்)</option>
          <option value="upi">UPI (GPay/PhonePe)</option>
          <option value="bank_transfer">Bank Transfer</option>
          <option value="card">Card</option>
        </select>
      </div>

      {/* Payments Table */}
      <div className="maroon-card rounded-3xl overflow-hidden shadow-xl border border-amber-500/25">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs bg-[#240005]">
            <thead className="bg-[#380109] text-amber-300 font-serif border-b border-amber-500/30">
              <tr>
                <th className="py-3 px-4">Receipt No</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Scheme & Inst #</th>
                <th className="py-3 px-4">Mode & Ref</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-500/10">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-amber-300/60 font-serif">
                    Loading payments...
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-amber-300/60 font-serif">
                    No payment records found.
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p.id} className="hover:bg-amber-500/5 transition-colors text-amber-100">
                    <td className="py-3 px-4 font-mono font-bold text-amber-400">
                      {p.receipt_number}
                    </td>
                    <td className="py-3 px-4 text-amber-200/80">
                      {formatDate(p.payment_date)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-amber-100">{p.customer_name}</div>
                      <div className="text-[10px] text-amber-400/60 font-mono">{p.customer_mobile}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-amber-200">{p.scheme_name}</div>
                      <span className="text-[11px] font-mono text-amber-400 font-bold">
                        Installment #{p.installment_number}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="uppercase text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-300">
                        {p.payment_mode}
                      </span>
                      {p.transaction_ref && (
                        <div className="text-[10px] text-amber-400/60 font-mono mt-0.5 truncate max-w-[120px]">
                          {p.transaction_ref}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-black text-amber-300 text-sm">
                      {formatINR(p.total_amount)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(p.status)}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setViewingReceipt(p)}
                          title="View & Print Official Receipt"
                          className="p-1.5 rounded-lg text-amber-400 hover:text-amber-200 hover:bg-amber-500/15 border border-amber-500/20"
                        >
                          <Printer className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleShareWhatsApp(p)}
                          title="Share Receipt on WhatsApp"
                          className="p-1.5 rounded-lg text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/40 border border-emerald-500/20"
                        >
                          <Share2 className="h-4 w-4" />
                        </button>
                        {p.status === "completed" && (
                          <button
                            onClick={() => handleOpenReverse(p)}
                            title="Reverse Transaction with Audit"
                            className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 border border-rose-500/20"
                          >
                            <RotateCcw className="h-4 w-4" />
                          </button>
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

      {/* Receipt Modal (Thermal Receipt View in Dark Luxury) */}
      {viewingReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-sm erp-modal-box overflow-hidden my-8 shadow-2xl border border-amber-500/40">
            <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-[#3e010b] via-[#4d0210] to-[#2b0006] text-amber-200 border-b border-amber-500/30">
              <div className="flex items-center gap-2">
                <Receipt className="h-4 w-4 text-amber-400" />
                <h3 className="text-sm font-bold font-serif">Official Payment Receipt</h3>
              </div>
              <button
                onClick={() => setViewingReceipt(null)}
                className="text-amber-400/80 hover:text-amber-300 p-1 rounded-lg hover:bg-amber-500/10"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 bg-[#240005] text-xs font-mono">
              <div className="text-center border-b border-dashed border-amber-500/30 pb-3">
                <h4 className="font-black text-sm text-amber-300 font-serif">
                  {appSettings.shop_name?.split("(")[0]?.trim() || "SRI LAKSHMI SUPERMARKET"}
                </h4>
                <p className="text-[10px] text-amber-200/80">
                  {appSettings.shop_address || "2a PP NAGAR MADURAI, MADURAI - 625016, Tamil Nadu"}
                </p>
                <p className="text-[10px] text-amber-400 font-bold">
                  Phone: {appSettings.shop_phone || "+91 96009 01937"} {appSettings.shop_gst ? `| GST: ${appSettings.shop_gst}` : ""}
                </p>
                <p className="text-[10px] font-bold text-amber-400 mt-1">DIWALI CHIT FUND RECEIPT</p>
              </div>

              <div className="space-y-1.5 text-amber-100">
                <div className="flex justify-between">
                  <span className="text-amber-400/70">Receipt No:</span>
                  <span className="font-bold text-amber-300">{viewingReceipt.receipt_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-amber-400/70">Date:</span>
                  <span>{formatDate(viewingReceipt.payment_date)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-amber-400/70">Customer:</span>
                  <span className="font-bold">{viewingReceipt.customer_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-amber-400/70">Mobile:</span>
                  <span>{viewingReceipt.customer_mobile}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-amber-400/70">Scheme:</span>
                  <span className="font-semibold text-amber-200">{viewingReceipt.scheme_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-amber-400/70">Installment #:</span>
                  <span className="font-bold text-amber-400">#{viewingReceipt.installment_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-amber-400/70">Payment Mode:</span>
                  <span className="uppercase">{viewingReceipt.payment_mode}</span>
                </div>
              </div>

              <div className="border-t border-b border-dashed border-amber-500/30 py-3 my-2 flex justify-between items-center text-sm">
                <span className="font-bold text-amber-300">Total Collected:</span>
                <span className="text-lg font-black text-amber-300 font-serif">{formatINR(viewingReceipt.total_amount)}</span>
              </div>

              <div className="text-center text-[10px] text-amber-300/70 space-y-0.5 pt-2">
                <p>Thank you for saving with {appSettings.shop_name?.split("(")[0]?.trim() || "Sri Lakshmi Supermarket"}!</p>
                <p>தீபாவளி மளிகை சிட் சேமிப்பில் இணைந்தமைக்கு நன்றி!</p>
                <p className="font-mono text-[9px] text-amber-400/50">Computer Generated Receipt • Valid without signature</p>
              </div>
            </div>

            <div className="p-4 bg-[#1e0004] border-t border-amber-500/20 flex flex-wrap items-center justify-end gap-2">
              <button
                onClick={() => setViewingReceipt(null)}
                className="px-3.5 py-2 text-xs font-semibold text-amber-300/80 hover:bg-amber-500/10 rounded-xl border border-amber-500/20"
              >
                Close
              </button>

              {/* WhatsApp Share PDF Button */}
              <button
                onClick={() => handleShareReceiptWhatsAppPDF(viewingReceipt)}
                disabled={sharingWa}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all"
                title="Share Receipt PDF via WhatsApp"
              >
                <Share2 className="h-4 w-4" />
                <span>{sharingWa ? "Sharing..." : "WhatsApp Share PDF"}</span>
              </button>

              {/* Download PDF Button */}
              <button
                onClick={() => handleDownloadReceiptPDF(viewingReceipt)}
                className="px-3.5 py-2 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/40 text-amber-300 font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all"
                title="Download Receipt PDF"
              >
                <Download className="h-4 w-4 text-amber-400" />
                <span>Download PDF</span>
              </button>

              {/* Print Receipt Button */}
              <button
                onClick={() => handlePrintReceipt(viewingReceipt)}
                className="gold-gradient-btn px-4 py-2 text-[#1a0004] font-black text-xs rounded-xl shadow-md flex items-center gap-1.5 hover:scale-105 transition-all"
              >
                <Printer className="h-4 w-4" />
                <span>Print Receipt</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reversal Modal */}
      {reversalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-md erp-modal-box overflow-hidden shadow-2xl border border-rose-500/50">
            <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-[#4d0210] to-[#2b0006] text-amber-200 border-b border-rose-500/40">
              <div className="flex items-center gap-2">
                <RotateCcw className="h-4 w-4 text-rose-400" />
                <h3 className="text-sm font-bold font-serif">Reverse Transaction</h3>
              </div>
              <button onClick={() => setReversalModalOpen(false)}>
                <X className="h-4 w-4 text-amber-400/80 hover:text-amber-300" />
              </button>
            </div>
            <form onSubmit={handleReverseSubmit} className="p-6 space-y-4 text-xs bg-[#240005]">
              {reversalError && (
                <div className="p-3 bg-rose-950/80 text-rose-300 rounded-xl border border-rose-500/40">
                  {reversalError}
                </div>
              )}
              <div className="p-3 bg-[#180003] rounded-xl border border-amber-500/20 space-y-1 text-xs">
                <p className="font-bold text-amber-200">Receipt: {selectedPaymentToReverse?.receipt_number}</p>
                <p className="text-amber-300/80">Customer: {selectedPaymentToReverse?.customer_name}</p>
                <p className="text-amber-300/80">Amount: {formatINR(selectedPaymentToReverse?.total_amount)}</p>
              </div>
              <div>
                <label className="block font-bold text-amber-300 mb-1 font-serif">
                  Mandatory Reason for Reversal *
                </label>
                <textarea
                  required
                  rows={3}
                  value={reversalReason}
                  onChange={(e) => setReversalReason(e.target.value)}
                  placeholder="e.g. Cashier error, duplicate entry..."
                  className="w-full px-3 py-2 bg-[#180003] border border-amber-500/40 rounded-xl text-amber-100 placeholder-amber-400/40 focus:ring-2 focus:ring-amber-400"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-amber-500/20">
                <button
                  type="button"
                  onClick={() => setReversalModalOpen(false)}
                  className="px-4 py-2 text-amber-300/80 hover:bg-amber-500/10 rounded-xl font-semibold border border-amber-500/20"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reversing}
                  className="px-5 py-2 bg-gradient-to-r from-rose-700 to-rose-900 hover:from-rose-600 hover:to-rose-800 text-white rounded-xl font-bold shadow-md shadow-rose-950/50"
                >
                  {reversing ? "Reversing..." : "Confirm Reversal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Pay Modal */}
      {quickPayOpen && (
        <QuickPaymentModal
          isOpen={quickPayOpen}
          onClose={() => setQuickPayOpen(false)}
          onSuccess={() => {
            setQuickPayOpen(false);
            fetchPayments();
          }}
        />
      )}
    </div>
  );
}
