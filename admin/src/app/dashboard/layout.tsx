"use client";

import { useState } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import Header from "@/components/dashboard/Header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState("1");

  const events = [
    { id: "1", title: "حفل زفاف فهد و سارة" },
    { id: "2", title: "مؤتمر التقنية والتحول الرقمي 2026" },
    { id: "3", title: "حفل تخرج خالد - جامعة الملك سعود" }
  ];

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#0B0E14]">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex h-full flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          {/* Backdrop */}
          <div 
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-[#0B0E14]/80 backdrop-blur-sm"
          />
          {/* Sidebar content */}
          <div className="relative flex w-64 flex-1 flex-col animate-slide-in-right">
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header 
          onMenuClick={() => setSidebarOpen(true)}
          selectedEvent={selectedEventId}
          setSelectedEvent={setSelectedEventId}
          events={events}
        />
        
        <main className="flex-1 overflow-y-auto px-6 py-8">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
