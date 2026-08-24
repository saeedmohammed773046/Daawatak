import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  Settings, 
  LogOut, 
  Layers
} from "lucide-react";

interface SidebarProps {
  onClose?: () => void;
}

export default function Sidebar({ onClose }: SidebarProps) {
  const { pathname } = useLocation();

  const menuItems = [
    {
      name: "الرئيسية",
      href: "/dashboard",
      icon: LayoutDashboard
    },
    {
      name: "الفعاليات",
      href: "/dashboard/events",
      icon: Calendar
    },
    {
      name: "المدعوين",
      href: "/dashboard/guests",
      icon: Users
    },
    {
      name: "الإعدادات",
      href: "/dashboard/settings",
      icon: Settings
    }
  ];

  return (
    <div className="flex h-full w-64 flex-col border-l border-white/5 bg-[#121620]/90 backdrop-blur-md">
      {/* Logo Header */}
      <div className="flex h-16 items-center px-6 border-b border-white/5">
        <Link to="/dashboard" className="flex items-center gap-2 group">
          <img 
            src="/logo-dark.svg" 
            alt="دعوتك - Daawatak" 
            className="h-10 w-auto object-contain transition-transform duration-200 group-hover:scale-105" 
          />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1.5 px-4 py-6">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              onClick={onClose}
              className={`flex items-center gap-3.5 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-gradient-to-l from-[#D4AF37]/10 to-[#D4AF37]/5 text-[#D4AF37] border-r-2 border-[#D4AF37] shadow-[inset_-10px_0_20px_rgba(212,175,55,0.02)]"
                  : "text-slate-400 hover:bg-white/[0.03] hover:text-slate-200"
              }`}
            >
              <item.icon className={`h-5 w-5 ${isActive ? "text-[#D4AF37]" : "text-slate-400 group-hover:text-slate-200"}`} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Session Action */}
      <div className="p-4 border-t border-white/5">
        <button
          onClick={() => {
            // In production, trigger signout logic
            window.location.href = "/login";
          }}
          className="flex w-full items-center gap-3.5 rounded-xl px-4 py-3 text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-200"
        >
          <LogOut className="h-5 w-5" />
          <span>تسجيل الخروج</span>
        </button>
      </div>
    </div>
  );
}
