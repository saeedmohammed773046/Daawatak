import { PenTool, UserCheck, QrCode, ScanLine, BarChart3, FileSpreadsheet } from 'lucide-react'
import { useI18n } from '@/i18n'
import { Card, CardContent } from '@/components/ui/card'

export function FeaturesSection() {
  const { t } = useI18n()

  const features = [
    { icon: PenTool, ...t.features.create },
    { icon: UserCheck, ...t.features.customize },
    { icon: QrCode, ...t.features.qr },
    { icon: ScanLine, ...t.features.checkin },
    { icon: BarChart3, ...t.features.analytics },
    { icon: FileSpreadsheet, ...t.features.reports },
  ]

  return (
    <section id="features" className="py-16 sm:py-24">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{t.features.heading}</h2>
          <p className="mt-3 text-muted-foreground">{t.features.subheading}</p>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <Card key={f.title} className="group border-border/70 transition-all hover:-translate-y-1 hover:shadow-elevated">
              <CardContent className="flex flex-col gap-4 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold">{f.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
