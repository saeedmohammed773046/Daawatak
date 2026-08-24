"use client";

import React, { useEffect, useState } from "react";
import { Users, Calendar, CheckCircle2, DollarSign, ArrowUpRight } from "lucide-react";
import { apiRequest } from "@/lib/api";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await apiRequest("/admin/dashboard/stats");
        setStats(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-400 text-xs animate-pulse">
        جاري تحميل البيانات المالية والمقاييس العامة للنظام...
      </div>
    );
  }

  return (
    <div className="space-y-8" dir="rtl">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">المؤشرات العامة للنظام المنصة</h1>
        <p className="text-xs text-slate-400">ملخص شامل لإحصائيات المنصة، المشتركين، والمداخيل الحالية</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">إجمالي الحسابات</span>
            <div className="p-2 bg-blue-500/10 text-blue-400 rounded-2xl border border-blue-500/20">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-bold text-white">{stats?.users?.total || 0}</p>
          <span className="text-[11px] text-slate-500">{stats?.users?.owners || 0} منظم | {stats?.users?.receptionists || 0} موظف استقبال</span>
        </div>

        <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">إجمالي المناسبات</span>
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-2xl border border-amber-500/20">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-bold text-white">{stats?.events?.total || 0}</p>
          <span className="text-[11px] text-emerald-400 font-medium">{stats?.events?.active || 0} مناسبة نشطة حالياً</span>
        </div>

        <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">عمليات التحقق والدخول</span>
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-bold text-white">{stats?.attendance?.total_checkins || 0}</p>
          <span className="text-[11px] text-slate-500">من إجمالي {stats?.attendance?.total_guests || 0} ضيف</span>
        </div>

        <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">إجمالي المداخيل</span>
            <div className="p-2 bg-purple-500/10 text-purple-400 rounded-2xl border border-purple-500/20">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-bold text-white">${stats?.financials?.total_revenue || 0}</p>
          <span className="text-[11px] text-purple-300 font-medium">{stats?.financials?.active_subscriptions || 0} اشتراك نشط</span>
        </div>
      </div>

      {/* Recent Activity lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent users */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-400" /> آخر المستخدمين المسجلين
          </h3>

          <div className="space-y-3">
            {stats?.recent_users?.map((u: any) => (
              <div key={u.id} className="p-3 bg-slate-950 rounded-2xl border border-slate-850 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-white">{u.name}</p>
                  <p className="text-slate-500 text-[11px]">{u.email}</p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-slate-800 text-amber-400 font-medium capitalize">
                  {u.role}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent payments */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-400" /> آخر عمليات الدفع والاشتراك
          </h3>

          <div className="space-y-3">
            {stats?.recent_payments?.length ? (
              stats.recent_payments.map((p: any) => (
                <div key={p.id} className="p-3 bg-slate-950 rounded-2xl border border-slate-850 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-white">{p.user?.name || "مستخدم"}</p>
                    <p className="text-slate-500 text-[11px]">{p.gateway} | {p.transaction_id}</p>
                  </div>
                  <span className="font-bold text-emerald-400">${p.amount}</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 py-4 text-center">لا توجد مدفوعات مسجلة بعد</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
