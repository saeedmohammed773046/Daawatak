"use client";

import React, { useState, useEffect } from "react";
import { User, Lock, Bell, Moon, Shield, CreditCard, Save, Check } from "lucide-react";
import { apiRequest } from "@/lib/api";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"profile" | "security" | "subscription">("profile");
  const [user, setUser] = useState<any>(null);
  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [statusMsg, setStatusMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("auth_user");
    if (stored) {
      setUser(JSON.parse(stored));
    }
  }, []);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg("");
    setErrorMsg("");

    if (passwordData.new_password !== passwordData.confirm_password) {
      setErrorMsg("كلمتا المرور غير متطابقتين");
      return;
    }

    setLoading(true);
    try {
      await apiRequest("/auth/change-password", {
        method: "POST",
        body: JSON.stringify({
          current_password: passwordData.current_password,
          new_password: passwordData.new_password,
        }),
      });
      setStatusMsg("تم تغيير كلمة المرور بنجاح");
      setPasswordData({ current_password: "", new_password: "", confirm_password: "" });
    } catch (err: any) {
      setErrorMsg(err.message || "فشل تغيير كلمة المرور");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">إعدادات الحساب والأمان</h1>
        <p className="text-xs text-slate-400">إدارة الملف الشخصي، كلمة المرور، وتفاصيل الاشتراك</p>
      </div>

      {/* Tabs bar */}
      <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
        {[
          { id: "profile", label: "الملف الشخصي", icon: User },
          { id: "security", label: "الأمان وكلمة المرور", icon: Lock },
          { id: "subscription", label: "الاشتراك والباقة", icon: CreditCard },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-5 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition ${activeTab === tab.id ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20" : "bg-slate-900 text-slate-400 hover:text-white"}`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Messages */}
      {statusMsg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 rounded-2xl text-xs flex items-center gap-2">
          <Check className="w-4 h-4" /> {statusMsg}
        </div>
      )}
      {errorMsg && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-2xl text-xs">
          {errorMsg}
        </div>
      )}

      {/* Profile Settings */}
      {activeTab === "profile" && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 max-w-xl">
          <h3 className="text-sm font-bold text-white">معلومات الحساب الشخصية</h3>
          
          <div className="space-y-4 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">الاسم الكامل</label>
              <input
                type="text"
                disabled
                value={user?.name || ""}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-300 cursor-not-allowed opacity-80"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">البريد الإلكتروني</label>
              <input
                type="email"
                disabled
                value={user?.email || ""}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-300 cursor-not-allowed opacity-80"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">دور الحساب الصلاحية</label>
              <input
                type="text"
                disabled
                value={user?.role || ""}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-amber-400 font-bold capitalize cursor-not-allowed opacity-80"
              />
            </div>
          </div>
        </div>
      )}

      {/* Security Settings */}
      {activeTab === "security" && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 max-w-xl">
          <h3 className="text-sm font-bold text-white">تغيير كلمة المرور</h3>
          
          <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">كلمة المرور الحالية *</label>
              <input
                type="password"
                required
                value={passwordData.current_password}
                onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">كلمة المرور الجديدة *</label>
              <input
                type="password"
                required
                value={passwordData.new_password}
                onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">تأكيد كلمة المرور الجديدة *</label>
              <input
                type="password"
                required
                value={passwordData.confirm_password}
                onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 transition shadow-lg shadow-amber-500/20"
            >
              <Save className="w-4 h-4" /> {loading ? "جاري الحفظ..." : "حفظ كلمة المرور الجديدة"}
            </button>
          </form>
        </div>
      )}

      {/* Subscription Settings */}
      {activeTab === "subscription" && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 max-w-xl">
          <h3 className="text-sm font-bold text-white">الاشتراك والباقة الحالية</h3>
          <div className="p-6 bg-slate-950 border border-amber-500/20 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">الباقة الفعالة</span>
              <span className="px-3 py-1 bg-amber-500/10 text-amber-400 text-xs font-bold rounded-full border border-amber-500/30">Premium Plan</span>
            </div>

            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-500">حد المناسبات:</span>
                <span className="font-bold">10 مناسبات</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">حد المدعوين/مناسبة:</span>
                <span className="font-bold">1,000 ضيف</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
