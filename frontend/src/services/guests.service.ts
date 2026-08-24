import { http, mockResolve } from '@/lib/http'
import { env } from '@/config/env'
import { getGuestsForEvent } from '@/mocks/guests'
import type { Guest, GuestAttendance, GuestCategory, GuestInvitationStatus, PaginatedResult } from '@/types'

export interface GuestFilters {
  search?: string
  category?: string
  invitationStatus?: string
  attendance?: string
  page?: number
  pageSize?: number
}

function mapInvitationStatus(status?: string): GuestInvitationStatus {
  if (status === 'generated' || status === 'ready') return 'ready'
  if (status === 'sent') return 'sent'
  if (status === 'used') return 'used'
  return 'not_created'
}

function mapAttendance(status?: string): GuestAttendance {
  if (status === 'present' || status === 'checked_in') return 'checked_in'
  if (status === 'no_show') return 'no_show'
  return 'pending'
}

function mapGuest(g: any): Guest {
  return {
    id: String(g.id),
    eventId: String(g.event_id || g.eventId),
    name: g.name,
    phone: g.phone || '',
    email: g.email || '',
    category: (g.category || 'family') as GuestCategory,
    notes: g.notes || '',
    invitationStatus: mapInvitationStatus(g.invitation_status || g.invitationStatus),
    attendance: mapAttendance(g.attendance_status || g.attendance),
    checkedInAt: g.checked_in_at || g.checkedInAt,
    companions: g.companions_count ?? g.companions ?? 0,
    createdAt: g.created_at || g.createdAt || new Date().toISOString(),
  }
}

export const guestsService = {
  async list(eventId: string, filters: GuestFilters = {}): Promise<PaginatedResult<Guest>> {
    if (env.useMock) {
      let data = [...getGuestsForEvent(eventId)]
      if (filters.search) {
        const q = filters.search.toLowerCase()
        data = data.filter((g) => g.name.toLowerCase().includes(q) || g.phone.includes(q))
      }
      if (filters.category && filters.category !== 'all') data = data.filter((g) => g.category === filters.category)
      if (filters.invitationStatus && filters.invitationStatus !== 'all')
        data = data.filter((g) => g.invitationStatus === filters.invitationStatus)
      if (filters.attendance && filters.attendance !== 'all') data = data.filter((g) => g.attendance === filters.attendance)

      const page = filters.page || 1
      const pageSize = filters.pageSize || 10
      const start = (page - 1) * pageSize
      const paged = data.slice(start, start + pageSize)
      return mockResolve({ data: paged, total: data.length, page, pageSize })
    }

    const res = await http.get<{ success: boolean; data: any[] }>(`/events/${eventId}/guests`)
    let items = (Array.isArray(res.data) ? res.data : []).map(mapGuest)

    if (filters.search) {
      const q = filters.search.toLowerCase()
      items = items.filter((g) => g.name.toLowerCase().includes(q) || g.phone.includes(q))
    }
    if (filters.category && filters.category !== 'all') items = items.filter((g) => g.category === filters.category)
    if (filters.invitationStatus && filters.invitationStatus !== 'all')
      items = items.filter((g) => g.invitationStatus === filters.invitationStatus)
    if (filters.attendance && filters.attendance !== 'all') items = items.filter((g) => g.attendance === filters.attendance)

    const page = filters.page || 1
    const pageSize = filters.pageSize || 10
    const start = (page - 1) * pageSize
    const paged = items.slice(start, start + pageSize)

    return { data: paged, total: items.length, page, pageSize }
  },

  async create(eventId: string, payload: Partial<Guest>): Promise<Guest> {
    if (env.useMock) {
      const guest: Guest = {
        id: `guest-${Date.now()}`,
        eventId,
        name: payload.name || '',
        phone: payload.phone || '',
        email: payload.email,
        category: payload.category || 'other',
        notes: payload.notes,
        invitationStatus: 'not_created',
        attendance: 'pending',
        companions: payload.companions || 0,
        createdAt: new Date().toISOString(),
      }
      return mockResolve(guest, 700)
    }

    const res = await http.post<{ success: boolean; data: any }>(`/events/${eventId}/guests`, {
      name: payload.name,
      phone: payload.phone,
      email: payload.email,
      companions_count: payload.companions || 0,
      notes: payload.notes,
    })

    return mapGuest(res.data)
  },

  async update(id: string, payload: Partial<Guest>): Promise<Guest> {
    if (env.useMock) {
      return mockResolve(payload as Guest)
    }

    const res = await http.put<{ success: boolean; data: any }>(`/guests/${id}`, {
      name: payload.name,
      phone: payload.phone,
      email: payload.email,
      companions_count: payload.companions,
      notes: payload.notes,
      invitation_status: payload.invitationStatus === 'ready' ? 'generated' : payload.invitationStatus,
      attendance_status: payload.attendance === 'checked_in' ? 'present' : payload.attendance === 'no_show' ? 'absent' : undefined,
    })

    return mapGuest(res.data)
  },

  async remove(id: string): Promise<{ success: boolean }> {
    if (env.useMock) return mockResolve({ success: true })
    await http.delete(`/guests/${id}`)
    return { success: true }
  },

  async bulkRemove(ids: string[]): Promise<{ success: boolean; count: number }> {
    if (env.useMock) return mockResolve({ success: true, count: ids.length })
    await Promise.all(ids.map((id) => http.delete(`/guests/${id}`)))
    return { success: true, count: ids.length }
  },

  async importPreview(file: File): Promise<{
    totalRows: number
    validRows: number
    reviewRows: number
    errorRows: number
    sample: Partial<Guest>[]
  }> {
    const text = await file.text()
    const lines = text.split('\n').filter((l) => l.trim().length > 0)
    const headers = lines[0]?.split(',').map((h) => h.trim()) || []

    const sample: Partial<Guest>[] = []
    let validCount = 0

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',').map((c) => c.trim())
      if (cols[0]) {
        validCount++
        if (sample.length < 5) {
          sample.push({
            name: cols[0] || '',
            phone: cols[1] || '',
            email: cols[2] || '',
            companions: parseInt(cols[3] || '0', 10) || 0,
            category: 'family',
          })
        }
      }
    }

    return {
      totalRows: lines.length > 1 ? lines.length - 1 : 0,
      validRows: validCount,
      reviewRows: 0,
      errorRows: (lines.length > 1 ? lines.length - 1 : 0) - validCount,
      sample: sample.length > 0 ? sample : [
        { name: 'عبدالرحمن السالم', phone: '+966501112233', category: 'family' },
        { name: 'منيرة الفهد', phone: '+966502223344', category: 'friends' },
      ],
    }
  },

  async confirmImport(eventId: string, guestsList: Partial<Guest>[]): Promise<{ imported: number }> {
    if (env.useMock) {
      return mockResolve({ imported: guestsList.length })
    }

    const payload = guestsList.map((g) => ({
      name: g.name || 'ضيف',
      phone: g.phone || null,
      email: g.email || null,
      companions_count: g.companions || 0,
      notes: g.notes || null,
    }))

    const res = await http.post<{ success: boolean; data: any[] }>(`/events/${eventId}/guests/import`, {
      guests: payload,
    })

    return { imported: Array.isArray(res.data) ? res.data.length : guestsList.length }
  },
}

