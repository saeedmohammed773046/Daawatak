import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Check,
  CalendarDays,
  Clock,
  MapPin,
  ImagePlus,
  ClipboardCheck,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { eventTypeIcon } from '@/components/events/event-type-icon'
import { eventsService } from '@/services/events.service'
import type { EventType } from '@/types'
import { useI18n } from '@/i18n'
import { toast } from 'sonner'

const eventTypes: EventType[] = ['wedding', 'engagement', 'religious', 'graduation', 'birthday', 'conference', 'training', 'meeting', 'opening', 'special']

interface FormState {
  title: string
  type: EventType | ''
  date: string
  time: string
  venue: string
  city: string
  coverUrl: string
  description: string
}

const steps = [
  { key: 'info', label: 'معلومات المناسبة', icon: ClipboardCheck },
  { key: 'datetime', label: 'التاريخ والوقت', icon: CalendarDays },
  { key: 'location', label: 'الموقع', icon: MapPin },
  { key: 'media', label: 'الصورة والوصف', icon: ImagePlus },
  { key: 'review', label: 'المراجعة والتأكيد', icon: Check },
]

export default function EventCreateWizardPage() {
  const { t, locale } = useI18n()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)
  const [savingDraft, setSavingDraft] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [form, setForm] = useState<FormState>({
    title: '',
    type: '',
    date: '',
    time: '',
    venue: '',
    city: '',
    coverUrl: '',
    description: '',
  })

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }))
    setErrors((e) => ({ ...e, [key]: '' }))
  }

  function validateStep(index: number): boolean {
    const next: Record<string, string> = {}
    if (index === 0) {
      if (!form.title.trim()) next.title = 'اسم المناسبة مطلوب'
      if (!form.type) next.type = 'يرجى اختيار نوع المناسبة'
    }
    if (index === 1) {
      if (!form.date) next.date = 'التاريخ مطلوب'
      if (!form.time) next.time = 'الوقت مطلوب'
    }
    if (index === 2) {
      if (!form.venue.trim()) next.venue = 'اسم القاعة/الموقع مطلوب'
      if (!form.city.trim()) next.city = 'المدينة مطلوبة'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  function goNext() {
    if (!validateStep(step)) return
    setStep((s) => Math.min(s + 1, steps.length - 1))
  }
  function goPrev() {
    setStep((s) => Math.max(s - 1, 0))
  }

  async function handleSaveDraft() {
    setSavingDraft(true)
    try {
      await eventsService.create({ ...form, type: (form.type || 'special') as EventType })
      toast.success('تم حفظ المناسبة كمسودة بنجاح')
      navigate('/dashboard/events')
    } catch {
      toast.error('تعذر حفظ المسودة، حاول مرة أخرى')
    } finally {
      setSavingDraft(false)
    }
  }

  async function handleSubmit() {
    if (!validateStep(0) || !validateStep(1) || !validateStep(2)) {
      setStep(0)
      return
    }
    setSaving(true)
    try {
      const event = await eventsService.create({ ...form, type: form.type as EventType })
      toast.success('تم إنشاء المناسبة بنجاح 🎉')
      navigate(`/dashboard/events/${event.id}`)
    } catch {
      toast.error('حدث خطأ أثناء إنشاء المناسبة')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold sm:text-2xl">إنشاء مناسبة جديدة</h1>
        <p className="mt-1 text-sm text-muted-foreground">أكمل الخطوات التالية لإنشاء مناسبتك بسهولة.</p>
      </div>

      {/* Progress Indicator */}
      <div className="flex items-center">
        {steps.map((s, i) => {
          const Icon = s.icon
          const isActive = i === step
          const isDone = i < step
          return (
            <div key={s.key} className="flex flex-1 items-center last:flex-none">
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={
                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors ' +
                    (isDone
                      ? 'border-primary bg-primary text-primary-foreground'
                      : isActive
                      ? 'border-primary text-primary'
                      : 'border-border text-muted-foreground')
                  }
                >
                  {isDone ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                </div>
                <span className={'hidden text-center text-[11px] font-medium sm:block ' + (isActive ? 'text-foreground' : 'text-muted-foreground')}>
                  {s.label}
                </span>
              </div>
              {i < steps.length - 1 && <div className={'mx-1 h-0.5 flex-1 rounded ' + (isDone ? 'bg-primary' : 'bg-border')} />}
            </div>
          )
        })}
      </div>

      <Card>
        <CardContent className="p-6">
          {step === 0 && (
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <Label htmlFor="title">اسم المناسبة</Label>
                <Input id="title" value={form.title} onChange={(e) => update('title', e.target.value)} error={!!errors.title} placeholder="مثال: حفل زفاف أحمد وسارة" />
                {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
              </div>
              <div className="flex flex-col gap-2">
                <Label>نوع المناسبة</Label>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                  {eventTypes.map((type) => {
                    const Icon = eventTypeIcon(type)
                    const active = form.type === type
                    return (
                      <button
                        type="button"
                        key={type}
                        onClick={() => update('type', type)}
                        className={
                          'flex flex-col items-center gap-2 rounded-xl border p-3 text-xs font-medium transition-all ' +
                          (active ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:border-primary/40')
                        }
                      >
                        <Icon className="h-5 w-5" />
                        {(t.eventTypes as any)[type]}
                      </button>
                    )
                  })}
                </div>
                {errors.type && <p className="text-xs text-destructive">{errors.type}</p>}
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="date">تاريخ المناسبة</Label>
                <Input id="date" type="date" value={form.date} onChange={(e) => update('date', e.target.value)} error={!!errors.date} />
                {errors.date && <p className="text-xs text-destructive">{errors.date}</p>}
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="time">الوقت</Label>
                <Input id="time" type="time" value={form.time} onChange={(e) => update('time', e.target.value)} error={!!errors.time} />
                {errors.time && <p className="text-xs text-destructive">{errors.time}</p>}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <Label htmlFor="venue">القاعة / الموقع</Label>
                <Input id="venue" value={form.venue} onChange={(e) => update('venue', e.target.value)} error={!!errors.venue} placeholder="مثال: قصر الأفراح الملكي" />
                {errors.venue && <p className="text-xs text-destructive">{errors.venue}</p>}
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="city">المدينة</Label>
                <Select value={form.city} onValueChange={(v) => update('city', v)}>
                  <SelectTrigger id="city" className={errors.city ? 'border-destructive' : ''}>
                    <SelectValue placeholder="اختر المدينة" />
                  </SelectTrigger>
                  <SelectContent>
                    {['صنعاء', 'عدن', 'تعز', 'حضرموت (المكلا / سيئون)', 'إب', 'الحديدة', 'ذمار', 'مأرب', 'شبوة', 'صعدة', 'المهرة'].map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.city && <p className="text-xs text-destructive">{errors.city}</p>}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <Label htmlFor="coverUrl">رابط صورة الغلاف {t.common.optional}</Label>
                <Input id="coverUrl" value={form.coverUrl} onChange={(e) => update('coverUrl', e.target.value)} placeholder="https://..." />
                <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-border bg-muted/40 text-sm text-muted-foreground">
                  {form.coverUrl ? (
                    <img src={form.coverUrl} alt="غلاف المناسبة" className="h-full w-full rounded-xl object-cover" onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')} />
                  ) : (
                    <span className="flex items-center gap-2"><ImagePlus className="h-5 w-5" /> لم تتم إضافة صورة غلاف بعد</span>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="description">وصف المناسبة {t.common.optional}</Label>
                <Textarea id="description" value={form.description} onChange={(e) => update('description', e.target.value)} placeholder="اكتب رسالة ترحيبية مختصرة لضيوفك..." />
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="flex flex-col gap-4">
              <h3 className="text-base font-semibold">مراجعة تفاصيل المناسبة</h3>
              <div className="grid gap-3 rounded-xl border border-border/70 bg-muted/30 p-4 text-sm sm:grid-cols-2">
                <div><span className="text-muted-foreground">اسم المناسبة: </span><span className="font-medium">{form.title || '—'}</span></div>
                <div><span className="text-muted-foreground">النوع: </span><span className="font-medium">{form.type ? (t.eventTypes as any)[form.type] : '—'}</span></div>
                <div><span className="text-muted-foreground">التاريخ: </span><span className="font-medium">{form.date || '—'}</span></div>
                <div><span className="text-muted-foreground">الوقت: </span><span className="font-medium">{form.time || '—'}</span></div>
                <div><span className="text-muted-foreground">الموقع: </span><span className="font-medium">{form.venue || '—'}</span></div>
                <div><span className="text-muted-foreground">المدينة: </span><span className="font-medium">{form.city || '—'}</span></div>
              </div>
              {form.description && <p className="rounded-xl bg-primary/5 p-4 text-sm text-muted-foreground">{form.description}</p>}
              <p className="text-xs text-muted-foreground">بمجرد الضغط على "إنشاء المناسبة" ستتمكن من إضافة المدعوين وتصميم الدعوات وإرسالها.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between gap-3">
        <div className="flex gap-2">
          {step > 0 && (
            <Button variant="outline" onClick={goPrev}>
              {locale === 'ar' ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />} {t.common.previous}
            </Button>
          )}
          <Button variant="ghost" onClick={handleSaveDraft} loading={savingDraft}>
            {t.common.saveDraft}
          </Button>
        </div>
        {step < steps.length - 1 ? (
          <Button onClick={goNext}>
            {t.common.next} {locale === 'ar' ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        ) : (
          <Button onClick={handleSubmit} loading={saving}>
            <Check className="h-4 w-4" /> إنشاء المناسبة
          </Button>
        )}
      </div>
    </div>
  )
}
