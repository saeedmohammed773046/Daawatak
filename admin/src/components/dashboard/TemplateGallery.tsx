"use client";

import React, { useState } from "react";
import { Sparkles, Check, Eye, Layout, Crown } from "lucide-react";

interface Template {
  id: string;
  name: string;
  category: string;
  image: string;
  isPremium?: boolean;
}

const TEMPLATES: Template[] = [
  { id: "1", name: "الذهب الملكي الفاخر", category: "wedding", image: "https://daawatak-assets.s3.amazonaws.com/templates/gold_luxury.jpg", isPremium: true },
  { id: "2", name: "الأناقة البحرية والفضة", category: "wedding", image: "https://daawatak-assets.s3.amazonaws.com/templates/navy_blue.jpg" },
  { id: "3", name: "الزمرد والذهب الكلاسيكي", category: "engagement", image: "https://daawatak-assets.s3.amazonaws.com/templates/emerald_gold.jpg" },
  { id: "4", name: "مؤتمرات الأعمال الحديثة", category: "conference", image: "https://daawatak-assets.s3.amazonaws.com/templates/business_modern.jpg" },
  { id: "5", name: "فخامة الخريجين الملكية", category: "graduation", image: "https://daawatak-assets.s3.amazonaws.com/templates/graduation_gold.jpg" },
];

export default function TemplateGallery({ onSelectTemplate }: { onSelectTemplate?: (t: Template) => void }) {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [activeTemplate, setActiveTemplate] = useState<string>("1");

  const filtered = selectedCategory === "all" ? TEMPLATES : TEMPLATES.filter((t) => t.category === selectedCategory);

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header & Filter categories */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Layout className="w-5 h-5 text-amber-400" /> معرض القوالب الفاخرة المعتمدة
          </h2>
          <p className="text-xs text-slate-400">اختر من بين تشكيلة مصممة خصيصاً بمقاييس عالمية لمناسبتك</p>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
          {[
            { id: "all", label: "جميع القوالب" },
            { id: "wedding", label: "أعراس وزفاف" },
            { id: "engagement", label: "عقد قران" },
            { id: "graduation", label: "تخرج" },
            { id: "conference", label: "مؤتمرات" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs whitespace-nowrap transition ${selectedCategory === cat.id ? "bg-amber-500 text-slate-950 font-bold" : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"}`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Templates */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {filtered.map((t) => (
          <div
            key={t.id}
            onClick={() => {
              setActiveTemplate(t.id);
              if (onSelectTemplate) onSelectTemplate(t);
            }}
            className={`group relative rounded-3xl bg-slate-900 border overflow-hidden cursor-pointer transition-all duration-300 ${activeTemplate === t.id ? "border-amber-400 ring-2 ring-amber-400/20 shadow-xl shadow-amber-500/10" : "border-slate-800 hover:border-slate-700"}`}
          >
            {/* Image Card Container */}
            <div className="h-56 bg-slate-950 relative flex items-center justify-center p-6 bg-gradient-to-br from-slate-900 via-slate-950 to-black">
              {t.isPremium && (
                <span className="absolute top-3 right-3 bg-amber-500 text-slate-950 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-lg">
                  <Crown className="w-3 h-3" /> مميز (Premium)
                </span>
              )}

              <div className="w-full h-full border border-amber-500/20 rounded-2xl p-4 flex flex-col justify-between text-center relative overflow-hidden group-hover:scale-105 transition-transform duration-300">
                <span className="text-amber-400 text-xs font-bold font-serif">دعوة خاصة</span>
                <span className="text-white text-sm font-bold">{t.name}</span>
                <span className="text-slate-500 text-[10px]">رمز QR مشفر في الأسفل</span>
              </div>
            </div>

            {/* Template Info & Action */}
            <div className="p-4 border-t border-slate-800/80 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-white">{t.name}</h4>
                <span className="text-[10px] text-slate-500 capitalize">{t.category}</span>
              </div>

              <div className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1 ${activeTemplate === t.id ? "bg-amber-500 text-slate-950" : "bg-slate-800 text-slate-400 group-hover:bg-slate-700 group-hover:text-white"}`}>
                {activeTemplate === t.id ? <Check className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
