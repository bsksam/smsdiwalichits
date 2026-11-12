"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "@/components/layout/LanguageContext";
import { formatINR, formatDate, getStatusBadge } from "@/lib/utils";
import {
  Building2,
  Users,
  Plus,
  ShieldCheck,
  Receipt,
  Phone,
  MapPin,
  Lock,
  User,
  X,
  AlertCircle,
  Briefcase,
  Sparkles,
  Edit2,
  CheckCircle2,
} from "lucide-react";

export default function StaffPage() {
  const { t, language } = useLanguage();
  const [staff, setStaff] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"staff" | "branches">("staff");

  // Add Staff Modal
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [staffFormData, setStaffFormData] = useState({
    username: "",
    password: "",
    fullName: "",
    mobile: "",
    role: "cashier",
    branchId: 1,
  });

  // Edit Staff Modal
  const [isEditStaffModalOpen, setIsEditStaffModalOpen] = useState(false);
  const [editStaffData, setEditStaffData] = useState({
    id: 0,
    username: "",
    fullName: "",
    mobile: "",
    role: "cashier",
    branchId: 1,
    status: "active",
    newPassword: "",
  });

  // Add Branch Modal
  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);
  const [branchFormData, setBranchFormData] = useState({
    name: "",
    address: "",
    city: "Salem",
    district: "Salem",
    pincode: "636001",
    phone: "",
    email: "",
  });

  // Edit Branch Modal
  const [isEditBranchModalOpen, setIsEditBranchModalOpen] = useState(false);
  const [editBranchData, setEditBranchData] = useState({
    id: 0,
    code: "",
    name: "",
    address: "",
    city: "Salem",
    district: "Salem",
    pincode: "636001",
    phone: "",
    email: "",
    isMainBranch: false,
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [staffRes, branchRes] = await Promise.all([
        fetch("/api/staff"),
        fetch("/api/branches"),
      ]);
      const staffData = await staffRes.json();
      const branchData = await branchRes.json();

      setStaff(staffData.staff || []);
      setBranches(branchData.branches || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(staffFormData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create staff account");
      }

      setIsStaffModalOpen(false);
      fetchData();
    } catch (err: any) {
      setError(err.message || "Failed to create staff user");
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenEditStaff = (user: any) => {
    setEditStaffData({
      id: user.id,
      username: user.username,
      fullName: user.full_name || "",
      mobile: user.mobile || "",
      role: user.role || "cashier",
      branchId: user.branch_id || 1,
      status: user.status || "active",
      newPassword: "",
    });
    setError(null);
    setIsEditStaffModalOpen(true);
  };

  const handleEditStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/staff", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editStaffData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update staff account");
      }

      setIsEditStaffModalOpen(false);
      fetchData();
    } catch (err: any) {
      setError(err.message || "Failed to update staff user");
    } finally {
      setSubmitting(false);
    }
  };

  const handleBranchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/branches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(branchFormData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create branch");
      }

      setIsBranchModalOpen(false);
      fetchData();
    } catch (err: any) {
      setError(err.message || "Failed to register branch");
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenEditBranch = (b: any) => {
    setEditBranchData({
      id: b.id,
      code: b.code,
      name: b.name || "",
      address: b.address || "",
      city: b.city || "Salem",
      district: b.district || "Salem",
      pincode: b.pincode || "636001",
      phone: b.phone || "",
      email: b.email || "",
      isMainBranch: Boolean(b.is_main_branch === 1),
    });
    setError(null);
    setIsEditBranchModalOpen(true);
  };

  const handleEditBranchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/branches", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editBranchData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update branch");
      }

      setIsEditBranchModalOpen(false);
      fetchData();
    } catch (err: any) {
      setError(err.message || "Failed to update branch");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-amber-300 font-serif tracking-wide drop-shadow flex items-center gap-2">
            <Building2 className="h-6 w-6 text-amber-400" />
            <span>Staff & Branch Management</span>
          </h1>
          <p className="text-xs text-amber-200/70 mt-1">
            Manage staff roles, collection agents, access permissions, branches and locations
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {activeTab === "staff" ? (
            <button
              onClick={() => {
                setStaffFormData({
                  username: "",
                  password: "",
                  fullName: "",
                  mobile: "",
                  role: "cashier",
                  branchId: 1,
                });
                setError(null);
                setIsStaffModalOpen(true);
              }}
              className="flex items-center gap-2 gold-gradient-btn text-[#1a0004] px-4 py-2 rounded-xl text-xs sm:text-sm font-black shadow-md transition-all"
            >
              <Plus className="h-4 w-4" />
              <span>{language === "ta" ? "+ புதிய பணியாளர்" : "+ Add Staff User"}</span>
            </button>
          ) : (
            <button
              onClick={() => {
                setBranchFormData({
                  name: "",
                  address: "",
                  city: "Salem",
                  district: "Salem",
                  pincode: "636001",
                  phone: "",
                  email: "",
                });
                setError(null);
                setIsBranchModalOpen(true);
              }}
              className="flex items-center gap-2 gold-gradient-btn text-[#1a0004] px-4 py-2 rounded-xl text-xs sm:text-sm font-black shadow-md transition-all"
            >
              <Plus className="h-4 w-4" />
              <span>{language === "ta" ? "+ புதிய கிளை" : "+ Add Branch"}</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-amber-500/20 pb-2">
        <button
          onClick={() => setActiveTab("staff")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "staff"
              ? "gold-gradient-btn text-[#1a0004] shadow-md font-black"
              : "text-amber-200/80 hover:bg-amber-500/10"
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Staff Accounts ({staff.length})</span>
        </button>
        <button
          onClick={() => setActiveTab("branches")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "branches"
              ? "gold-gradient-btn text-[#1a0004] shadow-md font-black"
              : "text-amber-200/80 hover:bg-amber-500/10"
          }`}
        >
          <Building2 className="h-4 w-4" />
          <span>Branches ({branches.length})</span>
        </button>
      </div>

      {activeTab === "staff" ? (
        /* Staff Users Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {staff.map((u) => (
            <div
              key={u.id}
              className="maroon-card rounded-3xl p-5 shadow-xl space-y-3.5 border border-amber-500/30 flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-400 text-[#1a0004] font-black flex items-center justify-center text-sm shadow-md font-serif">
                      {u.full_name ? u.full_name[0].toUpperCase() : "U"}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-amber-100 font-serif">{u.full_name}</h3>
                      <span className="text-[10px] font-mono text-amber-400 font-semibold">@{u.username}</span>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(u.status)}`}>
                    {u.status}
                  </span>
                </div>

                <div className="pt-3 mt-2 border-t border-amber-500/20 space-y-1.5 text-xs">
                  <div className="flex justify-between text-amber-200/80">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="h-3.5 w-3.5 text-amber-400" />
                      <span>Role:</span>
                    </span>
                    <span className="font-bold text-amber-300 uppercase text-[11px] bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded">
                      {u.role.replace("_", " ")}
                    </span>
                  </div>

                  <div className="flex justify-between text-amber-200/80">
                    <span className="flex items-center gap-1.5">
                      <Building2 className="h-3.5 w-3.5 text-amber-400" />
                      <span>Branch:</span>
                    </span>
                    <span className="font-semibold text-amber-100">{u.branch_name || "Head Office"}</span>
                  </div>

                  <div className="flex justify-between text-amber-200/80">
                    <span className="flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-amber-400" />
                      <span>Mobile:</span>
                    </span>
                    <span className="font-mono text-amber-300 font-bold">{u.mobile}</span>
                  </div>
                </div>
              </div>

              {/* Edit Staff Action Button */}
              <div className="pt-2 border-t border-amber-500/20 flex justify-end">
                <button
                  onClick={() => handleOpenEditStaff(u)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-500/40 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 text-xs font-bold transition-all shadow-sm"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                  <span>Edit Staff</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Branches Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {branches.map((b) => (
            <div
              key={b.id}
              className="maroon-card rounded-3xl p-5 shadow-xl space-y-3.5 border border-amber-500/30 flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-mono text-[10px] text-amber-400 font-bold block">{b.code}</span>
                    <h3 className="font-black text-sm text-amber-100 font-serif">{b.name}</h3>
                  </div>
                  {b.is_main_branch === 1 && (
                    <span className="bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      Main Head Office
                    </span>
                  )}
                </div>

                <p className="text-xs text-amber-200/80 mt-2">
                  {b.address}, {b.city}, {b.district} - {b.pincode}
                </p>

                <div className="pt-2.5 border-t border-amber-500/20 flex justify-between items-center text-xs text-amber-300/80">
                  <span>Phone: <span className="font-mono text-amber-300 font-bold">{b.phone}</span></span>
                  <span className="font-bold text-amber-400">{b.customer_count || 0} Customers</span>
                </div>
              </div>

              {/* Edit Branch Action Button */}
              <div className="pt-2 border-t border-amber-500/20 flex justify-end">
                <button
                  onClick={() => handleOpenEditBranch(b)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-500/40 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 text-xs font-bold transition-all shadow-sm"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                  <span>Edit Branch</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Staff Modal */}
      {isStaffModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-md erp-modal-box overflow-hidden shadow-2xl border border-amber-500/40">
            <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-[#3e010b] via-[#4d0210] to-[#2b0006] text-amber-200 border-b border-amber-500/30">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-400" />
                <h3 className="text-sm font-bold font-serif tracking-wide">Register Staff Account</h3>
              </div>
              <button
                onClick={() => setIsStaffModalOpen(false)}
                className="text-amber-400/80 hover:text-amber-300 p-1 rounded-lg hover:bg-amber-500/10"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleStaffSubmit} className="p-6 space-y-4 text-xs bg-[#240005]">
              {error && (
                <div className="p-3 bg-rose-950/80 text-rose-300 rounded-xl border border-rose-500/40">
                  {error}
                </div>
              )}

              <div>
                <label className="block font-bold text-amber-300 mb-1 font-serif">Full Name *</label>
                <input
                  type="text"
                  required
                  value={staffFormData.fullName}
                  onChange={(e) => setStaffFormData({ ...staffFormData, fullName: e.target.value })}
                  placeholder="e.g. S. Ramanathan"
                  className="w-full px-3 py-2 bg-[#180003] border border-amber-500/40 rounded-xl text-amber-100 placeholder-amber-400/40"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-amber-300 mb-1 font-serif">Username *</label>
                  <input
                    type="text"
                    required
                    value={staffFormData.username}
                    onChange={(e) => setStaffFormData({ ...staffFormData, username: e.target.value })}
                    placeholder="ramanathan"
                    className="w-full px-3 py-2 bg-[#180003] border border-amber-500/40 rounded-xl text-amber-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-amber-300 mb-1 font-serif">Password *</label>
                  <input
                    type="password"
                    required
                    value={staffFormData.password}
                    onChange={(e) => setStaffFormData({ ...staffFormData, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 bg-[#180003] border border-amber-500/40 rounded-xl text-amber-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-amber-300 mb-1 font-serif">Mobile *</label>
                  <input
                    type="text"
                    required
                    value={staffFormData.mobile}
                    onChange={(e) => setStaffFormData({ ...staffFormData, mobile: e.target.value })}
                    placeholder="9876543210"
                    className="w-full px-3 py-2 bg-[#180003] border border-amber-500/40 rounded-xl text-amber-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-amber-300 mb-1 font-serif">Role *</label>
                  <select
                    value={staffFormData.role}
                    onChange={(e) => setStaffFormData({ ...staffFormData, role: e.target.value })}
                    className="w-full px-3 py-2 bg-[#180003] border border-amber-500/40 rounded-xl font-bold text-amber-200"
                  >
                    <option value="cashier">Cashier</option>
                    <option value="branch_manager">Branch Manager</option>
                    <option value="agent">Collection Agent</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-amber-300 mb-1 font-serif">Branch Assignment</label>
                <select
                  value={staffFormData.branchId}
                  onChange={(e) => setStaffFormData({ ...staffFormData, branchId: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-[#180003] border border-amber-500/40 rounded-xl font-bold text-amber-200"
                >
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.city})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-amber-500/20">
                <button
                  type="button"
                  onClick={() => setIsStaffModalOpen(false)}
                  className="px-4 py-2 font-semibold text-amber-300/80 hover:bg-amber-500/10 rounded-xl border border-amber-500/20"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="gold-gradient-btn px-5 py-2 font-black text-[#1a0004] rounded-xl shadow-md transition-all"
                >
                  {submitting ? "Creating..." : "Create Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Staff Modal */}
      {isEditStaffModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-md erp-modal-box overflow-hidden shadow-2xl border border-amber-500/40">
            <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-[#3e010b] via-[#4d0210] to-[#2b0006] text-amber-200 border-b border-amber-500/30">
              <div className="flex items-center gap-2">
                <Edit2 className="h-4 w-4 text-amber-400" />
                <h3 className="text-sm font-bold font-serif tracking-wide">
                  Edit Staff User: @{editStaffData.username}
                </h3>
              </div>
              <button
                onClick={() => setIsEditStaffModalOpen(false)}
                className="text-amber-400/80 hover:text-amber-300 p-1 rounded-lg hover:bg-amber-500/10"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleEditStaffSubmit} className="p-6 space-y-4 text-xs bg-[#240005]">
              {error && (
                <div className="p-3 bg-rose-950/80 text-rose-300 rounded-xl border border-rose-500/40">
                  {error}
                </div>
              )}

              <div>
                <label className="block font-bold text-amber-300 mb-1 font-serif">Full Name *</label>
                <input
                  type="text"
                  required
                  value={editStaffData.fullName}
                  onChange={(e) => setEditStaffData({ ...editStaffData, fullName: e.target.value })}
                  className="w-full px-3 py-2 bg-[#180003] border border-amber-500/40 rounded-xl text-amber-100 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-amber-300 mb-1 font-serif">Mobile *</label>
                  <input
                    type="text"
                    required
                    value={editStaffData.mobile}
                    onChange={(e) => setEditStaffData({ ...editStaffData, mobile: e.target.value })}
                    className="w-full px-3 py-2 bg-[#180003] border border-amber-500/40 rounded-xl text-amber-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-amber-300 mb-1 font-serif">Role *</label>
                  <select
                    value={editStaffData.role}
                    onChange={(e) => setEditStaffData({ ...editStaffData, role: e.target.value })}
                    className="w-full px-3 py-2 bg-[#180003] border border-amber-500/40 rounded-xl font-bold text-amber-200"
                  >
                    <option value="cashier">Cashier</option>
                    <option value="branch_manager">Branch Manager</option>
                    <option value="agent">Collection Agent</option>
                    <option value="admin">Admin</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-amber-300 mb-1 font-serif">Branch Assignment</label>
                  <select
                    value={editStaffData.branchId}
                    onChange={(e) => setEditStaffData({ ...editStaffData, branchId: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-[#180003] border border-amber-500/40 rounded-xl font-bold text-amber-200"
                  >
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.city})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-amber-300 mb-1 font-serif">Status</label>
                  <select
                    value={editStaffData.status}
                    onChange={(e) => setEditStaffData({ ...editStaffData, status: e.target.value })}
                    className="w-full px-3 py-2 bg-[#180003] border border-amber-500/40 rounded-xl font-bold text-amber-200"
                  >
                    <option value="active">Active (செயலில்)</option>
                    <option value="inactive">Inactive / Blocked</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-amber-300 mb-1 font-serif">
                  Reset Password (Leave empty to keep current password)
                </label>
                <input
                  type="password"
                  value={editStaffData.newPassword}
                  onChange={(e) => setEditStaffData({ ...editStaffData, newPassword: e.target.value })}
                  placeholder="Enter new password if changing..."
                  className="w-full px-3 py-2 bg-[#180003] border border-amber-500/40 rounded-xl text-amber-100 placeholder-amber-400/40"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-amber-500/20">
                <button
                  type="button"
                  onClick={() => setIsEditStaffModalOpen(false)}
                  className="px-4 py-2 font-semibold text-amber-300/80 hover:bg-amber-500/10 rounded-xl border border-amber-500/20"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="gold-gradient-btn px-5 py-2 font-black text-[#1a0004] rounded-xl shadow-md transition-all"
                >
                  {submitting ? "Updating..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Branch Modal */}
      {isBranchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-md erp-modal-box overflow-hidden shadow-2xl border border-amber-500/40">
            <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-[#3e010b] via-[#4d0210] to-[#2b0006] text-amber-200 border-b border-amber-500/30">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-400" />
                <h3 className="text-sm font-bold font-serif tracking-wide">Register New Branch</h3>
              </div>
              <button
                onClick={() => setIsBranchModalOpen(false)}
                className="text-amber-400/80 hover:text-amber-300 p-1 rounded-lg hover:bg-amber-500/10"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleBranchSubmit} className="p-6 space-y-4 text-xs bg-[#240005]">
              {error && (
                <div className="p-3 bg-rose-950/80 text-rose-300 rounded-xl border border-rose-500/40">
                  {error}
                </div>
              )}

              <div>
                <label className="block font-bold text-amber-300 mb-1 font-serif">Branch Name *</label>
                <input
                  type="text"
                  required
                  value={branchFormData.name}
                  onChange={(e) => setBranchFormData({ ...branchFormData, name: e.target.value })}
                  placeholder="e.g. நாமக்கல் கிளை (Namakkal Branch)"
                  className="w-full px-3 py-2 bg-[#180003] border border-amber-500/40 rounded-xl text-amber-100 placeholder-amber-400/40"
                />
              </div>

              <div>
                <label className="block font-bold text-amber-300 mb-1 font-serif">Address *</label>
                <input
                  type="text"
                  required
                  value={branchFormData.address}
                  onChange={(e) => setBranchFormData({ ...branchFormData, address: e.target.value })}
                  placeholder="Street / Road address"
                  className="w-full px-3 py-2 bg-[#180003] border border-amber-500/40 rounded-xl text-amber-100 placeholder-amber-400/40"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-amber-300 mb-1 font-serif">City *</label>
                  <input
                    type="text"
                    required
                    value={branchFormData.city}
                    onChange={(e) => setBranchFormData({ ...branchFormData, city: e.target.value })}
                    className="w-full px-3 py-2 bg-[#180003] border border-amber-500/40 rounded-xl text-amber-100"
                  />
                </div>
                <div>
                  <label className="block font-bold text-amber-300 mb-1 font-serif">Phone *</label>
                  <input
                    type="text"
                    required
                    value={branchFormData.phone}
                    onChange={(e) => setBranchFormData({ ...branchFormData, phone: e.target.value })}
                    placeholder="+91..."
                    className="w-full px-3 py-2 bg-[#180003] border border-amber-500/40 rounded-xl text-amber-100 font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-amber-500/20">
                <button
                  type="button"
                  onClick={() => setIsBranchModalOpen(false)}
                  className="px-4 py-2 font-semibold text-amber-300/80 hover:bg-amber-500/10 rounded-xl border border-amber-500/20"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="gold-gradient-btn px-5 py-2 font-black text-[#1a0004] rounded-xl shadow-md transition-all"
                >
                  {submitting ? "Saving..." : "Register Branch"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Branch Modal */}
      {isEditBranchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-md erp-modal-box overflow-hidden shadow-2xl border border-amber-500/40">
            <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-[#3e010b] via-[#4d0210] to-[#2b0006] text-amber-200 border-b border-amber-500/30">
              <div className="flex items-center gap-2">
                <Edit2 className="h-4 w-4 text-amber-400" />
                <h3 className="text-sm font-bold font-serif tracking-wide">
                  Edit Branch: {editBranchData.code}
                </h3>
              </div>
              <button
                onClick={() => setIsEditBranchModalOpen(false)}
                className="text-amber-400/80 hover:text-amber-300 p-1 rounded-lg hover:bg-amber-500/10"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleEditBranchSubmit} className="p-6 space-y-4 text-xs bg-[#240005]">
              {error && (
                <div className="p-3 bg-rose-950/80 text-rose-300 rounded-xl border border-rose-500/40">
                  {error}
                </div>
              )}

              <div>
                <label className="block font-bold text-amber-300 mb-1 font-serif">Branch Name *</label>
                <input
                  type="text"
                  required
                  value={editBranchData.name}
                  onChange={(e) => setEditBranchData({ ...editBranchData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-[#180003] border border-amber-500/40 rounded-xl text-amber-100 font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-amber-300 mb-1 font-serif">Address *</label>
                <input
                  type="text"
                  required
                  value={editBranchData.address}
                  onChange={(e) => setEditBranchData({ ...editBranchData, address: e.target.value })}
                  className="w-full px-3 py-2 bg-[#180003] border border-amber-500/40 rounded-xl text-amber-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-amber-300 mb-1 font-serif">City *</label>
                  <input
                    type="text"
                    required
                    value={editBranchData.city}
                    onChange={(e) => setEditBranchData({ ...editBranchData, city: e.target.value })}
                    className="w-full px-3 py-2 bg-[#180003] border border-amber-500/40 rounded-xl text-amber-100 font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-amber-300 mb-1 font-serif">District</label>
                  <input
                    type="text"
                    value={editBranchData.district}
                    onChange={(e) => setEditBranchData({ ...editBranchData, district: e.target.value })}
                    className="w-full px-3 py-2 bg-[#180003] border border-amber-500/40 rounded-xl text-amber-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-amber-300 mb-1 font-serif">Phone *</label>
                  <input
                    type="text"
                    required
                    value={editBranchData.phone}
                    onChange={(e) => setEditBranchData({ ...editBranchData, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-[#180003] border border-amber-500/40 rounded-xl text-amber-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-amber-300 mb-1 font-serif">Pincode</label>
                  <input
                    type="text"
                    value={editBranchData.pincode}
                    onChange={(e) => setEditBranchData({ ...editBranchData, pincode: e.target.value })}
                    className="w-full px-3 py-2 bg-[#180003] border border-amber-500/40 rounded-xl text-amber-100 font-mono"
                  />
                </div>
              </div>

              <div className="p-3 bg-[#1e0004] rounded-xl border border-amber-500/25 flex items-center gap-2.5">
                <input
                  type="checkbox"
                  id="mainBranch"
                  checked={editBranchData.isMainBranch}
                  onChange={(e) => setEditBranchData({ ...editBranchData, isMainBranch: e.target.checked })}
                  className="h-4 w-4 rounded border-amber-500 text-amber-500 focus:ring-amber-400"
                />
                <label htmlFor="mainBranch" className="text-xs font-semibold text-amber-200">
                  Set as Primary Head Office Branch (தலைமை கிளை)
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-amber-500/20">
                <button
                  type="button"
                  onClick={() => setIsEditBranchModalOpen(false)}
                  className="px-4 py-2 font-semibold text-amber-300/80 hover:bg-amber-500/10 rounded-xl border border-amber-500/20"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="gold-gradient-btn px-5 py-2 font-black text-[#1a0004] rounded-xl shadow-md transition-all"
                >
                  {submitting ? "Updating..." : "Save Branch"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
