"use client";

import React, { useState } from "react";
import { Move, Type, QrCode as QrIcon, Image as ImageIcon, Save, Undo, Redo, ZoomIn, ZoomOut, Monitor, Smartphone, Layers, Check } from "lucide-react";

interface CanvasElement {
  id: string;
  type: "name" | "qr" | "title" | "date" | "venue";
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
  fontFamily: string;
}

export default function InvitationDesigner() {
  const [activeTab, setActiveTab] = useState<"desktop" | "mobile">("desktop");
  const [bgImage, setBgImage] = useState("https://daawatak-assets.s3.amazonaws.com/templates/gold_luxury.jpg");
  const [elements, setElements] = useState<CanvasElement[]>([
    { id: "1", type: "name", text: "المكرم: [اسم الضيف]", x: 200, y: 150, fontSize: 24, color: "#D4AF37", fontFamily: "Cairo" },
    { id: "2", type: "title", text: "حفل زفاف فهد و سارة", x: 200, y: 80, fontSize: 28, color: "#FFFFFF", fontFamily: "Cairo" },
    { id: "3", type: "qr", text: "QR_CODE_PLACEHOLDER", x: 250, y: 240, fontSize: 100, color: "#000000", fontFamily: "sans-serif" },
  ]);
  const [selectedId, setSelectedId] = useState<string | null>("1");
  const [saved, setSaved] = useState(false);

  const selectedElement = elements.find((e) => e.id === selectedId);

  const updateSelected = (key: keyof CanvasElement, value: any) => {
    if (!selectedId) return;
    setElements(elements.map((el) => (el.id === selectedId ? { ...el, [key]: value } : el)));
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row h-[750px]" dir="rtl">
      {/* Control Panel Sidebar */}
      <div className="w-full md:w-80 bg-slate-950 border-l border-slate-800 p-6 flex flex-col justify-between space-y-6 overflow-y-auto">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Type className="w-4 h-4 text-amber-400" /> مخصص التصميم والتخطيط
            </h3>
            <span className="text-[10px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/20 font-bold">تفاعلي</span>
          </div>

          {/* Background selector */}
          <div className="space-y-2">
            <label className="text-xs text-slate-400 font-medium block">خلفية البطاقة</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { name: "ذهبي ملكي", url: "https://daawatak-assets.s3.amazonaws.com/templates/gold_luxury.jpg", color: "from-amber-700 to-slate-900" },
                { name: "أزرق نيلي", url: "https://daawatak-assets.s3.amazonaws.com/templates/navy_blue.jpg", color: "from-blue-900 to-slate-950" },
                { name: "أسود فخم", url: "https://daawatak-assets.s3.amazonaws.com/templates/black_gold.jpg", color: "from-slate-900 to-black" },
              ].map((bg, i) => (
                <button
                  key={i}
                  onClick={() => setBgImage(bg.url)}
                  className={`h-14 rounded-xl bg-gradient-to-br ${bg.color} border flex items-center justify-center text-[10px] font-bold text-white p-1 text-center transition ${bgImage === bg.url ? "border-amber-400 ring-2 ring-amber-400/20" : "border-slate-800 hover:border-slate-700"}`}
                >
                  {bg.name}
                </button>
              ))}
            </div>
          </div>

          {/* Canvas Elements list */}
          <div className="space-y-2">
            <label className="text-xs text-slate-400 font-medium block">عناصر التصميم</label>
            <div className="space-y-1">
              {elements.map((el) => (
                <button
                  key={el.id}
                  onClick={() => setSelectedId(el.id)}
                  className={`w-full text-right px-3 py-2 rounded-xl text-xs flex items-center justify-between transition ${selectedId === el.id ? "bg-amber-500/10 text-amber-300 border border-amber-500/30" : "bg-slate-900 text-slate-400 hover:bg-slate-850"}`}
                >
                  <span className="truncate">{el.type === "qr" ? "رمز الـ QR المشفر" : el.text}</span>
                  <Move className="w-3 h-3 opacity-50" />
                </button>
              ))}
            </div>
          </div>

          {/* Selected Element Adjustments */}
          {selectedElement && (
            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-4 text-xs">
              <span className="font-bold text-amber-400 block border-b border-slate-800 pb-2">تعديل العنصر المحدد</span>
              
              {selectedElement.type !== "qr" && (
                <>
                  <div>
                    <label className="text-slate-400 block mb-1">حجم الخط ({selectedElement.fontSize}px)</label>
                    <input
                      type="range"
                      min={12}
                      max={48}
                      value={selectedElement.fontSize}
                      onChange={(e) => updateSelected("fontSize", parseInt(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">لون النص</label>
                    <input
                      type="color"
                      value={selectedElement.color}
                      onChange={(e) => updateSelected("color", e.target.value)}
                      className="w-full h-8 bg-slate-950 border border-slate-800 rounded-lg p-0.5 cursor-pointer"
                    />
                  </div>
                </>
              )}

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1">الموقع أفقياً (X)</label>
                  <input
                    type="number"
                    value={selectedElement.x}
                    onChange={(e) => updateSelected("x", parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-white text-center"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">الموقع رأسيًا (Y)</label>
                  <input
                    type="number"
                    value={selectedElement.y}
                    onChange={(e) => updateSelected("y", parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-white text-center"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={handleSave}
          className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-2xl text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-amber-500/20"
        >
          {saved ? <Check className="w-4 h-4 text-emerald-950" /> : <Save className="w-4 h-4" />}
          {saved ? "تم حفظ أبعاد القالب!" : "حفظ إعدادات القالب"}
        </button>
      </div>

      {/* Main Interactive Canvas Area */}
      <div className="flex-1 bg-slate-950 p-6 flex flex-col justify-between relative overflow-hidden">
        {/* Top View Mode Bar */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("desktop")}
              className={`px-3 py-1.5 rounded-xl text-xs flex items-center gap-2 transition ${activeTab === "desktop" ? "bg-amber-500 text-slate-950 font-bold" : "bg-slate-900 text-slate-400 hover:text-white"}`}
            >
              <Monitor className="w-3.5 h-3.5" /> معاينة سطح المكتب
            </button>
            <button
              onClick={() => setActiveTab("mobile")}
              className={`px-3 py-1.5 rounded-xl text-xs flex items-center gap-2 transition ${activeTab === "mobile" ? "bg-amber-500 text-slate-950 font-bold" : "bg-slate-900 text-slate-400 hover:text-white"}`}
            >
              <Smartphone className="w-3.5 h-3.5" /> معاينة الهاتف
            </button>
          </div>
        </div>

        {/* The Card Workspace Canvas */}
        <div className="flex-1 flex items-center justify-center p-4">
          <div
            className={`relative rounded-3xl shadow-2xl border border-slate-800/80 overflow-hidden transition-all duration-300 ${activeTab === "mobile" ? "w-[320px] h-[520px]" : "w-[600px] h-[400px]"} bg-gradient-to-br from-slate-900 via-slate-950 to-black`}
            style={{
              backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.6), rgba(15, 23, 42, 0.8)), url(${bgImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            {/* Watermark Frame */}
            <div className="absolute inset-4 border border-amber-500/20 rounded-2xl pointer-events-none" />

            {/* Elements Layer */}
            {elements.map((el) => (
              <div
                key={el.id}
                onClick={() => setSelectedId(el.id)}
                style={{
                  position: "absolute",
                  left: `${el.x}px`,
                  top: `${el.y}px`,
                  color: el.color,
                  fontSize: `${el.fontSize}px`,
                  fontFamily: el.fontFamily,
                }}
                className={`cursor-pointer transition-all ${selectedId === el.id ? "ring-2 ring-amber-400 ring-offset-2 ring-offset-slate-950 rounded px-2 py-1" : ""}`}
              >
                {el.type === "qr" ? (
                  <div className="w-24 h-24 bg-white p-2 rounded-xl flex items-center justify-center shadow-lg border border-slate-200">
                    <QrIcon className="w-full h-full text-slate-950" />
                  </div>
                ) : (
                  <span>{el.text}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="text-center text-[11px] text-slate-500">
          * انقر على أي عنصر على البطاقة لتحديده وضبط موقعه وألوانه بدقة.
        </div>
      </div>
    </div>
  );
}
