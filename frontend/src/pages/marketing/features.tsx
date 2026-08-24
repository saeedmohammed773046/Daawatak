import { FeaturesSection } from '@/components/marketing/features-section'
import { HowItWorksSection } from '@/components/marketing/how-it-works-section'
import { EventTypesSection } from '@/components/marketing/event-types-section'
import { ShowcaseSection } from '@/components/marketing/showcase-section'
import { CtaSection } from '@/components/marketing/cta-section'
import { useI18n } from '@/i18n'

export default function FeaturesPage() {
  const { t } = useI18n()
  return (
    <>
      <section className="bg-mesh py-14 sm:py-20">
        <div className="container text-center">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{t.features.heading}</h1>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">{t.features.subheading}</p>
        </div>
      </section>
      <FeaturesSection />
      <HowItWorksSection />
      <EventTypesSection />
      <ShowcaseSection />
      <CtaSection />
    </>
  )
}
