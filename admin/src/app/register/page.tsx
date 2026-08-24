"use client";

import { useState } from "react";
import { Layers, Mail, Lock, User, Phone, ArrowLeft } from "lucide-react";
import { apiRequest } from "@/lib/api";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await apiRequest("/auth/register", {
        method: "POST",
        body: JSON.stringify({ name, email, phone, password }),
      });

      if (response.success && response.data) {
        localStorage.setItem("pending_email", response.data.email);
        if (response.data.otp_preview) {
          localStorage.setItem("otp_preview", response.data.otp_preview);
        }
        window.location.href = "/verify-otp";
      } else {
        setError(response.message || "فشل إنشاء الحساب");
      }
    } catch (err: any) {
      setError(err.message || "حدث خطأ أثناء إرسال البيانات");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0B0E14] px-4 py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      
      {/* Decorative Glows */}
      <div className="absolute top-[-20%] left-[-10%] h-[600px] w-[600px] rounded-full bg-[#D4AF37]/5 blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-10%] h-[600px] w-[600px] rounded-full bg-blue-500/5 blur-[120px]" />

      <div className="w-full max-w-md space-y-6 rounded-3xl border border-white/5 bg-[#121620]/45 p-8 backdrop-blur-xl gold-glow relative z-10">
        
        <div className="flex flex-col items-center justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#D4AF37] to-[#AA7C11] text-[#0B0E14] shadow-lg">
            <Layers className="h-6 w-6" />
          </div>
          <h2 className="mt-5 text-center text-2xl font-extrabold text-white tracking-tight">
            إنشاء حساب كمنظم
          </h2>
          <p className="mt-1.5 text-center text-xs text-slate-400 font-medium">
            أنشئ حسابك لبدء رقمنة وإدارة بطاقات الدعوات الخاصة بك
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-center text-xs font-semibold text-red-400">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">الاسم الكامل *</label>
            <div className="relative">
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="أحمد العتيبي"
                className="h-10 w-full rounded-xl border border-white/5 bg-[#121620]/60 pr-10 pl-4 text-xs text-slate-200 placeholder-slate-600 focus:border-[#D4AF37]/50 focus:outline-none transition-all"
              />
              <User className="absolute right-3 top-3 h-4 w-4 text-slate-500" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">البريد الإلكتروني *</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="h-10 w-full rounded-xl border border-white/5 bg-[#121620]/60 pr-10 pl-4 text-xs text-slate-200 placeholder-slate-600 focus:border-[#D4AF37]/50 focus:outline-none transition-all"
              />
              <Mail className="absolute right-3 top-3 h-4 w-4 text-slate-500" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">رقم الجوال</label>
            <div className="relative">
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+966500000000"
                className="h-10 w-full rounded-xl border border-white/5 bg-[#121620]/60 pr-10 pl-4 text-xs text-slate-200 placeholder-slate-600 focus:border-[#D4AF37]/50 focus:outline-none transition-all"
              />
              <Phone className="absolute right-3 top-3 h-4 w-4 text-slate-500" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">كلمة المرور *</label>
            <div className="relative">
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="6 أحرف على الأقل"
                className="h-10 w-full rounded-xl border border-white/5 bg-[#121620]/60 pr-10 pl-4 text-xs text-slate-200 placeholder-slate-600 focus:border-[#D4AF37]/50 focus:outline-none transition-all"
              />
              <Lock className="absolute right-3 top-3 h-4 w-4 text-slate-500" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex h-11 w-full items-center justify-center rounded-xl bg-gradient-to-tr from-[#D4AF37] to-[#AA7C11] text-sm font-bold text-[#0B0E14] shadow-md hover:opacity-90 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 mt-4"
          >
            {loading ? "جاري الإنشاء..." : "تسجيل وإرسال رمز التحقق"}
          </button>
        </form>

        <div className="text-center text-xs text-slate-500 font-medium">
          لديك حساب بالفعل؟ <a href="/login" className="text-[#D4AF37] font-semibold hover:underline">تسجيل الدخول</a>
        </div>

      </div>
    </div>
  );
}
