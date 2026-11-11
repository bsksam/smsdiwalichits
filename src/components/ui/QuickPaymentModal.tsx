"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "@/components/layout/LanguageContext";
import { formatINR } from "@/lib/utils";
import { getWhatsAppShareUrl, generatePaymentReceiptWhatsAppMessage } from "@/lib/whatsapp";
import {
  X,
  Search,
  CheckCircle2,
  Printer,
  Share2,
  AlertCircle,
  Receipt,
  User,
  CreditCard,
} from "lucide-react";

interface QuickPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function QuickPaymentModal({ isOpen, onClose, onSuccess }: QuickPaymentModalProps) {
  const { t, language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [customerSchemes, setCustomerSchemes] = useState<any[]>([]);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [pendingInstallments, setPendingInstallments] = useState<any[]>([]);
  const [selectedInstallment, setSelectedInstallment] = useState<any>(null);

  // Form fields
  const [amount, setAmount] = useState<number>(0);
  const [discount, setDiscount] = useState<number>(0);
  const [lateFee, setLateFee] = useState<number>(0);
  const [paymentMode, setPaymentMode] = useState<string>("cash");
  const [transactionRef, setTransactionRef] = useState<string>("");
  const [remarks, setRemarks] = useState<string>("Diwali Chit monthly installment");

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completedReceipt, setCompletedReceipt] = useState<any>(null);

