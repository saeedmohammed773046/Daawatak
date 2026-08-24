import { ReceiptText } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/shared/empty-state'
import { ErrorState } from '@/components/shared/error-state'
import { useAsync } from '@/hooks/use-async'
import { usersService } from '@/services/users.service'
import { subscriptionService } from '@/services/subscription.service'
import { formatDate } from '@/lib/utils'
import { useI18n } from '@/i18n'

export default function AdminSubscriptionsPage() {
  const { t, locale } = useI18n()
  const isAr = locale === 'ar'
  const { data: usersRes, isLoading: usersLoading, isError, refetch } = useAsync(
    () => usersService.list({ pageSize: 100 }),
    []
  )
  const { data: plans, isLoading: plansLoading } = useAsync(() => subscriptionService.getPlans(), [])

  const isLoading = usersLoading || plansLoading
  const users = usersRes?.data ?? []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{isAr ? 'الاشتراكات' : 'User Subscriptions'}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {isAr ? 'استعرض اشتراكات جميع المستخدمين وباقاتهم الحالية.' : 'Review all registered users and their current subscription plans.'}
        </p>
      </div>

      {isError ? (
        <ErrorState variant="network" onRetry={refetch} />
      ) : isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : users.length === 0 ? (
        <EmptyState
          icon={ReceiptText}
          title={isAr ? 'لا توجد اشتراكات' : 'No subscriptions found'}
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border/70 bg-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-start">{isAr ? 'المستخدم' : 'User'}</th>
                  <th className="px-3 py-3 text-start">{isAr ? 'الخطة' : 'Plan'}</th>
                  <th className="px-3 py-3 text-start">{isAr ? 'تاريخ الانضمام' : 'Joined Date'}</th>
                  <th className="px-3 py-3 text-start">{t.common.status}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((u) => {
                  const plan = plans?.find((p) => p.id === u.planId)
                  return (
                    <tr key={u.id} className="hover:bg-muted/20">
                      <td className="px-4 py-3">
                        <p className="font-medium">{u.name}</p>
                        <p className="text-xs text-muted-foreground">{u.email}</p>
                      </td>
                      <td className="px-3 py-3">
                        <Badge variant={plan?.isPopular ? 'gold' : 'secondary'}>
                          {isAr ? (plan?.nameAr ?? u.planId) : (plan?.name ?? u.planId)}
                        </Badge>
                      </td>
                      <td className="px-3 py-3 text-muted-foreground">{formatDate(u.createdAt, locale)}</td>
                      <td className="px-3 py-3">
                        <Badge variant={u.status === 'active' ? 'success' : 'destructive'}>
                          {u.status === 'active' ? (isAr ? 'نشط' : 'Active') : (isAr ? 'معلّق' : 'Suspended')}
                        </Badge>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
