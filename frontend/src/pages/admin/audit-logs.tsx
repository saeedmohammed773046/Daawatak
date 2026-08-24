import { useState } from 'react'
import { FileClock, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/shared/empty-state'
import { ErrorState } from '@/components/shared/error-state'
import { useAsync, useDebouncedValue } from '@/hooks/use-async'
import { usersService } from '@/services/users.service'
import { formatDateTime } from '@/lib/utils'
import { useI18n } from '@/i18n'

export default function AdminAuditLogsPage() {
  const { t, locale } = useI18n()
  const isAr = locale === 'ar'
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search)
  const { data: logs, isLoading, isError, refetch } = useAsync(() => usersService.auditLogs(), [])

  const filtered = (logs ?? []).filter((log) => {
    if (!debouncedSearch) return true
    const q = debouncedSearch.toLowerCase()
    return log.actor.toLowerCase().includes(q) || log.action.toLowerCase().includes(q) || log.target.toLowerCase().includes(q)
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{isAr ? 'سجل النشاطات' : 'System Audit Logs'}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {isAr ? 'تتبّع جميع الإجراءات والعمليات الأمنية التي تمت على المنصة.' : 'Track security events, administrator actions, and user logins.'}
        </p>
      </div>

      <div className="relative max-w-xs">
        <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder={isAr ? 'بحث في السجل...' : 'Search logs by actor, action, or target...'}
          className="ps-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isError ? (
        <ErrorState variant="network" title={isAr ? 'تعذر تحميل السجل' : 'Failed to load audit logs'} onRetry={refetch} />
      ) : isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={FileClock}
          title={isAr ? 'لا توجد نتائج' : 'No logs found'}
          description={isAr ? 'جرّب تعديل كلمة البحث.' : 'Try adjusting your search query.'}
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border/70 bg-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-start">{isAr ? 'المستخدم' : 'Actor'}</th>
                  <th className="px-3 py-3 text-start">{isAr ? 'الإجراء' : 'Action'}</th>
                  <th className="px-3 py-3 text-start">{isAr ? 'الهدف / السجل' : 'Target'}</th>
                  <th className="px-3 py-3 text-start">{isAr ? 'عنوان IP' : 'IP Address'}</th>
                  <th className="px-3 py-3 text-start">{t.common.date}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((log) => (
                  <tr key={log.id} className="hover:bg-muted/20">
                    <td className="px-4 py-3 font-medium">{log.actor}</td>
                    <td className="px-3 py-3 text-muted-foreground">{log.action}</td>
                    <td className="px-3 py-3 text-muted-foreground">{log.target}</td>
                    <td className="px-3 py-3 text-muted-foreground" dir="ltr">{log.ip}</td>
                    <td className="px-3 py-3 whitespace-nowrap text-muted-foreground">{formatDateTime(log.createdAt, locale)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
