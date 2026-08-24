import type { Invitation, InvitationChannel, InvitationDeliveryStatus } from '@/types'
import { getGuestsForEvent } from './guests'
import { mockEvents } from './events'

function pick<T>(arr: T[], seed: number) { return arr[seed % arr.length] }
const channels: InvitationChannel[] = ['whatsapp', 'email', 'sms', 'link']
const deliveries: InvitationDeliveryStatus[] = ['pending', 'sent', 'delivered', 'failed']

export const mockInvitationsByEvent: Record<string, Invitation[]> = mockEvents.reduce((acc, event) => {
  const guests = getGuestsForEvent(event.id)
  acc[event.id] = guests
    .filter((g) => g.invitationStatus !== 'not_created')
    .map((g, i) => ({
      id: `inv-${g.id}`,
      eventId: event.id,
      guestId: g.id,
      guestName: g.name,
      status: g.invitationStatus,
      channel: g.invitationStatus !== 'ready' ? pick(channels, i) : undefined,
      deliveryStatus: g.invitationStatus !== 'ready' ? pick(deliveries, i) : undefined,
      qrCode: `DWTK-${event.id}-${g.id}`.toUpperCase(),
      createdAt: g.createdAt,
      sentAt: g.invitationStatus !== 'ready' ? g.createdAt : undefined,
      usedAt: g.invitationStatus === 'used' ? g.checkedInAt : undefined,
    }))
  return acc
}, {} as Record<string, Invitation[]>)

export function getInvitationsForEvent(eventId: string): Invitation[] {
  return mockInvitationsByEvent[eventId] || []
}
