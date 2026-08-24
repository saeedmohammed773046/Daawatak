"use client";

import { useEffect, useState } from "react";
import { Bell, Search, Menu, Calendar, LogOut, KeyRound } from "lucide-react";

interface HeaderProps {
  onMenuClick: () => void;
  selectedEvent: string;
  setSelectedEvent: (id: string) => void;
  events: Array<{ id: string; title: string }>;
}

export default function Header({ onMenuClick, selectedEvent, setSelectedEvent, events }: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("auth_user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (_) {}
    }
  }, []);

  const initialLetter = user?.name ? user.name.trim().charAt(0) : "م";

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    window.location.href = "/login";
  };

  return (
    <header className="flex h-16 w-full items-center justify-between border-b border-white/5 bg-[#0B0E14]/75 px-6 backdrop-blur-md sticky top-0 z-30">
      {/* Mobile Hamburger & Event selector */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-white/5 hover:text-slate-200 md:hidden"
        >
          <Menu className="h-6 w-6" />
        </button>

        <div className="flex items-center gap-2 bg-white/[0.02] border border-white/5 rounded-xl px-3 py-1.5 hover:bg-white/[0.04] transition-colors">
          <Calendar className="h-4.5 w-4.5 text-[#D4AF37]" />
          <select
            value={selectedEvent}
            onChange={(e) => setSelectedEvent(e.target.value)}
            className="bg-transparent border-0 text-sm font-medium text-slate-200 focus:outline-none focus:ring-0 cursor-pointer max-w-[200px] truncate"
          >
            {events.length > 0 ? (
              events.map((evt) => (
                <option key={evt.id} value={evt.id} className="bg-[#121620] text-slate-200">
                  {evt.title}
                </option>
              ))
            ) : (
              <option value="" className="bg-[#121620] text-slate-200">لا توجد فعاليات</option>
            )}
          </select>
        </div>
      </div>

      {/* Global Actions */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative hidden sm:block">
          <Search className="absolute right-3 top-2.5 h-4.5 w-4.5 text-slate-500" />
          <input
            type="text"
            placeholder="بحث عن مدعو..."
            className="h-9 w-60 rounded-xl border border-white/5 bg-[#121620]/60 pr-10 pl-4 text-xs text-slate-200 placeholder-slate-500 focus:border-[#D4AF37]/50 focus:outline-none focus:ring-1 focus:ring-[#D4AF37]/50 transition-all duration-200"
          />
        </div>

        {/* Profile */}
        <div className="flex items-center gap-3 pr-2.5 border-r border-white/5">
          <div className="h-8.5 w-8.5 rounded-full bg-gradient-to-tr from-[#D4AF37] to-[#AA7C11] p-[1.5px] shadow-sm">
            <div className="flex h-full w-full items-center justify-center rounded-full bg-[#121620] text-[#D4AF37] text-sm font-bold font-sans">
              {initialLetter}
            </div>
          </div>
          <div className="hidden md:flex flex-col text-right">
            <span className="text-xs font-bold text-white">{user?.name || "منظم الفعالية"}</span>
            <span className="text-[10px] text-slate-400 font-mono">{user?.email || "owner@daawatak.com"}</span>
          </div>

          <button
            onClick={handleLogout}
            className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-white/5 transition-all mr-1"
            title="تسجيل الخروج"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
