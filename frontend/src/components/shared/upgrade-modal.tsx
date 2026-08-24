import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Sparkles } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface UpgradeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  featureName?: string
}

export function UpgradeModal({ open, onOpenChange, featureName }: UpgradeModalProps) {
  const navigate = useNavigate()
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gold/15 text-gold">
          <Sparkles className="h-7 w-7" />
        </div>
        <DialogHeader className="text-center items-center">
          <DialogTitle>هذه الميزة متاحة في الخطة الاحترافية</DialogTitle>
          <DialogDescription>
            {featureName ? `ميزة "${featureName}" ` : 'هذه الميزة '}
            متوفرة فقط للمشتركين في الخطة الاحترافية أو خطة الأعمال. قم بالترقية الآن للاستفادة من كل الإمكانيات.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-center">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            ليس الآن
          </Button>
          <Button
            variant="gold"
            onClick={() => {
              onOpenChange(false)
              navigate('/dashboard/subscription')
            }}
          >
            ترقية الخطة
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
