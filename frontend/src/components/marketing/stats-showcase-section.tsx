import { useI18n } from '@/i18n'
import { formatNumber, formatPercent } from '@/lib/utils'
import { globalStats } from '@/mocks/analytics'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { CheckCircle2, XCircle, MailCheck, Percent } from 'lucide-react'

export function StatsShowcaseSection() {
  const { t, locale } = useI18n()
  const pieData = [
    { name: t.statsShowcase.attended, value: globalStats.attended, color: '#22c55e' },
    { name: t.statsShowcase.absent, value: globalStats.absent, color: '#ef4444' },
  ]

  const cards = [
    { icon: MailCheck, label: t.statsShowcase.sent, value: formatNumber(globalStats.totalInvitations, locale), color: 'text-primary bg-primary/10' },
    { icon: CheckCircle2, label: t.statsShowcase.attended, value: formatNumber(globalStats.attended, locale), color: 'text-success bg-success/10' },
    { icon: XCircle, label: t.statsShowcase.absent, value: formatNumber(globalStats.absent, locale), color: 'text-destructive bg-destructive/10' },
    { icon: Percent, label: t.statsShowcase.rate, value: formatPercent(globalStats.attendanceRate, locale), color: 'text-gold bg-gold/10' },
  ]

  return (
    <section className="py-16 sm:py-24">
      <div className="container grid items-center gap-10 lg:grid-cols-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{t.statsShowcase.heading}</h2>
          <p className="mt-3 max-w-md text-muted-foreground">{t.statsShowcase.subheading}</p>

          <div className="mt-8 grid grid-cols-2 gap-4">
            {cards.map((c) => (
              <div key={c.label} className="rounded-xl border border-border/70 bg-card p-5">
                <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg ${c.color}`}>
                  <c.icon className="h-5 w-5" />
                </div>
                <p className="text-2xl font-bold">{c.value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{c.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative flex items-center justify-center rounded-2xl border border-border/70 bg-card p-8 shadow-card">
          <div className="h-64 w-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" innerRadius={70} outerRadius={100} paddingAngle={3}>
                  {pieData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="absolute flex flex-col items-center">
            <span className="text-3xl font-bold">{formatPercent(globalStats.attendanceRate, locale)}</span>
            <span className="text-xs text-muted-foreground">{t.statsShowcase.rate}</span>
          </div>
          <div className="absolute -bottom-4 flex gap-4 rounded-full bg-background px-4 py-2 shadow-soft">
            {pieData.map((d) => (
              <div key={d.name} className="flex items-center gap-1.5 text-xs">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: d.color }} />
                {d.name}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
