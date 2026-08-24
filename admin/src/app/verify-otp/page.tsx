"use client";

import { useEffect, useState } from "react";
import { KeyRound, CheckCircle2, RefreshCw, Mail } from "lucide-react";
import { apiRequest } from "@/lib/api";

export default function VerifyOtpPage() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpPreview, setOtpPreview] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    const savedEmail = localStorage.getItem("pending_email") || "";
    const savedOtp = localStorage.getItem("otp_preview") || "";
    setEmail(savedEmail);
    setOtpPreview(savedOtp);
  }, []);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await apiRequest("/auth/verify-otp", {
        method: "POST",
        body: JSON.stringify({ email, otp }),
      });

      if (response.success && response.data) {
        localStorage.removeItem("pending_email");
        localStorage.removeItem("otp_preview");
        localStorage.setItem("auth_token", response.data.access_token);
        localStorage.setItem("auth_user", JSON.stringify(response.data.user));
        
        setMessage("تم تفعيل حسابك بنجاح! جاري التوجيه للوحة التحكم...");
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 1200);
      } else {
        setError(response.message || "رمز التحقق غير صحيح");
      }
    } catch (err: any) {
      setError(err.message || "فشل التحقق من الرمز");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) return;
    setResending(true);
    setError("");
    setMessage("");

    try {
      const response = await apiRequest("/auth/resend-otp", {
        method: "POST",
        body: JSON.stringify({ email }),
      });

      if (response.success && response.data) {
        setMessage("تم إرسال رمز كود جديد بنجاح إلى بريدك الإلكتروني.");
        if (response.data.otp_preview) {
          setOtpPreview(response.data.otp_preview);
          localStorage.setItem("otp_preview", response.data.otp_preview);
        }
      } else {
        setError(response.message || "فشل إعادة إرسال الرمز");
      }
    } catch (err: any) {
      setError(err.message || "حدث خطأ أثناء إعادة إرسال الرمز");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0B0E14] px-4 py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      
      {/* Decorative Glows */}
      <div className="absolute top-[-20%] left-[-10%] h-[600px] w-[600px] rounded-full bg-[#D4AF37]/5 blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-10%] h-[600px] w-[600px] rounded-full bg-emerald-500/5 blur-[120px]" />

      <div className="w-full max-w-md space-y-6 rounded-3xl border border-white/5 bg-[#121620]/45 p-8 backdrop-blur-xl gold-glow relative z-10">
        
        <div className="flex flex-col items-center justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#D4AF37] to-[#AA7C11] text-[#0B0E14] shadow-lg">
            <KeyRound className="h-7 w-7" />
          </div>
          <h2 className="mt-5 text-center text-2xl font-extrabold text-white tracking-tight">
            تأكيد البريد الإلكتروني
          </h2>
          <p className="mt-1.5 text-center text-xs text-slate-400 font-medium px-4">
            تم إرسال رمز مكون من 6 أرقام إلى بريدك الإلكتروني: <span className="text-[#D4AF37] font-bold">{email || "بريدك المسجل"}</span>
          </p>
        </div>

        {otpPreview && (
          <div className="rounded-2xl border border-[#D4AF37]/30 bg-[#D4AF37]/10 p-4 text-center">
            <p className="text-[11px] font-bold text-[#D4AF37]">رمز التحقق التجريبي المحاكي للإيميل:</p>
            <p className="text-2xl font-mono font-extrabold text-white tracking-widest mt-1">{otpPreview}</p>
          </div>
        )}

        <form onSubmit={handleVerify} className="mt-6 space-y-4">
          {error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-center text-xs font-semibold text-red-400">
              {error}
            </div>
          )}

          {message && (
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-center text-xs font-semibold text-emerald-400 flex items-center justify-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              <span>{message}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 text-center">أدخل كود التحقق (6 أرقام)</label>
            <input
              type="text"
              required
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.trim())}
              placeholder="123456"
              className="h-12 w-full text-center text-2xl tracking-[0.5em] font-mono font-bold rounded-xl border border-white/10 bg-[#0B0E14] text-white focus:border-[#D4AF37] focus:outline-none transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="flex h-11 w-full items-center justify-center rounded-xl bg-gradient-to-tr from-[#D4AF37] to-[#AA7C11] text-sm font-bold text-[#0B0E14] shadow-md hover:opacity-90 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 mt-4"
          >
            {loading ? "جاري التفعيل..." : "تأكيد الكود وتفعيل الحساب"}
          </button>
        </form>

        <div className="flex items-center justify-between text-xs pt-2">
          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            className="flex items-center gap-1.5 text-slate-400 hover:text-[#D4AF37] transition-all disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${resending ? "animate-spin" : ""}`} />
            <span>إعادة إرسال الكود</span>
          </button>

          <a href="/login" className="text-slate-500 hover:text-slate-300">العودة لتسجيل الدخول</a>
        </div>

      </div>
    </div>
  );
}
