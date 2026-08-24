import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, CalendarDays, MoreVertical, Eye, Pencil, Archive, Trash2, MapPin, Users } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { EmptyState } from '@/components/shared/empty-state'
import { ErrorState } from '@/components/shared/error-state'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { EventStatusBadge } from '@/components/events/event-status-badge'
import { eventTypeIcon } from '@/components/events/event-type-icon'
import { useAsync, useDebouncedValue } from '@/hooks/use-async'
import { eventsService } from '@/services/events.service'
import { formatDate, formatNumber } from '@/lib/utils'
import { useI18n } from '@/i18n'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'

export default function EventsListPage() {
  const { t, locale } = useI18n()
  const isAr = locale === 'ar'
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [type, setType] = useState('all')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const debouncedSearch = useDebouncedValue(search)

  const { data, isLoading, isError, refetch } = useAsync(
    () => eventsService.list({ search: debouncedSearch, status, type, pageSize: 50 }),
    [debouncedSearch, status, type]
  )

  const events = data?.data || []

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold sm:text-2xl">{t.dashboard.events}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isAr ? 'تصفح، أنشئ، وتابع جميع مناسباتك من مكان واحد.' : 'Browse, create, and manage all your events from one place.'}
          </p>
        </div>
        <Button asChild>
          <Link to="/dashboard/events/create">
            <Plus className="h-4 w-4" /> {t.dashboard.createEvent}
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 -translate-y-1/2 start-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={isAr ? 'ابحث باسم المناسبة أو الموقع...' : 'Search by event title or venue...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="ps-9"
          />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder={t.common.status} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{isAr ? 'كل الحالات' : 'All Statuses'}</SelectItem>
            <SelectItem value="draft">{isAr ? 'مسودة' : 'Draft'}</SelectItem>
            <SelectItem value="upcoming">{isAr ? 'قادمة' : 'Upcoming'}</SelectItem>
            <SelectItem value="ongoing">{isAr ? 'جارية الآن' : 'Ongoing'}</SelectItem>
            <SelectItem value="completed">{isAr ? 'مكتملة' : 'Completed'}</SelectItem>
            <SelectItem value="archived">{isAr ? 'مؤرشفة' : 'Archived'}</SelectItem>
          </SelectContent>
        </Select>
        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder={isAr ? 'النوع' : 'Type'} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{isAr ? 'كل الأنواع' : 'All Types'}</SelectItem>
            <SelectItem value="wedding">{t.eventTypes.wedding}</SelectItem>
            <SelectItem value="engagement">{t.eventTypes.engagement}</SelectItem>
            <SelectItem value="religious">{t.eventTypes.religious}</SelectItem>
            <SelectItem value="graduation">{t.eventTypes.graduation}</SelectItem>
            <SelectItem value="birthday">{t.eventTypes.birthday}</SelectItem>
            <SelectItem value="conference">{t.eventTypes.conference}</SelectItem>
            <SelectItem value="training">{t.eventTypes.training}</SelectItem>
            <SelectItem value="meeting">{t.eventTypes.meeting}</SelectItem>
            <SelectItem value="opening">{t.eventTypes.opening}</SelectItem>
            <SelectItem value="special">{t.eventTypes.special}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isError ? (
        <ErrorState variant="network" onRetry={refetch} />
      ) : isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full rounded-xl" />
          ))}
        </div>
      ) : events.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title={t.dashboard.noEvents}
          description={isAr ? 'لم يتم العثور على مناسبات تطابق البحث الحالي.' : 'No events found matching your search criteria.'}
          actionLabel={t.dashboard.createEvent}
          onAction={() => (window.location.href = '/dashboard/events/create')}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => {
            const Icon = eventTypeIcon(event.type)
            return (
              <div key={event.id} className="group flex flex-col gap-4 rounded-xl border border-border/70 bg-card p-5 transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-elevated">
                <div className="flex items-start justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-5.5 w-5.5" />
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent" aria-label="options">
                        <MoreVertical className="h-4.5 w-4.5" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link to={`/dashboard/events/${event.id}`}>
                          <Eye className="h-4 w-4" /> {t.common.view}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to={`/dashboard/events/${event.id}?edit=1`}>
                          <Pencil className="h-4 w-4" /> {t.common.edit}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Archive className="h-4 w-4" /> {isAr ? 'أرشفة' : 'Archive'}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setDeleteId(event.id)} className="text-destructive focus:text-destructive">
                        <Trash2 className="h-4 w-4" /> {t.common.delete}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <Link to={`/dashboard/events/${event.id}`}>
                  <h3 className="line-clamp-1 text-base font-semibold group-hover:text-primary">{event.title}</h3>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <CalendarDays className="h-3.5 w-3.5" /> {formatDate(event.date, locale)}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" /> {event.city || event.venue}
                    </span>
                  </div>
                </Link>

                <div className="flex items-center justify-between border-t border-border pt-3">
                  <span className="flex items-center gap-1.5 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" /> {formatNumber(event.guestsCount || 0, locale)} {isAr ? 'مدعو' : 'guests'}
                  </span>
                  <EventStatusBadge status={event.status} />
                </div>
              </div>
            )
          })}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(v) => !v && setDeleteId(null)}
        title={isAr ? 'هل أنت متأكد من حذف هذه المناسبة؟' : 'Are you sure you want to delete this event?'}
        description={isAr ? 'سيتم حذف جميع البيانات المرتبطة بالمناسبة بما في ذلك المدعوين والدعوات، ولا يمكن التراجع عن هذا الإجراء.' : 'All event data including guests and invitations will be permanently removed.'}
        onConfirm={async () => {
          if (!deleteId) return
          await eventsService.remove(deleteId)
          toast.success(isAr ? 'تم حذف المناسبة بنجاح' : 'Event deleted successfully')
          setDeleteId(null)
          refetch()
        }}
      />
    </div>
  )
}
