import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Sparkles, ShieldCheck, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/i18n'
import { InvitationPreviewCard, defaultInvitationDesign } from '@/components/invitation/invitation-preview-card'

export function HeroSection() {
  const { t, dir, locale } = useI18n()
  const ArrowIcon = dir === 'rtl' ? ArrowLeft : ArrowRight

  return (
    <section className="relative overflow-hidden bg-mesh pb-16 pt-14 sm:pb-24 sm:pt-20">
      <div className="container grid items-center gap-12 lg:grid-cols-2 lg:gap-8">
        <div className="flex flex-col items-start gap-6 animate-fade-in-up">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1.5 text-xs font-medium text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            {t.hero.badge}
          </span>
          <h1 className="text-balance text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl lg:text-[2.75rem]">
            {t.hero.title}
          </h1>
          <p className="max-w-xl text-balance text-base leading-relaxed text-muted-foreground sm:text-lg">
            {t.hero.subtitle}
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button size="lg" asChild>
              <Link to="/login">
                {t.hero.ctaPrimary}
                <ArrowIcon className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/features">{t.hero.ctaSecondary}</Link>
            </Button>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4.5 w-4.5 text-success" />
              <span>{locale === 'ar' ? 'بدون بطاقة ائتمان' : 'No credit card required'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4.5 w-4.5 text-primary" />
              <span>{locale === 'ar' ? '+12,000 مستخدم يثق بنا في اليمن' : '+12,000 Trusted Users'}</span>
            </div>
          </div>
        </div>

        <div className="relative mx-auto flex w-full max-w-sm items-center justify-center lg:max-w-md animate-fade-in">
          <div className="absolute -inset-6 rounded-[2rem] bg-gradient-to-tr from-primary/20 via-transparent to-gold/20 blur-2xl" />
          <InvitationPreviewCard design={defaultInvitationDesign} qrValue="DAAWATAK-HERO-DEMO" className="relative" />
        </div>
      </div>
    </section>
  )
}
