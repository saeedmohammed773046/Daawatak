import { http, mockResolve } from '@/lib/http'
import { env } from '@/config/env'
import { getAnalyticsForEvent, getCheckInFeed, globalStats } from '@/mocks/analytics'

export const analyticsService = {
  async getEventAnalytics(eventId: string) {
    if (env.useMock) {
      return mockResolve(getAnalyticsForEvent(eventId))
    }
    try {
      const res = await http.get<{ success: boolean; data: any }>(`/events/${eventId}/analytics`)
      const d = res.data
      return {
        totalGuests: d.total_guests ?? 0,
        checkedIn: d.checked_in ?? d.total_checkins ?? 0,
        noShow: d.no_show ?? Math.max(0, (d.total_guests ?? 0) - (d.checked_in ?? 0)),
        pending: d.pending ?? 0,
        attendanceRate: d.attendance_rate ?? 0,
        hourlyCheckIns: d.hourly_checkins ?? [
          { hour: '8:00 م', count: 12 },
          { hour: '8:30 م', count: 28 },
          { hour: '9:00 م', count: 45 },
          { hour: '9:30 م', count: 15 },
        ],
        categoryBreakdown: d.category_breakdown ?? [
          { category: 'family', count: 40 },
          { category: 'friends', count: 30 },
          { category: 'vip', count: 10 },
          { category: 'work', count: 20 },
        ],
      }
    } catch {
      return getAnalyticsForEvent(eventId)
    }
  },

  async getCheckInFeed(eventId: string) {
    if (env.useMock) {
      return mockResolve(getCheckInFeed(eventId))
    }
    try {
      const res = await http.get<{ success: boolean; data: any }>(`/events/${eventId}/analytics`)
      return res.data?.recent_checkins || getCheckInFeed(eventId)
    } catch {
      return getCheckInFeed(eventId)
    }
  },

  async getGlobalStats() {
    if (env.useMock) {
      return mockResolve(globalStats)
    }
    try {
      const res = await http.get<{ success: boolean; data: any }>('/admin/dashboard/stats')
      const d = res.data
      const totalInvitations = d.attendance?.total_guests ?? 0
      const attended = d.attendance?.total_checkins ?? 0
      const absent = Math.max(0, totalInvitations - attended)
      const attendanceRate = totalInvitations > 0 ? Math.round((attended / totalInvitations) * 100) : 0
      return {
        totalUsers: d.users?.total ?? 0,
        activeEvents: d.events?.active ?? d.events?.total ?? 0,
        totalInvitations,
        attended,
        absent,
        attendanceRate,
        checkInRate: attendanceRate,
        recentActivity: (d.recent_users || []).map((u: any) => ({
          id: String(u.id),
          description: `تسجيل مستخدم جديد: ${u.name}`,
          timestamp: u.created_at ? new Date(u.created_at).toLocaleDateString('ar-SA') : 'اليوم',
        })),
      }
    } catch {
      return globalStats
    }
  },
}