  // Search customers on query
  useEffect(() => {
    if (!searchTerm.trim()) {
      setCustomers([]);
      return;
    }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/customers?search=${encodeURIComponent(searchTerm.trim())}`);
        const data = await res.json();
        setCustomers(data.customers || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // When customer is selected, fetch their enrolled schemes
  const handleSelectCustomer = async (cust: any) => {
    setSelectedCustomer(cust);
    setSelectedMember(null);
    setSelectedInstallment(null);
    try {
      const res = await fetch(`/api/customers/${cust.id}`);
      const data = await res.json();
      setCustomerSchemes(data.schemes || []);
      if (data.schemes && data.schemes.length > 0) {
        handleSelectScheme(data.schemes[0], data.installments || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectScheme = (schemeMember: any, allInsts?: any[]) => {
    setSelectedMember(schemeMember);
    const amountVal = Number(schemeMember.monthly_amount);
    setAmount(amountVal);

    if (allInsts) {
      const pending = allInsts.filter(
        (i) => i.member_id === schemeMember.id && i.status !== "paid"
      );
      setPendingInstallments(pending);
      if (pending.length > 0) {
        setSelectedInstallment(pending[0]);
      }
    } else {
      // Fetch installments
      fetch(`/api/installments?memberId=${schemeMember.id}&status=pending`)
        .then((res) => res.json())
        .then((data) => {
          setPendingInstallments(data.installments || []);
          if (data.installments && data.installments.length > 0) {
            setSelectedInstallment(data.installments[0]);
          }
        });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer || !selectedMember) {
      setError("Please select customer and scheme");
      return;
    }
    if (amount <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: selectedCustomer.id,
          schemeId: selectedMember.scheme_id,
          memberId: selectedMember.id,
          installmentId: selectedInstallment?.id || null,
          installmentNumber: selectedInstallment?.installment_number || 1,
          amount,
          discount,
          lateFee,
          paymentMode,
          transactionRef,
          remarks,
          paymentDate: new Date().toISOString().split("T")[0],
        }),
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || "Payment collection failed");
      }

      setCompletedReceipt(resData.receipt);
    } catch (err: any) {
      setError(err.message || "Failed to process payment");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-amber-200 overflow-hidden my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-brand-blue via-blue-900 to-indigo-950 text-white">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-white shadow-sm">
              <Receipt className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight">
                {language === "ta" ? "விரைவு தவணை வசூல்" : "Quick Installment Collection"}
              </h3>
              <p className="text-xs text-amber-300">
                {language === "ta" ? "ரசீது & உடனடி வாட்ஸ்அப் பகிர்வு" : "Instant Receipt & WhatsApp Sharing"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-white/80 hover:bg-white/10 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {completedReceipt ? (
            /* Success & Receipt View */
            <div className="space-y-6">
              <div className="text-center py-4 bg-emerald-50 rounded-2xl border border-emerald-200">
                <CheckCircle2 className="h-12 w-12 text-emerald-600 mx-auto mb-2" />
                <h4 className="text-lg font-bold text-emerald-900">
                  {language === "ta" ? "தவணை வெற்றிகரமாக பெறப்பட்டது!" : "Payment Collected Successfully!"}
                </h4>
                <p className="text-xs text-emerald-700 font-mono mt-1">
                  Receipt No: {completedReceipt.receipt_number}
                </p>
              </div>

              {/* Receipt Summary Card */}
              <div className="border border-dashed border-slate-300 rounded-2xl p-5 bg-amber-50/30 text-xs space-y-3 font-sans">
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <span className="font-bold text-slate-800 text-sm">
                    {completedReceipt.customer_name} ({completedReceipt.customer_code})
                  </span>
                  <span className="font-mono text-slate-600">{completedReceipt.customer_mobile}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-slate-600">
                  <div>
                    <span className="font-semibold text-slate-800">Scheme: </span>
                    {completedReceipt.scheme_name}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-800">Passbook: </span>
                    {completedReceipt.passbook_number}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-800">Installment #: </span>
                    {completedReceipt.installment_number}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-800">Mode: </span>
                    <span className="uppercase font-bold text-slate-800">{completedReceipt.payment_mode}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-200 text-sm font-bold text-brand-blue">
                  <span>Total Amount Paid:</span>
                  <span className="text-base text-emerald-700 font-extrabold">
                    {formatINR(completedReceipt.total_amount)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 justify-center pt-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-semibold text-xs shadow-sm"
                >
                  <Printer className="h-4 w-4 text-slate-600" />
                  {t.printReceipt}
                </button>

                <a
                  href={getWhatsAppShareUrl(
                    completedReceipt.customer_mobile,
                    generatePaymentReceiptWhatsAppMessage({
                      customerName: completedReceipt.customer_name,
                      schemeName: completedReceipt.scheme_name,
                      receiptNumber: completedReceipt.receipt_number,
                      installmentNumber: completedReceipt.installment_number,
                      amount: completedReceipt.total_amount,
                      paymentMode: completedReceipt.payment_mode,
                      paymentDate: completedReceipt.payment_date,
                      shopName: "ஸ்ரீ லட்சுமி சூப்பர் மார்க்கெட்",
                      shopPhone: "+91 98765 43210",
                    })
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-md shadow-emerald-600/20"
                >
                  <Share2 className="h-4 w-4" />
                  {t.shareWhatsApp}
                </a>

                <button
                  onClick={() => {
                    setCompletedReceipt(null);
                    onSuccess?.();
                  }}
                  className="px-5 py-2.5 rounded-xl bg-brand-blue hover:bg-blue-800 text-white font-semibold text-xs shadow-md shadow-blue-900/20"
                >
                  {language === "ta" ? "முடிந்தது" : "Done"}
                </button>
              </div>
            </div>
          ) : (
            /* Collection Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 text-xs bg-rose-50 text-rose-700 rounded-xl border border-rose-200">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Customer Search Section */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {language === "ta" ? "சந்தாதாரர் தேடுக (பெயர் / எண் / குறியீடு)" : "Search Customer (Name, Mobile, ID)"}
                </label>
                <div className="relative">
                  <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={language === "ta" ? "வாடிக்கையாளர் பெயர் அல்லது மொபைல் எண்..." : "Type customer name or mobile..."}
                    className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all"
                  />
                </div>

                {/* Search Results Dropdown */}
                {customers.length > 0 && !selectedCustomer && (
                  <div className="mt-1 border border-slate-200 rounded-xl max-h-44 overflow-y-auto bg-white shadow-lg divide-y divide-slate-100">
                    {customers.map((c) => (
                      <div
                        key={c.id}
                        onClick={() => handleSelectCustomer(c)}
                        className="p-2.5 hover:bg-amber-50 cursor-pointer flex justify-between items-center text-xs"
                      >
                        <div>
                          <p className="font-bold text-slate-800">{c.full_name}</p>
                          <p className="text-slate-500 text-[11px]">{c.mobile} • {c.city}</p>
                        </div>
                        <span className="font-mono text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold">
                          {c.customer_code}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Selected Customer Card */}
              {selectedCustomer && (
                <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-blue text-white font-bold text-xs">
                      <User className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-bold text-xs text-slate-800">{selectedCustomer.full_name}</p>
                      <p className="text-[11px] text-slate-500">{selectedCustomer.mobile} • {selectedCustomer.city}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCustomer(null);
                      setSelectedMember(null);
                      setCustomerSchemes([]);
                    }}
                    className="text-xs text-amber-700 hover:underline font-semibold"
                  >
                    Change
                  </button>
                </div>
              )}

              {/* Enrolled Schemes Selector */}
              {customerSchemes.length > 0 && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    {language === "ta" ? "திட்டம் & பாஸ்புக் தேர்வு" : "Select Chit Scheme & Passbook"}
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {customerSchemes.map((s) => (
                      <div
                        key={s.id}
                        onClick={() => handleSelectScheme(s)}
                        className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                          selectedMember?.id === s.id
                            ? "border-amber-500 bg-amber-50/90 shadow-sm"
                            : "border-slate-200 bg-white hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-slate-800">{s.scheme_name}</span>
                          <span className="font-mono text-[11px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">
                            {s.passbook_number}
                          </span>
                        </div>
                        <div className="flex justify-between text-[11px] text-slate-500">
                          <span>Monthly: {formatINR(s.monthly_amount)}</span>
                          <span className="font-semibold text-emerald-700">
                            Paid: {s.completed_installments}/12
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Installment selection & Amount fields */}
              {selectedMember && (
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        {language === "ta" ? "தவணை எண்" : "Installment #"}
                      </label>
                      <select
                        value={selectedInstallment?.id || ""}
                        onChange={(e) => {
                          const inst = pendingInstallments.find((i) => i.id === Number(e.target.value));
                          setSelectedInstallment(inst);
                        }}
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                      >
                        {pendingInstallments.map((inst) => (
                          <option key={inst.id} value={inst.id}>
                            Installment #{inst.installment_number} (Due: {inst.due_date})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        {language === "ta" ? "தவணைத் தொகை (₹)" : "Installment Amount (₹)"}
                      </label>
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(Number(e.target.value))}
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold text-brand-blue"
                        required
                      />
                    </div>
                  </div>

                  {/* Payment Mode & Ref */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        {language === "ta" ? "செலுத்தும் முறை" : "Payment Mode"}
                      </label>
                      <select
                        value={paymentMode}
                        onChange={(e) => setPaymentMode(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                      >
                        <option value="cash">Cash (ரொக்கம்)</option>
                        <option value="upi">UPI / GPay / PhonePe</option>
                        <option value="bank_transfer">Bank Transfer (NEFT/IMPS)</option>
                        <option value="card">Card (Debit/Credit)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        {language === "ta" ? "பரிவர்த்தனை குறிப்பு (Ref No)" : "Transaction Ref (Optional)"}
                      </label>
                      <input
                        type="text"
                        value={transactionRef}
                        onChange={(e) => setTransactionRef(e.target.value)}
                        placeholder="e.g. UPI Ref, Cheque No"
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-3">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-3 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-white font-bold text-sm rounded-xl shadow-lg shadow-amber-500/25 transition-all"
                    >
                      {submitting
                        ? (language === "ta" ? "வசூல் செய்யப்படுகிறது..." : "Collecting Payment...")
                        : `${language === "ta" ? "தவணை வசூலித்து ரசீது உருவாக்கு" : "Collect Payment & Print Receipt"} (${formatINR(amount)})`}
                    </button>
                  </div>
                </div>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
