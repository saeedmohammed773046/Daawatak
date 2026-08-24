import { Link } from 'react-router-dom'
import { CalendarDays, MapPin, Users } from 'lucide-react'
import type { EventItem } from '@/types'
import { formatDate } from '@/lib/utils'
import { EventStatusBadge } from '@/components/events/event-status-badge'
import { eventTypeIcon } from '@/components/events/event-type-icon'

export function EventMiniCard({ event }: { event: EventItem }) {
  const Icon = eventTypeIcon(event.type)
  return (
    <Link
      to={`/dashboard/events/${event.id}`}
      className="flex items-center gap-4 rounded-xl border border-border/70 bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-card"
    >
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="h-6 w-6" />
      </div>
      <div className="flex-1 overflow-hidden">
        <div className="flex items-center justify-between gap-2">
          <h4 className="truncate text-sm font-semibold">{event.title}</h4>
          <EventStatusBadge status={event.status} />
        </div>
        <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <CalendarDays className="h-3.5 w-3.5" /> {formatDate(event.date)}
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" /> {event.city}
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" /> {event.guestsCount}
          </span>
        </div>
      </div>
    </Link>
  )
}
