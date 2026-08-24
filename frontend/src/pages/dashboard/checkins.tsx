import { useState, useMemo, useEffect } from 'react'
import { toast } from 'sonner'
import { initEcho } from '@/lib/echo'
import { useAuthStore } from '@/store/auth.store'
import {
  ScanLine,
  Users,
  UserCheck,
  UserX,
  Percent,
  RadioTower,
  RefreshCw,
} from 'lucide-react'
import {
  PieChart,
  Pie,
  Cell,
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
import { EmptyState } from '@/components/shared/empty-state'
import { ErrorState } from '@/components/shared/error-state'
import { EventPicker } from '@/components/events/event-picker'
import { useAsync } from '@/hooks/use-async'
import { eventsService } from '@/services/events.service'
import { analyticsService } from '@/services/analytics.service'
import { formatNumber, formatPercent, formatTime } from '@/lib/utils'
import type { GuestCategory } from '@/types'

const categoryLabels: Record<GuestCategory, string> = {
  family: 'العائلة',
  friends: 'الأصدقاء',
  work: 'العمل',
  vip: 'كبار الشخصيات',
  other: 'أخرى',
}

const categoryColorVar: Record<GuestCategory, string> = {
  family: 'hsl(var(--primary))',
  friends: 'hsl(var(--success))',
  work: 'hsl(var(--muted-foreground))',
  vip: 'hsl(var(--gold))',
  other: 'hsl(var(--warning))',
}

export default function CheckinsDashboardPage() {
  const [eventId, setEventId] = useState<string>('')

  const {
    data: eventsRes,
    isLoading: eventsLoading,
    isError: eventsError,
    refetch: refetchEvents,
  } = useAsync(() => eventsService.list({ pageSize: 100 }), [])

  const events = eventsRes?.data ?? []

  const activeEventId = eventId || events[0]?.id || ''

  const {
    data: analytics,
    isLoading: analyticsLoading,
    isError: analyticsError,
    refetch: refetchAnalytics,
  } = useAsync(() => analyticsService.getEventAnalytics(activeEventId), [activeEventId])

  const {
    data: feed,
    isLoading: feedLoading,
    refetch: refetchFeed,
  } = useAsync(() => analyticsService.getCheckInFeed(activeEventId), [activeEventId])

  useEffect(() => {
    if (!activeEventId) return
    const token = useAuthStore.getState().token || localStorage.getItem('daawatak_token') || ''
    const echo = initEcho(token)
    if (!echo) return

    const channel = echo.private(`event.${activeEventId}`)
    channel.listen('.attendance.scanned', (e: any) => {
      if (e.status === 'ACCEPTED') {
        toast.success(`دخول جديد: ${e.guestName || 'ضيف'}`)
        refetchAnalytics()
        refetchFeed()
      }
    })

    return () => {
      channel.stopListening('.attendance.scanned')
      echo.leave(`event.${activeEventId}`)
    }
  }, [activeEventId, refetchAnalytics, refetchFeed])

  const pieData = useMemo(
    () => (analytics?.categoryBreakdown ?? []).filter((c: any) => c.count > 0),
    [analytics]
  )

  if (eventsError) {
    return <ErrorState variant="network" title="تعذر تحميل قائمة المناسبات" onRetry={refetchEvents} />
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">لوحة الحضور</h1>
          <p className="mt-1 text-sm text-muted-foreground">تابع نسب الحضور ومعدلات الدخول لحظة بلحظة.</p>
        </div>
        {eventsLoading ? (
          <Skeleton className="h-10 w-64" />
        ) : events.length > 0 ? (
          <EventPicker events={events} value={activeEventId} onChange={setEventId} />
        ) : null}
      </div>

      {eventsLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : events.length === 0 ? (
        <EmptyState icon={ScanLine} title="لا توجد مناسبات بعد" description="أنشئ مناسبتك الأولى لمتابعة لوحة الحضور." />
      ) : analyticsError ? (
        <ErrorState variant="generic" title="تعذر تحميل بيانات الحضور" onRetry={refetchAnalytics} />
      ) : analyticsLoading || !analytics ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : (
        <>
          {/* Stat cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatMini icon={Users} label="إجمالي الضيوف" value={formatNumber(analytics.totalGuests)} />
            <StatMini icon={UserCheck} label="تم الحضور" value={formatNumber(analytics.checkedIn)} accent="text-success" />
            <StatMini icon={UserX} label="لم يحضر" value={formatNumber(analytics.noShow)} accent="text-destructive" />
            <StatMini icon={Percent} label="نسبة الحضور" value={formatPercent(analytics.attendanceRate)} accent="text-primary" />
          </div>

          {analytics.totalGuests === 0 ? (
            <EmptyState icon={ScanLine} title="لا توجد بيانات حضور بعد" description="ستظهر إحصائيات الحضور بعد بدء عملية تسجيل الدخول للمناسبة." />
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">توزيع الضيوف حسب الفئة</CardTitle>
                </CardHeader>
                <CardContent className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} dataKey="count" nameKey="category" innerRadius={50} outerRadius={80} paddingAngle={2}>
                        {pieData.map((entry: any) => (
                          <Cell key={entry.category} fill={categoryColorVar[entry.category as GuestCategory]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: 8 }}
                        formatter={(value: number, _name, item: any) => [formatNumber(value), categoryLabels[item.payload.category as GuestCategory]]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-2 flex flex-wrap justify-center gap-3 text-xs">
                    {pieData.map((entry: any) => (
                      <span key={entry.category} className="flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ background: categoryColorVar[entry.category as GuestCategory] }} />
                        {categoryLabels[entry.category as GuestCategory]} ({formatNumber(entry.count)})
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">تسجيل الدخول حسب الساعة</CardTitle>
                </CardHeader>
                <CardContent className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.hourlyCheckIns}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="hour" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                      <YAxis tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} allowDecimals={false} />
                      <Tooltip
                        contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: 8 }}
                      />
                      <Bar dataKey="count" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Live feed */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success/60" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-success" />
                </span>
                سجل الدخول الحي
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={refetchFeed}>
                <RefreshCw className="h-4 w-4" />
                تحديث
              </Button>
            </CardHeader>
            <CardContent>
              {feedLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : !feed || feed.length === 0 ? (
                <EmptyState icon={RadioTower} title="لا توجد تسجيلات دخول بعد" description="سيظهر هنا كل ضيف فور تسجيل دخوله عبر رمز QR." />
              ) : (
                <ul className="divide-y divide-border">
                  {feed.map((record: any) => (
                    <li key={record.id} className="flex items-center justify-between gap-3 py-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-success/10 text-success">
                          <UserCheck className="h-4.5 w-4.5" />
                        </span>
                        <div>
                          <p className="text-sm font-medium">{record.guestName}</p>
                          <p className="text-xs text-muted-foreground">{record.gate}{record.companions ? ` · ${record.companions} مرافق` : ''}</p>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">{formatTime(record.time)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

function StatMini({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: typeof Users
  label: string
  value: string
  accent?: string
}) {
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
