import { http, mockResolve } from '@/lib/http'
import { env } from '@/config/env'
import { mockEvents, getEventById } from '@/mocks/events'
import type { EventItem, EventType, PaginatedResult } from '@/types'

export interface EventFilters {
  search?: string
  status?: string
  type?: string
  page?: number
  pageSize?: number
  sortBy?: 'date' | 'createdAt' | 'title'
  sortDir?: 'asc' | 'desc'
}

function mapEvent(e: any): EventItem {
  return {
    id: String(e.id),
    title: e.title || 'مناسبة',
    type: (e.category || e.type || 'special') as EventType,
    status: e.status || 'draft',
    date: e.event_date ? new Date(e.event_date).toISOString() : (e.date || new Date().toISOString()),
    time: e.start_time || e.time || '8:00 مساءً',
    venue: e.venue || '',
    city: e.city || (e.venue ? e.venue.split('،')[1]?.trim() : '') || 'الرياض',
    description: e.description || '',
    coverUrl: e.cover_image_url || e.coverUrl || '',
    accessPin: e.access_pin || e.accessPin || '123456',
    guestsCount: e.guests_count ?? e.guests?.length ?? e.guestsCount ?? 0,
    invitationsCount: e.invitations_count ?? e.invitationsCount ?? 0,
    checkedInCount: e.checked_in_count ?? e.attendance_logs_count ?? e.checkedInCount ?? 0,
    createdAt: e.created_at || e.createdAt || new Date().toISOString(),
  }
}

export const eventsService = {
  async list(filters: EventFilters = {}): Promise<PaginatedResult<EventItem>> {
    if (env.useMock) {
      let data = [...mockEvents]
      if (filters.search) {
        const q = filters.search.toLowerCase()
        data = data.filter((e) => e.title.toLowerCase().includes(q) || e.venue.toLowerCase().includes(q))
      }
      if (filters.status && filters.status !== 'all') {
        data = data.filter((e) => e.status === filters.status)
      }
      if (filters.type && filters.type !== 'all') {
        data = data.filter((e) => e.type === filters.type)
      }
      const sortBy = filters.sortBy || 'date'
      const sortDir = filters.sortDir || 'asc'
      data.sort((a, b) => {
        const av = sortBy === 'title' ? a.title : a[sortBy]
        const bv = sortBy === 'title' ? b.title : b[sortBy]
        const cmp = String(av).localeCompare(String(bv))
        return sortDir === 'asc' ? cmp : -cmp
      })
      const page = filters.page || 1
      const pageSize = filters.pageSize || 10
      const start = (page - 1) * pageSize
      const paged = data.slice(start, start + pageSize)
      return mockResolve({ data: paged, total: data.length, page, pageSize })
    }

    const res = await http.get<{ success: boolean; data: any[] }>('/events')
    let items = (Array.isArray(res.data) ? res.data : []).map(mapEvent)

    if (filters.search) {
      const q = filters.search.toLowerCase()
      items = items.filter((e) => e.title.toLowerCase().includes(q) || e.venue.toLowerCase().includes(q))
    }
    if (filters.status && filters.status !== 'all') {
      items = items.filter((e) => e.status === filters.status)
    }
    if (filters.type && filters.type !== 'all') {
      items = items.filter((e) => e.type === filters.type)
    }

    const page = filters.page || 1
    const pageSize = filters.pageSize || 10
    const start = (page - 1) * pageSize
    const paged = items.slice(start, start + pageSize)

    return { data: paged, total: items.length, page, pageSize }
  },

  async getById(id: string): Promise<EventItem | null> {
    if (env.useMock) {
      return mockResolve(getEventById(id) || null)
    }

    try {
      const res = await http.get<{ success: boolean; data: any }>(`/events/${id}`)
      return mapEvent(res.data)
    } catch {
      return null
    }
  },

  async create(payload: Partial<EventItem>): Promise<EventItem> {
    if (env.useMock) {
      const newEvent: EventItem = {
        id: `event-${Date.now()}`,
        title: payload.title || 'مناسبة جديدة',
        type: payload.type || 'special',
        status: 'draft',
        date: payload.date || new Date().toISOString(),
        time: payload.time || '7:00 مساءً',
        venue: payload.venue || '',
        city: payload.city || '',
        description: payload.description || '',
        coverUrl: payload.coverUrl || '',
        guestsCount: 0,
        invitationsCount: 0,
        checkedInCount: 0,
        createdAt: new Date().toISOString(),
      }
      return mockResolve(newEvent, 900)
    }

    const dateVal = payload.date ? payload.date.split('T')[0] : new Date().toISOString().split('T')[0]
    const res = await http.post<{ success: boolean; data: any }>('/events', {
      title: payload.title,
      description: payload.description,
      category: payload.type || 'wedding',
      event_date: dateVal,
      start_time: payload.time || '20:00:00',
      venue: payload.venue || 'قاعة الاحتفالات',
      cover_image_url: payload.coverUrl,
    })

    return mapEvent(res.data)
  },

  async update(id: string, payload: Partial<EventItem> & { googleMapsUrl?: string }): Promise<EventItem> {
    if (env.useMock) {
      const existing = getEventById(id)
      return mockResolve({ ...(existing as EventItem), ...payload })
    }

    let dateVal: string | undefined = undefined
    if (payload.date) {
      dateVal = payload.date.includes('T') ? payload.date.split('T')[0] : payload.date
    }

    const res = await http.put<{ success: boolean; data: any }>(`/events/${id}`, {
      title: payload.title,
      description: payload.description,
      category: payload.type,
      event_date: dateVal,
      start_time: payload.time,
      venue: payload.venue,
      status: payload.status,
      access_pin: payload.accessPin,
      google_maps_url: payload.googleMapsUrl,
      cover_image_url: payload.coverUrl,
    })

    return mapEvent(res.data)
  },

  async remove(id: string): Promise<{ success: boolean }> {
    if (env.useMock) return mockResolve({ success: true })
    await http.delete(`/events/${id}`)
    return { success: true }
  },

  async duplicate(id: string): Promise<EventItem> {
    if (env.useMock) {
      const existing = getEventById(id)
      return mockResolve({ ...(existing as EventItem), id: `event-copy-${Date.now()}`, title: `${existing?.title} (نسخة)` })
    }
    const res = await http.post<{ success: boolean; data: any }>(`/events/${id}/duplicate`)
    return mapEvent(res.data)
  },
}

