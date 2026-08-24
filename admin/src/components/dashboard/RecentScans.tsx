import { CheckCircle2, UserCheck, Smartphone } from "lucide-react";

interface ScanLog {
  id: string;
  guest_name: string;
  time: string;
  device: string;
}

interface RecentScansProps {
  logs: ScanLog[];
}

export default function RecentScans({ logs }: RecentScansProps) {
  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" });
    } catch {
      return isoString;
    }
  };

  const displayLogs = logs.length > 0 ? logs : [
    { id: "1", guest_name: "خالد بن عبد الله", time: new Date().toISOString(), device: "iPhone 15 Pro - سارة" },
    { id: "2", guest_name: "محمد السديري", time: new Date(Date.now() - 300000).toISOString(), device: "Galaxy S24 - سارة" },
    { id: "3", guest_name: "عبد العزيز الحربي", time: new Date(Date.now() - 900000).toISOString(), device: "iPhone 15 Pro - سارة" },
  ];

  return (
    <div className="rounded-2xl border border-white/5 bg-[#121620]/60 p-6 backdrop-blur-md">
      <h3 className="text-lg font-bold text-white mb-6">آخر عمليات التحقق المقبولة</h3>
      <div className="space-y-4">
        {displayLogs.map((log) => (
          <div 
            key={log.id} 
            className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                <UserCheck className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">{log.guest_name}</h4>
                <div className="flex items-center gap-1.5 mt-0.5 text-xs text-slate-400">
                  <Smartphone className="h-3 w-3" />
                  <span>{log.device}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-400">{formatTime(log.time)}</span>
              <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
