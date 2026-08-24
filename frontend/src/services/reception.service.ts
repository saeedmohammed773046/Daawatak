import { http, mockResolve } from '@/lib/http'
import { env } from '@/config/env'
import { mockEvents } from '@/mocks/events'

export type ScanResultStatus = 'success' | 'used' | 'invalid' | 'expired'

export const receptionService = {
  async listEvents() {
    if (env.useMock) {
      return mockResolve(mockEvents.filter((e) => e.status === 'upcoming' || e.status === 'ongoing'))
    }
    const res = await http.get<{ success: boolean; data: any[] }>('/reception/events')
    return res.data || []
  },

  async verifyPin(eventId: string, pin: string): Promise<{ success: boolean; message?: string }> {
    if (env.useMock) {
      return mockResolve({ success: pin === '123456' || pin.length === 6 })
    }
    const res = await http.post<{ success: boolean; message: string }>('/reception/verify-pin', {
      event_id: eventId,
      pin,
    })
    return { success: res.success, message: res.message }
  },

  async scanCode(code: string, eventId?: string): Promise<{ status: ScanResultStatus; companions?: number; guestName?: string }> {
    if (env.useMock || !eventId) {
      await new Promise((r) => setTimeout(r, 600))
      const hash = code.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
      const mod = hash % 10
      if (mod < 6) return { status: 'success', companions: mod % 4 }
      if (mod < 8) return { status: 'used' }
      if (mod < 9) return { status: 'expired' }
      return { status: 'invalid' }
    }

    const res = await http.post<{ success: boolean; data: { verification_result: string } }>('/reception/verify', {
      event_id: eventId,
      token: code,
      device_info: typeof navigator !== 'undefined' ? navigator.userAgent : 'Web Reception Portal',
    })

    const result = res.data?.verification_result
    if (result === 'ACCEPTED') return { status: 'success', companions: 0 }
    if (result === 'ALREADY_USED') return { status: 'used' }
    if (result === 'EXPIRED') return { status: 'expired' }
    return { status: 'invalid' }
  },
}

