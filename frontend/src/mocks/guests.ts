import type { Guest, GuestCategory, GuestInvitationStatus, GuestAttendance } from '@/types'
import { mockEvents } from './events'

const firstNames = ['محمد', 'أحمد', 'سارة', 'نورة', 'فاطمة', 'عبدالله', 'خالد', 'مها', 'ريم', 'سلطان', 'لمى', 'عمر', 'هند', 'يوسف', 'جواهر', 'ناصر']
const lastNames = ['العتيبي', 'القحطاني', 'الدوسري', 'الشهري', 'السبيعي', 'الحربي', 'الغامدي', 'الزهراني', 'المالكي', 'العنزي']
const categories: GuestCategory[] = ['family', 'friends', 'work', 'vip', 'other']
const invStatuses: GuestInvitationStatus[] = ['not_created', 'ready', 'sent', 'used']
const attendances: GuestAttendance[] = ['pending', 'checked_in', 'no_show']

function pick<T>(arr: T[], seed: number) { return arr[seed % arr.length] }

function generateGuests(eventId: string, count: number, seedBase: number): Guest[] {
  return Array.from({ length: count }, (_, i) => {
    const seed = seedBase + i
    const name = `${pick(firstNames, seed)} ${pick(lastNames, seed + 3)}`
    const invitationStatus = pick(invStatuses, seed)
    const attendance: GuestAttendance = invitationStatus === 'used' ? 'checked_in' : pick(attendances, seed + 1)
    return {
      id: `guest-${eventId}-${i + 1}`,
      eventId,
      name,
      phone: `+9665${(10000000 + seed * 137) % 90000000}`,
      email: i % 3 === 0 ? `${name.replace(' ', '.')}@example.com` : undefined,
      category: pick(categories, seed + 2),
      notes: i % 7 === 0 ? 'يحتاج مقعد بجانب المدخل' : undefined,
      invitationStatus,
      attendance,
      checkedInAt: attendance === 'checked_in' ? new Date(Date.now() - seed * 60000).toISOString() : undefined,
      companions: seed % 4,
      createdAt: new Date(Date.now() - (count - i) * 3600000).toISOString(),
    }
  })
}

export const mockGuestsByEvent: Record<string, Guest[]> = mockEvents.reduce((acc, event, idx) => {
  acc[event.id] = generateGuests(event.id, Math.min(event.guestsCount, 60), idx * 17 + 1)
  return acc
}, {} as Record<string, Guest[]>)

export function getGuestsForEvent(eventId: string): Guest[] {
  return mockGuestsByEvent[eventId] || []
}
