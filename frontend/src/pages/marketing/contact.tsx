import { useState } from 'react'
import { Mail, Phone, MapPin, CheckCircle2 } from 'lucide-react'
import { useI18n } from '@/i18n'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { contactService } from '@/services/contact.service'
import { toast } from 'sonner'

type FormState = { name: string; email: string; phone: string; subject: string; message: string }
type Errors = Partial<Record<keyof FormState, string>>

export default function ContactPage() {
  const { t } = useI18n()
  const [form, setForm] = useState<FormState>({ name: '', email: '', phone: '', subject: '', message: '' })
  const [errors, setErrors] = useState<Errors>({})
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  function validate(): boolean {
    const next: Errors = {}
    if (!form.name.trim()) next.name = 'الاسم مطلوب'
    if (!form.email.trim()) next.email = 'البريد الإلكتروني مطلوب'
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = 'صيغة البريد الإلكتروني غير صحيحة'
    if (!form.subject.trim()) next.subject = 'الموضوع مطلوب'
    if (!form.message.trim() || form.message.length < 10) next.message = 'الرسالة قصيرة جدًا (10 أحرف على الأقل)'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setStatus('loading')
    try {
      await contactService.send(form)
      setStatus('success')
      toast.success(t.contact.success)
      setForm({ name: '', email: '', phone: '', subject: '', message: '' })
    } catch {
      setStatus('error')
      toast.error(t.contact.error)
    }
  }

  return (
    <section className="py-14 sm:py-20">
      <div className="container grid gap-10 lg:grid-cols-[1fr,1.3fr]">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">{t.contact.heading}</h1>
          <p className="mt-3 text-muted-foreground">{t.contact.subheading}</p>

          <div className="mt-8 flex flex-col gap-4">
            {[
              { icon: Mail, label: 'البريد الإلكتروني', value: 'support@daawatak.com' },
              { icon: Phone, label: 'الهاتف / واتساب', value: '+967 770 000 000' },
              { icon: MapPin, label: 'الموقع', value: 'صنعاء، الجمهورية اليمنية' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <item.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <p className="text-sm font-medium">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Card>
          <CardContent className="p-6 sm:p-8">
            {status === 'success' ? (
              <div className="flex flex-col items-center gap-3 py-10 text-center">
                <CheckCircle2 className="h-12 w-12 text-success" />
                <h3 className="text-lg font-semibold">{t.contact.success}</h3>
                <Button variant="outline" onClick={() => setStatus('idle')}>
                  إرسال رسالة أخرى
                </Button>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="grid gap-5 sm:grid-cols-2" noValidate>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="name">{t.common.name}</Label>
                  <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} error={!!errors.name} />
                  {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="email">{t.common.email}</Label>
                  <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} error={!!errors.email} />
                  {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                </div>
                <div className="flex flex-col gap-2 sm:col-span-2">
                  <Label htmlFor="phone">
                    {t.common.phone} <span className="text-muted-foreground">({t.common.optional})</span>
                  </Label>
                  <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </div>
                <div className="flex flex-col gap-2 sm:col-span-2">
                  <Label htmlFor="subject">{t.contact.subject}</Label>
                  <Input id="subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} error={!!errors.subject} />
                  {errors.subject && <p className="text-xs text-destructive">{errors.subject}</p>}
                </div>
                <div className="flex flex-col gap-2 sm:col-span-2">
                  <Label htmlFor="message">{t.contact.message}</Label>
                  <Textarea id="message" rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} error={!!errors.message} />
                  {errors.message && <p className="text-xs text-destructive">{errors.message}</p>}
                </div>
                <div className="sm:col-span-2">
                  <Button type="submit" size="lg" className="w-full sm:w-auto" loading={status === 'loading'}>
                    {status === 'loading' ? t.contact.sending : t.contact.send}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
