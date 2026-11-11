"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "@/components/layout/LanguageContext";
import { formatINR, formatDate, getStatusBadge } from "@/lib/utils";
import { getWhatsAppShareUrl } from "@/lib/whatsapp";
import {
  Users,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  CreditCard,
  Share2,
  X,
  Check,
  AlertCircle,
  FileSpreadsheet,
} from "lucide-react";
import Link from "next/link";
import * as XLSX from "xlsx";

export default function CustomersPage() {
  const { t, language } = useLanguage();
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Add / Edit Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any>(null);
  const [formData, setFormData] = useState({
    fullName: "",
    fatherOrHusbandName: "",
    mobile: "",
    altMobile: "",
    address: "",
    city: "Salem",
    district: "Salem",
    pincode: "636001",
    aadhaarRef: "",
    nomineeName: "",
    nomineeRelation: "",
    nomineeMobile: "",
  });
  const [modalSubmitting, setModalSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const fetchCustomers = async () => {
    try {
      let url = `/api/customers?search=${encodeURIComponent(searchTerm)}`;
      if (statusFilter) url += `&status=${statusFilter}`;
      const res = await fetch(url);
      const data = await res.json();
      setCustomers(data.customers || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [searchTerm, statusFilter]);

  const handleOpenAdd = () => {
    setEditingCustomer(null);
    setFormData({
      fullName: "",
      fatherOrHusbandName: "",
      mobile: "",
      altMobile: "",
      address: "",
      city: "Salem",
      district: "Salem",
      pincode: "636001",
      aadhaarRef: "",
      nomineeName: "",
      nomineeRelation: "",
      nomineeMobile: "",
    });
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: any) => {
    setEditingCustomer(c);
    setFormData({
      fullName: c.full_name || "",
      fatherOrHusbandName: c.father_husband_name || "",
      mobile: c.mobile || "",
      altMobile: c.alt_mobile || "",
      address: c.address || "",
      city: c.city || "Salem",
      district: c.district || "Salem",
      pincode: c.pincode || "636001",
      aadhaarRef: c.aadhaar_ref || "",
      nomineeName: c.nominee_name || "",
      nomineeRelation: c.nominee_relation || "",
      nomineeMobile: c.nominee_mobile || "",
    });
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm(language === "ta" ? "இந்த வாடிக்கையாளரை நீக்க விரும்புகிறீர்களா?" : "Are you sure you want to remove this customer?")) {
      return;
    }
    try {
      const res = await fetch(`/api/customers/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchCustomers();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalSubmitting(true);
    setModalError(null);

    try {
      const url = editingCustomer ? `/api/customers/${editingCustomer.id}` : "/api/customers";
      const method = editingCustomer ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || "Operation failed");
      }

      setIsModalOpen(false);
      fetchCustomers();
    } catch (err: any) {
      setModalError(err.message || "Something went wrong");
    } finally {
      setModalSubmitting(false);
    }
  };

  const exportToExcel = () => {
    const exportData = customers.map((c) => ({
      "Customer ID": c.customer_code,
      "Full Name": c.full_name,
      "Father / Husband": c.father_husband_name || "-",
      "Mobile": c.mobile,
      "Alt Mobile": c.alt_mobile || "-",
      "Address": c.address,
      "City": c.city,
      "District": c.district,
      "Nominee Name": c.nominee_name || "-",
      "Nominee Relation": c.nominee_relation || "-",
      "Nominee Mobile": c.nominee_mobile || "-",
      "Registration Date": c.registration_date,
      "Status": c.status,
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Customers");
    XLSX.writeFile(wb, "Diwali_Chit_Customers.xlsx");
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">
            {t.customers}
          </h1>
          <p className="text-xs text-slate-500">
            {language === "ta" ? "சந்தாதாரர்களின் விவரங்கள், திட்டங்கள் & பாஸ்புக் மேலாண்மை" : "Manage customer records, enrolled schemes and member cards"}
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
            onClick={handleOpenAdd}
            className="flex items-center gap-2 bg-gradient-to-r from-brand-blue to-blue-700 hover:from-blue-800 hover:to-blue-900 text-white px-4 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-blue-900/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <Plus className="h-4 w-4" />
            <span>{t.addCustomer}</span>
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
            placeholder={language === "ta" ? "வாடிக்கையாளர் பெயர், மொபைல், ஐடி அல்லது ஊர்..." : "Search by name, mobile, customer ID or city..."}
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full sm:w-44 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium"
        >
          <option value="">{language === "ta" ? "அனைத்து நிலைகளும்" : "All Statuses"}</option>
          <option value="active">Active (செயலில் உள்ளது)</option>
          <option value="blocked">Blocked / Inactive</option>
        </select>
      </div>

      {/* Customers Table */}
      <div className="rounded-3xl border border-slate-200/80 bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Customer ID</th>
                <th className="py-3 px-4">Name & Father/Husband</th>
                <th className="py-3 px-4">Mobile Numbers</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4 text-center">Active Schemes</th>
                <th className="py-3 px-4 text-right">Total Paid</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Loading customers...
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No customers found matching your criteria.
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-amber-700">
                      {c.customer_code}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-800">{c.full_name}</div>
                      {c.father_husband_name && (
                        <div className="text-[11px] text-slate-500">
                          c/o {c.father_husband_name}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-700">{c.mobile}</div>
                      {c.alt_mobile && (
                        <div className="text-[10px] text-slate-400">{c.alt_mobile}</div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      <div>{c.city}</div>
                      <div className="text-[10px] text-slate-400">{c.district} - {c.pincode}</div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-block px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-brand-blue">
                        {c.active_schemes_count || 0} Schemes
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-emerald-700">
                      {formatINR(c.total_paid)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(c.status)}`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <Link
                          href={`/customers/${c.id}`}
                          title="View Ledger & Passbook"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-brand-blue hover:bg-slate-100"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link
                          href={`/customers/print-card/${c.id}`}
                          title="Print Member Card / Passbook"
                          className="p-1.5 rounded-lg text-amber-600 hover:text-amber-800 hover:bg-amber-50"
                        >
                          <CreditCard className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleOpenEdit(c)}
                          title="Edit Customer"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-slate-100"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(c.id)}
                          title="Delete / Block"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-700 hover:bg-slate-100"
                        >
                          <Trash2 className="h-4 w-4" />
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

      {/* Add / Edit Customer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8">
            <div className="flex items-center justify-between px-6 py-4 bg-brand-blue text-white">
              <h3 className="text-base font-bold">
                {editingCustomer
                  ? (language === "ta" ? "வாடிக்கையாளர் திருத்தம்" : "Edit Customer Details")
                  : (language === "ta" ? "புதிய வாடிக்கையாளர் பதிவு" : "Register New Customer")}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-full p-1 text-white/80 hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleModalSubmit} className="p-6 space-y-4">
              {modalError && (
                <div className="flex items-center gap-2 p-3 text-xs bg-rose-50 text-rose-700 rounded-xl border border-rose-200">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{modalError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    முழுப் பெயர் (Full Name) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="e.g. S. Murugesan"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    தந்தை / கணவர் பெயர் (Father / Husband)
                  </label>
                  <input
                    type="text"
                    value={formData.fatherOrHusbandName}
                    onChange={(e) => setFormData({ ...formData, fatherOrHusbandName: e.target.value })}
                    placeholder="e.g. Subramanian"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    கைபேசி எண் (Mobile Number) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    placeholder="10-digit mobile"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    கூடுதல் மொபைல் (Alternate Mobile)
                  </label>
                  <input
                    type="text"
                    value={formData.altMobile}
                    onChange={(e) => setFormData({ ...formData, altMobile: e.target.value })}
                    placeholder="Optional second number"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    முகவரி (Door No, Street Address) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="e.g. 15/2, Gandhi Road, Suramangalam"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ஊர் / நகரம் (City)
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    மாவட்டம் (District) & அஞ்சல் குறியீடு (Pincode)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={formData.district}
                      onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                      placeholder="Salem"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                    />
                    <input
                      type="text"
                      value={formData.pincode}
                      onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                      placeholder="636001"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ஆதார் எண் (Aadhaar Reference - Last 4 Digits)
                  </label>
                  <input
                    type="text"
                    maxLength={4}
                    value={formData.aadhaarRef}
                    onChange={(e) => setFormData({ ...formData, aadhaarRef: e.target.value })}
                    placeholder="e.g. 8892"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    வாரிசுதாரர் பெயர் (Nominee Name)
                  </label>
                  <input
                    type="text"
                    value={formData.nomineeName}
                    onChange={(e) => setFormData({ ...formData, nomineeName: e.target.value })}
                    placeholder="Nominee full name"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    வாரிசுதாரர் உறவுமுறை (Nominee Relationship)
                  </label>
                  <input
                    type="text"
                    value={formData.nomineeRelation}
                    onChange={(e) => setFormData({ ...formData, nomineeRelation: e.target.value })}
                    placeholder="Wife / Son / Daughter"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    வாரிசுதாரர் மொபைல் (Nominee Mobile)
                  </label>
                  <input
                    type="text"
                    value={formData.nomineeMobile}
                    onChange={(e) => setFormData({ ...formData, nomineeMobile: e.target.value })}
                    placeholder="Nominee contact"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  disabled={modalSubmitting}
                  className="px-5 py-2 text-xs font-bold bg-brand-blue hover:bg-blue-800 text-white rounded-xl shadow-md"
                >
                  {modalSubmitting ? "Saving..." : t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
