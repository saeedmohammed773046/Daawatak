import { useState } from 'react'
import { Eye } from 'lucide-react'
import { useI18n } from '@/i18n'
import { InvitationPreviewCard, defaultInvitationDesign } from '@/components/invitation/invitation-preview-card'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

const showcaseDesigns = [
  { ...defaultInvitationDesign, eventTitle: 'دعوة زفاف', eventNames: 'أحمد & سارة', primaryColor: '#5b21b6', secondaryColor: '#c9a24b' },
  { ...defaultInvitationDesign, eventTitle: 'خطوبة', eventNames: 'فيصل & نوف', primaryColor: '#831843', secondaryColor: '#f5d0c5', bodyText: 'يسعدنا دعوتكم لحضور حفل خطوبتنا' },
  { ...defaultInvitationDesign, eventTitle: 'حفل تخرج', eventNames: 'دفعة 2026', primaryColor: '#1d3557', secondaryColor: '#e9c46a', bodyText: 'شاركونا فرحة التخرج والنجاح' },
  { ...defaultInvitationDesign, eventTitle: 'عيد ميلاد', eventNames: 'لمى', primaryColor: '#065f46', secondaryColor: '#f3d17a', bodyText: 'تعالوا نحتفل معًا بعيد ميلاد مميز' },
]

export function ShowcaseSection() {
  const { t } = useI18n()
  const [previewIndex, setPreviewIndex] = useState<number | null>(null)

  return (
    <section className="bg-muted/30 py-16 sm:py-24">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{t.showcase.heading}</h2>
          <p className="mt-3 text-muted-foreground">{t.showcase.subheading}</p>
        </div>

        <div className="mt-12 flex gap-5 overflow-x-auto pb-4 no-scrollbar sm:grid sm:grid-cols-2 sm:overflow-visible lg:grid-cols-4">
          {showcaseDesigns.map((design, i) => (
            <div key={i} className="group relative min-w-[240px] shrink-0 sm:min-w-0">
              <InvitationPreviewCard design={design} qrValue={`DAAWATAK-SHOWCASE-${i}`} className="!aspect-[3/4]" />
              <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/0 opacity-0 transition-all group-hover:bg-black/40 group-hover:opacity-100">
                <Button size="sm" variant="secondary" onClick={() => setPreviewIndex(i)}>
                  <Eye className="h-4 w-4" />
                  {t.showcase.preview}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Dialog open={previewIndex !== null} onOpenChange={(v) => !v && setPreviewIndex(null)}>
        <DialogContent className="flex max-w-xs flex-col items-center bg-transparent border-none shadow-none p-0" hideClose>
          <DialogTitle className="sr-only">{t.showcase.preview}</DialogTitle>
          {previewIndex !== null && (
            <InvitationPreviewCard design={showcaseDesigns[previewIndex]} qrValue={`DAAWATAK-SHOWCASE-${previewIndex}`} />
          )}
        </DialogContent>
      </Dialog>
    </section>
  )
}
