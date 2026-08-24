import { http, mockResolve } from '@/lib/http'
import { env } from '@/config/env'
import { mockUsers, mockAuditLogs } from '@/mocks/users'
import type { PaginatedResult, User, AuditLog, UserRole } from '@/types'

function mapRole(role: string): UserRole {
  if (role === 'super_admin' || role === 'admin') return 'admin'
  if (role === 'receptionist' || role === 'reception') return 'reception'
  return 'user'
}

function mapUser(u: any): User {
  return {
    id: String(u.id),
    name: u.name,
    email: u.email,
    phone: u.phone,
    avatarUrl: u.avatar_url,
    role: mapRole(u.role),
    planId: u.plan_id || 'plan-free',
    createdAt: u.created_at || new Date().toISOString(),
    status: u.role === 'suspended' ? 'suspended' : 'active',
  }
}

export const usersService = {
  async list(filters: { search?: string; status?: string; page?: number; pageSize?: number } = {}): Promise<PaginatedResult<User>> {
    if (env.useMock) {
      let data = [...mockUsers]
      if (filters.search) {
        const q = filters.search.toLowerCase()
        data = data.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
      }
      if (filters.status && filters.status !== 'all') data = data.filter((u) => u.status === filters.status)
      const page = filters.page || 1
      const pageSize = filters.pageSize || 10
      const start = (page - 1) * pageSize
      return mockResolve({ data: data.slice(start, start + pageSize), total: data.length, page, pageSize })
    }

    try {
      const params = new URLSearchParams()
      if (filters.search) params.append('search', filters.search)
      if (filters.status && filters.status !== 'all') params.append('status', filters.status)
      if (filters.page) params.append('page', String(filters.page))
      const qs = params.toString() ? `?${params.toString()}` : ''
      const res = await http.get<{ success: boolean; data: any }>(`/admin/users${qs}`)
      const rawUsers = res.data?.data || (Array.isArray(res.data) ? res.data : [])
      const items = rawUsers.map(mapUser)
      const total = res.data?.total ?? items.length

      return {
        data: items,
        total,
        page: filters.page || 1,
        pageSize: filters.pageSize || 15,
      }
    } catch {
      return { data: mockUsers, total: mockUsers.length, page: 1, pageSize: 10 }
    }
  },

  async create(payload: { name: string; email: string; phone?: string; password: string; role?: 'user' | 'reception' | 'admin' }): Promise<User> {
    if (env.useMock) {
      const newUser: User = {
        id: `user-${Date.now()}`,
        name: payload.name,
        email: payload.email,
        phone: payload.phone,
        role: payload.role || 'user',
        planId: 'plan-custom',
        status: 'active',
        createdAt: new Date().toISOString(),
      }
      mockUsers.unshift(newUser)
      return mockResolve(newUser)
    }
    const res = await http.post<{ success: boolean; data: any }>('/admin/users', payload)
    return mapUser(res.data)
  },

  async setStatus(id: string, _status: 'active' | 'suspended') {
    if (env.useMock) return mockResolve({ success: true })
    const res = await http.post<{ success: boolean }>(`/admin/users/${id}/toggle-status`)
    return res
  },

  async auditLogs(): Promise<AuditLog[]> {
    if (env.useMock) return mockResolve(mockAuditLogs)
    try {
      const res = await http.get<{ success: boolean; data: any[] }>('/admin/audit-logs')
      const logs = Array.isArray(res.data) ? res.data : []
      return logs.map((l: any) => ({
        id: String(l.id),
        actor: l.user?.name || l.actor || 'مستخدم',
        action: l.action || 'تسجيل عملية',
        target: l.table_name || l.target || 'النظام',
        createdAt: l.created_at || new Date().toISOString(),
        ip: l.ip_address || l.ip || '127.0.0.1',
      }))
    } catch {
      return mockAuditLogs
    }
  },
}

