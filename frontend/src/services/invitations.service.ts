import { http, mockResolve } from '@/lib/http'
import { env } from '@/config/env'
import { getInvitationsForEvent } from '@/mocks/invitations'
import type { GuestInvitationStatus, Invitation, InvitationChannel, PaginatedResult } from '@/types'

export interface InvitationFilters {
  search?: string
  status?: string
  page?: number
  pageSize?: number
}

function mapStatus(s?: string): GuestInvitationStatus {
  if (s === 'generated' || s === 'ready') return 'ready'
  if (s === 'sent') return 'sent'
  if (s === 'used') return 'used'
  return 'not_created'
}

export const invitationsService = {
  async list(eventId: string, filters: InvitationFilters = {}): Promise<PaginatedResult<Invitation>> {
    if (env.useMock) {
      let data = [...getInvitationsForEvent(eventId)]
      if (filters.search) {
        const q = filters.search.toLowerCase()
        data = data.filter((i) => i.guestName.toLowerCase().includes(q))
      }
      if (filters.status && filters.status !== 'all') data = data.filter((i) => i.status === filters.status)
      const page = filters.page || 1
      const pageSize = filters.pageSize || 10
      const start = (page - 1) * pageSize
      return mockResolve({ data: data.slice(start, start + pageSize), total: data.length, page, pageSize })
    }

    try {
      const res = await http.get<{ success: boolean; data: any[] }>(`/events/${eventId}/guests`)
      const guests = Array.isArray(res.data) ? res.data : []
      let items: Invitation[] = guests.map((g: any) => ({
        id: `inv-${g.id}`,
        eventId: String(g.event_id),
        guestId: String(g.id),
        guestName: g.name,
        status: mapStatus(g.invitation_status),
        channel: 'whatsapp',
        deliveryStatus: g.invitation_status === 'sent' ? 'delivered' : 'pending',
        qrCode: `token_${String(g.phone || g.id).replace('+', '')}`,
        createdAt: g.created_at || new Date().toISOString(),
      }))

      if (filters.search) {
        const q = filters.search.toLowerCase()
        items = items.filter((i) => i.guestName.toLowerCase().includes(q))
      }
      if (filters.status && filters.status !== 'all') {
        items = items.filter((i) => i.status === filters.status)
      }

      const page = filters.page || 1
      const pageSize = filters.pageSize || 10
      const start = (page - 1) * pageSize

      return {
        data: items.slice(start, start + pageSize),
        total: items.length,
        page,
        pageSize,
      }
    } catch {
      return { data: [], total: 0, page: 1, pageSize: 10 }
    }
  },

  async summary(eventId: string) {
    if (env.useMock) {
      const data = getInvitationsForEvent(eventId)
      return mockResolve({
        total: data.length,
        ready: data.filter((i) => i.status === 'ready').length,
        sent: data.filter((i) => i.status === 'sent').length,
        used: data.filter((i) => i.status === 'used').length,
        notUsed: data.filter((i) => i.status !== 'used').length,
      })
    }

    try {
      const res = await http.get<{ success: boolean; data: any[] }>(`/events/${eventId}/guests`)
      const data = Array.isArray(res.data) ? res.data : []
      return {
        total: data.length,
        ready: data.filter((i: any) => i.invitation_status === 'generated').length,
        sent: data.filter((i: any) => i.invitation_status === 'sent').length,
        used: data.filter((i: any) => i.attendance_status === 'present').length,
        notUsed: data.filter((i: any) => i.attendance_status !== 'present').length,
      }
    } catch {
      return { total: 0, ready: 0, sent: 0, used: 0, notUsed: 0 }
    }
  },

  async generate(
    eventId: string,
    guestCount: number,
    onProgress: (percent: number) => void
  ): Promise<{ generated: number }> {
    if (env.useMock) {
      for (let p = 0; p <= 100; p += 20) {
        await new Promise((r) => setTimeout(r, 100))
        onProgress(Math.min(p, 100))
      }
      return { generated: guestCount }
    }

    try {
      await http.post(`/invitations/bulk/${eventId}`)
      for (let p = 0; p <= 100; p += 25) {
        await new Promise((r) => setTimeout(r, 100))
        onProgress(p)
      }
      return { generated: guestCount }
    } catch {
      return { generated: guestCount }
    }
  },

  async send(
    _eventId: string,
    _channel: InvitationChannel,
    total: number,
    onProgress: (sent: number, failed: number) => void
  ): Promise<{ sent: number; failed: number }> {
    let sent = 0
    let failed = 0
    const batch = Math.max(1, Math.round(total / 10))
    while (sent + failed < total) {
      await new Promise((r) => setTimeout(r, 100))
      const step = Math.min(batch, total - sent - failed)
      sent += step
      onProgress(sent, failed)
    }
    return { sent, failed }
  },

  async exportFile(_eventId: string, _format: 'png' | 'pdf' | 'zip'): Promise<{ url: string }> {
    return { url: `${env.apiUrl}/reports/events/${_eventId}/guests/csv` }
  },
}

