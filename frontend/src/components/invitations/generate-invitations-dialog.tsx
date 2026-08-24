import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Sparkles, CheckCircle2 } from 'lucide-react'
import { invitationsService } from '@/services/invitations.service'
import { toast } from 'sonner'

interface GenerateInvitationsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  eventId: string
  guestCount: number
  onGenerated: () => void
}

type Step = 'confirm' | 'loading' | 'success'

export function GenerateInvitationsDialog({ open, onOpenChange, eventId, guestCount, onGenerated }: GenerateInvitationsDialogProps) {
  const [step, setStep] = useState<Step>('confirm')
  const [progress, setProgress] = useState(0)
  const [generated, setGenerated] = useState(0)

  function reset() {
    setStep('confirm'); setProgress(0); setGenerated(0)
  }

  async function handleGenerate() {
    setStep('loading')
    try {
      const res = await invitationsService.generate(eventId, guestCount, (p) => setProgress(p))
      setGenerated(res.generated)
      setStep('success')
      toast.success(`تم إنشاء ${res.generated} دعوة بنجاح`)
      onGenerated()
    } catch {
      toast.error('حدث خطأ أثناء إنشاء الدعوات')
      setStep('confirm')
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) reset() }}>
      <DialogContent>
        {step === 'confirm' && (
          <>
            <DialogHeader>
              <DialogTitle>إنشاء الدعوات</DialogTitle>
              <DialogDescription>
                سيتم إنشاء {guestCount} دعوة إلكترونية لجميع المدعوين الذين لم يتم إنشاء دعواتهم بعد، كل دعوة تحتوي على رمز QR فريد.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>إلغاء</Button>
              <Button onClick={handleGenerate}>
                <Sparkles className="h-4 w-4" /> تأكيد الإنشاء
              </Button>
            </DialogFooter>
          </>
        )}

        {step === 'loading' && (
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <div className="h-14 w-14 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
            <p className="text-sm font-medium">جارٍ إنشاء الدعوات... {progress}%</p>
            <Progress value={progress} className="w-full" />
          </div>
        )}

        {step === 'success' && (
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-success/10 text-success">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <p className="text-base font-semibold">تم إنشاء {generated} دعوة بنجاح 🎉</p>
            <Button onClick={() => onOpenChange(false)}>إغلاق</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
