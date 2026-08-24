"use client";

import React, { useEffect, useState } from "react";
import { CreditCard, Plus, Trash2, Edit3, Check } from "lucide-react";
import { apiRequest } from "@/lib/api";

export default function AdminPlansPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    max_events: 5,
    max_guests_per_event: 500,
    max_receptionists: 3,
    validity_days: 30,
  });

  async function fetchPlans() {
    setLoading(true);
    try {
      const res = await apiRequest("/admin/plans");
      setPlans(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest("/admin/plans", {
        method: "POST",
        body: JSON.stringify(formData),
      });
      setIsModalOpen(false);
      fetchPlans();
    } catch (err: any) {
      alert(err.message || "فشل إخراج الخطة");
    }
  };

  const handleDeletePlan = async (id: string) => {
    if (!confirm("هل أنت تأكد من حذف هذه الخطة من النظام؟")) return;
    try {
      await apiRequest(`/admin/plans/${id}`, { method: "DELETE" });
      fetchPlans();
    } catch (err: any) {
      alert(err.message || "فشل حذف الخطة");
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">إدارة خطط الاشتراكات (SaaS Plans)</h1>
          <p className="text-xs text-slate-400">تخصيص أسعار وحدود الباقات للمناسبات، المدعوين، وموظفي الاستقبال</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 transition shadow-lg shadow-amber-500/20"
        >
          <Plus className="w-4 h-4" /> إضافة خطة باقة جديدة
        </button>
      </div>

      {/* Grid of Plans */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((p) => (
          <div key={p.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">{p.name}</h3>
                <button onClick={() => handleDeletePlan(p.id)} className="p-2 text-slate-500 hover:text-rose-400 transition">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="text-2xl font-bold text-amber-400 font-mono">
                ${p.price} <span className="text-xs text-slate-400 font-normal">/ {p.validity_days} يوم</span>
              </div>

              <p className="text-xs text-slate-400 min-h-[36px]">{p.description}</p>

              <div className="space-y-2 pt-4 border-t border-slate-800 text-xs text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-500">أقصى مناسبات:</span>
                  <span className="font-bold">{p.max_events}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">أقصى ضيوف/مناسبة:</span>
                  <span className="font-bold">{p.max_guests_per_event}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">أقصى موظفي استقبال:</span>
                  <span className="font-bold">{p.max_receptionists}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Plan Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md space-y-4">
            <h3 className="text-base font-bold text-white">إضافة باقة اشتراك جديدة</h3>
            
            <form onSubmit={handleCreatePlan} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 block mb-1">اسم الخطة</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="مثال: الخطة الماسية"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1">الوصف</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1">السعر ($)</label>
                  <input
                    type="number"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">الصلاحية (أيام)</label>
                  <input
                    type="number"
                    required
                    value={formData.validity_days}
                    onChange={(e) => setFormData({ ...formData, validity_days: parseInt(e.target.value) || 30 })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-slate-300 block mb-1">المناسبات</label>
                  <input
                    type="number"
                    value={formData.max_events}
                    onChange={(e) => setFormData({ ...formData, max_events: parseInt(e.target.value) || 1 })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2 py-2 text-white text-center"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">الضيوف/مناسبة</label>
                  <input
                    type="number"
                    value={formData.max_guests_per_event}
                    onChange={(e) => setFormData({ ...formData, max_guests_per_event: parseInt(e.target.value) || 50 })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2 py-2 text-white text-center"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">الموظفين</label>
                  <input
                    type="number"
                    value={formData.max_receptionists}
                    onChange={(e) => setFormData({ ...formData, max_receptionists: parseInt(e.target.value) || 1 })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2 py-2 text-white text-center"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl"
                >
                  حفظ الخطة
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-800 text-slate-300 rounded-xl"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
