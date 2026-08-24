import { FaqSection } from '@/components/marketing/faq-section'
import { CtaSection } from '@/components/marketing/cta-section'
import { useI18n } from '@/i18n'

export default function FaqPage() {
  const { t } = useI18n()
  return (
    <>
      <section className="bg-mesh py-14 sm:py-20">
        <div className="container text-center">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{t.faq.heading}</h1>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">{t.faq.subheading}</p>
        </div>
      </section>
      <FaqSection />
      <CtaSection />
    </>
  )
}
