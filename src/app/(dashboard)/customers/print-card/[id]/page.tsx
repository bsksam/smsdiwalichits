"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { formatINR, formatDate } from "@/lib/utils";
import { Logo } from "@/components/ui/Logo";
import { Printer, ArrowLeft, Download, CheckCircle, ShieldCheck, Sparkles, BookOpen, Share2 } from "lucide-react";
import { generatePassbookPDF, shareOrDownloadPDF, printPDF } from "@/lib/pdf";

export default function CustomerPrintCardPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const customerId = params.id as string;
  const initialMemberId = searchParams.get("memberId") ? Number(searchParams.get("memberId")) : null;

  const [customer, setCustomer] = useState<any>(null);
  const [schemes, setSchemes] = useState<any[]>([]);
  const [installments, setInstallments] = useState<any[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(initialMemberId);
  const [loading, setLoading] = useState(true);
  const [sharingWa, setSharingWa] = useState(false);

  // App Master Settings for Shop Header
  const [appSettings, setAppSettings] = useState<any>({
    shop_name: "ஸ்ரீ லட்சுமி சூப்பர் மார்க்கெட் (SRI LAKSHMI SUPERMARKET)",
    shop_address: "2a PP NAGAR MADURAI, MADURAI - 625016, Tamil Nadu",
    shop_phone: "+91 96009 01937 / +91 91502 80795",
    shop_gst: "33bsops67891zq",
  });

  useEffect(() => {
    Promise.all([
      fetch(`/api/customers/${customerId}`).then((res) => res.json()),
      fetch("/api/settings").then((res) => res.json()).catch(() => ({})),
    ])
      .then(([custData, settingsData]) => {
        if (custData?.customer) {
          setCustomer(custData.customer);
          const enrolled = custData.schemes || [];
          setSchemes(enrolled);
          setInstallments(custData.installments || []);
          if (!selectedMemberId && enrolled.length > 0) {
            setSelectedMemberId(enrolled[0].id);
          }
        }
        if (settingsData?.settings) {
          setAppSettings(settingsData.settings);
        }
      })
      .finally(() => setLoading(false));
  }, [customerId]);

  if (loading) {
    return <div className="p-8 text-center text-sm font-bold text-amber-200">Generating Passbook Card...</div>;
  }

  if (!customer) {
    return <div className="p-8 text-center text-sm font-bold text-amber-200">Customer not found.</div>;
  }

  const selectedScheme = schemes.find((s) => s.id === selectedMemberId) || schemes[0] || {};
  const memberInstallments = installments.filter((i) => i.member_id === selectedScheme.id);
  const displayInstallments = memberInstallments.length > 0 ? memberInstallments : installments.slice(0, 12);

  const handleDownloadPDF = () => {
    const doc = generatePassbookPDF(customer, selectedScheme, displayInstallments, appSettings);
    doc.save(`Passbook_${selectedScheme.passbook_number || customer.customer_code}.pdf`);
  };

  const handleShareWhatsAppPDF = async () => {
    setSharingWa(true);
    try {
      const doc = generatePassbookPDF(customer, selectedScheme, displayInstallments, appSettings);
      const text = `🪔 *${appSettings.shop_name || "SRI LAKSHMI SUPERMARKET"}*\n*தீபாவளி சிட் பாஸ்புக் கார்டு (Diwali Chit Passbook)*\nவணக்கம் திரு/திருமதி. *${customer.full_name}*,\nபாஸ்புக் எண்: ${selectedScheme.passbook_number || "PB-PENDING"}\nதிட்டம்: ${selectedScheme.scheme_name || "-"}\nஉதவிக்கு: ${appSettings.shop_phone || ""}`;
      await shareOrDownloadPDF(
        doc,
        `Passbook_${selectedScheme.passbook_number || customer.customer_code}.pdf`,
        `Diwali Chit Passbook - ${customer.full_name}`,
        customer.mobile,
        text
      );
    } finally {
      setSharingWa(false);
    }
  };

  const handlePrint = () => {
    try {
      const doc = generatePassbookPDF(customer, selectedScheme, displayInstallments, appSettings);
      printPDF(doc);
    } catch {
      window.print();
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Action Bar (hidden when printing) */}
      <div className="no-print space-y-3 p-4 bg-[#260005] rounded-2xl border border-amber-500/40 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <button
            onClick={() => {
              if (typeof window !== "undefined" && window.history.length > 1) {
                router.back();
              } else {
                router.push("/portal");
              }
            }}
            className="flex items-center gap-2 text-xs font-bold text-amber-300 hover:text-amber-100"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>← Back / பின்செல்க</span>
          </button>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* WhatsApp PDF Share Button */}
            <button
              onClick={handleShareWhatsAppPDF}
              disabled={sharingWa}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition-all"
              title="Share Passbook PDF via WhatsApp"
            >
              <Share2 className="h-4 w-4" />
              <span>{sharingWa ? "Sharing..." : "WhatsApp Share PDF"}</span>
            </button>

            {/* Download PDF Button */}
            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/50 text-amber-300 shadow-md transition-all"
              title="Download Passbook PDF"
            >
              <Download className="h-4 w-4 text-amber-400" />
              <span>Download PDF</span>
            </button>

            {/* Print Passbook Button */}
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 gold-gradient-btn text-[#1a0004] px-4 py-2 rounded-xl text-xs font-black shadow-md shadow-amber-900/30"
            >
              <Printer className="h-4 w-4" />
              <span>Print Passbook (A4)</span>
            </button>
          </div>
        </div>

        {/* Scheme Selector Tabs for customers with multiple chits */}
        {schemes.length > 1 && (
          <div className="pt-2 border-t border-amber-500/20">
            <span className="text-[11px] font-bold text-amber-300 block mb-1.5">
              Select Scheme Passbook to Print ({schemes.length} enrolled):
            </span>
            <div className="flex flex-wrap gap-2">
              {schemes.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelectedMemberId(s.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    selectedMemberId === s.id
                      ? "gold-gradient-btn text-[#1a0004] font-black shadow-md"
                      : "bg-[#180003] text-amber-200 border border-amber-500/30 hover:bg-amber-500/10"
                  }`}
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  <span>{s.scheme_name}</span>
                  <span className="font-mono text-[10px] bg-black/40 px-1.5 py-0.5 rounded font-extrabold text-amber-300">
                    {s.passbook_number}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Passbook / Identity Card Container (A4 Printable layout) */}
      <div className="print-card bg-white p-8 rounded-3xl border-2 border-amber-400 shadow-xl space-y-6 font-sans text-slate-900">
        {/* Passbook Header */}
        <div className="border-b-2 border-amber-500 pb-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left bg-gradient-to-r from-amber-50/80 via-white to-amber-50/80 p-4 rounded-2xl">
          <div className="flex items-center gap-3">
            <Logo size="lg" showText={false} />
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-rose-950 tracking-tight">
                {appSettings.shop_name?.split("(")[0]?.trim() || "ஸ்ரீ லட்சுமி சூப்பர் மார்க்கெட்"}
              </h1>
              <h2 className="text-sm font-extrabold text-amber-800 tracking-wide">
                {appSettings.shop_name?.includes("(")
                  ? appSettings.shop_name.split("(")[1].replace(")", "").trim()
                  : appSettings.shop_name || "SRI LAKSHMI SUPERMARKET"} • DIWALI CHIT FUND
              </h2>
              <p className="text-[11px] text-slate-600 font-medium">
                {appSettings.shop_address || "2a PP NAGAR MADURAI, MADURAI - 625016, Tamil Nadu"} | Phone: {appSettings.shop_phone || "+91 96009 01937"}
              </p>
              {appSettings.shop_gst && (
                <p className="text-[10px] text-slate-500 font-mono font-bold">
                  GSTIN: {appSettings.shop_gst}
                </p>
              )}
            </div>
          </div>

          <div className="text-right border-l-2 border-amber-300 pl-4">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Passbook Number</span>
            <span className="font-mono text-base font-black text-rose-800">
              {selectedScheme.passbook_number || "PB-PENDING"}
            </span>
            <span className="text-[10px] text-emerald-800 font-bold block">
              Member ID: {customer.customer_code}
            </span>
          </div>
        </div>

        {/* Member and Scheme Specification Box */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
          <div className="sm:col-span-2 space-y-2">
            <div className="flex justify-between border-b border-slate-200 pb-1">
              <span className="text-slate-500">சந்தாதாரர் பெயர் (Member Name):</span>
              <span className="font-extrabold text-slate-900 text-sm">{customer.full_name}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-1">
              <span className="text-slate-500">தந்தை / கணவர் (c/o):</span>
              <span className="font-semibold text-slate-700">{customer.father_husband_name || "-"}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-1">
              <span className="text-slate-500">கைபேசி (Mobile):</span>
              <span className="font-mono font-bold text-slate-900">{customer.mobile}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-1">
              <span className="text-slate-500">முகவரி (Address):</span>
              <span className="font-medium text-slate-700 text-right">{customer.address}, {customer.city}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">வாரிசுதாரர் (Nominee):</span>
              <span className="font-semibold text-slate-800">{customer.nominee_name || "-"} ({customer.nominee_relation || "-"})</span>
            </div>
          </div>

          {/* Scheme Box */}
          <div className="bg-amber-100/70 border border-amber-300 rounded-xl p-3 flex flex-col justify-between text-center">
            <div>
              <span className="text-[10px] font-bold text-amber-800 uppercase block">Scheme Enrolled</span>
              <span className="text-sm font-black text-rose-950 block mt-0.5">
                {selectedScheme.scheme_tamil_name || selectedScheme.scheme_name || "Diwali Chit"}
              </span>
            </div>
            <div className="my-2 py-2 border-y border-amber-300">
              <span className="text-xs text-slate-600 block">Monthly Installment:</span>
              <span className="text-lg font-black text-emerald-800">
                {formatINR(selectedScheme.monthly_amount || 700)}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-600 block">Total Grocery Package:</span>
              <span className="text-sm font-extrabold text-rose-800">
                {formatINR(selectedScheme.grocery_package_value || 10000)}
              </span>
            </div>
          </div>
        </div>

        {/* 12 Months Payment Schedule Grid */}
        <div>
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
            <span>மாதத் தவணை அட்டவணை (12 Months Payment Ledger & Stamps)</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 text-xs">
            {displayInstallments.map((inst, index) => {
              const isPaid = inst.status === "paid";
              return (
                <div
                  key={inst.id || index}
                  className={`p-2.5 rounded-xl border flex flex-col justify-between text-center min-h-[90px] ${
                    isPaid
                      ? "border-emerald-300 bg-emerald-50/70"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <div className="flex justify-between items-center text-[10px] font-bold text-slate-500">
                    <span>Month {inst.installment_number}</span>
                    <span>{formatINR(inst.amount)}</span>
                  </div>

                  <div className="my-1.5">
                    {isPaid ? (
                      <div className="inline-flex flex-col items-center">
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-emerald-600 text-white">
                          ✓ PAID
                        </span>
                        <span className="text-[9px] font-mono text-emerald-800 font-bold mt-0.5">
                          {formatDate(inst.paid_date)}
                        </span>
                      </div>
                    ) : (
                      <div className="h-6 border border-dashed border-slate-300 rounded flex items-center justify-center text-[9px] text-slate-400">
                        Stamp
                      </div>
                    )}
                  </div>

                  <div className="text-[9px] text-slate-400 truncate">
                    Due: {formatDate(inst.due_date)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Terms & Signatures */}
        <div className="pt-4 border-t-2 border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-4 text-[10px] text-slate-600">
          <div className="sm:col-span-2 space-y-1">
            <p className="font-bold text-slate-800">விதிமுறைகள் (Terms & Conditions):</p>
            <p>1. ஒவ்வொரு மாதமும் 10-ஆம் தேதிக்குள் தவணைத் தொகையை செலுத்தி ரசீது பெற்றுக்கொள்ளவும்.</p>
            <p>2. தீபாவளி பண்டிகைக்கு 10 நாட்களுக்கு முன்பாக மளிகைப் பொருட்கள் வழங்கப்படும் போது இந்த பாஸ்புக் சமர்ப்பிக்கப்பட வேண்டும்.</p>
            <p>3. அசல் பாஸ்புக் தொலைந்துவிட்டால் உடனடியாக கடை நிர்வாகத்திடம் தெரிவிக்கவும்.</p>
          </div>

          <div className="flex flex-col justify-end text-center pt-6">
            <div className="border-t border-slate-400 pt-1 font-bold text-slate-800">
              Authorized Signature / Seal
            </div>
            <span className="text-[9px] text-slate-500">ஸ்ரீ லட்சுமி சூப்பர் மார்க்கெட்</span>
          </div>
        </div>
      </div>
    </div>
  );
}
