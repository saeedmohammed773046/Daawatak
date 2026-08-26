"use client";

import React, { useEffect, useState } from "react";
import { Users, Search, UserCheck, UserX, Shield, UserPlus, X, Check, KeyRound } from "lucide-react";
import { apiRequest } from "@/lib/api";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  // Modal State for adding receptionist
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "receptionist",
  });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function fetchUsers() {
    setLoading(true);
    try {
      let url = `/admin/users?search=${encodeURIComponent(search)}`;
      if (roleFilter !== "all") {
        url += `&role=${encodeURIComponent(roleFilter)}`;
      }
      const res = await apiRequest(url);
      setUsers(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers();
  }, [search, roleFilter]);

  const handleToggleStatus = async (id: string) => {
    try {
      await apiRequest(`/admin/users/${id}/toggle-status`, { method: "POST" });
      fetchUsers();
    } catch (err: any) {
      alert(err.message || "فشل تغيير حالة الحساب");
    }
  };

  const handleCreateReceptionist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim()) {
      setFormError("يرجى ملء جميع الحقول المطلوبة (الاسم، البريد/اسم المستخدم، وكلمة المرور)");
      return;
    }

    setFormSubmitting(true);
    setFormError(null);

    try {
      await apiRequest("/admin/users", {
        method: "POST",
        body: JSON.stringify({
          ...formData,
          role: "receptionist",
        }),
      });
      setIsAddModalOpen(false);
      setFormData({
        name: "",
        email: "",
        phone: "",
        password: "",
        role: "receptionist",
      });
      fetchUsers();
    } catch (err: any) {
      setFormError(err.message || "تعذر إضافة موظف الاستقبال، تأكد من عدم تكرار البريد الإلكتروني");
    } finally {
      setFormSubmitting(false);
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">إدارة المستخدمين وموظفي الاستقبال</h1>
          <p className="text-xs text-slate-400">إضافة موظفي الاستقبال، تفعيل وتجميد الحسابات، وإدارة صلاحيات المنصة</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Add Receptionist Button */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 transition shadow-lg shadow-amber-500/20 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>إضافة موظف استقبال</span>
          </button>

          {/* Search input */}
          <div className="relative w-64">
            <Search className="w-4 h-4 text-slate-500 absolute right-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="بحث بالاسم، البريد أو الهاتف..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pr-9 pl-4 py-2 text-xs text-white focus:outline-none focus:border-amber-500 transition"
            />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        {[
          { id: "all", label: "جميع الحسابات" },
          { id: "receptionist", label: "موظفو الاستقبال" },
          { id: "event_owner", label: "منظمو الفعاليات" },
          { id: "super_admin", label: "مدراء النظام" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setRoleFilter(tab.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              roleFilter === tab.id
                ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Users table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <table className="w-full text-right text-xs">
          <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
            <tr>
              <th className="p-4">الاسم الكامل</th>
              <th className="p-4">البريد الإلكتروني / المعرف</th>
              <th className="p-4">رقم الهاتف</th>
              <th className="p-4">الدور الصلاحية</th>
              <th className="p-4">تاريخ التسجيل</th>
              <th className="p-4 text-center">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300">
            {loading ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-500">جاري تحميل حسابات المستخدمين...</td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-500">لم يتم العثور على أية حسابات مطابقة</td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-850/50 transition">
                  <td className="p-4 font-bold text-white">{u.name}</td>
                  <td className="p-4 font-mono text-slate-400">{u.email}</td>
                  <td className="p-4 font-mono">{u.phone || "-"}</td>
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        u.role === "super_admin"
                          ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                          : u.role === "receptionist"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                          : u.role === "suspended"
                          ? "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                          : "bg-blue-500/10 text-blue-400 border border-blue-500/30"
                      }`}
                    >
                      {u.role === "super_admin"
                        ? "مدير نظام (Super Admin)"
                        : u.role === "receptionist"
                        ? "موظف استقبال (Receptionist)"
                        : u.role === "suspended"
                        ? "مُجمّد (Suspended)"
                        : "منظم فعاليات (Organizer)"}
                    </span>
                  </td>
                  <td className="p-4 text-slate-500">{new Date(u.created_at).toLocaleDateString("ar-SA")}</td>
                  <td className="p-4 text-center">
                    {u.role !== "super_admin" && (
                      <button
                        onClick={() => handleToggleStatus(u.id)}
                        className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition flex items-center gap-1 mx-auto cursor-pointer ${
                          u.role === "suspended"
                            ? "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20"
                            : "bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20"
                        }`}
                      >
                        {u.role === "suspended" ? <UserCheck className="w-3.5 h-3.5" /> : <UserX className="w-3.5 h-3.5" />}
                        {u.role === "suspended" ? "إلغاء التجميد" : "تجميد الحساب"}
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Receptionist Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
                  <UserPlus className="w-4 h-4" />
                </div>
                <h2 className="text-base font-bold text-white">إضافة موظف استقبال جديد</h2>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs p-3 rounded-xl">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateReceptionist} className="space-y-3.5">
              <div>
                <label className="block text-xs text-slate-300 font-medium mb-1">اسم الموظف الكامل *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: خالد المنصوري"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 font-medium mb-1">البريد الإلكتروني أو المعرّف *</label>
                <input
                  type="email"
                  required
                  placeholder="reception@daawatak.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 font-medium mb-1">رقم الهاتف (اختياري)</label>
                <input
                  type="tel"
                  placeholder="+966500000000"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 font-medium mb-1">كلمة المرور للدخول *</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition disabled:opacity-50"
                >
                  {formSubmitting ? "جاري الإضافة..." : "حفظ وإضافة الحساب"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
