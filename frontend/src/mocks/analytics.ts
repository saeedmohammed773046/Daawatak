import type { AnalyticsSnapshot, CheckInRecord } from '@/types'
import { getGuestsForEvent } from './guests'

export function getAnalyticsForEvent(eventId: string): AnalyticsSnapshot {
  const guests = getGuestsForEvent(eventId)
  const totalGuests = guests.length
  const checkedIn = guests.filter((g) => g.attendance === 'checked_in').length
  const noShow = guests.filter((g) => g.attendance === 'no_show').length
  const pending = totalGuests - checkedIn - noShow
  const attendanceRate = totalGuests ? Math.round((checkedIn / totalGuests) * 1000) / 10 : 0

  const hourlyCheckIns = Array.from({ length: 8 }, (_, i) => ({
    hour: `${6 + i}:00`,
    count: Math.max(0, Math.round(checkedIn / 8 + (Math.sin(i) * checkedIn) / 12)),
  }))

  const categories = ['family', 'friends', 'work', 'vip', 'other'] as const
  const categoryBreakdown = categories.map((category) => ({
    category,
    count: guests.filter((g) => g.category === category).length,
  }))

  return { totalGuests, checkedIn, noShow, pending, attendanceRate, hourlyCheckIns, categoryBreakdown }
}

export function getCheckInFeed(eventId: string): CheckInRecord[] {
  const guests = getGuestsForEvent(eventId).filter((g) => g.attendance === 'checked_in' && g.checkedInAt)
  return guests
    .sort((a, b) => new Date(b.checkedInAt!).getTime() - new Date(a.checkedInAt!).getTime())
    .slice(0, 12)
    .map((g, i) => ({
      id: `checkin-${g.id}`,
      eventId,
      guestName: g.name,
      time: g.checkedInAt!,
      gate: `البوابة ${(i % 3) + 1}`,
      companions: g.companions,
    }))
}

export const globalStats = {
  totalInvitations: 8420,
  attended: 6103,
  absent: 2317,
  attendanceRate: 72.5,
}
