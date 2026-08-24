import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/i18n'

export function CtaSection() {
  const { t } = useI18n()
  return (
    <section className="py-16 sm:py-20">
      <div className="container">
        <div className="relative overflow-hidden rounded-3xl bg-brand-gradient px-6 py-14 text-center text-white sm:px-16">
          <div className="absolute -top-16 -end-16 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-16 -start-16 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
          <div className="relative z-10 mx-auto max-w-xl">
            <h2 className="text-2xl font-bold sm:text-3xl">{t.hero.title}</h2>
            <p className="mt-3 text-white/85">{t.hero.subtitle}</p>
            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <Button size="lg" variant="secondary" asChild>
                <Link to="/login">{t.hero.ctaPrimary}</Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white/40 bg-transparent text-white hover:bg-white/10" asChild>
                <Link to="/pricing">{t.nav.pricing}</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
