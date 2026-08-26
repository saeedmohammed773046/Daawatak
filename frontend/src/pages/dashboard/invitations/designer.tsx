import { useState, useEffect } from 'react'
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
  CheckCircle2,
  ArrowLeft,
  Users,
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
import { eventsService } from '@/services/events.service'
import { invitationsService } from '@/services/invitations.service'
import { guestsService } from '@/services/guests.service'
import { cn } from '@/lib/utils'
import { useI18n } from '@/i18n'
import { toast } from 'sonner'

const templatePresets = [
  { name: 'ملكي ذهبي فاخر', primary: '#5b21b6', secondary: '#c9a24b', bgDesc: 'بنفسجي ملكي مع ذهبي براق' },
  { name: 'فخامة ليلية كلاسيكية', primary: '#0f172a', secondary: '#d4af37', bgDesc: 'أسود فحمي مع ذهبي عتيق' },
  { name: 'ياقوتي أزرق عصري', primary: '#1d3557', secondary: '#e9c46a', bgDesc: 'كحلي ياقوتي مع أصفر دافئ' },
  { name: 'عنابي برستيج راقي', primary: '#5b2333', secondary: '#d4af37', bgDesc: 'عنابي مخملي مع ذهبي' },
  { name: 'زمردي احتفالي', primary: '#065f46', secondary: '#f3d17a', bgDesc: 'أخضر زمردي مع ذهبي ساطع' },
  { name: 'وردي ذهبي أنيق', primary: '#831843', secondary: '#f5d0c5', bgDesc: 'زهري داكن مع روز قولد' },
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
          <Label>{isAr ? 'نص رسالة الدعوة' : 'Invitation Message'}</Label>
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
          <Label>{isAr ? 'اسم المدعو (معاينة تجريبية)' : 'Guest Name (Preview)'}</Label>
          <Input
            value={design.guestName}
            onChange={(e) => update('guestName', e.target.value)}
          />
          <p className="text-[11px] text-muted-foreground">
            {isAr ? 'ملاحظة: سيتم استبدال هذا الاسم تلقائياً باسم كل مدعو عند إنشاء الدعوات.' : 'Note: This name will be automatically replaced with each guest\'s name.'}
          </p>
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
          <Label>{isAr ? 'القوالب والألوان الجاهزة' : 'Pre-designed Themes'}</Label>
          <div className="grid grid-cols-2 gap-2">
            {templatePresets.map((tPreset, i) => (
              <button
                key={i}
                type="button"
                onClick={() => { update('primaryColor', tPreset.primary); update('secondaryColor', tPreset.secondary) }}
                className={cn(
                  'flex items-center gap-2.5 p-2 rounded-xl border text-start transition-all',
                  design.primaryColor === tPreset.primary ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border/70 hover:border-border'
                )}
              >
                <div
                  className="h-7 w-7 shrink-0 rounded-full border border-white/40 shadow-sm"
                  style={{ background: `linear-gradient(135deg, ${tPreset.primary}, ${tPreset.secondary})` }}
                />
                <div className="overflow-hidden">
                  <div className="text-xs font-semibold truncate">{tPreset.name}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label>{isAr ? 'اللون الأساسي' : 'Primary Color'}</Label>
          <div className="flex items-center gap-2">
            <input type="color" value={design.primaryColor} onChange={(e) => update('primaryColor', e.target.value)} className="h-10 w-14 cursor-pointer rounded-lg border border-border" />
            <Input value={design.primaryColor} onChange={(e) => update('primaryColor', e.target.value)} />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Label>{isAr ? 'اللون الثانوي (الذهبي/التزيين)' : 'Secondary / Gold Color'}</Label>
          <div className="flex items-center gap-2">
            <input type="color" value={design.secondaryColor} onChange={(e) => update('secondaryColor', e.target.value)} className="h-10 w-14 cursor-pointer rounded-lg border border-border" />
            <Input value={design.secondaryColor} onChange={(e) => update('secondaryColor', e.target.value)} />
          </div>
        </div>
      </TabsContent>

      <TabsContent value="qr" className="flex flex-col gap-5">
        <div className="flex items-center justify-between rounded-lg border border-border/70 p-3">
          <Label htmlFor="show-qr" className="cursor-pointer">{isAr ? 'إظهار رمز QR للتحقق والبوابة' : 'Show Entry QR Code'}</Label>
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
  const eventId = params.get('eventId') || ''
  const [design, setDesign] = useState<InvitationDesign>(defaultInvitationDesign)
  const [saving, setSaving] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [guestsCount, setGuestsCount] = useState(0)
  const [mobileControlsOpen, setMobileControlsOpen] = useState(false)

  // Load existing event data & design if eventId is provided
  useEffect(() => {
    if (!eventId) return
    eventsService.getById(eventId).then((ev) => {
      if (ev) {
        setGuestsCount(ev.guestsCount || 0)
        setDesign((prev) => ({
          ...prev,
          ...(ev.themeConfig || {}),
          eventTitle: ev.title || prev.eventTitle,
          venue: ev.venue || prev.venue,
          date: ev.date ? `${ev.date} ${ev.time || ''}`.trim() : prev.date,
        }))
      }
    }).catch(() => {})

    guestsService.list(eventId, { pageSize: 100 }).then((res) => {
      if (res?.data) {
        setGuestsCount(res.total || res.data.length)
      }
    }).catch(() => {})
  }, [eventId])

  function update<K extends keyof InvitationDesign>(key: K, value: InvitationDesign[K]) {
    setDesign((d) => ({ ...d, [key]: value }))
  }

  async function handleSave() {
    setSaving(true)
    try {
      if (eventId) {
        await eventsService.update(eventId, {
          themeConfig: design as any,
        })
      }
      toast.success(isAr ? 'تم حفظ واعتماد تصميم القالب بنجاح' : 'Invitation design saved successfully')
    } catch {
      toast.error('حدث خطأ أثناء حفظ التصميم')
    } finally {
      setSaving(false)
    }
  }

  async function handleApproveAndGenerate() {
    setGenerating(true)
    try {
      if (eventId) {
        // 1. Save template design to event
        await eventsService.update(eventId, {
          themeConfig: design as any,
        })

        // 2. Trigger automatic bulk generation for all guests
        await invitationsService.generate(eventId, guestsCount || 1, () => {})

        toast.success(isAr ? 'تم اعتماد القالب وإنشاء جميع الدعوات تلقائياً بنجاح 🎉' : 'Template approved & all invitations generated successfully!')
        
        // Navigate back to event invitations tab
        navigate(`/dashboard/events/${eventId}?tab=invitations`)
      } else {
        toast.success(isAr ? 'تم حفظ القالب بنجاح' : 'Template saved')
      }
    } catch {
      toast.error('حدث خطأ أثناء إنشاء الدعوات')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            {eventId && (
              <Button variant="ghost" size="sm" onClick={() => navigate(`/dashboard/events/${eventId}`)} className="h-8 w-8 p-0">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <h1 className="flex items-center gap-2 text-xl font-bold sm:text-2xl">
              <Sparkles className="h-5 w-5 text-gold" /> {isAr ? 'تنسيق واعتماد قالب الدعوة' : 'Invitation Template Designer'}
            </h1>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {isAr ? 'الخطوة الإلزامية لتخصيص بطاقة الدعوة قبل توليدها للمدعوين.' : 'Mandatory step to customize and approve your invitation design.'}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => navigate(`/dashboard/templates`)}>
            <LayoutTemplate className="h-4 w-4" /> {isAr ? 'استعراض القوالب' : 'Templates'}
          </Button>
          <Button variant="secondary" onClick={handleSave} loading={saving}>
            <Save className="h-4 w-4" /> {isAr ? 'حفظ المسودة' : 'Save Draft'}
          </Button>
          {eventId && (
            <Button
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-md"
              onClick={handleApproveAndGenerate}
              loading={generating}
            >
              <CheckCircle2 className="h-4 w-4 me-1.5" />
              {isAr ? `اعتماد القالب وتوليد الدعوات (${guestsCount} مدعو) 🚀` : `Approve & Generate for ${guestsCount} Guests`}
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <div className="hidden rounded-xl border border-border/70 bg-card p-5 lg:block shadow-sm">
          <ControlsPanel design={design} update={update} isAr={isAr} t={t} />
        </div>

        <div className="flex flex-col items-center gap-4">
          <div className="flex w-full items-center justify-center rounded-2xl bg-muted/30 p-6 sm:p-10 border border-border/50">
            <InvitationPreviewCard design={design} qrValue={`DAAWATAK-${eventId || 'DEMO'}-PREVIEW`} />
          </div>
          <Button variant="outline" className="w-full lg:hidden" onClick={() => setMobileControlsOpen(true)}>
            <SlidersHorizontal className="h-4 w-4" /> {isAr ? 'فتح خيارات التنسيق والتصميم' : 'Open Design Controls'}
          </Button>
        </div>
      </div>

      <Dialog open={mobileControlsOpen} onOpenChange={setMobileControlsOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{isAr ? 'خيارات وتنسيق القالب' : 'Design Controls'}</DialogTitle>
          </DialogHeader>
          <ControlsPanel design={design} update={update} isAr={isAr} t={t} />
        </DialogContent>
      </Dialog>
    </div>
  )
}
