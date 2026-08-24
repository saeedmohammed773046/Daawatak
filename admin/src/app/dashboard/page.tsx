"use client";

import { useEffect, useState } from "react";
import StatsCard from "@/components/dashboard/StatsCard";
import AttendanceChart from "@/components/dashboard/AttendanceChart";
import RecentScans from "@/components/dashboard/RecentScans";
import { Users, UserCheck, UserMinus, PlusCircle, AlertCircle, RefreshCw, MapPin, Calendar, Clock, ExternalLink } from "lucide-react";
import { initEcho } from "@/lib/echo";
import { apiRequest } from "@/lib/api";
import Link from "next/link";

interface ScanLog {
  id: string;
  guest_name: string;
  time: string;
  device: string;
}

interface HourlyStat {
  hour: string;
  count: number;
}

interface EventDetail {
  id: string;
  title: string;
  event_date?: string;
  start_time?: string;
  venue?: string;
  google_maps_url?: string;
  category?: string;
}

export default function DashboardPage() {
  const [events, setEvents] = useState<EventDetail[]>([]);
  const [activeEventId, setActiveEventId] = useState("");
  const [activeEvent, setActiveEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [stats, setStats] = useState({
    totalGuests: 0,
    attendedGuests: 0,
    absentGuests: 0,
    totalCompanions: 0,
    attendanceRate: 0
  });

  const [logs, setLogs] = useState<ScanLog[]>([]);
  const [chartData, setChartData] = useState<HourlyStat[]>([]);

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (activeEventId) {
      const selected = events.find(e => e.id === activeEventId) || null;
      setActiveEvent(selected);
      fetchAnalytics(activeEventId);
      setupWebSocket(activeEventId);
    }
  }, [activeEventId, events]);

  const fetchEvents = async () => {
    try {
      const response = await apiRequest("/events");
      if (response.success && response.data.length > 0) {
        setEvents(response.data);
        setActiveEventId(response.data[0].id);
        setActiveEvent(response.data[0]);
      } else {
        setError("لم يتم العثور على فعاليات نشطة. يرجى إنشاء فعالية أولاً.");
        setLoading(false);
      }
    } catch (err: any) {
      setError(err.message || "فشل تحميل الفعاليات.");
      setLoading(false);
    }
  };

  const fetchAnalytics = async (eventId: string) => {
    setLoading(true);
    setError("");
    try {
      const response = await apiRequest(`/events/${eventId}/analytics`);
      if (response.success && response.data) {
        const d = response.data;
        setStats({
          totalGuests: d.total_guests,
          attendedGuests: d.attended_guests,
          absentGuests: d.absent_guests,
          totalCompanions: d.total_companions,
          attendanceRate: Math.round(d.attendance_percentage)
        });
        setLogs(d.recent_scans);
        setChartData(d.hourly_stats || []);
      }
    } catch (err: any) {
      setError(err.message || "فشل تحميل تحليلات الفعالية.");
    } finally {
      setLoading(false);
    }
  };

  const setupWebSocket = (eventId: string) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") || "" : "";
    const echo = initEcho(token);

    if (echo) {
      echo.private(`event.${eventId}`)
        .listen(".attendance.scanned", (data: { status: string; timestamp: string; device: string }) => {
          if (data.status === "ACCEPTED") {
            setStats(prev => {
              const newAttended = prev.attendedGuests + 1;
              const newAbsent = Math.max(0, prev.absentGuests - 1);
              const total = prev.totalGuests;
              return {
                ...prev,
                attendedGuests: newAttended,
                absentGuests: newAbsent,
                attendanceRate: total ? Math.round((newAttended / total) * 100) : 0
              };
            });

            const newLog: ScanLog = {
              id: Date.now().toString(),
              guest_name: "ضيف تم مسحه حديثاً",
              time: data.timestamp,
              device: data.device
            };
            setLogs(prev => [newLog, ...prev.slice(0, 9)]);
            fetchAnalytics(eventId);
          }
        });
    }

    return () => {
      if (echo) {
        echo.leaveChannel(`event.${eventId}`);
      }
    };
  };

  return (
    <div className="space-y-8">
      {/* Header Greeting */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">لوحة تحكم دعوتك</h1>
          <p className="text-sm text-slate-400 mt-1 font-medium">متابعة فورية وإحصائيات مباشرة لفعاليتك الحالية عبر قنوات اتصال مباشرة (WebSockets).</p>
        </div>
        
        <div className="flex items-center gap-2">
          {activeEventId && (
            <button
              onClick={() => fetchAnalytics(activeEventId)}
              className="p-2.5 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] text-slate-400 hover:text-slate-200 transition-all animate-none"
              title="تحديث البيانات"
            >
              <RefreshCw className="h-4.5 w-4.5" />
            </button>
          )}
          <Link
            href="/dashboard/events"
            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-tr from-[#D4AF37] to-[#AA7C11] px-5 py-2.5 text-sm font-semibold text-[#0B0E14] shadow-md hover:opacity-90 transition-all duration-200"
          >
            <PlusCircle className="h-4.5 w-4.5" />
            <span>إضافة فعالية</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm font-semibold text-red-400 flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      )}

      {/* Select Active Event */}
      {events.length > 0 && (
        <div className="rounded-2xl border border-white/5 bg-[#121620]/60 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <span className="text-xs font-bold text-slate-400 flex-shrink-0">اختيار المناسبة:</span>
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
        </div>
      )}

      {/* Event Details & Location Header Card */}
      {activeEvent && (
        <div className="rounded-3xl border border-[#D4AF37]/20 bg-gradient-to-r from-[#121620] via-[#161B28] to-[#121620] p-6 shadow-xl relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10">
            <div className="space-y-2">
              <div className="inline-block rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 px-3 py-1 text-xs font-bold text-[#D4AF37]">
                الفعالية النشطة حالياً
              </div>
              <h2 className="text-2xl font-black text-white">{activeEvent.title}</h2>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 font-medium pt-1">
                {activeEvent.event_date && (
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-[#D4AF37]" />
                    <span>{activeEvent.event_date}</span>
                  </div>
                )}
                {activeEvent.start_time && (
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-[#D4AF37]" />
                    <span>{activeEvent.start_time}</span>
                  </div>
                )}
                {activeEvent.venue && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-[#D4AF37]" />
                    <span>{activeEvent.venue}</span>
                  </div>
                )}
              </div>
            </div>

            {activeEvent.google_maps_url && (
              <a
                href={activeEvent.google_maps_url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 rounded-2xl border border-[#D4AF37]/40 bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 px-5 py-3 text-xs font-bold text-[#D4AF37] transition-all self-start lg:self-center"
              >
                <MapPin className="h-4 w-4" />
                <span>عرض الموقع على الخريطة</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
        </div>
      )}

      {loading && stats.totalGuests === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#D4AF37] border-t-transparent"></div>
          <p className="text-slate-400 text-sm mt-4 font-medium">جاري تحميل لوحة الإحصائيات اللحظية...</p>
        </div>
      ) : activeEventId ? (
        <>
          {/* Stats Grid */}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <StatsCard 
              title="إجمالي المدعوين" 
              value={stats.totalGuests} 
              subtitle="تم تسجيلهم في القائمة" 
              icon={Users}
              color="gold"
            />
            <StatsCard 
              title="حاضرين حتى الآن" 
              value={stats.attendedGuests} 
              subtitle={`نسبة حضور ${stats.attendanceRate}%`} 
              icon={UserCheck}
              color="green"
            />
            <StatsCard 
              title="لم يحضروا بعد" 
              value={stats.absentGuests} 
              subtitle="بانتظار وصولهم" 
              icon={UserMinus}
              color="red"
            />
            <StatsCard 
              title="المرافقين الحاضرين" 
              value={stats.totalCompanions} 
              subtitle="مجموع الدخول الفعلي للمرافقين" 
              icon={Users}
              color="blue"
            />
          </div>

          {/* Visual Analytics Row */}
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <AttendanceChart data={chartData} />
            </div>
            <div className="lg:col-span-1">
              <RecentScans logs={logs} />
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
