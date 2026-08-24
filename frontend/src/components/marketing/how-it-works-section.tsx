import { CalendarPlus, UsersRound, Send, LineChart } from 'lucide-react'
import { useI18n } from '@/i18n'

export function HowItWorksSection() {
  const { t } = useI18n()
  const steps = [
    { icon: CalendarPlus, ...t.howItWorks.step1 },
    { icon: UsersRound, ...t.howItWorks.step2 },
    { icon: Send, ...t.howItWorks.step3 },
    { icon: LineChart, ...t.howItWorks.step4 },
  ]

  return (
    <section id="how-it-works" className="bg-muted/30 py-16 sm:py-24">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{t.howItWorks.heading}</h2>
          <p className="mt-3 text-muted-foreground">{t.howItWorks.subheading}</p>
        </div>

        <div className="relative mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="absolute top-8 hidden h-px w-full bg-border lg:block" />
          {steps.map((step, i) => (
            <div key={step.title} className="relative flex flex-col items-center gap-4 text-center">
              <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-2xl bg-background shadow-elevated ring-1 ring-border">
                <step.icon className="h-7 w-7 text-primary" />
                <span className="absolute -top-2 -end-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {i + 1}
                </span>
              </div>
              <h3 className="text-base font-semibold">{step.title}</h3>
              <p className="max-w-[220px] text-sm text-muted-foreground">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
