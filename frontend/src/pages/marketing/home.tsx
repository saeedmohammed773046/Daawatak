import { HeroSection } from '@/components/marketing/hero-section'
import { FeaturesSection } from '@/components/marketing/features-section'
import { HowItWorksSection } from '@/components/marketing/how-it-works-section'
import { EventTypesSection } from '@/components/marketing/event-types-section'
import { ShowcaseSection } from '@/components/marketing/showcase-section'
import { StatsShowcaseSection } from '@/components/marketing/stats-showcase-section'
import { PricingSection } from '@/components/marketing/pricing-section'
import { FaqSection } from '@/components/marketing/faq-section'
import { CtaSection } from '@/components/marketing/cta-section'

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <EventTypesSection />
      <ShowcaseSection />
      <StatsShowcaseSection />
      <PricingSection compact />
      <FaqSection />
      <CtaSection />
    </>
  )
}
