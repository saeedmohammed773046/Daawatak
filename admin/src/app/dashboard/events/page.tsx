"use client";

import { useEffect, useState } from "react";
import {
  Calendar, MapPin, Clock, Plus, Pencil, Trash2, Copy, Archive,
  CheckCircle2, AlertCircle, ChevronRight, Search, Filter, Users, Key, Trash, RefreshCw
} from "lucide-react";
import Link from "next/link";
import { apiRequest } from "@/lib/api";

const EVENT_CATEGORIES: Record<string, string> = {
  wedding: "حفل زفاف",
  engagement: "حفل خطوبة",
  graduation: "حفل تخرج",
  birthday: "عيد ميلاد",
  conference: "مؤتمر",
  workshop: "ورشة عمل",
  business_meeting: "اجتماع عمل",
  corporate: "فعالية شركات",
  opening_ceremony: "حفل افتتاح",
  private_gathering: "تجمع خاص",
  family: "لقاء عائلي",
  custom: "فعالية مخصصة",
};

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  draft:     { label: "مسودة",     color: "text-slate-400 bg-slate-400/10 border-slate-400/20" },
  published: { label: "منشورة",    color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" },
  completed: { label: "مكتملة",    color: "text-blue-400 bg-blue-400/10 border-blue-400/20" },
  archived:  { label: "مؤرشفة",   color: "text-orange-400 bg-orange-400/10 border-orange-400/20" },
};

interface EventItem {
  id: string;
  title: string;
  category: string;
  event_date: string;
  start_time: string;
  venue: string;
  status: string;
  access_pin?: string;
  guest_count?: number;
}

interface ReceptionistItem {
  id: string;
  name: string;
  email: string;
  phone: string;
}

interface EventModalProps {
  onClose: () => void;
  onSaved: () => void;
  initial?: EventItem | null;
}

