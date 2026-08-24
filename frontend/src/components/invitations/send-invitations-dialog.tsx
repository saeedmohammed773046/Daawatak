import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { MessageCircle, Mail, MessageSquareText, Link2, CheckCircle2, XCircle } from 'lucide-react'
import type { InvitationChannel } from '@/types'
import { invitationsService } from '@/services/invitations.service'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface SendInvitationsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  eventId: string
  total: number
  onSent: () => void
}

type Step = 'channel' | 'sending' | 'done'

const channels: { key: InvitationChannel; label: string; icon: any; color: string }[] = [
  { key: 'whatsapp', label: 'واتساب', icon: MessageCircle, color: 'text-success bg-success/10' },
  { key: 'email', label: 'البريد الإلكتروني', icon: Mail, color: 'text-primary bg-primary/10' },
  { key: 'sms', label: 'رسالة نصية SMS', icon: MessageSquareText, color: 'text-gold bg-gold/10' },
  { key: 'link', label: 'رابط مباشر', icon: Link2, color: 'text-secondary-foreground bg-secondary' },
]

export function SendInvitationsDialog({ open, onOpenChange, eventId, total, onSent }: SendInvitationsDialogProps) {
  const [step, setStep] = useState<Step>('channel')
  const [channel, setChannel] = useState<InvitationChannel | null>(null)
  const [sent, setSent] = useState(0)
  const [failed, setFailed] = useState(0)

  function reset() {
    setStep('channel'); setChannel(null); setSent(0); setFailed(0)
  }

  async function handleSend(ch: InvitationChannel) {
    setChannel(ch)
    setStep('sending')
    try {
      const res = await invitationsService.send(eventId, ch, total, (s, f) => { setSent(s); setFailed(f) })
      setStep('done')
      toast.success(`تم إرسال ${res.sent} دعوة بنجاح`)
      onSent()
    } catch {
      toast.error('حدث خطأ أثناء الإرسال')
      setStep('channel')
    }
  }

  const progressPct = total ? Math.round(((sent + failed) / total) * 100) : 0

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) reset() }}>
      <DialogContent>
        {step === 'channel' && (
          <>
            <DialogHeader>
              <DialogTitle>إرسال الدعوات</DialogTitle>
              <DialogDescription>اختر قناة الإرسال لإرسال {total} دعوة إلى الضيوف.</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-3">
              {channels.map((c) => (
                <button
                  key={c.key}
                  onClick={() => handleSend(c.key)}
                  className="flex flex-col items-center gap-2 rounded-xl border border-border p-4 text-sm font-medium transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-card"
                >
                  <div className={cn('flex h-11 w-11 items-center justify-center rounded-xl', c.color)}>
                    <c.icon className="h-5 w-5" />
                  </div>
                  {c.label}
                </button>
              ))}
            </div>
          </>
        )}

        {step === 'sending' && channel && (
          <div className="flex flex-col items-center gap-4 py-4 text-center">
            <div className="h-14 w-14 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
            <p className="text-sm font-medium">جارٍ الإرسال عبر {channels.find((c) => c.key === channel)?.label}...</p>
            <Progress value={progressPct} className="w-full" />
            <div className="grid w-full grid-cols-3 gap-3 text-center">
              <div><p className="text-lg font-bold">{total}</p><p className="text-[11px] text-muted-foreground">الإجمالي</p></div>
              <div><p className="text-lg font-bold text-success">{sent}</p><p className="text-[11px] text-muted-foreground">تم الإرسال</p></div>
              <div><p className="text-lg font-bold text-destructive">{failed}</p><p className="text-[11px] text-muted-foreground">فشل</p></div>
            </div>
          </div>
        )}

        {step === 'done' && (
          <div className="flex flex-col items-center gap-4 py-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-success/10 text-success">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <p className="text-base font-semibold">اكتمل الإرسال</p>
            <div className="grid w-full grid-cols-2 gap-3 text-center">
              <div className="rounded-lg bg-success/10 p-3"><p className="text-lg font-bold text-success">{sent}</p><p className="text-[11px] text-muted-foreground">تم الإرسال بنجاح</p></div>
              <div className="rounded-lg bg-destructive/10 p-3"><p className="text-lg font-bold text-destructive">{failed}</p><p className="flex items-center justify-center gap-1 text-[11px] text-muted-foreground"><XCircle className="h-3 w-3" /> فشل الإرسال</p></div>
            </div>
            <Button onClick={() => onOpenChange(false)}>إغلاق</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
