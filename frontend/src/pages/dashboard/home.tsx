import { CalendarDays, CalendarClock, MailOpen, UserCheck, UserX, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useI18n } from '@/i18n'
import { Button } from '@/components/ui/button'
import { StatCard, StatCardSkeleton } from '@/components/dashboard/stat-card'
import { EventMiniCard } from '@/components/dashboard/event-mini-card'
import { EmptyState } from '@/components/shared/empty-state'
import { ErrorState } from '@/components/shared/error-state'
import { useAsync } from '@/hooks/use-async'
import { eventsService } from '@/services/events.service'
import { analyticsService } from '@/services/analytics.service'
import { useAuthStore } from '@/store/auth.store'
import { formatNumber, formatTime } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { CheckCircle2 } from 'lucide-react'

export default function DashboardHomePage() {
  const { t, locale } = useI18n()
  const { user } = useAuthStore()

  const { data: eventsData, isLoading, isError, refetch } = useAsync(() => eventsService.list({ pageSize: 100 }), [])
  const events = eventsData?.data || []
  const firstEventId = events[0]?.id
  const { data: checkinFeed } = useAsync(() => (firstEventId ? analyticsService.getCheckInFeed(firstEventId) : Promise.resolve([])), [firstEventId])

  const upcoming = events.filter((e) => e.status === 'upcoming' || e.status === 'ongoing').slice(0, 4)
  const totalInvitations = events.reduce((sum, e) => sum + e.invitationsCount, 0)
  const totalCheckedIn = events.reduce((sum, e) => sum + e.checkedInCount, 0)
  const totalAbsence = Math.max(totalInvitations - totalCheckedIn, 0)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold sm:text-2xl">
            {t.dashboard.welcomeBack}، {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {locale === 'ar' ? 'هذا ملخص سريع عن مناسباتك ودعواتك.' : 'Here is a quick overview of your events and invitations.'}
          </p>
        </div>
        <Button asChild>
          <Link to="/dashboard/events/create">
            <Plus className="h-4 w-4" /> {t.dashboard.createEvent}
          </Link>
        </Button>
      </div>

      {isError ? (
        <ErrorState variant="network" onRetry={refetch} />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => <StatCardSkeleton key={i} />)
            ) : (
              <>
                <StatCard icon={CalendarDays} label={t.dashboard.totalEvents} value={formatNumber(events.length, locale)} trend={8} />
                <StatCard
                  icon={CalendarClock}
                  label={t.dashboard.upcomingEvents}
                  value={formatNumber(events.filter((e) => e.status === 'upcoming').length, locale)}
                  colorClass="text-gold bg-gold/10"
                />
                <StatCard icon={MailOpen} label={t.dashboard.totalInvitations} value={formatNumber(totalInvitations, locale)} trend={14} />
                <StatCard
                  icon={UserCheck}
                  label={t.dashboard.attendance}
                  value={formatNumber(totalCheckedIn, locale)}
                  colorClass="text-success bg-success/10"
                  trend={5}
                />
                <StatCard
                  icon={UserX}
                  label={t.dashboard.absence}
                  value={formatNumber(totalAbsence, locale)}
                  colorClass="text-destructive bg-destructive/10"
                  trend={-3}
                />
              </>
            )}
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-base font-semibold">{t.dashboard.upcomingEvents}</h2>
                <Link to="/dashboard/events" className="text-sm font-medium text-primary hover:underline">
                  {t.common.seeAll}
                </Link>
              </div>
              {isLoading ? (
                <div className="flex flex-col gap-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full rounded-xl" />
                  ))}
                </div>
              ) : upcoming.length === 0 ? (
                <EmptyState
                  icon={CalendarDays}
                  title={t.dashboard.noEvents}
                  description={t.dashboard.noEventsDesc}
                  actionLabel={t.dashboard.createEvent}
                  onAction={() => (window.location.href = '/dashboard/events/create')}
                />
              ) : (
                <div className="flex flex-col gap-3">
                  {upcoming.map((event) => (
                    <EventMiniCard key={event.id} event={event} />
                  ))}
                </div>
              )}
            </div>

            <div>
              <h2 className="mb-3 text-base font-semibold">{t.dashboard.recentCheckins}</h2>
              <div className="rounded-xl border border-border/70 bg-card">
                {!checkinFeed || checkinFeed.length === 0 ? (
                  <EmptyState className="border-none" title={locale === 'ar' ? 'لا توجد عمليات دخول حتى الآن' : 'No check-ins yet'} />
                ) : (
                  <ul className="divide-y divide-border">
                    {checkinFeed.slice(0, 6).map((c: any) => (
                      <li key={c.id} className="flex items-center gap-3 px-4 py-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-success/10 text-success">
                          <CheckCircle2 className="h-4 w-4" />
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <p className="truncate text-sm font-medium">{c.guestName}</p>
                          <p className="text-xs text-muted-foreground">{c.gate}</p>
                        </div>
                        <span className="shrink-0 text-xs text-muted-foreground">{formatTime(c.time, locale)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
