import { http, mockResolve } from '@/lib/http'
import { env } from '@/config/env'
import type { ReceptionistStaff } from '@/types'

const mockEventReceptionists: Record<string, ReceptionistStaff[]> = {
  'event-1': [
    {
      id: 'rec-1',
      name: 'عمر باعباد (بوابة الرجال)',
      email: 'omar.gate1@daawatak.com',
      phone: '771234567',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'rec-2',
      name: 'سارة الكاف (بوابة النساء)',
      email: 'sara.gate2@daawatak.com',
      phone: '777654321',
      createdAt: new Date().toISOString(),
    },
  ],
}

export const receptionistsService = {
  async list(eventId: string): Promise<ReceptionistStaff[]> {
    if (env.useMock) {
      return mockResolve(mockEventReceptionists[eventId] || [])
    }
    try {
      const res = await http.get<{ success: boolean; data: any[] }>(`/events/${eventId}/receptionists`)
      const raw = res.data || []
      return raw.map((u: any) => ({
        id: String(u.id),
        name: u.name,
        email: u.email,
        phone: u.phone,
        createdAt: u.created_at,
      }))
    } catch {
      return mockEventReceptionists[eventId] || []
    }
  },

  async create(
    eventId: string,
    payload: { name: string; password: string }
  ): Promise<ReceptionistStaff> {
    if (env.useMock) {
      const newStaff: ReceptionistStaff = {
        id: `rec-${Date.now()}`,
        name: payload.name,
        password: payload.password,
        createdAt: new Date().toISOString(),
      }
      if (!mockEventReceptionists[eventId]) {
        mockEventReceptionists[eventId] = []
      }
      mockEventReceptionists[eventId].unshift(newStaff)
      return mockResolve(newStaff)
    }

    const res = await http.post<{ success: boolean; message: string; data: any }>(
      `/events/${eventId}/receptionists`,
      payload
    )
    return {
      id: String(res.data.id),
      name: res.data.name,
      password: res.data.password || payload.password,
      email: res.data.email,
      phone: res.data.phone,
      createdAt: res.data.created_at || new Date().toISOString(),
    }
  },

  async delete(eventId: string, userId: string): Promise<{ success: boolean; message: string }> {
    if (env.useMock) {
      if (mockEventReceptionists[eventId]) {
        mockEventReceptionists[eventId] = mockEventReceptionists[eventId].filter((r) => r.id !== userId)
      }
      return mockResolve({ success: true, message: 'تم حذف موظف الاستقبال بنجاح' })
    }

    const res = await http.delete<{ success: boolean; message: string }>(`/events/${eventId}/receptionists/${userId}`)
    return res
  },

  async updateAccessPin(eventId: string, pin: string): Promise<{ success: boolean; pin: string }> {
    if (env.useMock) {
      return mockResolve({ success: true, pin })
    }
    await http.put(`/events/${eventId}`, { access_pin: pin })
    return { success: true, pin }
  },
}
