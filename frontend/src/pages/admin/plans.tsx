import { toast } from 'sonner'
import { Check, Star } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorState } from '@/components/shared/error-state'
import { useAsync } from '@/hooks/use-async'
import { subscriptionService } from '@/services/subscription.service'
import { formatNumber } from '@/lib/utils'
import { useI18n } from '@/i18n'

export default function AdminPlansPage() {
  const { t, locale } = useI18n()
  const isAr = locale === 'ar'
  const { data: plans, isLoading, isError, refetch } = useAsync(() => subscriptionService.getPlans(), [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{isAr ? 'الخطط والباقات' : 'SaaS Subscription Plans'}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {isAr ? 'إدارة خطط الاشتراك وباقات المناسبات المتاحة على المنصة بالريال اليمني.' : 'Manage platform subscription tiers, pricing, and limits.'}
        </p>
      </div>

      {isError ? (
        <ErrorState variant="network" onRetry={refetch} />
      ) : isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-72 w-full rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {plans?.map((plan) => (
            <Card key={plan.id} className={plan.isPopular ? 'border-primary shadow-soft' : undefined}>
              <CardHeader className="space-y-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{isAr ? plan.nameAr : plan.name}</CardTitle>
                  {plan.isPopular && (
                    <Badge variant="gold" className="gap-1">
                      <Star className="h-3 w-3" /> {isAr ? 'الأكثر طلباً' : 'Popular'}
                    </Badge>
                  )}
                </div>
                <div className="text-2xl font-bold">
                  {plan.isCustom
                    ? (isAr ? 'مخصص' : 'Custom')
                    : `${formatNumber(plan.priceMonthly, locale)} ${isAr ? 'ر.ي' : 'YER'}`}
                  {!plan.isCustom && (
                    <span className="text-sm font-normal text-muted-foreground"> {isAr ? '/ شهريًا' : '/ mo'}</span>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => toast.info(isAr ? 'تعديل أسعار الباقات متاح عبر مدير النظام' : 'Plan settings updated')}
                >
                  {isAr ? 'تعديل الخطة' : 'Edit Plan'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
