import { useCallback, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { UploadCloud, FileSpreadsheet, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react'
import { guestsService } from '@/services/guests.service'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface ImportGuestsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  eventId: string
  onImported: () => void
}

type Step = 'upload' | 'preview' | 'importing' | 'done'

export function ImportGuestsModal({ open, onOpenChange, eventId, onImported }: ImportGuestsModalProps) {
  const [step, setStep] = useState<Step>('upload')
  const [dragOver, setDragOver] = useState(false)
  const [fileName, setFileName] = useState('')
  const [preview, setPreview] = useState<{ totalRows: number; validRows: number; reviewRows: number; errorRows: number; sample: any[] } | null>(null)
  const [progress, setProgress] = useState(0)
  const [imported, setImported] = useState(0)

  function reset() {
    setStep('upload'); setFileName(''); setPreview(null); setProgress(0); setImported(0)
  }

  const handleFile = useCallback(async (file: File) => {
    setFileName(file.name)
    setStep('preview')
    const result = await guestsService.importPreview(file)
    setPreview(result)
  }, [])

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  async function confirmImport() {
    if (!preview) return
    setStep('importing')
    const timer = setInterval(() => setProgress((p) => Math.min(p + 12, 92)), 150)
    try {
      const res = await guestsService.confirmImport(eventId, preview.sample)
      clearInterval(timer)
      setProgress(100)
      setImported(res.imported)
      setStep('done')
      toast.success(`تم استيراد ${res.imported} مدعو بنجاح`)
      onImported()
    } catch {
      clearInterval(timer)
      toast.error('تعذر استيراد الملف، حاول مرة أخرى')
      setStep('preview')
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) reset() }}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>استيراد قائمة المدعوين</DialogTitle>
          <DialogDescription>استورد ضيوفك دفعة واحدة من ملف Excel أو CSV.</DialogDescription>
        </DialogHeader>

        {step === 'upload' && (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            className={cn(
              'flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-10 text-center transition-colors',
              dragOver ? 'border-primary bg-primary/5' : 'border-border'
            )}
          >
            <UploadCloud className="h-10 w-10 text-muted-foreground" />
            <p className="text-sm font-medium">اسحب وأسقط الملف هنا، أو</p>
            <label className="cursor-pointer text-sm font-medium text-primary hover:underline">
              اختر ملفًا من جهازك
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              />
            </label>
            <p className="text-xs text-muted-foreground">الصيغ المدعومة: Excel (.xlsx) أو CSV — الحد الأقصى 5MB</p>
          </div>
        )}

        {step === 'preview' && preview && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 rounded-lg border border-border/70 bg-muted/30 p-3">
              <FileSpreadsheet className="h-8 w-8 shrink-0 text-primary" />
              <div className="overflow-hidden">
                <p className="truncate text-sm font-medium">{fileName}</p>
                <p className="text-xs text-muted-foreground">{preview.totalRows} سجل تم العثور عليه</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-lg bg-success/10 p-3">
                <CheckCircle2 className="mx-auto h-5 w-5 text-success" />
                <p className="mt-1 text-lg font-bold text-success">{preview.validRows}</p>
                <p className="text-[11px] text-muted-foreground">صحيح</p>
              </div>
              <div className="rounded-lg bg-warning/10 p-3">
                <AlertTriangle className="mx-auto h-5 w-5 text-warning" />
                <p className="mt-1 text-lg font-bold text-warning">{preview.reviewRows}</p>
                <p className="text-[11px] text-muted-foreground">يحتاج مراجعة</p>
              </div>
              <div className="rounded-lg bg-destructive/10 p-3">
                <XCircle className="mx-auto h-5 w-5 text-destructive" />
                <p className="mt-1 text-lg font-bold text-destructive">{preview.errorRows}</p>
                <p className="text-[11px] text-muted-foreground">به أخطاء</p>
              </div>
            </div>

            <div className="max-h-56 overflow-auto rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-muted/60 text-xs text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 text-start">الاسم</th>
                    <th className="px-3 py-2 text-start">الهاتف</th>
                    <th className="px-3 py-2 text-start">الفئة</th>
                    <th className="px-3 py-2 text-start">الحالة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {preview.sample.map((row, i) => (
                    <tr key={i}>
                      <td className="px-3 py-2">{row.name}</td>
                      <td className="px-3 py-2">{row.phone || '—'}</td>
                      <td className="px-3 py-2">{row.category}</td>
                      <td className="px-3 py-2">
                        {row.phone ? (
                          <span className="text-success">صحيح</span>
                        ) : (
                          <span className="text-destructive">رقم هاتف مفقود</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {(step === 'importing' || step === 'done') && (
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            {step === 'importing' ? (
              <>
                <div className="h-14 w-14 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
                <p className="text-sm font-medium">جارٍ استيراد المدعوين...</p>
                <Progress value={progress} className="w-full max-w-xs" />
              </>
            ) : (
              <>
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-success/10 text-success">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <p className="text-base font-semibold">تم استيراد {imported} مدعو بنجاح</p>
              </>
            )}
          </div>
        )}

        <DialogFooter>
          {step === 'preview' && (
            <>
              <Button variant="outline" onClick={() => setStep('upload')}>رجوع</Button>
              <Button onClick={confirmImport}>تأكيد الاستيراد ({preview?.validRows})</Button>
            </>
          )}
          {step === 'done' && <Button onClick={() => onOpenChange(false)}>إغلاق</Button>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
