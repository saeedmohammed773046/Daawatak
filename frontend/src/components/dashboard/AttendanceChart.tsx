"use client";

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";

interface AttendanceChartProps {
  data: Array<{ hour: string; count: number }>;
}

export default function AttendanceChart({ data }: AttendanceChartProps) {
  const chartData = data.length > 0 ? data : [
    { hour: "18:00", count: 12 },
    { hour: "19:00", count: 48 },
    { hour: "20:00", count: 145 },
    { hour: "21:00", count: 98 },
    { hour: "22:00", count: 32 },
    { hour: "23:00", count: 8 },
  ];

  return (
    <div className="rounded-2xl border border-white/5 bg-[#121620]/60 p-6 backdrop-blur-md">
      <h3 className="text-lg font-bold text-white mb-6">ذروة تدفق الحضور (بالساعة)</h3>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorScans" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="hour" 
              stroke="#64748B" 
              fontSize={11}
              tickLine={false}
              axisLine={false}
              dy={10}
            />
            <YAxis 
              stroke="#64748B" 
              fontSize={11}
              tickLine={false}
              axisLine={false}
              dx={-10}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1E2536",
                borderColor: "rgba(255, 255, 255, 0.08)",
                borderRadius: "12px",
                color: "#FFFFFF",
                fontFamily: "Cairo, sans-serif"
              }}
              labelStyle={{ fontSize: "12px", fontWeight: "bold", textAlign: "right" }}
              itemStyle={{ fontSize: "12px", color: "#D4AF37", textAlign: "right" }}
            />
            <Area
              type="monotone"
              dataKey="count"
              stroke="#D4AF37"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorScans)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
