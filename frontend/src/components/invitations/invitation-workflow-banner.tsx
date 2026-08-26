import { useNavigate } from 'react-router-dom'
import { Users, Palette, Sparkles, Share2, Check, ArrowLeft, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface InvitationWorkflowBannerProps {
  eventId: string
  guestsCount: number
  hasCustomTemplate: boolean
  invitationsReadyCount: number
  onGenerateClick?: () => void
  className?: string
}

export function InvitationWorkflowBanner({
  eventId,
  guestsCount,
  hasCustomTemplate,
  invitationsReadyCount,
  onGenerateClick,
  className,
}: InvitationWorkflowBannerProps) {
  const navigate = useNavigate()

  // Determine current active step (1 to 4)
  const step1Done = guestsCount > 0
  const step2Done = hasCustomTemplate
  const step3Done = invitationsReadyCount > 0 && invitationsReadyCount >= guestsCount
  const step4Active = step3Done

  const steps = [
    {
      number: 1,
      title: 'إضافة المدعوين',
      desc: guestsCount > 0 ? `${guestsCount} مدعو مسجل` : 'أضف قائمة ضيوفك وبياناتهم',
      icon: Users,
      isDone: step1Done,
      isActive: !step1Done,
      action: !step1Done ? () => {} : undefined,
    },
    {
      number: 2,
      title: 'اختيار وتنسيق القالب',
      desc: step2Done ? 'تم اعتماد التصميم' : 'خطوة إلزامية لتخصيص الدعوة',
      icon: Palette,
      isDone: step2Done,
      isActive: step1Done && !step2Done,
      action: () => navigate(`/dashboard/invitations/designer?eventId=${eventId}`),
      actionLabel: 'تنسيق القالب',
    },
    {
      number: 3,
      title: 'إنشاء الدعوات تلقائياً',
      desc: step3Done ? `${invitationsReadyCount} دعوة جاهزة` : 'دمج الأسماء ورموز الـ QR',
      icon: Sparkles,
      isDone: step3Done,
      isActive: step1Done && step2Done && !step3Done,
      action: onGenerateClick,
      actionLabel: 'توليد الدعوات',
    },
    {
      number: 4,
      title: 'إدارة ومشاركة الدعوات',
      desc: 'واتساب، PDF، صورة، وروابط',
      icon: Share2,
      isDone: step4Active,
      isActive: step4Active,
    },
  ]

  return (
    <div className={cn('rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-background to-gold/10 p-5 shadow-sm', className)}>
      <div className="flex flex-col gap-1 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-gold" />
            مسار إنشاء وإرسال الدعوات الإلكترونية
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            آلية آلية متكاملة تبدأ بإضافة المدعوين وتنسيق القالب وحتى إرسال الدعوات المخصصة لكل ضيف.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((s) => {
          const Icon = s.icon
          return (
            <div
              key={s.number}
              className={cn(
                'relative flex flex-col justify-between rounded-xl border p-4 transition-all',
                s.isDone
                  ? 'border-success/30 bg-success/5'
                  : s.isActive
                  ? 'border-primary/50 bg-primary/5 ring-1 ring-primary/30'
                  : 'border-border/60 bg-card/60 opacity-85'
              )}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div
                    className={cn(
                      'flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold',
                      s.isDone
                        ? 'bg-success text-success-foreground'
                        : s.isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {s.isDone ? <Check className="h-4 w-4" /> : s.number}
                  </div>
                  <Icon className={cn('h-5 w-5', s.isDone ? 'text-success' : s.isActive ? 'text-primary' : 'text-muted-foreground')} />
                </div>
                <h3 className="text-sm font-semibold text-foreground">{s.title}</h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{s.desc}</p>
              </div>

              {s.action && (
                <div className="mt-3 pt-2 border-t border-border/40">
                  <Button
                    size="sm"
                    variant={s.isDone ? 'outline' : 'default'}
                    className="w-full text-xs h-8"
                    onClick={s.action}
                  >
                    {s.actionLabel}
                    <ArrowLeft className="h-3 w-3 ms-1" />
                  </Button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
