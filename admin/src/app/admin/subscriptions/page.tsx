"use client";

import React, { useEffect, useState } from "react";
import { ShieldCheck, CreditCard, Clock } from "lucide-react";
import { apiRequest } from "@/lib/api";

export default function AdminSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchSubscriptions() {
    setLoading(true);
    try {
      const res = await apiRequest("/admin/subscriptions");
      setSubscriptions(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">الاشتراكات والمدفوعات الحالية</h1>
        <p className="text-xs text-slate-400">متابعة كافة الاشتراكات الفعالة، التواريخ، وحالات السداد</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <table className="w-full text-right text-xs">
          <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
            <tr>
              <th className="p-4">اسم المنظم</th>
              <th className="p-4">اسم الخطة</th>
              <th className="p-4">الحالة</th>
              <th className="p-4">تاريخ البدء</th>
              <th className="p-4">تاريخ الانتهاء</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300">
            {loading ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-500">جاري تحميل بيانات الاشتراكات...</td>
              </tr>
            ) : subscriptions.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-500">لا توجد اشتراكات مسجلة حالياً</td>
              </tr>
            ) : (
              subscriptions.map((s) => (
                <tr key={s.id} className="hover:bg-slate-850/50 transition">
                  <td className="p-4 font-bold text-white">{s.user?.name || "-"}</td>
                  <td className="p-4 text-amber-400 font-medium">{s.plan?.name || "-"}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${s.status === "active" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30" : "bg-rose-500/10 text-rose-400 border border-rose-500/30"}`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="p-4 text-slate-400">{new Date(s.starts_at).toLocaleDateString("ar-SA")}</td>
                  <td className="p-4 text-slate-400">{new Date(s.ends_at).toLocaleDateString("ar-SA")}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
