import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import type { EventItem } from '@/types'
import { formatDate } from '@/lib/utils'

export function EventPicker({
  events,
  value,
  onChange,
}: {
  events: EventItem[]
  value: string
  onChange: (id: string) => void
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full sm:w-72">
        <SelectValue placeholder="اختر مناسبة" />
      </SelectTrigger>
      <SelectContent>
        {events.map((event) => (
          <SelectItem key={event.id} value={event.id}>
            {event.title} — {formatDate(event.date)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
