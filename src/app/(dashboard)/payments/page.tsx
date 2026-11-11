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
} from "lucide-react";
import { QuickPaymentModal } from "@/components/ui/QuickPaymentModal";
import * as XLSX from "xlsx";

export default function PaymentsPage() {
  const { t, language } = useLanguage();
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [paymentModeFilter, setPaymentModeFilter] = useState("");
  const [quickPayOpen, setQuickPayOpen] = useState(false);

  // Selected receipt for detailed viewing/printing
  const [viewingReceipt, setViewingReceipt] = useState<any>(null);

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
      "Scheme": p.scheme_name,
      "Passbook": p.passbook_number,
      "Installment #": p.installment_number,
      "Amount": p.amount,
      "Discount": p.discount,
      "Late Fee": p.late_fee,
      "Total Amount": p.total_amount,
      "Payment Mode": p.payment_mode,
      "Transaction Ref": p.transaction_ref || "-",
      "Payment Date": p.payment_date,
      "Collected By": p.collected_by_name || "-",
      "Status": p.status,
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Payments");
    XLSX.writeFile(wb, "Diwali_Chit_Payment_Collections.xlsx");
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">
            {t.payments}
          </h1>
          <p className="text-xs text-slate-500">
            {language === "ta"
              ? "தவணை வசூல் பதிவுகள், ரசீது அச்சிடுதல் & வாட்ஸ்அப் பகிர்வு"
              : "Installment collection ledger, official thermal receipts and WhatsApp sharing"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={exportToExcel}
            className="flex items-center gap-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 px-3.5 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
            <span>Excel Export</span>
          </button>

          <button
            onClick={() => setQuickPayOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-white font-bold text-xs sm:text-sm px-4 py-2 rounded-xl shadow-md shadow-amber-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <Plus className="h-4 w-4" />
            <span>{t.quickPayment}</span>
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={language === "ta" ? "ரசீது எண், வாடிக்கையாளர் பெயர் அல்லது மொபைல்..." : "Search by receipt number, customer name or mobile..."}
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <select
          value={paymentModeFilter}
          onChange={(e) => setPaymentModeFilter(e.target.value)}
          className="w-full sm:w-44 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium"
        >
          <option value="">All Payment Modes</option>
          <option value="cash">Cash (ரொக்கம்)</option>
          <option value="upi">UPI (GPay/PhonePe)</option>
          <option value="bank_transfer">Bank Transfer</option>
          <option value="card">Card</option>
        </select>
      </div>

      {/* Payments Table */}
      <div className="rounded-3xl border border-slate-200/80 bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase border-b border-slate-200">
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
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Loading payments...
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No payment records found.
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-amber-700">
                      {p.receipt_number}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {formatDate(p.payment_date)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-800">{p.customer_name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{p.customer_mobile}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-800">{p.scheme_name}</div>
                      <div className="text-[10px] text-amber-700 font-bold">
                        PB: {p.passbook_number} • Inst #{p.installment_number}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="uppercase text-[10px] font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                        {p.payment_mode}
                      </span>
                      {p.transaction_ref && (
                        <div className="text-[9px] text-slate-400 font-mono mt-0.5">{p.transaction_ref}</div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-extrabold text-emerald-700 text-sm">
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
                          title="View / Print Receipt"
                          className="p-1.5 rounded-lg text-slate-600 hover:text-brand-blue hover:bg-slate-100"
                        >
                          <Printer className="h-4 w-4" />
                        </button>

                        <a
                          href={getWhatsAppShareUrl(
                            p.customer_mobile,
                            generatePaymentReceiptWhatsAppMessage({
                              customerName: p.customer_name,
                              schemeName: p.scheme_name,
                              receiptNumber: p.receipt_number,
                              installmentNumber: p.installment_number,
                              amount: p.total_amount,
                              paymentMode: p.payment_mode,
                              paymentDate: formatDate(p.payment_date),
                              shopName: "ஸ்ரீ லட்சுமி சூப்பர் மார்க்கெட்",
                              shopPhone: "+91 98765 43210",
                            })
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Share on WhatsApp"
                          className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50"
                        >
                          <Share2 className="h-4 w-4" />
                        </a>

                        {p.status === "completed" && (
                          <button
                            onClick={() => handleOpenReverse(p)}
                            title="Reverse Transaction with Audit"
                            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50"
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

      {/* Official Thermal / Standard Receipt Modal */}
      {viewingReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden font-sans">
            <div className="p-6 border-b border-dashed border-slate-300 text-center space-y-1">
              <span className="text-xs font-black text-rose-800 uppercase tracking-widest">
                OFFICIAL PAYMENT RECEIPT
              </span>
              <h2 className="text-lg font-black text-brand-blue">
                ஸ்ரீ லட்சுமி சூப்பர் மார்க்கெட்
              </h2>
              <p className="text-xs font-bold text-slate-700">SRI LAKSHMI SUPERMARKET</p>
              <p className="text-[10px] text-slate-500">
                124, Bazaar Main Road, Near Clock Tower, Salem - 636001
              </p>
              <p className="text-[10px] text-slate-500">Phone: 98765 43210 | GSTIN: 33AABCS1429B1Z8</p>
            </div>

            <div className="p-6 space-y-3 text-xs">
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">Receipt No:</span>
                <span className="font-mono font-bold text-amber-800">{viewingReceipt.receipt_number}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">Date & Time:</span>
                <span className="font-semibold text-slate-800">{formatDate(viewingReceipt.payment_date)}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">Customer Name:</span>
                <span className="font-bold text-slate-900">{viewingReceipt.customer_name}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">Mobile:</span>
                <span className="font-mono text-slate-800">{viewingReceipt.customer_mobile}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">Scheme & Passbook:</span>
                <span className="font-semibold text-slate-800">{viewingReceipt.scheme_name} ({viewingReceipt.passbook_number})</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">Installment Number:</span>
                <span className="font-bold text-brand-blue">Installment #{viewingReceipt.installment_number}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">Payment Mode:</span>
                <span className="font-bold uppercase text-slate-800">{viewingReceipt.payment_mode}</span>
              </div>

              <div className="flex justify-between items-center pt-2 text-sm font-black text-emerald-800">
                <span>TOTAL AMOUNT RECEIVED:</span>
                <span className="text-lg">{formatINR(viewingReceipt.total_amount)}</span>
              </div>

              <div className="pt-4 text-center border-t border-dashed border-slate-300 text-[10px] text-slate-500 space-y-1">
                <p>Thank you for saving with Sri Lakshmi Supermarket!</p>
                <p>தீபாவளி மளிகை சிட் சேமிப்பில் இணைந்தமைக்கு நன்றி!</p>
                <p className="font-mono text-[9px] text-slate-400">Computer Generated Receipt • Valid without signature</p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button
                onClick={() => setViewingReceipt(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-5 py-2 bg-brand-blue hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-rose-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 bg-rose-700 text-white">
              <div className="flex items-center gap-2">
                <RotateCcw className="h-4 w-4" />
                <h3 className="text-sm font-bold">Reverse Transaction</h3>
              </div>
              <button onClick={() => setReversalModalOpen(false)}>
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleReverseSubmit} className="p-6 space-y-4 text-xs">
              {reversalError && (
                <div className="p-3 bg-rose-50 text-rose-700 rounded-xl border border-rose-200">
                  {reversalError}
                </div>
              )}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <p className="font-bold text-slate-800">Receipt: {selectedPaymentToReverse?.receipt_number}</p>
                <p className="text-slate-600">Customer: {selectedPaymentToReverse?.customer_name}</p>
                <p className="text-slate-600">Amount: {formatINR(selectedPaymentToReverse?.total_amount)}</p>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Mandatory Reason for Reversal *
                </label>
                <textarea
                  required
                  rows={3}
                  value={reversalReason}
                  onChange={(e) => setReversalReason(e.target.value)}
                  placeholder="e.g. Cashier error, duplicate entry..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReversalModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reversing}
                  className="px-5 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded-xl font-bold shadow-md shadow-rose-900/20"
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
