"use client";

import React, { useEffect, useState } from "react";
import { Layout, Plus, Trash2, Globe, Eye } from "lucide-react";
import { apiRequest } from "@/lib/api";

export default function AdminTemplatesPage() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchTemplates() {
    setLoading(true);
    try {
      const res = await apiRequest("/admin/templates");
      setTemplates(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت تأكد من حذف هذا القالب؟")) return;
    try {
      await apiRequest(`/admin/templates/${id}`, { method: "DELETE" });
      fetchTemplates();
    } catch (err: any) {
      alert(err.message || "فشل حذف القالب");
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">إدارة قوالب الدعوة العامة</h1>
          <p className="text-xs text-slate-400">إضافة ونشر وتحديث القوالب العامة المتاحة لكافة المنظمين في النظام</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {templates.map((t) => (
          <div key={t.id} className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden p-4 space-y-4">
            <div className="h-44 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-center p-4">
              <span className="text-amber-400 text-xs font-bold font-serif">{t.name}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-white font-bold">{t.name}</span>
              <button onClick={() => handleDelete(t.id)} className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-lg">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
