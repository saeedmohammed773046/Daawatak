import { mockResolve } from '@/lib/http'

export type ReportType = 'attendance' | 'invitations' | 'sending'

export const reportsService = {
  async generate(_eventId: string, _type: ReportType, _format: 'excel' | 'pdf'): Promise<{ url: string; fileName: string }> {
    await new Promise((r) => setTimeout(r, 1600))
    const ext = _format === 'excel' ? 'xlsx' : 'pdf'
    return { url: '#', fileName: `daawatak-${_type}-report.${ext}` }
  },
  async listRecent(eventId: string) {
    return mockResolve([
      { id: 'r-1', type: 'attendance', format: 'pdf', createdAt: new Date(Date.now() - 3600000).toISOString(), eventId },
      { id: 'r-2', type: 'invitations', format: 'excel', createdAt: new Date(Date.now() - 86400000).toISOString(), eventId },
    ])
  },
}
