"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Search, Plus, Trash2, Upload, Download, Eye, Send, FileCode,
  CheckCircle2, XCircle, Clock, Users, ChevronUp, ChevronDown, AlertCircle, RefreshCw, FileText
} from "lucide-react";
import { apiRequest } from "@/lib/api";

interface Guest {
  id: string;
  name: string;
  phone: string;
  email: string;
  companions_count: number;
  notes: string;
  invitation_status: "pending" | "generated" | "sent" | "failed";
  attendance_status: "absent" | "present";
}

interface EventItem {
  id: string;
  title: string;
}

const INV_STATUS: Record<string, { label: string; cls: string }> = {
  pending:   { label: "معلقة",    cls: "text-slate-400  bg-slate-400/10  border-slate-400/20"  },
  generated: { label: "جاهزة",    cls: "text-blue-400   bg-blue-400/10   border-blue-400/20"   },
  sent:      { label: "مُرسلة",   cls: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" },
  failed:    { label: "فشلت",     cls: "text-red-400    bg-red-400/10    border-red-400/20"    },
};

const ATT_STATUS: Record<string, { label: string; icon: typeof CheckCircle2; cls: string }> = {
  present: { label: "حاضر",   icon: CheckCircle2, cls: "text-emerald-400" },
  absent:  { label: "غائب",   icon: XCircle,      cls: "text-slate-400"   },
};

interface AddGuestModalProps {
  onClose: () => void;
  onSaved: () => void;
  eventId: string;
  initial?: Guest | null;
}

function AddGuestModal({ onClose, onSaved, eventId, initial }: AddGuestModalProps) {
  const [form, setForm] = useState({
    name:             initial?.name ?? "",
    phone:            initial?.phone ?? "",
    email:            initial?.email ?? "",
    companions_count: initial?.companions_count ?? 0,
    notes:            initial?.notes ?? "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const endpoint = initial?.id ? `/guests/${initial.id}` : `/events/${eventId}/guests`;
      const method = initial?.id ? "PUT" : "POST";
      const response = await apiRequest(endpoint, {
        method,
        body: JSON.stringify(form),
      });

      if (response.success) {
        onSaved();
      }
    } catch (err: any) {
      setError(err.message || "فشل حفظ بيانات المدعو.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-2xl border border-white/10 bg-[#121620] p-8 shadow-2xl">
        <h2 className="text-xl font-bold text-white mb-6">
          {initial ? "تعديل بيانات المدعو" : "إضافة مدعو جديد يدوياً"}
        </h2>
        {error && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 mb-4 text-center text-xs text-red-400">
            {error}
          </div>
        )}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">الاسم الكامل *</label>
            <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="h-9 w-full rounded-xl border border-white/5 bg-[#0B0E14] px-3 text-sm text-slate-200 focus:outline-none focus:border-[#D4AF37]/50 transition-all"
              placeholder="الاسم الثلاثي" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">رقم الجوال (لإرسال البطاقة)</label>
              <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                className="h-9 w-full rounded-xl border border-white/5 bg-[#0B0E14] px-3 text-sm text-slate-200 focus:outline-none focus:border-[#D4AF37]/50 transition-all"
                placeholder="+966500000000" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">البريد الإلكتروني</label>
              <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="h-9 w-full rounded-xl border border-white/5 bg-[#0B0E14] px-3 text-sm text-slate-200 focus:outline-none focus:border-[#D4AF37]/50 transition-all"
                placeholder="guest@example.com" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">عدد المرافقين المسموح لهم</label>
            <input type="number" min={0} value={form.companions_count}
              onChange={e => setForm(f => ({ ...f, companions_count: parseInt(e.target.value) || 0 }))}
              className="h-9 w-full rounded-xl border border-white/5 bg-[#0B0E14] px-3 text-sm text-slate-200 focus:outline-none focus:border-[#D4AF37]/50 transition-all" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">ملاحظات</label>
            <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              className="w-full rounded-xl border border-white/5 bg-[#0B0E14] p-3 text-sm text-slate-200 focus:outline-none focus:border-[#D4AF37]/50 transition-all h-20 resize-none"
              placeholder="مثال: قريب العريس، كبار الشخصيات..." />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button type="submit" disabled={loading}
            className="flex-1 rounded-xl bg-gradient-to-tr from-[#D4AF37] to-[#AA7C11] py-2 text-sm font-bold text-[#0B0E14] hover:opacity-90 transition-all disabled:opacity-50">
            {loading ? "جاري الحفظ..." : "حفظ المدعو"}
          </button>
          <button type="button" onClick={onClose}
            className="flex-1 rounded-xl border border-white/10 bg-white/[0.02] py-2 text-sm font-semibold text-slate-300 hover:bg-white/[0.05] transition-all">
            إلغاء
          </button>
        </div>
      </form>
    </div>
  );
}

function PreviewCardModal({ onClose, guestId }: { onClose: () => void; guestId: string }) {
  const [html, setHtml] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPreview();
  }, [guestId]);

  const fetchPreview = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await apiRequest(`/invitations/${guestId}/preview`);
      setHtml(response);
    } catch (err: any) {
      setError(err.message || "فشل تحميل معاينة البطاقة.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 md:p-10">
      <div className="w-full max-w-5xl h-[85vh] rounded-3xl border border-white/10 bg-[#121620] flex flex-col overflow-hidden relative shadow-2xl">
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
          <h3 className="font-bold text-white text-sm">معاينة بطاقة الدعوة الفاخرة للضيف</h3>
          <button onClick={onClose} className="px-4 py-1.5 text-xs rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10">إغلاق</button>
        </div>
        <div className="flex-1 bg-[#0B0E14] relative">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-xs">جاري رسم البطاقة...</div>
          ) : error ? (
            <div className="absolute inset-0 flex items-center justify-center text-red-400 text-xs">{error}</div>
          ) : (
            <iframe srcDoc={html} className="w-full h-full border-0" title="Invitation Preview" />
          )}
        </div>
      </div>
    </div>
  );
}

