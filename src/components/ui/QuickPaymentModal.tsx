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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#320008] rounded-3xl shadow-2xl border border-amber-500/40 overflow-hidden my-8 text-amber-100">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-[#4d020e] to-[#250005] border-b border-amber-500/30 text-white">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 font-black shadow-md">
              <Receipt className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-amber-300 font-serif tracking-tight">
                {language === "ta" ? "விரைவு தவணை வசூல்" : "Quick Installment Collection"}
              </h3>
              <p className="text-xs text-amber-200/70">
                {language === "ta" ? "ரசீது & உடனடி வாட்ஸ்அப் பகிர்வு" : "Instant Receipt & WhatsApp Sharing"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-amber-200/80 hover:bg-amber-500/10 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {completedReceipt ? (
            /* Success & Receipt View */
            <div className="space-y-6">
              <div className="text-center py-4 bg-[#200004] rounded-2xl border border-amber-500/40">
                <CheckCircle2 className="h-12 w-12 text-amber-400 mx-auto mb-2" />
                <h4 className="text-lg font-black text-amber-300 font-serif">
                  {language === "ta" ? "தவணை வெற்றிகரமாக பெறப்பட்டது!" : "Payment Collected Successfully!"}
                </h4>
                <p className="text-xs text-amber-400 font-mono mt-1">
                  Receipt No: {completedReceipt.receipt_number}
                </p>
              </div>

              {/* Receipt Summary Card */}
              <div className="border border-dashed border-amber-500/40 rounded-2xl p-5 bg-[#250005] text-xs space-y-3 font-sans">
                <div className="flex justify-between items-center pb-2 border-b border-amber-500/20">
                  <span className="font-bold text-amber-200 text-sm">
                    {completedReceipt.customer_name} ({completedReceipt.customer_code})
                  </span>
                  <span className="font-mono text-amber-400">{completedReceipt.customer_mobile}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-amber-100/80">
                  <div>
                    <span className="font-semibold text-amber-300">Scheme: </span>
                    {completedReceipt.scheme_name}
                  </div>
                  <div>
                    <span className="font-semibold text-amber-300">Passbook: </span>
                    {completedReceipt.passbook_number}
                  </div>
                  <div>
                    <span className="font-semibold text-amber-300">Installment #: </span>
                    #{completedReceipt.installment_number}
                  </div>
                  <div>
                    <span className="font-semibold text-amber-300">Mode: </span>
                    <span className="uppercase font-bold text-amber-400">{completedReceipt.payment_mode}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-amber-500/20 text-sm font-bold">
                  <span className="text-amber-200">Total Amount Paid:</span>
                  <span className="text-lg text-amber-400 font-black font-mono">
                    {formatINR(completedReceipt.total_amount)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 justify-center pt-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-amber-500/40 bg-[#250005] hover:bg-[#350109] text-amber-200 font-semibold text-xs shadow-sm"
                >
                  <Printer className="h-4 w-4 text-amber-400" />
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
                  className="px-5 py-2.5 rounded-xl gold-gradient-btn text-slate-950 font-black text-xs"
                >
                  {language === "ta" ? "முடிந்தது" : "Done"}
                </button>
              </div>
            </div>
          ) : (
            /* Collection Form */
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {error && (
                <div className="flex items-center gap-2 p-3 text-xs bg-rose-950/80 text-rose-300 rounded-xl border border-rose-500/40">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Customer Search Section */}
              <div>
                <label className="block text-xs font-bold text-amber-200 mb-1.5">
                  {language === "ta" ? "சந்தாதாரர் தேடுக (பெயர் / எண் / குறியீடு)" : "Search Customer (Name, Mobile, ID)"}
                </label>
                <div className="relative">
                  <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-amber-400/60" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={language === "ta" ? "வாடிக்கையாளர் பெயர் அல்லது மொபைல் எண்..." : "Type customer name or mobile..."}
                    className="w-full pl-10 pr-4 py-2.5 text-xs bg-[#220005] border border-amber-500/30 rounded-xl text-amber-100 placeholder-amber-200/30 focus:outline-none focus:ring-2 focus:ring-amber-400 font-medium"
                  />
                </div>

                {/* Search Results Dropdown */}
                {customers.length > 0 && !selectedCustomer && (
                  <div className="mt-1 border border-amber-500/30 rounded-xl max-h-44 overflow-y-auto bg-[#250005] shadow-2xl divide-y divide-amber-500/10">
                    {customers.map((c) => (
                      <div
                        key={c.id}
                        onClick={() => handleSelectCustomer(c)}
                        className="p-2.5 hover:bg-amber-500/10 cursor-pointer flex justify-between items-center text-xs"
                      >
                        <div>
                          <p className="font-bold text-amber-200">{c.full_name}</p>
                          <p className="text-amber-300/60 text-[11px] font-mono">{c.mobile} • {c.city}</p>
                        </div>
                        <span className="font-mono text-xs bg-amber-500/10 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded-full font-bold">
                          {c.customer_code}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Selected Customer Card */}
              {selectedCustomer && (
                <div className="p-3 bg-[#240005] border border-amber-500/30 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500 text-slate-950 font-black text-xs">
                      <User className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-bold text-xs text-amber-200">{selectedCustomer.full_name}</p>
                      <p className="text-[11px] text-amber-300/60 font-mono">{selectedCustomer.mobile} • {selectedCustomer.city}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCustomer(null);
                      setSelectedMember(null);
                      setCustomerSchemes([]);
                    }}
                    className="text-xs text-amber-400 hover:underline font-bold"
                  >
                    Change
                  </button>
                </div>
              )}

              {/* Enrolled Schemes Selector */}
              {customerSchemes.length > 0 && (
                <div>
                  <label className="block text-xs font-bold text-amber-200 mb-1.5">
                    {language === "ta" ? "திட்டம் & பாஸ்புக் தேர்வு" : "Select Chit Scheme & Passbook"}
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {customerSchemes.map((s) => (
                      <div
                        key={s.id}
                        onClick={() => handleSelectScheme(s)}
                        className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                          selectedMember?.id === s.id
                            ? "border-amber-400 bg-amber-500/20 shadow-sm"
                            : "border-amber-500/20 bg-[#250005] hover:bg-amber-500/10"
                        }`}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-amber-200">{s.scheme_name}</span>
                          <span className="font-mono text-[11px] bg-black/40 px-1.5 py-0.5 rounded text-amber-300 font-bold">
                            {s.passbook_number}
                          </span>
                        </div>
                        <div className="flex justify-between text-[11px] text-amber-300/70">
                          <span>Monthly: {formatINR(s.monthly_amount)}</span>
                          <span className="font-bold text-emerald-400 font-mono">
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
                <div className="space-y-3 pt-2 border-t border-amber-500/20">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-amber-200 mb-1">
                        {language === "ta" ? "தவணை எண்" : "Installment #"}
                      </label>
                      <select
                        value={selectedInstallment?.id || ""}
                        onChange={(e) => {
                          const inst = pendingInstallments.find((i) => i.id === Number(e.target.value));
                          setSelectedInstallment(inst);
                        }}
                        className="w-full px-3 py-2 text-xs bg-[#220005] border border-amber-500/30 rounded-xl font-semibold text-amber-100"
                      >
                        {pendingInstallments.map((inst) => (
                          <option key={inst.id} value={inst.id}>
                            Installment #{inst.installment_number} (Due: {inst.due_date})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-amber-200 mb-1">
                        {language === "ta" ? "தவணைத் தொகை (₹)" : "Installment Amount (₹)"}
                      </label>
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(Number(e.target.value))}
                        className="w-full px-3 py-2 text-xs bg-[#220005] border border-amber-500/30 rounded-xl font-black text-amber-300 font-mono"
                        required
                      />
                    </div>
                  </div>

                  {/* Payment Mode & Ref */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-amber-200 mb-1">
                        {language === "ta" ? "செலுத்தும் முறை" : "Payment Mode"}
                      </label>
                      <select
                        value={paymentMode}
                        onChange={(e) => setPaymentMode(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-[#220005] border border-amber-500/30 rounded-xl font-semibold text-amber-100"
                      >
                        <option value="cash">Cash (ரொக்கம்)</option>
                        <option value="upi">UPI / GPay / PhonePe</option>
                        <option value="bank_transfer">Bank Transfer (NEFT/IMPS)</option>
                        <option value="card">Card (Debit/Credit)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-amber-200 mb-1">
                        {language === "ta" ? "பரிவர்த்தனை குறிப்பு (Ref No)" : "Transaction Ref (Optional)"}
                      </label>
                      <input
                        type="text"
                        value={transactionRef}
                        onChange={(e) => setTransactionRef(e.target.value)}
                        placeholder="e.g. UPI Ref, Cheque No"
                        className="w-full px-3 py-2 text-xs bg-[#220005] border border-amber-500/30 rounded-xl text-amber-100"
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-3">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-3.5 gold-gradient-btn rounded-xl font-black text-xs tracking-wider uppercase"
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
