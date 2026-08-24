import { useState } from 'react'
import { toast } from 'sonner'
import { FileSpreadsheet, FileText, UserCheck, MailOpen, Send, Download, ClipboardList } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/shared/empty-state'
import { ErrorState } from '@/components/shared/error-state'
import { EventPicker } from '@/components/events/event-picker'
import { useAsync } from '@/hooks/use-async'
import { eventsService } from '@/services/events.service'
import { reportsService, type ReportType } from '@/services/reports.service'
import { formatDateTime } from '@/lib/utils'
import { cn } from '@/lib/utils'

const reportTypes: { key: ReportType; label: string; icon: typeof UserCheck; description: string }[] = [
  { key: 'attendance', label: 'تقرير الحضور', icon: UserCheck, description: 'تفاصيل الحضور والغياب لكل ضيف' },
  { key: 'invitations', label: 'تقرير الدعوات', icon: MailOpen, description: 'حالة إنشاء واستخدام الدعوات' },
  { key: 'sending', label: 'تقرير الإرسال', icon: Send, description: 'نتائج إرسال الدعوات حسب القناة' },
]

export default function ReportsPage() {
  const [eventId, setEventId] = useState('')
  const [selectedType, setSelectedType] = useState<ReportType>('attendance')
  const [generatingFormat, setGeneratingFormat] = useState<'excel' | 'pdf' | null>(null)

  const {
    data: eventsRes,
    isLoading: eventsLoading,
    isError: eventsError,
    refetch: refetchEvents,
  } = useAsync(() => eventsService.list({ pageSize: 100 }), [])

  const events = eventsRes?.data ?? []
  const activeEventId = eventId || events[0]?.id || ''

  const {
    data: recentReports,
    isLoading: reportsLoading,
    refetch: refetchRecent,
  } = useAsync(() => reportsService.listRecent(activeEventId), [activeEventId])

  async function handleExport(format: 'excel' | 'pdf') {
    setGeneratingFormat(format)
    try {
      const result = await reportsService.generate(activeEventId, selectedType, format)
      toast.success(`تم إنشاء التقرير "${result.fileName}" بنجاح`)
      refetchRecent()
    } catch {
      toast.error('حدث خطأ أثناء إنشاء التقرير')
    } finally {
      setGeneratingFormat(null)
    }
  }

  if (eventsError) {
    return <ErrorState variant="network" title="تعذر تحميل قائمة المناسبات" onRetry={refetchEvents} />
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">التقارير</h1>
          <p className="mt-1 text-sm text-muted-foreground">أنشئ وصدّر تقارير مفصلة حول الحضور والدعوات والإرسال.</p>
        </div>
        {eventsLoading ? (
          <Skeleton className="h-10 w-64" />
        ) : events.length > 0 ? (
          <EventPicker events={events} value={activeEventId} onChange={setEventId} />
        ) : null}
      </div>

      {eventsLoading ? (
        <Skeleton className="h-56 w-full" />
      ) : events.length === 0 ? (
        <EmptyState icon={ClipboardList} title="لا توجد مناسبات بعد" description="أنشئ مناسبة أولًا لتتمكن من إنشاء التقارير." />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            {reportTypes.map((rt) => {
              const Icon = rt.icon
              const active = selectedType === rt.key
              return (
                <button
                  key={rt.key}
                  type="button"
                  onClick={() => setSelectedType(rt.key)}
                  className={cn(
                    'flex flex-col items-start gap-2 rounded-xl border p-4 text-start transition-colors',
                    active ? 'border-primary bg-primary/5' : 'border-border hover:bg-accent'
                  )}
                >
                  <span className={cn('flex h-10 w-10 items-center justify-center rounded-lg', active ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary')}>
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="font-semibold">{rt.label}</span>
                  <span className="text-xs text-muted-foreground">{rt.description}</span>
                </button>
              )
            })}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">تصدير التقرير</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                onClick={() => handleExport('excel')}
                loading={generatingFormat === 'excel'}
                disabled={generatingFormat !== null}
              >
                <FileSpreadsheet className="h-4 w-4" />
                تصدير Excel
              </Button>
              <Button
                variant="outline"
                onClick={() => handleExport('pdf')}
                loading={generatingFormat === 'pdf'}
                disabled={generatingFormat !== null}
              >
                <FileText className="h-4 w-4" />
                تصدير PDF
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">التقارير الأخيرة</CardTitle>
            </CardHeader>
            <CardContent>
              {reportsLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <Skeleton key={i} className="h-14 w-full" />
                  ))}
                </div>
              ) : !recentReports || recentReports.length === 0 ? (
                <EmptyState icon={ClipboardList} title="لا توجد تقارير سابقة" description="ستظهر هنا التقارير التي تُنشئها لهذه المناسبة." />
              ) : (
                <ul className="divide-y divide-border">
                  {recentReports.map((r) => (
                    <li key={r.id} className="flex items-center justify-between gap-3 py-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                          {r.format === 'excel' ? <FileSpreadsheet className="h-4.5 w-4.5" /> : <FileText className="h-4.5 w-4.5" />}
                        </span>
                        <div>
                          <p className="text-sm font-medium">
                            {reportTypes.find((rt) => rt.key === r.type)?.label ?? r.type}
                          </p>
                          <p className="text-xs text-muted-foreground">{formatDateTime(r.createdAt)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="uppercase">{r.format}</Badge>
                        <Button variant="ghost" size="icon" onClick={() => toast.info('رابط تحميل تجريبي')}>
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
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
