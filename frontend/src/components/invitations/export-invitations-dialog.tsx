import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { FileImage, FileText, FileArchive, Loader2, Download } from 'lucide-react'
import { invitationsService } from '@/services/invitations.service'
import { toast } from 'sonner'

interface ExportInvitationsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  eventId: string
}

const formats: { key: 'png' | 'pdf' | 'zip'; label: string; desc: string; icon: any }[] = [
  { key: 'png', label: 'صور PNG', desc: 'كل دعوة كصورة منفصلة', icon: FileImage },
  { key: 'pdf', label: 'ملف PDF', desc: 'كل الدعوات في ملف واحد', icon: FileText },
  { key: 'zip', label: 'أرشيف ZIP', desc: 'كل الدعوات مضغوطة في مجلد', icon: FileArchive },
]

export function ExportInvitationsDialog({ open, onOpenChange, eventId }: ExportInvitationsDialogProps) {
  const [loadingFormat, setLoadingFormat] = useState<string | null>(null)

  async function handleExport(format: 'png' | 'pdf' | 'zip') {
    setLoadingFormat(format)
    toast.info('جاري تجهيز الملف... يمكنك إغلاق هذه النافذة والاستمرار بالتصفح')
    try {
      await invitationsService.exportFile(eventId, format)
      toast.success('الملف جاهز للتحميل')
    } catch {
      toast.error('تعذر تجهيز الملف، حاول مرة أخرى')
    } finally {
      setLoadingFormat(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>تصدير الدعوات</DialogTitle>
          <DialogDescription>اختر الصيغة المناسبة لتصدير جميع دعوات هذه المناسبة.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          {formats.map((f) => (
            <button
              key={f.key}
              onClick={() => handleExport(f.key)}
              disabled={!!loadingFormat}
              className="flex items-center gap-3 rounded-xl border border-border p-4 text-start transition-all hover:border-primary/40 hover:shadow-card disabled:opacity-60"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <f.icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold">{f.label}</p>
                <p className="text-xs text-muted-foreground">{f.desc}</p>
              </div>
              {loadingFormat === f.key ? <Loader2 className="h-4 w-4 animate-spin text-primary" /> : <Download className="h-4 w-4 text-muted-foreground" />}
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
