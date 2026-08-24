"use client";

import React, { useEffect, useState } from "react";
import { Users, Search, UserCheck, UserX, Shield } from "lucide-react";
import { apiRequest } from "@/lib/api";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  async function fetchUsers() {
    setLoading(true);
    try {
      const res = await apiRequest(`/admin/users?search=${encodeURIComponent(search)}`);
      setUsers(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers();
  }, [search]);

  const handleToggleStatus = async (id: string) => {
    try {
      await apiRequest(`/admin/users/${id}/toggle-status`, { method: "POST" });
      fetchUsers();
    } catch (err: any) {
      alert(err.message || "فشل تغيير حالة الحساب");
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">إدارة المستخدمين والحسابات</h1>
          <p className="text-xs text-slate-400">البحث، التحكم الصارم، وتجميد/تفعيل حسابات المنظمين والموظفين</p>
        </div>

        {/* Search input */}
        <div className="relative w-72">
          <Search className="w-4 h-4 text-slate-500 absolute right-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث بالاسم، البريد أو الهاتف..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pr-9 pl-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 transition"
          />
        </div>
      </div>

      {/* Users table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <table className="w-full text-right text-xs">
          <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
            <tr>
              <th className="p-4">الاسم الكامل</th>
              <th className="p-4">البريد الإلكتروني</th>
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
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${u.role === "super_admin" ? "bg-amber-500/10 text-amber-400 border border-amber-500/30" : u.role === "suspended" ? "bg-rose-500/10 text-rose-400 border border-rose-500/30" : "bg-blue-500/10 text-blue-400 border border-blue-500/30"}`}>
                      {u.role === "super_admin" ? "Super Admin" : u.role === "suspended" ? "مُجمّد (Suspended)" : u.role}
                    </span>
                  </td>
                  <td className="p-4 text-slate-500">{new Date(u.created_at).toLocaleDateString("ar-SA")}</td>
                  <td className="p-4 text-center">
                    {u.role !== "super_admin" && (
                      <button
                        onClick={() => handleToggleStatus(u.id)}
                        className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition flex items-center gap-1 mx-auto ${u.role === "suspended" ? "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20" : "bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20"}`}
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
    </div>
  );
}
