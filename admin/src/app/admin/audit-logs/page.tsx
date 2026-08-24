"use client";

import React, { useEffect, useState } from "react";
import { History, Search } from "lucide-react";
import { apiRequest } from "@/lib/api";

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchLogs() {
    setLoading(true);
    try {
      const res = await apiRequest("/admin/audit-logs");
      setLogs(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">سجل التغييرات والأمان (Audit Logs)</h1>
        <p className="text-xs text-slate-400">تتبع دقيق لكافة الحركات، التعديلات، وعمليات الدخول مع تسجيل عناوين IP</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <table className="w-full text-right text-xs">
          <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
            <tr>
              <th className="p-4">التوقيت</th>
              <th className="p-4">المستخدم</th>
              <th className="p-4">الحدث (Action)</th>
              <th className="p-4">الجدول التأثري</th>
              <th className="p-4">عنوان IP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300">
            {loading ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-500">جاري تحميل سجلات الأمان...</td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-500">لا توجد سجلات تدقيق حتى الآن</td>
              </tr>
            ) : (
              logs.map((l) => (
                <tr key={l.id} className="hover:bg-slate-850/50 transition">
                  <td className="p-4 text-slate-400 font-mono">{new Date(l.created_at).toLocaleString("ar-SA")}</td>
                  <td className="p-4 font-bold text-white">{l.user?.name || "النظام"}</td>
                  <td className="p-4 text-amber-400 font-medium">{l.action}</td>
                  <td className="p-4 font-mono text-slate-400">{l.table_name || "-"}</td>
                  <td className="p-4 font-mono text-slate-500">{l.ip_address || "127.0.0.1"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
