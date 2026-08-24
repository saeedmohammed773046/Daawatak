"use client";

import React, { useState } from "react";
import { Calendar, MapPin, Sparkles, Image as ImageIcon, Settings, CheckCircle2, ChevronLeft, ChevronRight, X, Lock } from "lucide-react";
import { apiRequest } from "@/lib/api";

interface EventWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onEventCreated: () => void;
}

export default function EventWizard({ isOpen, onClose, onEventCreated }: EventWizardProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    category: "wedding",
    description: "",
    event_date: "",
    start_time: "20:00",
    end_time: "23:30",
    venue: "",
    google_maps_url: "",
    cover_image_url: "",
    primary_color: "#D4AF37",
    font_family: "Cairo",
    welcome_text: "أهلاً وسهلاً بكم في مناسبتنا الحافلة",
    access_pin: "",
  });

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = () => {
    if (step === 1 && !formData.title.trim()) {
      setError("يرجى كتابة عنوان المناسبة للبدء");
      return;
    }
    if (step === 2 && !formData.event_date) {
      setError("يرجى تحديد تاريخ المناسبة");
      return;
    }
    if (step === 3 && !formData.venue.trim()) {
      setError("يرجى كتابة اسم الموقع أو القاعة");
      return;
    }
    setError("");
    setStep(step + 1);
  };

  const handleBack = () => {
    setError("");
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      await apiRequest("/events", {
        method: "POST",
        body: JSON.stringify({
          title: formData.title,
          category: formData.category,
          description: formData.description,
          event_date: formData.event_date,
          start_time: formData.start_time,
          end_time: formData.end_time,
          venue: formData.venue,
          google_maps_url: formData.google_maps_url,
          cover_image_url: formData.cover_image_url,
          theme_config: {
            primary_color: formData.primary_color,
            font_family: formData.font_family,
            welcome_text: formData.welcome_text,
          },
        }),
      });
      onEventCreated();
      onClose();
    } catch (err: any) {
      setError(err.message || "فشل إنشاء الفعالية");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in" dir="rtl">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header Bar */}
        <div className="px-8 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">معالج إنشاء مناسبة جديدة</h2>
              <p className="text-xs text-slate-400">خطوات متكاملة لإعداد مناستك الفاخرة</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wizard Steps Indicator */}
        <div className="px-8 py-3 bg-slate-900/60 border-b border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          {[
            { num: 1, label: "المعلومات العامة" },
            { num: 2, label: "التاريخ والوقت" },
            { num: 3, label: "الموقع والقاعة" },
            { num: 4, label: "التصميم والغلاف" },
            { num: 5, label: "الإعدادات والأمان" },
            { num: 6, label: "المراجعة النهائية" },
          ].map((s) => (
            <div key={s.num} className={`flex items-center gap-2 ${step === s.num ? "text-amber-400 font-bold" : step > s.num ? "text-emerald-400" : "opacity-60"}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${step === s.num ? "bg-amber-500 text-slate-950" : step > s.num ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-slate-800 text-slate-400"}`}>
                {step > s.num ? "✓" : s.num}
              </span>
              <span className="hidden md:inline">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Form Body */}
        <div className="p-8 overflow-y-auto flex-1 space-y-6 text-sm">
          {error && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-2xl text-xs">
              {error}
            </div>
          )}

          {/* STEP 1: BASIC INFO */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-slate-300 mb-2 font-medium">اسم المناسبة / العنوان *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="مثال: حفل زفاف فهد وسارة"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 mb-2 font-medium">نوع الفعالية</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition"
                  >
                    <option value="wedding">حفل زفاف (Wedding)</option>
                    <option value="engagement">عقد قران / خطوبة</option>
                    <option value="graduation">حفل تخرج</option>
                    <option value="conference">مؤتمر / ندوة أعمال</option>
                    <option value="exhibition">معرض خاص</option>
                    <option value="general">مناسبة عامة</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-2 font-medium">الوصف والترحيب (اختياري)</label>
                <textarea
                  name="description"
                  rows={3}
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="اكتب نبذة عن الفعالية أو تفاصيل استقبال الضيوف..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition resize-none"
                />
              </div>
            </div>
          )}

          {/* STEP 2: DATE & TIME */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-slate-300 mb-2 font-medium">تاريخ المناسبة *</label>
                <input
                  type="date"
                  name="event_date"
                  value={formData.event_date}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 mb-2 font-medium">وقت البدء</label>
                  <input
                    type="time"
                    name="start_time"
                    value={formData.start_time}
                    onChange={handleChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-2 font-medium">وقت الانتهاء المتوقع</label>
                  <input
                    type="time"
                    name="end_time"
                    value={formData.end_time}
                    onChange={handleChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: LOCATION */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block text-slate-300 mb-2 font-medium">اسم الموقع أو القاعة *</label>
                <input
                  type="text"
                  name="venue"
                  value={formData.venue}
                  onChange={handleChange}
                  placeholder="مثال: قاعة الفريد للاحتفالات - الرياض"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-2 font-medium">رابط موقع Google Maps (اختياري)</label>
                <input
                  type="url"
                  name="google_maps_url"
                  value={formData.google_maps_url}
                  onChange={handleChange}
                  placeholder="https://maps.google.com/?q=..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition"
                />
              </div>
            </div>
          )}

          {/* STEP 4: COVER & THEME */}
          {step === 4 && (
            <div className="space-y-4">
              <div>
                <label className="block text-slate-300 mb-2 font-medium">رابط صورة الغلاف (Cover Image URL)</label>
                <input
                  type="url"
                  name="cover_image_url"
                  value={formData.cover_image_url}
                  onChange={handleChange}
                  placeholder="https://daawatak-assets.s3.amazonaws.com/covers/wedding.jpg"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 mb-2 font-medium">اللون الرئيسي للبطاقة</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      name="primary_color"
                      value={formData.primary_color}
                      onChange={handleChange}
                      className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer p-1"
                    />
                    <span className="text-xs text-slate-400 font-mono">{formData.primary_color}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-slate-300 mb-2 font-medium">خط البطاقة العربي</label>
                  <select
                    name="font_family"
                    value={formData.font_family}
                    onChange={handleChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition"
                  >
                    <option value="Cairo">خط القاهرة (Cairo)</option>
                    <option value="Amiri">الخط الأميري (Amiri)</option>
                    <option value="Tajawal">تجوال (Tajawal)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: SETTINGS */}
          {step === 5 && (
            <div className="space-y-4">
              <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center gap-3 text-amber-300 text-xs">
                <Lock className="w-5 h-5 flex-shrink-0" />
                <span>يتم توليد رمز PIN أمان عشوائي تلقائياً لاقتران تطبيق موظف الاستقبال بهذه المناسبة.</span>
              </div>
              <div>
                <label className="block text-slate-300 mb-2 font-medium">رسالة الترحيب للضيوف</label>
                <input
                  type="text"
                  name="welcome_text"
                  value={formData.welcome_text}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition"
                />
              </div>
            </div>
          )}

          {/* STEP 6: REVIEW */}
          {step === 6 && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" /> ملخص بيانات المناسبة
              </h3>

              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-3 text-xs">
                <div className="flex justify-between border-b border-slate-800/80 pb-2">
                  <span className="text-slate-400">العنوان:</span>
                  <span className="text-white font-bold">{formData.title}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800/80 pb-2">
                  <span className="text-slate-400">التاريخ والوقت:</span>
                  <span className="text-amber-400">{formData.event_date} | من {formData.start_time} إلى {formData.end_time}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800/80 pb-2">
                  <span className="text-slate-400">الموقع والقاعة:</span>
                  <span className="text-white">{formData.venue}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800/80 pb-2">
                  <span className="text-slate-400">النوع:</span>
                  <span className="text-white capitalize">{formData.category}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Bar */}
        <div className="px-8 py-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          {step > 1 ? (
            <button
              onClick={handleBack}
              disabled={loading}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl text-xs flex items-center gap-2 transition"
            >
              <ChevronRight className="w-4 h-4" /> السابق
            </button>
          ) : <div />}

          {step < 6 ? (
            <button
              onClick={handleNext}
              className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 transition"
            >
              التالي <ChevronLeft className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-8 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 transition shadow-lg shadow-emerald-500/20"
            >
              {loading ? "جاري الإنشاء..." : "إنشاء وتأكيد الفعالية ✓"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
