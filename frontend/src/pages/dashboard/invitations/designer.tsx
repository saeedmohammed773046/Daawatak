import { useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import {
  Type,
  QrCode,
  Palette as PaletteIcon,
  AlignStartHorizontal,
  AlignCenterHorizontal,
  AlignEndHorizontal,
  Save,
  LayoutTemplate,
  Sparkles,
  SlidersHorizontal,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { InvitationPreviewCard, defaultInvitationDesign, type InvitationDesign } from '@/components/invitation/invitation-preview-card'
import { cn } from '@/lib/utils'
import { useI18n } from '@/i18n'
import { toast } from 'sonner'

const colorPresets = [
  ['#5b21b6', '#c9a24b'],
  ['#0f172a', '#c9a24b'],
  ['#1d3557', '#e9c46a'],
  ['#5b2333', '#d4af37'],
  ['#065f46', '#f3d17a'],
  ['#831843', '#f5d0c5'],
]

interface ControlsPanelProps {
  design: InvitationDesign
  update: <K extends keyof InvitationDesign>(key: K, value: InvitationDesign[K]) => void
  isAr: boolean
  t: any
}

function ControlsPanel({ design, update, isAr, t }: ControlsPanelProps) {
  return (
    <Tabs defaultValue="content" className="flex flex-col gap-4">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="content"><Type className="h-4 w-4" /></TabsTrigger>
        <TabsTrigger value="text"><SlidersHorizontal className="h-4 w-4" /></TabsTrigger>
        <TabsTrigger value="colors"><PaletteIcon className="h-4 w-4" /></TabsTrigger>
        <TabsTrigger value="qr"><QrCode className="h-4 w-4" /></TabsTrigger>
      </TabsList>

      <TabsContent value="content" className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label>{isAr ? 'عنوان المناسبة' : 'Event Title'}</Label>
          <Input
            value={design.eventTitle}
            onChange={(e) => update('eventTitle', e.target.value)}
            placeholder={isAr ? 'مثال: حفل زفاف' : 'e.g. Wedding Ceremony'}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label>{isAr ? 'أسماء أصحاب المناسبة' : 'Hosts / Names'}</Label>
          <Input
            value={design.eventNames}
            onChange={(e) => update('eventNames', e.target.value)}
            placeholder={isAr ? 'مثال: أحمد & سارة' : 'e.g. Ahmed & Sara'}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label>{isAr ? 'نص الدعوة' : 'Invitation Message'}</Label>
          <Textarea
            value={design.bodyText}
            onChange={(e) => update('bodyText', e.target.value)}
            rows={3}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label>{t.common.date} {isAr ? 'والوقت' : '& Time'}</Label>
          <Input
            value={design.date}
            onChange={(e) => update('date', e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label>{t.common.location}</Label>
          <Input
            value={design.venue}
            onChange={(e) => update('venue', e.target.value)}
          />
        </div>
      </TabsContent>

      <TabsContent value="text" className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <Label>{isAr ? 'اسم المدعو (معاينة)' : 'Guest Name (Preview)'}</Label>
          <Input
            value={design.guestName}
            onChange={(e) => update('guestName', e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label>{isAr ? `حجم خط اسم المدعو: ${design.guestNameSize}px` : `Guest Name Font Size: ${design.guestNameSize}px`}</Label>
          <Slider value={[design.guestNameSize]} min={12} max={32} step={1} onValueChange={([v]) => update('guestNameSize', v)} />
        </div>
        <div className="flex flex-col gap-2">
          <Label>{isAr ? `سُمك الخط: ${design.guestNameWeight}` : `Font Weight: ${design.guestNameWeight}`}</Label>
          <Slider value={[design.guestNameWeight]} min={400} max={800} step={100} onValueChange={([v]) => update('guestNameWeight', v)} />
        </div>
        <div className="flex flex-col gap-2">
          <Label>{isAr ? 'محاذاة اسم المدعو' : 'Guest Name Alignment'}</Label>
          <div className="flex gap-2">
            {[
              { key: 'start', icon: AlignStartHorizontal },
              { key: 'center', icon: AlignCenterHorizontal },
              { key: 'end', icon: AlignEndHorizontal },
            ].map(({ key, icon: Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => update('guestNameAlign', key as any)}
                className={cn(
                  'flex h-10 flex-1 items-center justify-center rounded-lg border transition-colors',
                  design.guestNameAlign === key ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground'
                )}
              >
                <Icon className="h-4 w-4" />
              </button>
            ))}
          </div>
        </div>
      </TabsContent>

      <TabsContent value="colors" className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <Label>{isAr ? 'اللون الأساسي' : 'Primary Color'}</Label>
          <div className="flex items-center gap-2">
            <input type="color" value={design.primaryColor} onChange={(e) => update('primaryColor', e.target.value)} className="h-10 w-14 cursor-pointer rounded-lg border border-border" />
            <Input value={design.primaryColor} onChange={(e) => update('primaryColor', e.target.value)} />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Label>{isAr ? 'اللون الثانوي' : 'Secondary Color'}</Label>
          <div className="flex items-center gap-2">
            <input type="color" value={design.secondaryColor} onChange={(e) => update('secondaryColor', e.target.value)} className="h-10 w-14 cursor-pointer rounded-lg border border-border" />
            <Input value={design.secondaryColor} onChange={(e) => update('secondaryColor', e.target.value)} />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Label>{isAr ? 'أطياف جاهزة' : 'Color Palettes'}</Label>
          <div className="grid grid-cols-6 gap-2">
            {colorPresets.map(([p, s], i) => (
              <button
                key={i}
                type="button"
                onClick={() => { update('primaryColor', p); update('secondaryColor', s) }}
                className="h-9 w-9 rounded-full border-2 border-white shadow-soft ring-1 ring-border"
                style={{ background: `linear-gradient(135deg, ${p}, ${s})` }}
                aria-label={`palette-${i}`}
              />
            ))}
          </div>
        </div>
      </TabsContent>

      <TabsContent value="qr" className="flex flex-col gap-5">
        <div className="flex items-center justify-between rounded-lg border border-border/70 p-3">
          <Label htmlFor="show-qr" className="cursor-pointer">{isAr ? 'إظهار رمز QR' : 'Show QR Code'}</Label>
          <Switch id="show-qr" checked={design.showQr} onCheckedChange={(v) => update('showQr', v)} />
        </div>
        <div className="flex flex-col gap-2">
          <Label>{isAr ? `حجم رمز QR: ${design.qrSize}px` : `QR Code Size: ${design.qrSize}px`}</Label>
          <Slider value={[design.qrSize]} min={60} max={140} step={4} onValueChange={([v]) => update('qrSize', v)} disabled={!design.showQr} />
        </div>
      </TabsContent>
    </Tabs>
  )
}

export default function InvitationDesignerPage() {
  const { t, locale } = useI18n()
  const isAr = locale === 'ar'
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const eventId = params.get('eventId') || 'event-1'
  const [design, setDesign] = useState<InvitationDesign>(defaultInvitationDesign)
  const [saving, setSaving] = useState(false)
  const [mobileControlsOpen, setMobileControlsOpen] = useState(false)

  function update<K extends keyof InvitationDesign>(key: K, value: InvitationDesign[K]) {
    setDesign((d) => ({ ...d, [key]: value }))
  }

  async function handleSave() {
    setSaving(true)
    await new Promise((r) => setTimeout(r, 600))
    setSaving(false)
    toast.success(isAr ? 'تم حفظ تصميم الدعوة بنجاح' : 'Invitation design saved successfully')
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold sm:text-2xl">
            <Sparkles className="h-5 w-5 text-gold" /> {isAr ? 'مصمم الدعوات' : 'Invitation Designer'}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isAr ? 'صمم دعوتك كما تريد وشاهد المعاينة الفورية.' : 'Design your invitation card with live interactive preview.'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(`/dashboard/templates`)}>
            <LayoutTemplate className="h-4 w-4" /> {isAr ? 'استخدام قالب' : 'Choose Template'}
          </Button>
          <Button onClick={handleSave} loading={saving}>
            <Save className="h-4 w-4" /> {isAr ? 'حفظ التصميم' : 'Save Design'}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <div className="hidden rounded-xl border border-border/70 bg-card p-5 lg:block">
          <ControlsPanel design={design} update={update} isAr={isAr} t={t} />
        </div>

        <div className="flex flex-col items-center gap-4">
          <div className="flex w-full items-center justify-center rounded-xl bg-muted/30 p-6 sm:p-10">
            <InvitationPreviewCard design={design} qrValue={`DAAWATAK-${eventId}-PREVIEW`} />
          </div>
          <Button variant="outline" className="w-full lg:hidden" onClick={() => setMobileControlsOpen(true)}>
            <SlidersHorizontal className="h-4 w-4" /> {isAr ? 'فتح خيارات التصميم' : 'Open Design Controls'}
          </Button>
        </div>
      </div>

      <Dialog open={mobileControlsOpen} onOpenChange={setMobileControlsOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{isAr ? 'خيارات التصميم' : 'Design Controls'}</DialogTitle>
          </DialogHeader>
          <ControlsPanel design={design} update={update} isAr={isAr} t={t} />
        </DialogContent>
      </Dialog>
    </div>
  )
}