function EventModal({ onClose, onSaved, initial }: EventModalProps) {
  const [activeTab, setActiveTab] = useState<"details" | "receptionists">("details");
  const [form, setForm] = useState({
    title: initial?.title || "",
    category: initial?.category || "wedding",
    event_date: initial?.event_date || "",
    start_time: initial?.start_time ? initial.start_time.substring(0, 5) : "20:00",
    venue: initial?.venue || "",
    status: initial?.status || "draft",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Receptionists sub-state
  const [receptionists, setReceptionists] = useState<ReceptionistItem[]>([]);
  const [loadingStaff, setLoadingStaff] = useState(false);
  const [staffForm, setStaffForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [staffError, setStaffError] = useState("");
  const [staffSuccess, setStaffSuccess] = useState("");

  useEffect(() => {
    if (initial?.id && activeTab === "receptionists") {
      fetchReceptionists();
    }
  }, [activeTab, initial]);

  const fetchReceptionists = async () => {
    if (!initial?.id) return;
    setLoadingStaff(true);
    setStaffError("");
    try {
      const response = await apiRequest(`/events/${initial.id}/receptionists`);
      if (response.success) {
        setReceptionists(response.data);
      }
    } catch (err: any) {
      setStaffError(err.message || "فشل تحميل قائمة موظفي الاستقبال");
    } finally {
      setLoadingStaff(false);
    }
  };

  const handleSaveEvent = async () => {
    setLoading(true);
    setError("");
    try {
      const method = initial?.id ? "PUT" : "POST";
      const endpoint = initial?.id ? `/events/${initial.id}` : "/events";
      const payload = {
        ...form,
        // Send format backend expects
        event_date: form.event_date,
      };

      const response = await apiRequest(endpoint, {
        method,
        body: JSON.stringify(payload),
      });

      if (response.success) {
        onSaved();
      }
    } catch (err: any) {
      setError(err.message || "فشل حفظ الفعالية. يرجى التحقق من المدخلات.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!initial?.id) return;
    setLoadingStaff(true);
    setStaffError("");
    setStaffSuccess("");
    try {
      const response = await apiRequest(`/events/${initial.id}/receptionists`, {
        method: "POST",
        body: JSON.stringify(staffForm),
      });

      if (response.success) {
        setStaffSuccess("تم إنشاء حساب موظف الاستقبال بنجاح!");
        setStaffForm({ name: "", email: "", phone: "", password: "" });
        fetchReceptionists();
      }
    } catch (err: any) {
      setStaffError(err.message || "فشل إضافة الحساب. تأكد من أن البريد الإلكتروني فريد.");
    } finally {
      setLoadingStaff(false);
    }
  };

  const handleDeleteStaff = async (staffId: string) => {
    if (!initial?.id) return;
    setLoadingStaff(true);
    setStaffError("");
    setStaffSuccess("");
    try {
      const response = await apiRequest(`/events/${initial.id}/receptionists/${staffId}`, {
        method: "DELETE",
      });

      if (response.success) {
        setStaffSuccess("تم حذف حساب موظف الاستقبال بنجاح.");
        fetchReceptionists();
      }
    } catch (err: any) {
      setStaffError(err.message || "فشل حذف الحساب.");
      setLoadingStaff(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-xl rounded-2xl border border-white/10 bg-[#121620] p-8 shadow-2xl my-8 relative">
        
        {/* Tabs Headers */}
        <div className="flex border-b border-white/5 mb-6 text-sm">
          <button
            onClick={() => setActiveTab("details")}
            className={`pb-3 px-4 font-semibold transition-all ${
              activeTab === "details"
                ? "border-b-2 border-[#D4AF37] text-white"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            تفاصيل الفعالية
          </button>
          {initial?.id && (
            <button
              onClick={() => setActiveTab("receptionists")}
              className={`pb-3 px-4 font-semibold transition-all ${
                activeTab === "receptionists"
                  ? "border-b-2 border-[#D4AF37] text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              حساب موظف الاستقبال (المراسم)
            </button>
          )}
        </div>

        {activeTab === "details" && (
          <div className="space-y-4">
            {error && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3.5 text-center text-xs font-semibold text-red-400 flex items-center justify-center gap-2">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">عنوان الفعالية</label>
              <input
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                className="h-10 w-full rounded-xl border border-white/5 bg-[#0B0E14] px-4 text-sm text-slate-200 placeholder-slate-600 focus:border-[#D4AF37]/50 focus:outline-none focus:ring-1 focus:ring-[#D4AF37]/50 transition-all"
                placeholder="مثال: حفل زفاف فهد و سارة"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">نوع الفعالية</label>
                <select
                  value={form.category}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  className="h-10 w-full rounded-xl border border-white/5 bg-[#0B0E14] px-4 text-sm text-slate-200 focus:border-[#D4AF37]/50 focus:outline-none focus:ring-1 focus:ring-[#D4AF37]/50 transition-all"
                >
                  {Object.entries(EVENT_CATEGORIES).map(([k, v]) => (
                    <option key={k} value={k} className="bg-[#0B0E14]">{v}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">الحالة</label>
                <select
                  value={form.status}
                  onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                  className="h-10 w-full rounded-xl border border-white/5 bg-[#0B0E14] px-4 text-sm text-slate-200 focus:border-[#D4AF37]/50 focus:outline-none focus:ring-1 focus:ring-[#D4AF37]/50 transition-all"
                >
                  {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                    <option key={k} value={k} className="bg-[#0B0E14]">{v.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">تاريخ الفعالية</label>
                <input
                  type="date"
                  value={form.event_date}
                  onChange={e => setForm(f => ({ ...f, event_date: e.target.value }))}
                  className="h-10 w-full rounded-xl border border-white/5 bg-[#0B0E14] px-4 text-sm text-slate-200 focus:border-[#D4AF37]/50 focus:outline-none focus:ring-1 focus:ring-[#D4AF37]/50 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">وقت البدء</label>
                <input
                  type="time"
                  value={form.start_time}
                  onChange={e => setForm(f => ({ ...f, start_time: e.target.value }))}
                  className="h-10 w-full rounded-xl border border-white/5 bg-[#0B0E14] px-4 text-sm text-slate-200 focus:border-[#D4AF37]/50 focus:outline-none focus:ring-1 focus:ring-[#D4AF37]/50 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">مكان الفعالية</label>
              <input
                value={form.venue}
                onChange={e => setForm(f => ({ ...f, venue: e.target.value }))}
                className="h-10 w-full rounded-xl border border-white/5 bg-[#0B0E14] px-4 text-sm text-slate-200 placeholder-slate-600 focus:border-[#D4AF37]/50 focus:outline-none focus:ring-1 focus:ring-[#D4AF37]/50 transition-all"
                placeholder="مثال: قاعة الفريد للاحتفالات، الرياض"
              />
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={handleSaveEvent}
                disabled={loading}
                className="flex-1 rounded-xl bg-gradient-to-tr from-[#D4AF37] to-[#AA7C11] py-2.5 text-sm font-bold text-[#0B0E14] hover:opacity-90 transition-all disabled:opacity-50"
              >
                {loading ? "جاري الحفظ..." : "حفظ"}
              </button>
              <button
                onClick={onClose}
                className="flex-1 rounded-xl border border-white/10 bg-white/[0.02] py-2.5 text-sm font-semibold text-slate-300 hover:bg-white/[0.05] transition-all"
              >
                إلغاء
              </button>
            </div>
          </div>
        )}

        {activeTab === "receptionists" && initial?.id && (
          <div className="space-y-6">
            
            {staffError && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs font-semibold text-red-400">
                {staffError}
              </div>
            )}
            
            {staffSuccess && (
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs font-semibold text-emerald-400">
                {staffSuccess}
              </div>
            )}

            {/* List existing staff */}
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">حسابات موظفي الاستقبال المسجلة</h3>
              {loadingStaff && receptionists.length === 0 ? (
                <div className="text-center py-6 text-slate-500 text-xs">جاري التحميل...</div>
              ) : receptionists.length === 0 ? (
                <div className="rounded-xl border border-white/5 border-dashed bg-white/[0.01] p-6 text-center text-xs text-slate-500">
                  لا توجد حسابات استقبال منشأة لهذه الفعالية بعد. يمكنك إنشاء حساب في النموذج أدناه.
                </div>
              ) : (
                <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                  {receptionists.map(staff => (
                    <div key={staff.id} className="flex items-center justify-between p-3.5 rounded-xl border border-white/5 bg-[#0B0E14]/40 text-xs">
                      <div className="space-y-1">
                        <p className="font-bold text-white">{staff.name}</p>
                        <p className="text-slate-400 font-mono text-[10px]">{staff.email}</p>
                        {staff.phone && <p className="text-slate-500 text-[10px]">{staff.phone}</p>}
                      </div>
                      <button
                        onClick={() => handleDeleteStaff(staff.id)}
                        className="p-2 rounded-lg border border-red-500/10 bg-red-500/5 text-red-400 hover:bg-red-500/10 transition-all"
                        title="حذف الحساب"
                      >
                        <Trash className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Create new staff credentials */}
            <form onSubmit={handleAddStaff} className="border-t border-white/5 pt-5 space-y-3.5">
              <h3 className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider">إنشاء حساب مراسم جديد (الدخول المباشر للتطبيق)</h3>
              
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">اسم موظف الاستقبال</label>
                  <input
                    required
                    value={staffForm.name}
                    onChange={e => setStaffForm(s => ({ ...s, name: e.target.value }))}
                    className="h-9 w-full rounded-lg border border-white/5 bg-[#0B0E14] px-3 text-xs text-slate-200"
                    placeholder="الاسم الثلاثي"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">الهاتف</label>
                  <input
                    value={staffForm.phone}
                    onChange={e => setStaffForm(s => ({ ...s, phone: e.target.value }))}
                    className="h-9 w-full rounded-lg border border-white/5 bg-[#0B0E14] px-3 text-xs text-slate-200"
                    placeholder="+9665..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">البريد الإلكتروني (الخاص بالمراسم)</label>
                  <input
                    required
                    type="email"
                    value={staffForm.email}
                    onChange={e => setStaffForm(s => ({ ...s, email: e.target.value }))}
                    className="h-9 w-full rounded-lg border border-white/5 bg-[#0B0E14] px-3 text-xs text-slate-200 font-mono"
                    placeholder="event-reception@daawatak.com"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">كلمة المرور</label>
                  <input
                    required
                    type="password"
                    value={staffForm.password}
                    onChange={e => setStaffForm(s => ({ ...s, password: e.target.value }))}
                    className="h-9 w-full rounded-lg border border-white/5 bg-[#0B0E14] px-3 text-xs text-slate-200"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loadingStaff}
                className="w-full flex justify-center items-center gap-1.5 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 py-2 text-xs font-bold text-[#D4AF37] hover:bg-[#D4AF37]/20 transition-all disabled:opacity-50"
              >
                <Key className="h-3.5 w-3.5" />
                إنشاء حساب موظف الاستقبال
              </button>
            </form>

            <div className="flex justify-end pt-2 border-t border-white/5">
              <button
                onClick={onClose}
                className="px-6 rounded-xl border border-white/10 bg-white/[0.02] py-2.5 text-xs font-semibold text-slate-300 hover:bg-white/[0.05] transition-all"
              >
                إغلاق
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}

export default function EventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<EventItem | null>(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await apiRequest("/events");
      if (response.success) {
        setEvents(response.data);
      }
    } catch (err: any) {
      setError(err.message || "فشل جلب الفعاليات. يرجى التأكد من تسجيل الدخول.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaved = () => {
    setShowModal(false);
    setEditTarget(null);
    fetchEvents();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من رغبتك في حذف هذه الفعالية؟ سيتم حذف جميع المدعوين المرتبطين بها.")) return;
    try {
      const response = await apiRequest(`/events/${id}`, { method: "DELETE" });
      if (response.success) {
        fetchEvents();
      }
    } catch (err: any) {
      alert(err.message || "فشل حذف الفعالية");
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      const response = await apiRequest(`/events/${id}/duplicate`, { method: "POST" });
      if (response.success) {
        fetchEvents();
      }
    } catch (err: any) {
      alert(err.message || "فشل نسخ الفعالية");
    }
  };

  const filteredEvents = events.filter(ev => {
    const matchSearch = ev.title.toLowerCase().includes(search.toLowerCase()) ||
      ev.venue.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || ev.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">الفعاليات</h1>
          <p className="text-sm text-slate-400 mt-1">إدارة وتنظيم جميع فعالياتك ومراسم استقبالك في مكان واحد.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchEvents}
            className="p-2.5 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] text-slate-400 hover:text-slate-200 transition-all"
            title="تحديث البيانات"
          >
            <RefreshCw className="h-4.5 w-4.5" />
          </button>
          <button
            onClick={() => { setEditTarget(null); setShowModal(true); }}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-tr from-[#D4AF37] to-[#AA7C11] px-5 py-2.5 text-sm font-bold text-[#0B0E14] shadow-md hover:opacity-90 transition-all"
          >
            <Plus className="h-4 w-4" />
            فعالية جديدة
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm font-semibold text-red-400 flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      )}

      {/* Filters Row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="ابحث باسم الفعالية أو المكان..."
            className="h-9 w-full rounded-xl border border-white/5 bg-[#121620]/60 pr-10 pl-4 text-xs text-slate-200 placeholder-slate-500 focus:border-[#D4AF37]/50 focus:outline-none focus:ring-1 focus:ring-[#D4AF37]/50 transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-500" />
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="h-9 rounded-xl border border-white/5 bg-[#121620]/60 px-3 text-xs text-slate-200 focus:border-[#D4AF37]/50 focus:outline-none"
          >
            <option value="all">جميع الحالات</option>
            {Object.entries(STATUS_CONFIG).map(([k, v]) => (
              <option key={k} value={k} className="bg-[#121620]">{v.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#D4AF37] border-t-transparent"></div>
          <p className="text-slate-400 text-sm mt-4 font-medium">جاري تحميل الفعاليات الفعالة...</p>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-white/5 bg-[#121620]/30 py-20 text-center">
          <Calendar className="h-12 w-12 text-slate-600 mb-4" />
          <p className="text-slate-400 font-medium">لا توجد فعاليات مطابقة</p>
          <p className="text-slate-500 text-sm mt-1">جرب تغيير فلاتر البحث أو أضف فعالية جديدة</p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredEvents.map(event => {
            const statusCfg = STATUS_CONFIG[event.status] || STATUS_CONFIG.draft;
            return (
              <div
                key={event.id}
                className="group relative flex flex-col rounded-2xl border border-white/5 bg-[#121620]/60 backdrop-blur-md p-6 hover:border-[#D4AF37]/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#D4AF37]/5"
              >
                {/* Status Badge */}
                <span className={`absolute top-4 left-4 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusCfg.color}`}>
                  {statusCfg.label}
                </span>

                {/* Category */}
                <p className="text-xs font-semibold text-[#D4AF37] mb-2">
                  {EVENT_CATEGORIES[event.category] || event.category}
                </p>

                {/* Title */}
                <h3 className="text-base font-bold text-white leading-snug mb-4 line-clamp-2 pr-0">
                  {event.title}
                </h3>

                {/* Meta */}
                <div className="space-y-2 mb-5">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                    <span>{event.event_date}</span>
                    <Clock className="h-3.5 w-3.5 flex-shrink-0 mr-1" />
                    <span>{event.start_time}</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs text-slate-400">
                    <MapPin className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                    <span className="line-clamp-1">{event.venue}</span>
                  </div>
                </div>

                {/* Guest count & Security PIN */}
                <div className="flex items-center justify-between mb-3 rounded-xl bg-white/[0.02] border border-white/5 px-4 py-2.5">
                  <span className="text-xs text-slate-400">المدعوون</span>
                  <span className="text-sm font-bold text-white">{event.guest_count?.toLocaleString("ar-SA") ?? "—"}</span>
                </div>

                <div className="flex items-center justify-between mb-5 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 px-3.5 py-2">
                  <span className="text-[11px] font-bold text-slate-300">رمز حماية الفعالية للتطبيق:</span>
                  <span className="text-sm font-mono font-extrabold text-[#D4AF37] tracking-widest">{event.access_pin || '123456'}</span>
                </div>

                {/* Actions */}
                <div className="mt-auto flex items-center gap-2">
                  <Link
                    href={`/dashboard/guests?event=${event.id}`}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-[#D4AF37]/30 bg-[#D4AF37]/5 py-2 text-xs font-semibold text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-all"
                  >
                    المدعوون
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                  <button
                    onClick={() => { setEditTarget(event); setShowModal(true); }}
                    className="rounded-xl border border-white/5 bg-white/[0.02] p-2 text-slate-400 hover:bg-white/[0.06] hover:text-slate-200 transition-all"
                    title="تعديل الفعالية وموظفي الاستقبال"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDuplicate(event.id)}
                    className="rounded-xl border border-white/5 bg-white/[0.02] p-2 text-slate-400 hover:bg-white/[0.06] hover:text-slate-200 transition-all"
                    title="نسخ"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(event.id)}
                    className="rounded-xl border border-red-500/10 bg-red-500/5 p-2 text-red-400 hover:bg-red-500/10 transition-all"
                    title="حذف"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <EventModal
          onClose={() => { setShowModal(false); setEditTarget(null); }}
          onSaved={handleSaved}
          initial={editTarget}
        />
      )}
    </div>
  );
}
