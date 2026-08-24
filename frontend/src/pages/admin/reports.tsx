import { toast } from 'sonner'
import { BarChart3, FileSpreadsheet, FileText, Users, MailOpen, TrendingUp } from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorState } from '@/components/shared/error-state'
import { useAsync } from '@/hooks/use-async'
import { analyticsService } from '@/services/analytics.service'
import { formatNumber, formatPercent } from '@/lib/utils'
import { useI18n } from '@/i18n'

export default function AdminReportsPage() {
  const { t, locale } = useI18n()
  const isAr = locale === 'ar'

  const platformGrowth = Array.from({ length: 6 }, (_, i) => ({
    month: isAr ? `شهر ${i + 1}` : `M${i + 1}`,
    invitations: Math.round(600 + i * 220 + Math.sin(i) * 60),
  }))

  const { data: stats, isLoading, isError, refetch } = useAsync(() => analyticsService.getGlobalStats(), [])

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{isAr ? 'التقارير والإحصائيات' : 'Platform Reports & Analytics'}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isAr ? 'تقارير شاملة عن أداء المنصة، معدلات الحضور، واستخدام القوالب.' : 'Comprehensive platform analytics, invitation usage, and attendance rates.'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => toast.success(isAr ? 'تم تصدير تقرير Excel' : 'Excel report exported')}>
            <FileSpreadsheet className="h-4 w-4" /> Excel
          </Button>
          <Button variant="outline" size="sm" onClick={() => toast.success(isAr ? 'تم إنشاء تقرير PDF' : 'PDF report generated')}>
            <FileText className="h-4 w-4" /> PDF
          </Button>
        </div>
      </div>

      {isError ? (
        <ErrorState variant="network" title={isAr ? 'تعذر تحميل التقارير' : 'Failed to load reports'} onRetry={refetch} />
      ) : isLoading || !stats ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-2xl" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatMini icon={MailOpen} label={isAr ? 'إجمالي الدعوات' : 'Total Invitations'} value={formatNumber(stats.totalInvitations, locale)} />
            <StatMini icon={Users} label={isAr ? 'الحضور' : 'Attended'} value={formatNumber(stats.attended, locale)} accent="text-success" />
            <StatMini icon={Users} label={isAr ? 'الغياب' : 'Absent'} value={formatNumber(stats.absent, locale)} accent="text-destructive" />
            <StatMini icon={TrendingUp} label={isAr ? 'نسبة الحضور' : 'Attendance Rate'} value={formatPercent(stats.attendanceRate)} accent="text-primary" />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <BarChart3 className="h-4.5 w-4.5" />
                {isAr ? 'نمو الدعوات الشهري' : 'Monthly Invitations Growth'}
              </CardTitle>
            </CardHeader>
            <CardContent className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={platformGrowth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: 8 }} />
                  <Bar dataKey="invitations" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

function StatMini({ icon: Icon, label, value, accent }: { icon: typeof Users; label: string; value: string; accent?: string }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 ${accent ?? 'text-primary'}`}>
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-xl font-bold">{value}</p>
        </div>
      </CardContent>
    </Card>
  )
}
