import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color?: "gold" | "blue" | "green" | "red";
}

export default function StatsCard({ title, value, subtitle, icon: Icon, color = "gold" }: StatsCardProps) {
  
  const colors = {
    gold: {
      text: "text-[#D4AF37]",
      bg: "bg-[#D4AF37]/5 border-[#D4AF37]/15",
      iconBg: "bg-[#D4AF37]/10 text-[#D4AF37]"
    },
    blue: {
      text: "text-blue-400",
      bg: "bg-blue-400/5 border-blue-400/15",
      iconBg: "bg-blue-400/10 text-blue-400"
    },
    green: {
      text: "text-emerald-400",
      bg: "bg-emerald-400/5 border-emerald-400/15",
      iconBg: "bg-emerald-400/10 text-emerald-400"
    },
    red: {
      text: "text-red-400",
      bg: "bg-red-400/5 border-red-400/15",
      iconBg: "bg-red-400/10 text-red-400"
    }
  };

  const selectedColor = colors[color];

  return (
    <div className={`rounded-2xl border p-6 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${selectedColor.bg}`}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-400">{title}</span>
        <div className={`rounded-xl p-2.5 ${selectedColor.iconBg}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="mt-4">
        <h3 className="text-3xl font-bold tracking-tight text-white">{value}</h3>
        {subtitle && (
          <p className="mt-1 text-xs text-slate-400 font-medium">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
