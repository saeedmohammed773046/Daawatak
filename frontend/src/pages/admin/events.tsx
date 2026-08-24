import { useState } from 'react'
import { CalendarDays, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/shared/empty-state'
import { ErrorState } from '@/components/shared/error-state'
import { EventStatusBadge } from '@/components/events/event-status-badge'
import { eventTypeIcon } from '@/components/events/event-type-icon'
import { useAsync, useDebouncedValue } from '@/hooks/use-async'
import { eventsService } from '@/services/events.service'
import { formatDate, formatNumber } from '@/lib/utils'
import { useI18n } from '@/i18n'

export default function AdminEventsPage() {
  const { t, locale } = useI18n()
  const isAr = locale === 'ar'
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search)
  const { data, isLoading, isError, refetch } = useAsync(
    () => eventsService.list({ search: debouncedSearch, pageSize: 50 }),
    [debouncedSearch]
  )
  const events = data?.data ?? []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{isAr ? 'المناسبات' : 'Events Overview'}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {isAr ? 'استعرض جميع مناسبات المستخدمين على المنصة وتابع تفاصيلها.' : 'Browse all user events created across the platform.'}
        </p>
      </div>

      <div className="relative max-w-xs">
        <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder={isAr ? 'بحث عن مناسبة...' : 'Search events by name or venue...'}
          className="ps-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isError ? (
        <ErrorState variant="network" onRetry={refetch} />
      ) : isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : events.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title={isAr ? 'لا توجد مناسبات مطابقة' : 'No events found'}
          description={isAr ? 'جرّب تعديل كلمة البحث.' : 'Try adjusting your search terms.'}
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border/70 bg-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-start">{isAr ? 'المناسبة' : 'Event'}</th>
                  <th className="px-3 py-3 text-start">{t.common.date}</th>
                  <th className="px-3 py-3 text-start">{isAr ? 'المدينة / الموقع' : 'City / Venue'}</th>
                  <th className="px-3 py-3 text-start">{isAr ? 'المدعوون' : 'Guests'}</th>
                  <th className="px-3 py-3 text-start">{t.common.status}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {events.map((e) => {
                  const Icon = eventTypeIcon(e.type)
                  return (
                    <tr key={e.id} className="hover:bg-muted/20">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <Icon className="h-4 w-4" />
                          </span>
                          <p className="font-medium">{e.title}</p>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-muted-foreground">{formatDate(e.date, locale)}</td>
                      <td className="px-3 py-3 text-muted-foreground">{e.city || e.venue}</td>
                      <td className="px-3 py-3">{formatNumber(e.guestsCount || 0, locale)}</td>
                      <td className="px-3 py-3">
                        <EventStatusBadge status={e.status} />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
