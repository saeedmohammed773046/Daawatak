import {
  Users,
  CalendarDays,
  MailOpen,
  Wallet,
  TrendingUp,
} from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorState } from '@/components/shared/error-state'
import { useAsync } from '@/hooks/use-async'
import { analyticsService } from '@/services/analytics.service'
import { usersService } from '@/services/users.service'
import { eventsService } from '@/services/events.service'
import { formatNumber, formatPercent, formatDateTime } from '@/lib/utils'
import { useI18n } from '@/i18n'

export default function AdminHomePage() {
  const { t, locale } = useI18n()
  const isAr = locale === 'ar'

  const growthData = Array.from({ length: 12 }, (_, i) => ({
    month: isAr ? `شهر ${i + 1}` : `M${i + 1}`,
    users: Math.round(120 + i * 34 + Math.sin(i) * 20),
  }))

  const { data: stats, isLoading: statsLoading, isError: statsError, refetch: refetchStats } = useAsync(
    () => analyticsService.getGlobalStats(),
    []
  )
  const { data: usersRes, isLoading: usersLoading } = useAsync(() => usersService.list({ pageSize: 100 }), [])
  const { data: eventsRes, isLoading: eventsLoading } = useAsync(() => eventsService.list({ pageSize: 100 }), [])
  const { data: auditLogs, isLoading: logsLoading } = useAsync(() => usersService.auditLogs(), [])

  if (statsError) {
    return <ErrorState variant="network" title={isAr ? 'تعذر تحميل بيانات لوحة التحكم' : 'Failed to load dashboard data'} onRetry={refetchStats} />
  }

  const totalUsers = usersRes?.total ?? 0
  const totalEvents = eventsRes?.total ?? 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {isAr ? 'لوحة تحكم مدير النظام' : 'Super Admin Dashboard'}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {isAr ? 'نظرة عامة على أداء المنصة والنشاط الحالي.' : 'Overview of system performance, growth, and live activity.'}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statsLoading || usersLoading || eventsLoading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)
        ) : (
          <>
            <StatCard icon={Users} label={isAr ? 'إجمالي المستخدمين' : 'Total Users'} value={formatNumber(totalUsers, locale)} />
            <StatCard icon={CalendarDays} label={isAr ? 'إجمالي المناسبات' : 'Total Events'} value={formatNumber(totalEvents, locale)} />
            <StatCard icon={MailOpen} label={isAr ? 'إجمالي الدعوات' : 'Total Invitations'} value={formatNumber(stats?.totalInvitations ?? 0, locale)} />
            <StatCard icon={TrendingUp} label={isAr ? 'نسبة الحضور' : 'Attendance Rate'} value={formatPercent(stats?.attendanceRate ?? 0)} accent="text-success" />
          </>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {isAr ? 'نمو المستخدمين خلال السنة' : 'Annual User Growth'}
          </CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={growthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
              <Tooltip contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: 8 }} />
              <Line type="monotone" dataKey="users" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Wallet className="h-4.5 w-4.5" />
            {isAr ? 'آخر النشاطات والعمليات' : 'Recent System Activities'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {logsLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {(auditLogs ?? []).slice(0, 6).map((log) => (
                <li key={log.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                  <div>
                    <span className="font-medium">{log.actor}</span>
                    <span className="text-muted-foreground"> — {log.action} </span>
                    <span className="text-muted-foreground">({log.target})</span>
                  </div>
                  <span className="whitespace-nowrap text-xs text-muted-foreground">{formatDateTime(log.createdAt, locale)}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, accent }: { icon: typeof Users; label: string; value: string; accent?: string }) {
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
