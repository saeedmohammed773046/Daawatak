import { Heart, Gem, BookOpenCheck, GraduationCap, Cake, Presentation, Users2, Handshake, DoorOpen, Star } from 'lucide-react'
import { useI18n } from '@/i18n'

export function EventTypesSection() {
  const { t } = useI18n()

  const types = [
    { key: 'wedding', icon: Heart, color: 'text-rose-500 bg-rose-500/10' },
    { key: 'engagement', icon: Gem, color: 'text-pink-500 bg-pink-500/10' },
    { key: 'religious', icon: BookOpenCheck, color: 'text-emerald-600 bg-emerald-600/10' },
    { key: 'graduation', icon: GraduationCap, color: 'text-blue-600 bg-blue-600/10' },
    { key: 'birthday', icon: Cake, color: 'text-amber-500 bg-amber-500/10' },
    { key: 'conference', icon: Presentation, color: 'text-indigo-600 bg-indigo-600/10' },
    { key: 'training', icon: Users2, color: 'text-cyan-600 bg-cyan-600/10' },
    { key: 'meeting', icon: Handshake, color: 'text-teal-600 bg-teal-600/10' },
    { key: 'opening', icon: DoorOpen, color: 'text-orange-500 bg-orange-500/10' },
    { key: 'special', icon: Star, color: 'text-violet-600 bg-violet-600/10' },
  ] as const

  return (
    <section className="py-16 sm:py-24">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{t.eventTypes.heading}</h2>
          <p className="mt-3 text-muted-foreground">{t.eventTypes.subheading}</p>
        </div>
        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {types.map((type) => (
            <div
              key={type.key}
              className="group flex flex-col items-center gap-3 rounded-xl border border-border/70 bg-card p-5 text-center transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-card"
            >
              <div className={`flex h-12 w-12 items-center justify-center rounded-full ${type.color}`}>
                <type.icon className="h-6 w-6" />
              </div>
              <span className="text-sm font-medium">{t.eventTypes[type.key]}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