function GuestsContent() {
  const searchParams = useSearchParams();
  const initialEventId = searchParams.get("event") || "";

  const [events, setEvents] = useState<EventItem[]>([]);
  const [activeEventId, setActiveEventId] = useState(initialEventId);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editTarget, setEditTarget] = useState<Guest | null>(null);
  const [previewTargetId, setPreviewTargetId] = useState<string | null>(null);
  const [generatingId, setGeneratingId] = useState<string | null>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (activeEventId) {
      fetchGuests(activeEventId);
    }
  }, [activeEventId]);

  const fetchEvents = async () => {
    try {
      const response = await apiRequest("/events");
      if (response.success && response.data.length > 0) {
        setEvents(response.data);
        if (!activeEventId) {
          setActiveEventId(response.data[0].id);
        }
      } else {
        setError("يرجى إنشاء فعالية أولاً لتتمكن من إدارة المدعوين.");
      }
    } catch (err: any) {
      setError(err.message || "فشل تحميل الفعاليات.");
    }
  };

  const fetchGuests = async (eventId: string) => {
    setLoading(true);
    setError("");
    try {
      const response = await apiRequest(`/events/${eventId}/guests`);
      if (response.success) {
        setGuests(response.data);
      }
    } catch (err: any) {
      setError(err.message || "فشل تحميل قائمة المدعوين.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من رغبتك في حذف هذا المدعو؟")) return;
    try {
      const response = await apiRequest(`/guests/${id}`, { method: "DELETE" });
      if (response.success) {
        fetchGuests(activeEventId);
      }
    } catch (err: any) {
      alert(err.message || "فشل حذف المدعو");
    }
  };

  const handleSendWhatsApp = async (guest: Guest) => {
    if (!guest.phone) {
      alert("يرجى إضافة رقم الجوال للمدعو لإرسال الدعوة عبر WhatsApp.");
      return;
    }

    // Clean phone number format for WhatsApp link
    let cleanPhone = guest.phone.replace(/[^0-9]/g, "");
    if (cleanPhone.startsWith("0")) {
      cleanPhone = "966" + cleanPhone.substring(1);
    }

    const eventObj = events.find(e => e.id === activeEventId);
    const eventTitle = eventObj ? eventObj.title : "الفعالية";
    const previewUrl = `http://localhost:8000/api/v1/invitations/${guest.id}/preview`;
    
    const message = `مرحباً ${guest.name}، نتشرف بدعوتكم لحضور ${eventTitle}.\nيمكنك معاينة بطاقة الدعوة الخاصة بك عبر الرابط المباشر التالي:\n${previewUrl}`;
    
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");

    // Update guest invitation status to 'sent'
    try {
      await apiRequest(`/guests/${guest.id}`, {
        method: "PUT",
        body: JSON.stringify({ invitation_status: "sent" })
      });
      fetchGuests(activeEventId);
    } catch (_) {}
  };

  const handleGenerateCard = async (guestId: string) => {
    setGeneratingId(guestId);
    try {
      await apiRequest(`/invitations/${guestId}/generate`, {
        method: "POST"
      });

      const token = localStorage.getItem("auth_token") || "";
      const downloadUrl = `http://localhost:8000/api/v1/invitations/${guestId}/download?format=png&auth_token=${token}`;
      window.open(downloadUrl, "_blank");
      fetchGuests(activeEventId);
    } catch (err: any) {
      alert("فشل توليد البطاقة: " + (err.message || "حدث خطأ ما"));
    } finally {
      setGeneratingId(null);
    }
  };

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeEventId) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const text = evt.target?.result as string;
      if (!text) return;

      const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
      const parsedGuests: any[] = [];

      // Check if CSV or TXT file format
      const startIdx = lines[0].includes("name") || lines[0].includes("الاسم") ? 1 : 0;

      for (let i = startIdx; i < lines.length; i++) {
        // Supports CSV (comma separated) or TXT (comma/tab separated)
        const cols = lines[i].split(/,|\t/).map(c => c.trim().replace(/^["']|["']$/g, ""));
        if (!cols[0]) continue;
        parsedGuests.push({
          name: cols[0],
          phone: cols[1] || "",
          email: cols[2] || "",
          companions_count: parseInt(cols[3]) || 0,
          notes: cols[4] || ""
        });
      }

      if (parsedGuests.length === 0) {
        alert("لم يتم العثور على أي أسماء مدعوين صالحة في الملف المرفق.");
        return;
      }

      setLoading(true);
      try {
        const response = await apiRequest(`/events/${activeEventId}/guests/import`, {
          method: "POST",
          body: JSON.stringify({ guests: parsedGuests })
        });
        if (response.success) {
          alert(`تم استيراد ${response.data.length} مدعو بنجاح!`);
          fetchGuests(activeEventId);
        }
      } catch (err: any) {
        alert("فشل استيراد القائمة: " + (err.message || "صيغة غير مدعومة"));
      } finally {
        setLoading(false);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleBulkGenerate = async () => {
    if (!activeEventId || guests.length === 0) return;
    if (!confirm(`هل ترغب في توليد بطاقات الدعوة لجميع المدعوين الـ ${guests.length} في الخلفية؟`)) return;
    setLoading(true);
    try {
      const response = await apiRequest(`/invitations/bulk/${activeEventId}`, {
        method: "POST"
      });
      if (response.success) {
        alert(response.message || "تم جدولة إنشاء الدعوات بنجاح.");
        fetchGuests(activeEventId);
      }
    } catch (err: any) {
      alert("حدث خطأ: " + (err.message || "فشل جدولة العملية"));
      setLoading(false);
    }
  };

  const filteredGuests = guests.filter(g =>
    g.name.toLowerCase().includes(search.toLowerCase()) ||
    g.phone.includes(search)
  );

  const attendedCount = guests.filter(g => g.attendance_status === "present").length;
  const progressPercent = guests.length ? Math.round((attendedCount / guests.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">إدارة المدعوين والدعوات</h1>
          <p className="text-sm text-slate-400 mt-1">عرض القوائم، إضافة المدعوين بعدة طرق، وتصدير أو إرسال الدعوات مباشرة عبر WhatsApp.</p>
        </div>
        
        {activeEventId && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => fetchGuests(activeEventId)}
              className="p-2.5 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] text-slate-400 hover:text-slate-200 transition-all"
              title="تحديث البيانات"
            >
              <RefreshCw className="h-4.5 w-4.5" />
            </button>
            <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] px-4 py-2.5 text-xs font-bold text-slate-300 cursor-pointer transition-all">
              <Upload className="h-4 w-4" />
              رفع ملف (Excel / CSV / TXT)
              <input type="file" accept=".csv,.txt,.xlsx" onChange={handleFileImport} className="hidden" />
            </label>
            <button
              onClick={handleBulkGenerate}
              className="flex items-center gap-2 rounded-xl border border-[#D4AF37]/30 bg-[#D4AF37]/5 px-4 py-2.5 text-xs font-bold text-[#D4AF37] hover:bg-[#D4AF37]/15 transition-all"
            >
              <FileText className="h-4 w-4" />
              توليد الكل
            </button>
            <button
              onClick={() => { setEditTarget(null); setShowAddModal(true); }}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-tr from-[#D4AF37] to-[#AA7C11] px-5 py-2.5 text-sm font-bold text-[#0B0E14] shadow-md hover:opacity-90 transition-all"
            >
              <Plus className="h-4 w-4" />
              إضافة يدوية
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm font-semibold text-red-400 flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      )}

      {/* Select Event Row */}
      {events.length > 0 && (
        <div className="rounded-2xl border border-white/5 bg-[#121620]/60 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <span className="text-xs font-bold text-slate-400 flex-shrink-0">الفعالية المحددة:</span>
            <select
              value={activeEventId}
              onChange={e => setActiveEventId(e.target.value)}
              className="h-10 rounded-xl border border-white/5 bg-[#0B0E14] px-4 text-sm font-bold text-[#D4AF37] focus:border-[#D4AF37]/50 focus:outline-none w-full sm:w-80"
            >
              {events.map(ev => (
                <option key={ev.id} value={ev.id}>{ev.title}</option>
              ))}
            </select>
          </div>

          {guests.length > 0 && (
            <div className="flex items-center gap-4 w-full sm:w-auto text-xs bg-white/[0.01] border border-white/5 rounded-xl px-4 py-2">
              <span className="text-slate-400">حالة حضور الفعالية:</span>
              <div className="flex items-center gap-2 font-bold text-white">
                <span>{attendedCount} حاضر</span>
                <span className="text-slate-600">/</span>
                <span>{guests.length} مدعو</span>
                <span className="text-[#D4AF37] mr-1">({progressPercent}%)</span>
              </div>
            </div>
          )}
        </div>
      )}

      {activeEventId && !loading && guests.length > 0 && (
        <>
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute right-3.5 top-3 h-4 w-4 text-slate-500" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="ابحث بالاسم أو رقم الجوال..."
              className="h-10 w-full rounded-2xl border border-white/5 bg-[#121620]/60 pr-11 pl-4 text-xs text-slate-200 placeholder-slate-500 focus:border-[#D4AF37]/50 focus:outline-none focus:ring-1 focus:ring-[#D4AF37]/50 transition-all"
            />
          </div>

          {/* Guests Table */}
          <div className="overflow-x-auto rounded-2xl border border-white/5 bg-[#121620]/60 backdrop-blur-md">
            <table className="w-full text-right border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.01] text-slate-400 font-semibold">
                  <th className="p-4">الاسم الكامل</th>
                  <th className="p-4">رقم الجوال</th>
                  <th className="p-4">البريد الإلكتروني</th>
                  <th className="p-4 text-center">المرافقين</th>
                  <th className="p-4 text-center">حالة الدعوة</th>
                  <th className="p-4 text-center">حالة الحضور</th>
                  <th className="p-4 text-left">إجراءات والدعوات</th>
                </tr>
              </thead>
              <tbody>
                {filteredGuests.map(g => {
                  const inv = INV_STATUS[g.invitation_status] || INV_STATUS.pending;
                  const att = ATT_STATUS[g.attendance_status] || ATT_STATUS.absent;
                  const Icon = att.icon;
                  return (
                    <tr key={g.id} className="border-b border-white/5 hover:bg-white/[0.01] transition-all">
                      <td className="p-4 font-bold text-white">{g.name}</td>
                      <td className="p-4 text-slate-300 font-mono">{g.phone || "—"}</td>
                      <td className="p-4 text-slate-400 font-mono">{g.email || "—"}</td>
                      <td className="p-4 text-center text-slate-300 font-bold">{g.companions_count}</td>
                      <td className="p-4 text-center">
                        <span className={`inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${inv.cls}`}>
                          {inv.label}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1.5 font-semibold">
                          <Icon className={`h-4 w-4 ${att.cls}`} />
                          <span className={att.cls}>{att.label}</span>
                        </div>
                      </td>
                      <td className="p-4 text-left">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleSendWhatsApp(g)}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold hover:bg-emerald-500/20 transition-all"
                            title="إرسال بطاقة الدعوة مباشرة عبر WhatsApp"
                          >
                            <Send className="h-3.5 w-3.5" />
                            <span>WhatsApp</span>
                          </button>
                          <button
                            onClick={() => setPreviewTargetId(g.id)}
                            className="p-2 rounded-xl border border-white/5 bg-white/[0.02] text-slate-400 hover:bg-white/[0.06] hover:text-slate-200 transition-all"
                            title="معاينة بطاقة الدعوة"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleGenerateCard(g.id)}
                            disabled={generatingId === g.id}
                            className="px-2.5 py-1.5 rounded-xl border border-[#D4AF37]/30 bg-[#D4AF37]/5 text-[10px] font-bold text-[#D4AF37] hover:bg-[#D4AF37]/10 disabled:opacity-50 transition-all"
                          >
                            {generatingId === g.id ? "جاري التوليد..." : "تحميل PNG"}
                          </button>
                          <button
                            onClick={() => { setEditTarget(g); setShowAddModal(true); }}
                            className="p-2 rounded-xl border border-white/5 bg-white/[0.02] text-slate-400 hover:bg-white/[0.06] hover:text-slate-200 transition-all"
                          >
                            تعديل
                          </button>
                          <button
                            onClick={() => handleDelete(g.id)}
                            className="p-2 rounded-xl border border-red-500/10 bg-red-500/5 text-red-400 hover:bg-red-500/10 transition-all"
                          >
                            حذف
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {activeEventId && !loading && guests.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-white/5 bg-[#121620]/30 py-24 text-center">
          <Users className="h-12 w-12 text-slate-600 mb-4" />
          <p className="text-slate-400 font-medium">لا يوجد مدعوون مضافون حالياً</p>
          <p className="text-slate-500 text-xs mt-1 max-w-md">قم بإضافة المدعوين يدوياً أو اختر رفع ملف (Excel / CSV / TXT) يحتوي على الأعمدة: (الاسم، الجوال، البريد، عدد المرافقين، ملاحظات).</p>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#D4AF37] border-t-transparent"></div>
          <p className="text-slate-400 text-sm mt-4 font-medium">جاري تحميل قائمة المدعوين...</p>
        </div>
      )}

      {showAddModal && activeEventId && (
        <AddGuestModal
          onClose={() => { setShowAddModal(false); setEditTarget(null); }}
          onSaved={() => { setShowAddModal(false); setEditTarget(null); fetchGuests(activeEventId); }}
          eventId={activeEventId}
          initial={editTarget}
        />
      )}

      {previewTargetId && (
        <PreviewCardModal
          guestId={previewTargetId}
          onClose={() => setPreviewTargetId(null)}
        />
      )}
    </div>
  );
}

export default function GuestsPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#D4AF37] border-t-transparent"></div>
        <p className="text-slate-400 text-sm mt-4 font-medium">جاري التحميل...</p>
      </div>
    }>
      <GuestsContent />
    </Suspense>
  );
}
