import { http, mockResolve } from '@/lib/http'
import { env } from '@/config/env'
import { mockPlans, mockCustomPlan, mockSubscription } from '@/mocks/plans'
import type { Plan } from '@/types'

function mapPlan(p: any): Plan {
  return {
    id: String(p.id),
    name: p.name,
    nameAr: p.name,
    priceMonthly: parseFloat(p.price) || 0,
    priceYearly: (parseFloat(p.price) || 0) * 10,
    maxInvitations: p.max_guests_per_event || 100,
    maxEvents: p.max_events || 1,
    maxUsers: p.max_receptionists || 1,
    features: [
      `حتى ${p.max_events} مناسبات`,
      `حتى ${p.max_guests_per_event} ضيف لكل مناسبة`,
      `حتى ${p.max_receptionists} موظف استقبال`,
      `صلاحية ${p.validity_days} يوم`,
    ],
  }
}

export const subscriptionService = {
  async getPlans(): Promise<Plan[]> {
    if (env.useMock) {
      return mockResolve([...mockPlans, mockCustomPlan])
    }
    try {
      const res = await http.get<{ success: boolean; data: any[] }>('/admin/plans')
      if (Array.isArray(res.data) && res.data.length > 0) {
        return res.data.map(mapPlan)
      }
      return [...mockPlans, mockCustomPlan]
    } catch {
      return [...mockPlans, mockCustomPlan]
    }
  },

  async createPlan(payload: any) {
    if (env.useMock) return mockResolve({ success: true })
    const res = await http.post<{ success: boolean; data: any }>('/admin/plans', payload)
    return res
  },

  async updatePlan(id: string, payload: any) {
    if (env.useMock) return mockResolve({ success: true })
    const res = await http.put<{ success: boolean; data: any }>(`/admin/plans/${id}`, payload)
    return res
  },

  async deletePlan(id: string) {
    if (env.useMock) return mockResolve({ success: true })
    const res = await http.delete<{ success: boolean }>(`/admin/plans/${id}`)
    return res
  },

  async getCurrentSubscription() {
    if (env.useMock) {
      return mockResolve(mockSubscription)
    }
    try {
      const res = await http.get<{ success: boolean; data: any }>('/admin/subscriptions')
      const sub = res.data?.data?.[0] || res.data?.[0]
      if (sub) {
        return {
          id: String(sub.id),
          planId: String(sub.plan_id),
          startedAt: sub.starts_at || sub.created_at,
          expiresAt: sub.ends_at,
          invitationsUsed: 12,
          invitationsLimit: sub.plan?.max_guests_per_event || 1000,
          storageUsedMb: 45,
          storageLimitMb: 500,
          status: sub.status as any,
        }
      }
      return mockSubscription
    } catch {
      return mockSubscription
    }
  },

  async getAdminSubscriptions() {
    if (env.useMock) return mockResolve([])
    const res = await http.get<{ success: boolean; data: any }>('/admin/subscriptions')
    return res.data?.data || (Array.isArray(res.data) ? res.data : [])
  },

  async getAdminPayments() {
    if (env.useMock) return mockResolve([])
    const res = await http.get<{ success: boolean; data: any }>('/admin/payments')
    return res.data?.data || (Array.isArray(res.data) ? res.data : [])
  },

  async changePlan(_planId: string) {
    await new Promise((r) => setTimeout(r, 800))
    return { success: true }
  },
}

