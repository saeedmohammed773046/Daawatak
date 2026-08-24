import { useState } from 'react'
import { toast } from 'sonner'
import {
  CreditCard,
  Check,
  Sparkles,
  Building2,
  Crown,
  Gem,
  HardDrive,
  MailOpen,
  Loader2,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorState } from '@/components/shared/error-state'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { useAsync } from '@/hooks/use-async'
import { subscriptionService } from '@/services/subscription.service'
import { cn, formatDate, formatNumber, formatPercent } from '@/lib/utils'
import type { Plan } from '@/types'

const planIcon = (plan: Plan) => {
  if (plan.isCustom) return Building2
  if (plan.id === 'plan-free') return Sparkles
  if (plan.id === 'plan-business') return Crown
  return Gem
}

export default function SubscriptionPage() {
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly')
  const [confirmPlan, setConfirmPlan] = useState<Plan | null>(null)
  const [changing, setChanging] = useState(false)

  const {
    data: plans,
    isLoading: plansLoading,
    isError: plansError,
    refetch: refetchPlans,
  } = useAsync(() => subscriptionService.getPlans(), [])

  const {
    data: subscription,
    isLoading: subLoading,
    isError: subError,
    refetch: refetchSub,
  } = useAsync(() => subscriptionService.getCurrentSubscription(), [])

  const currentPlan = plans?.find((p) => p.id === subscription?.planId)

  async function handleConfirmChange() {
    if (!confirmPlan) return
    setChanging(true)
    try {
      await subscriptionService.changePlan(confirmPlan.id)
      toast.success(`تم تغيير خطتك إلى "${confirmPlan.nameAr}" بنجاح`)
      setConfirmPlan(null)
      refetchSub()
    } catch {
      toast.error('حدث خطأ أثناء تغيير الخطة، حاول مرة أخرى')
    } finally {
      setChanging(false)
    }
  }

  if (plansError || subError) {
    return (
      <ErrorState
        variant="network"
        title="تعذر تحميل بيانات الاشتراك"
        onRetry={() => {
          refetchPlans()
          refetchSub()
        }}
      />
    )
  }

  const invitationsPct = subscription
    ? Math.min(100, Math.round((subscription.invitationsUsed / subscription.invitationsLimit) * 100))
    : 0
  const storagePct = subscription
    ? Math.min(100, Math.round((subscription.storageUsedMb / subscription.storageLimitMb) * 100))
    : 0

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">الاشتراك والخطط</h1>
        <p className="mt-1 text-sm text-muted-foreground">تابع استخدامك الحالي واختر الخطة المناسبة لاحتياجاتك.</p>
      </div>

      {/* Current subscription summary */}
      {subLoading || plansLoading ? (
        <Card>
          <CardContent className="grid gap-4 p-6 sm:grid-cols-2">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>
      ) : subscription && currentPlan ? (
        <Card className="overflow-hidden border-none bg-brand-gradient text-white shadow-elevated">
          <div className="bg-mesh">
            <CardContent className="grid gap-6 p-6 sm:grid-cols-[1fr_auto] sm:items-center">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant="gold" className="gap-1">
                    <CreditCard className="h-3.5 w-3.5" />
                    خطتك الحالية
                  </Badge>
                  {subscription.status === 'active' && (
                    <Badge variant="secondary" className="bg-white/15 text-white">
                      نشط
                    </Badge>
                  )}
                </div>
                <h2 className="text-2xl font-bold">{currentPlan.nameAr}</h2>
                <p className="text-sm text-white/80">
                  تاريخ التجديد: {formatDate(subscription.expiresAt)}
                </p>

                <div className="grid gap-4 pt-2 sm:grid-cols-2">
                  <div>
                    <div className="mb-1.5 flex items-center justify-between text-xs text-white/80">
                      <span className="flex items-center gap-1">
                        <MailOpen className="h-3.5 w-3.5" /> الدعوات المستخدمة
                      </span>
                      <span>
                        {formatNumber(subscription.invitationsUsed)} / {formatNumber(subscription.invitationsLimit)}
                      </span>
                    </div>
                    <Progress value={invitationsPct} className="h-2 bg-white/20" indicatorClassName="bg-white" />
                  </div>
                  <div>
                    <div className="mb-1.5 flex items-center justify-between text-xs text-white/80">
                      <span className="flex items-center gap-1">
                        <HardDrive className="h-3.5 w-3.5" /> مساحة التخزين
                      </span>
                      <span>
                        {formatNumber(subscription.storageUsedMb)} / {formatNumber(subscription.storageLimitMb)} MB
                      </span>
                    </div>
                    <Progress value={storagePct} className="h-2 bg-white/20" indicatorClassName="bg-white" />
                  </div>
                </div>
              </div>
            </CardContent>
          </div>
        </Card>
      ) : null}

      {/* Billing toggle */}
      <div className="flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => setBilling('monthly')}
          className={cn(
            'rounded-full px-4 py-2 text-sm font-medium transition-colors',
            billing === 'monthly' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
          )}
        >
          شهري
        </button>
        <button
          type="button"
          onClick={() => setBilling('yearly')}
          className={cn(
            'rounded-full px-4 py-2 text-sm font-medium transition-colors',
            billing === 'yearly' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
          )}
        >
          سنوي
          <Badge variant="success" className="ms-2">
            وفّر أكثر
          </Badge>
        </button>
      </div>

      {/* Plans grid */}
      {plansLoading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-80 w-full" />
          ))}
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {plans?.map((plan) => {
            const Icon = planIcon(plan)
            const isCurrent = plan.id === subscription?.planId
            const price = plan.isCustom ? null : billing === 'monthly' ? plan.priceMonthly : plan.priceYearly

            return (
              <Card
                key={plan.id}
                className={cn(
                  'relative flex flex-col',
                  plan.isPopular && 'border-primary shadow-elevated',
                  isCurrent && 'ring-2 ring-primary'
                )}
              >
                {plan.isPopular && (
                  <Badge variant="gold" className="absolute -top-3 start-1/2 -translate-x-1/2">
                    الأكثر شعبية
                  </Badge>
                )}
                <CardHeader className="space-y-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-5.5 w-5.5" />
                  </div>
                  <CardTitle className="text-lg">{plan.nameAr}</CardTitle>
                  {plan.isCustom ? (
                    <div className="text-2xl font-bold">تواصل معنا</div>
                  ) : (
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold">{formatNumber(price ?? 0)}</span>
                      <span className="text-sm text-muted-foreground">ر.س / {billing === 'monthly' ? 'شهريًا' : 'سنويًا'}</span>
                    </div>
                  )}
                </CardHeader>
                <CardContent className="flex flex-1 flex-col gap-4">
                  <ul className="flex-1 space-y-2.5 text-sm">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full"
                    variant={isCurrent ? 'outline' : plan.isPopular ? 'default' : 'secondary'}
                    disabled={isCurrent}
                    onClick={() => setConfirmPlan(plan)}
                  >
                    {isCurrent ? 'خطتك الحالية' : plan.isCustom ? 'تواصل مع المبيعات' : 'الترقية لهذه الخطة'}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <ConfirmDialog
        open={!!confirmPlan}
        onOpenChange={(o) => !o && setConfirmPlan(null)}
        title={`تغيير الخطة إلى "${confirmPlan?.nameAr ?? ''}"`}
        description="سيتم تطبيق الخطة الجديدة فورًا وتحديث حدود استخدامك. هل تريد الاستمرار؟"
        confirmLabel={changing ? 'جارٍ التغيير...' : 'تأكيد التغيير'}
        variant="default"
        loading={changing}
        onConfirm={handleConfirmChange}
      />
    </div>
  )
}
