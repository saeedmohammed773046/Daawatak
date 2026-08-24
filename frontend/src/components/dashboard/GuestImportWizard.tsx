"use client";

import React, { useState } from "react";
import { Upload, FileText, CheckCircle2, AlertTriangle, X, ChevronLeft, ChevronRight, Users, Sparkles } from "lucide-react";
import { apiRequest } from "@/lib/api";

interface GuestImportWizardProps {
  isOpen: boolean;
  eventId: string;
  onClose: () => void;
  onImportComplete: () => void;
}

export default function GuestImportWizard({ isOpen, eventId, onClose, onImportComplete }: GuestImportWizardProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [parsedGuests, setParsedGuests] = useState<any[]>([]);
  const [importedCount, setImportedCount] = useState(0);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");
    setLoading(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split(/\r\n|\n/);
        const guests: any[] = [];

        // Parse lines (skipping header if contains name/الاسم)
        lines.forEach((line, index) => {
          if (!line.trim()) return;
          const cols = line.split(",").map((c) => c.trim().replace(/^["']|["']$/g, ""));
          
          // Skip header row
          if (index === 0 && (cols[0].toLowerCase().includes("name") || cols[0].includes("اسم"))) {
            return;
          }

          if (cols[0]) {
            guests.push({
              name: cols[0],
              phone: cols[1] || "",
              email: cols[2] || "",
              companions_count: parseInt(cols[3] || "0", 10) || 0,
              notes: cols[4] || "",
              status: "valid",
            });
          }
        });

        if (guests.length === 0) {
          setError("لم يتم العثور على أية بيانات صالحة في الملف");
        } else {
          setParsedGuests(guests);
          setStep(2);
        }
      } catch (err) {
        setError("تعثر تحليل الملف. يرجى التثبت من صيغة الملف CSV");
      } finally {
        setLoading(false);
      }
    };

    reader.readAsText(file, "UTF-8");
  };

  const handleConfirmImport = async () => {
    if (parsedGuests.length === 0) return;

    setLoading(true);
    setError("");

    try {
      const payload = {
        guests: parsedGuests.map((g) => ({
          name: g.name,
          phone: g.phone || null,
          email: g.email || null,
          companions_count: g.companions_count || 0,
          notes: g.notes || null,
        })),
      };

      const res = await apiRequest(`/events/${eventId}/guests/import`, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setImportedCount(res.data ? res.data.length : parsedGuests.length);
      setStep(4);
      onImportComplete();
    } catch (err: any) {
      setError(err.message || "فشل استيراد قائمة المدعوين");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in" dir="rtl">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-8 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">معالج استيراد المدعوين الذكي (CSV)</h2>
              <p className="text-xs text-slate-400">استيراد جماعي للقوائم مع التشفير والتوليد التلقائي للبطاقات</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wizard Steps */}
        <div className="px-8 py-3 bg-slate-900/60 border-b border-slate-800/80 flex items-center justify-around text-xs text-slate-400">
          {[
            { num: 1, label: "رفع الملف" },
            { num: 2, label: "المعاينة والتحليل" },
            { num: 3, label: "التأكيد والاستيراد" },
            { num: 4, label: "النتيجة النهائية" },
          ].map((s) => (
            <div key={s.num} className={`flex items-center gap-2 ${step === s.num ? "text-amber-400 font-bold" : step > s.num ? "text-emerald-400" : "opacity-60"}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${step === s.num ? "bg-amber-500 text-slate-950" : step > s.num ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-slate-800 text-slate-400"}`}>
                {step > s.num ? "✓" : s.num}
              </span>
              <span>{s.label}</span>
            </div>
          ))}
        </div>

        {/* Body */}
        <div className="p-8 overflow-y-auto flex-1 space-y-6 text-sm">
          {error && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-2xl text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: UPLOAD */}
          {step === 1 && (
            <div className="space-y-6 text-center">
              <div className="border-2 border-dashed border-slate-700 hover:border-amber-500/50 transition rounded-3xl p-12 bg-slate-950/40 flex flex-col items-center justify-center">
                <Upload className="w-12 h-12 text-amber-400 mb-4 animate-bounce" />
                <h3 className="text-base font-bold text-white mb-1">اختر ملف بيانات المدعوين (CSV / TXT)</h3>
                <p className="text-xs text-slate-400 mb-6">ترتيب الأعمدة المطلوبة: (الاسم، رقم الهاتف، البريد، عدد المرافقين، الملاحظات)</p>
                
                <label className="px-8 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-2xl text-xs cursor-pointer shadow-lg shadow-amber-500/20 transition">
                  {loading ? "جاري قراءة الملف..." : "تصفح ورفع الملف"}
                  <input type="file" accept=".csv,.txt" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-right text-xs text-slate-400 space-y-1">
                <p className="font-bold text-white">نموذج الملف المقبول:</p>
                <p className="font-mono text-amber-300/80 dir-ltr text-left">الاسم,الهاتف,البريد,المرافقين,الملاحظات</p>
                <p className="font-mono text-slate-400 dir-ltr text-left">فهد العتيبي,0501234567,fahad@example.com,2,قريب العريس</p>
              </div>
            </div>
          )}

          {/* STEP 2: PREVIEW */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-400" /> تم اكتشاف {parsedGuests.length} مدعو في الملف
                </h3>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden max-h-60 overflow-y-auto text-xs">
                <table className="w-full text-right border-collapse">
                  <thead className="bg-slate-900 text-slate-400 border-b border-slate-800 sticky top-0">
                    <tr>
                      <th className="p-3">#</th>
                      <th className="p-3">الاسم</th>
                      <th className="p-3">الهاتف</th>
                      <th className="p-3">المرافقين</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {parsedGuests.slice(0, 50).map((g, idx) => (
                      <tr key={idx} className="hover:bg-slate-900/40">
                        <td className="p-3 text-slate-500">{idx + 1}</td>
                        <td className="p-3 font-medium text-white">{g.name}</td>
                        <td className="p-3 font-mono">{g.phone || "-"}</td>
                        <td className="p-3">{g.companions_count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* STEP 3: CONFIRM */}
          {step === 3 && (
            <div className="space-y-6 text-center py-6">
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 rounded-2xl max-w-md mx-auto text-xs space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <p className="font-bold text-base">جاهز لبدء عملية الاستيراد والتشفير</p>
                <p>سيتم إضافة <strong>{parsedGuests.length}</strong> ضيف وتوليد رموز QR مشفرة بتقنية 256-bit entropy تلقائياً في قاعدة البيانات.</p>
              </div>
            </div>
          )}

          {/* STEP 4: RESULT */}
          {step === 4 && (
            <div className="space-y-6 text-center py-8">
              <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30 animate-pulse">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">تمت عملية الاستيراد بنجاح!</h3>
                <p className="text-xs text-slate-400">تم إضافة {importedCount} ضيف وتأمين بطاقات دعوتهم بنجاح.</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          {step > 1 && step < 4 ? (
            <button
              onClick={() => setStep(step - 1)}
              disabled={loading}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl text-xs flex items-center gap-2 transition"
            >
              <ChevronRight className="w-4 h-4" /> السابق
            </button>
          ) : <div />}

          {step === 2 && (
            <button
              onClick={() => setStep(3)}
              className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 transition"
            >
              متابعة التأكيد <ChevronLeft className="w-4 h-4" />
            </button>
          )}

          {step === 3 && (
            <button
              onClick={handleConfirmImport}
              disabled={loading}
              className="px-8 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 transition shadow-lg shadow-emerald-500/20"
            >
              {loading ? "جاري الاستيراد والتشفير..." : "إكمال الاستيراد الآن ✓"}
            </button>
          )}

          {step === 4 && (
            <button
              onClick={onClose}
              className="px-8 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition"
            >
              إغلاق العرض
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
