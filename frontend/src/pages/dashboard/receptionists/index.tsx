import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { ShieldCheck, CalendarDays, ExternalLink, Sparkles, Users, KeyRound, Plus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { EmptyState } from '@/components/shared/empty-state'
import { ErrorState } from '@/components/shared/error-state'
import { FullPageLoader } from '@/components/shared/loaders'
import { ReceptionistsTab } from '@/components/events/receptionists-tab'
import { useAsync } from '@/hooks/use-async'
import { eventsService } from '@/services/events.service'
import { useI18n } from '@/i18n'
import { formatDate } from '@/lib/utils'

export default function ReceptionistsManagementPage() {
  const { t, locale } = useI18n()
  const isAr = locale === 'ar'
  const [params, setParams] = useSearchParams()

  const {
    data: eventsRes,
    isLoading: eventsLoading,
    isError: eventsError,
    refetch: refetchEvents,
  } = useAsync(() => eventsService.list({ pageSize: 100 }), [])

  const events = eventsRes?.data || []
  const queryEventId = params.get('eventId')

  const [selectedEventId, setSelectedEventId] = useState<string>('')

  useEffect(() => {
    if (events.length > 0) {
      if (queryEventId && events.some((e) => e.id === queryEventId)) {
        setSelectedEventId(queryEventId)
      } else if (!selectedEventId) {
        setSelectedEventId(events[0].id)
      }
    }
  }, [events, queryEventId])

  function handleEventChange(id: string) {
    setSelectedEventId(id)
    setParams({ eventId: id })
  }

  const currentEvent = events.find((e) => e.id === selectedEventId) || events[0]

  if (eventsLoading) {
    return <FullPageLoader />
  }

  if (eventsError) {
    return <ErrorState variant="network" onRetry={refetchEvents} />
  }

  if (events.length === 0) {
    return (
      <EmptyState
        icon={CalendarDays}
        title={isAr ? 'لا توجد مناسبات بعد' : 'No events found'}
        description={
          isAr
            ? 'قم بإنشاء مناسبتك الأولى لتتمكن من تعيين موظفي الاستقبال وإدارة بوابات الدخول.'
            : 'Create your first event to assign reception staff and configure gate access.'
        }
        actionLabel={t.dashboard.createEvent}
        onAction={() => (window.location.href = '/dashboard/events/create')}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">
              {isAr ? 'فريق الاستقبال والبوابة' : 'Gate & Reception Team'}
            </h1>
            <Badge variant="outline" className="gap-1 text-xs py-0.5">
              <ShieldCheck className="h-3.5 w-3.5 text-primary" />
              <span>{isAr ? 'إدارة الوصول' : 'Access Control'}</span>
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {isAr
              ? 'إدارة موظفي البوابات، تحديد كلمات المرور، ورموز حماية الفعاليات (Event PIN) لمسح التذاكر.'
              : 'Manage gate staff credentials, event access PINs, and ticket scanning permissions.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Event Picker Dropdown */}
          <div className="w-full sm:w-64">
            <Select value={selectedEventId} onValueChange={handleEventChange}>
              <SelectTrigger className="w-full font-medium">
                <SelectValue placeholder={isAr ? 'اختر الفعالية...' : 'Select Event...'} />
              </SelectTrigger>
              <SelectContent>
                {events.map((ev) => (
                  <SelectItem key={ev.id} value={ev.id}>
                    {ev.title} ({formatDate(ev.date)})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Badge variant="secondary" className="gap-1.5 py-2 px-3 text-xs font-semibold">
            <span>📱 {isAr ? 'المسح عبر تطبيق الهاتف (Flutter)' : 'Scan via Flutter App'}</span>
          </Badge>
        </div>
      </div>

      {/* Selected Event Details & Receptionists Manager */}
      {currentEvent && (
        <ReceptionistsTab event={currentEvent} onEventUpdate={refetchEvents} />
      )}
    </div>
  )
}
