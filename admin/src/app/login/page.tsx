"use client";

import { useState } from "react";
import { Layers, Mail, Lock } from "lucide-react";
import { apiRequest } from "@/lib/api";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      if (response.success && response.data) {
        localStorage.setItem("auth_token", response.data.access_token);
        localStorage.setItem("auth_user", JSON.stringify(response.data.user));
        window.location.href = "/dashboard";
      } else {
        setError(response.message || "فشل تسجيل الدخول");
      }
    } catch (err: any) {
      setError(err.message || "البريد الإلكتروني أو كلمة المرور غير صحيحة");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0B0E14] px-4 py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      
      {/* Decorative Glows */}
      <div className="absolute top-[-20%] left-[-10%] h-[600px] w-[600px] rounded-full bg-[#D4AF37]/5 blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-10%] h-[600px] w-[600px] rounded-full bg-blue-500/5 blur-[120px]" />

      <div className="w-full max-w-md space-y-8 rounded-3xl border border-white/5 bg-[#121620]/45 p-8 backdrop-blur-xl gold-glow relative z-10">
        
        <div className="flex flex-col items-center justify-center">
          <img 
            src="/logo-dark.svg" 
            alt="دعوتك - Daawatak" 
            className="h-16 w-auto object-contain mb-2" 
          />
          <h2 className="mt-4 text-center text-3xl font-extrabold text-white tracking-tight">
            تسجيل الدخول
          </h2>
          <p className="mt-2 text-center text-sm text-slate-400 font-medium">
            منصة دعوتك لإدارة الدعوات الإلكترونية
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3.5 text-center text-xs font-semibold text-red-400">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">البريد الإلكتروني</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@daawatak.com"
                  className="h-11 w-full rounded-xl border border-white/5 bg-[#121620]/60 pr-11 pl-4 text-sm text-slate-200 placeholder-slate-600 focus:border-[#D4AF37]/50 focus:outline-none focus:ring-1 focus:ring-[#D4AF37]/50 transition-all duration-200"
                />
                <Mail className="absolute right-3.5 top-3.5 h-4.5 w-4.5 text-slate-500" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">كلمة المرور</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-11 w-full rounded-xl border border-white/5 bg-[#121620]/60 pr-11 pl-4 text-sm text-slate-200 placeholder-slate-600 focus:border-[#D4AF37]/50 focus:outline-none focus:ring-1 focus:ring-[#D4AF37]/50 transition-all duration-200"
                />
                <Lock className="absolute right-3.5 top-3.5 h-4.5 w-4.5 text-slate-500" />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs font-semibold">
            <label className="flex items-center gap-2 cursor-pointer text-slate-400 hover:text-slate-300">
              <input type="checkbox" className="rounded border-white/10 bg-[#121620] text-[#D4AF37] focus:ring-[#D4AF37]" />
              <span>تذكرني</span>
            </label>
            <a href="#" className="text-[#D4AF37] hover:underline">نسيت كلمة المرور؟</a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex h-11 w-full items-center justify-center rounded-xl bg-gradient-to-tr from-[#D4AF37] to-[#AA7C11] text-sm font-bold text-[#0B0E14] shadow-md hover:opacity-90 active:scale-[0.98] transition-all duration-200 disabled:opacity-50"
          >
            {loading ? "جاري الدخول..." : "دخول"}
          </button>
        </form>

        <div className="text-center text-xs text-slate-500 font-medium">
          ليس لديك حساب؟ <a href="/register" className="text-[#D4AF37] font-semibold hover:underline">إنشاء حساب جديد كمنظم</a>
        </div>

      </div>
    </div>
  );
}
