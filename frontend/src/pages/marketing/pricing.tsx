import { PricingSection } from '@/components/marketing/pricing-section'
import { FaqSection } from '@/components/marketing/faq-section'
import { CtaSection } from '@/components/marketing/cta-section'
import { useI18n } from '@/i18n'

export default function PricingPage() {
  const { t } = useI18n()
  return (
    <>
      <section className="bg-mesh py-14 sm:py-20">
        <div className="container text-center">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{t.pricing.heading}</h1>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">{t.pricing.subheading}</p>
        </div>
      </section>
      <PricingSection />
      <FaqSection />
      <CtaSection />
    </>
  )
}
