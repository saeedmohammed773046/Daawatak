import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, Sparkles } from 'lucide-react'
import { useI18n } from '@/i18n'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn, formatNumber } from '@/lib/utils'
import { mockPlans } from '@/mocks/plans'

const featureTranslations: Record<string, string> = {
  'حتى 50 دعوة': 'Up to 50 invitations',
  'قوالب أساسية': 'Basic templates',
  'رمز QR لكل دعوة': 'Unique QR code per invite',
  'دعم عبر واتساب والبريد': 'WhatsApp & Email support',
  'حتى 1000 دعوة': 'Up to 1,000 invitations',
  'قوالب مميزة وفاخرة': 'Luxury & Premium templates',
  'تقارير مفصلة': 'Detailed analytics & reports',
  'إرسال واتساب ورسائل قصيرة': 'WhatsApp & SMS sending',
  'دعم فني يمني على مدار الساعة': '24/7 dedicated support',
  'دعوات غير محدودة': 'Unlimited invitations',
  'عدة مناسبات ومستخدمين': 'Multiple events & team members',
  'صلاحيات متقدمة': 'Advanced permissions & roles',
  'واجهة استقبال ومسح QR متعددة البوابات': 'Multi-gate QR scanner reception interface',
  'مدير حساب مخصص': 'Dedicated account manager',
  'حلول مخصصة بالكامل': 'Fully customized solutions',
  'تكامل API خاص': 'Custom API integrations',
  'استضافة مخصصة': 'Dedicated cloud hosting',
}

export function PricingSection({ compact = false }: { compact?: boolean }) {
  const { t, locale } = useI18n()
  const isAr = locale === 'ar'
  const [yearly, setYearly] = useState(false)

  return (
    <section className={cn('py-16 sm:py-24', compact && 'py-0')}>
      <div className="container">
        {!compact && (
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{t.pricing.heading}</h2>
            <p className="mt-3 text-muted-foreground">{t.pricing.subheading}</p>
          </div>
        )}

        <div className="mx-auto mt-8 flex w-fit items-center gap-3 rounded-full border border-border bg-card p-1.5 shadow-xs">
          <button
            onClick={() => setYearly(false)}
            className={cn(
              'rounded-full px-4 py-2 text-sm font-medium transition-colors',
              !yearly ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {t.pricing.monthly}
          </button>
          <button
            onClick={() => setYearly(true)}
            className={cn(
              'flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors',
              yearly ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {t.pricing.yearly}
            <Badge variant="gold" className="text-[10px]">
              {t.pricing.saveBadge}
            </Badge>
          </button>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {mockPlans.map((plan) => {
            const price = yearly ? plan.priceYearly : plan.priceMonthly
            const planLabel =
              plan.id === 'plan-free' ? t.pricing.freePlan : plan.id === 'plan-pro' ? t.pricing.proPlan : t.pricing.businessPlan

            return (
              <Card
                key={plan.id}
                className={cn(
                  'relative flex flex-col overflow-hidden rounded-2xl transition-all duration-200 hover:-translate-y-1',
                  plan.isPopular && 'border-primary shadow-elevated ring-1 ring-primary/40'
                )}
              >
                {plan.isPopular && (
                  <div className="absolute inset-x-0 top-0 flex items-center justify-center gap-1 bg-primary py-1.5 text-xs font-medium text-primary-foreground">
                    <Sparkles className="h-3.5 w-3.5" /> {t.pricing.mostPopular}
                  </div>
                )}
                <CardHeader className={cn(plan.isPopular && 'pt-9')}>
                  <h3 className="text-lg font-bold">{planLabel.name}</h3>
                  <p className="text-sm text-muted-foreground">{planLabel.desc}</p>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col gap-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold">
                      {price === 0
                        ? isAr ? 'مجانًا' : 'Free'
                        : `${formatNumber(price, locale)} ${isAr ? 'ر.ي' : 'YER'}`}
                    </span>
                    {price !== 0 && (
                      <span className="text-sm text-muted-foreground">
                        {yearly ? t.pricing.perYear : t.pricing.perMonth}
                      </span>
                    )}
                  </div>
                  <ul className="flex flex-1 flex-col gap-3">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-sm">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                        <span>{isAr ? f : featureTranslations[f] || f}</span>
                      </li>
                    ))}
                  </ul>
                  <Button variant={plan.isPopular ? 'default' : 'outline'} className="w-full" asChild>
                    <Link to="/login">{isAr ? 'تسجيل الدخول للحساب' : 'Login to Account'}</Link>
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
