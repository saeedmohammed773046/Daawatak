"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ShieldCheck, Users, CreditCard, Layout, History, LogOut, ArrowRight, BarChart3 } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("auth_user");
    if (storedUser) {
      const u = JSON.parse(storedUser);
      if (u.role !== "super_admin") {
        router.push("/dashboard");
      } else {
        setUser(u);
      }
    } else {
      router.push("/login");
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.clear();
    router.push("/login");
  };

  if (!user) return null;

  const navItems = [
    { href: "/admin", label: "نظرة عامة (Dashboard)", icon: BarChart3 },
    { href: "/admin/users", label: "إدارة المستخدمين", icon: Users },
    { href: "/admin/plans", label: "خطط الباقات (SaaS)", icon: CreditCard },
    { href: "/admin/templates", label: "قوالب النظام العامة", icon: Layout },
    { href: "/admin/subscriptions", label: "الاشتراكات والعمليات", icon: ShieldCheck },
    { href: "/admin/audit-logs", label: "سجل العمليات (Audit Logs)", icon: History },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans" dir="rtl">
      {/* Admin Sidebar */}
      <aside className="w-64 border-l border-slate-900 bg-slate-950 flex flex-col justify-between p-6 flex-shrink-0">
        <div className="space-y-8">
          {/* Logo Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold shadow-lg shadow-amber-500/10">
              👑
            </div>
            <div>
              <h1 className="text-base font-bold text-white tracking-wide">لوحة الإدارة العليا</h1>
              <span className="text-[10px] text-amber-400 font-medium">Super Admin Console</span>
            </div>
          </div>

          {/* Navigation items */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-medium transition ${isActive ? "bg-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/20" : "text-slate-400 hover:text-white hover:bg-slate-900"}`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User profile & return */}
        <div className="space-y-3 pt-6 border-t border-slate-900">
          <Link
            href="/dashboard"
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-850 text-slate-300 rounded-xl text-xs transition"
          >
            <ArrowRight className="w-4 h-4" /> العودة للوحة المستخدم
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 rounded-xl text-xs transition border border-rose-500/20"
          >
            <LogOut className="w-4 h-4" /> تسجيل الخروج
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  );
}
