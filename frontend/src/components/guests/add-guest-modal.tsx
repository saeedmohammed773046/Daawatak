import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { guestsService } from '@/services/guests.service'
import type { GuestCategory } from '@/types'
import { toast } from 'sonner'

interface AddGuestModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  eventId: string
  onAdded: () => void
}

export function AddGuestModal({ open, onOpenChange, eventId, onAdded }: AddGuestModalProps) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [category, setCategory] = useState<GuestCategory>('family')
  const [companions, setCompanions] = useState('0')
  const [notes, setNotes] = useState('')
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({})
  const [saving, setSaving] = useState(false)

  function reset() {
    setName(''); setPhone(''); setEmail(''); setCategory('family'); setCompanions('0'); setNotes(''); setErrors({})
  }

  function validate() {
    const next: typeof errors = {}
    if (!name.trim()) next.name = 'اسم المدعو مطلوب'
    if (!phone.trim()) next.phone = 'رقم الهاتف مطلوب'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit() {
    if (!validate()) return
    setSaving(true)
    try {
      await guestsService.create(eventId, {
        name,
        phone,
        email: email || undefined,
        category,
        notes: notes || undefined,
        companions: Number(companions) || 0,
      })
      toast.success('تمت إضافة المدعو بنجاح')
      reset()
      onOpenChange(false)
      onAdded()
    } catch {
      toast.error('تعذر إضافة المدعو، حاول مرة أخرى')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) reset() }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>إضافة مدعو جديد</DialogTitle>
          <DialogDescription>أدخل بيانات المدعو لإضافته إلى قائمة ضيوف المناسبة.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="guest-name">الاسم الكامل</Label>
            <Input id="guest-name" value={name} onChange={(e) => setName(e.target.value)} error={!!errors.name} placeholder="مثال: عبدالرحمن السالم" />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="guest-phone">رقم الهاتف</Label>
              <Input id="guest-phone" value={phone} onChange={(e) => setPhone(e.target.value)} error={!!errors.phone} placeholder="05xxxxxxxx" />
              {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="guest-companions">عدد المرافقين</Label>
              <Input id="guest-companions" type="number" min={0} value={companions} onChange={(e) => setCompanions(e.target.value)} />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="guest-email">البريد الإلكتروني {`(${'اختياري'})`}</Label>
            <Input id="guest-email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="example@email.com" />
          </div>
          <div className="flex flex-col gap-2">
            <Label>فئة المدعو</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as GuestCategory)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="family">العائلة</SelectItem>
                <SelectItem value="friends">الأصدقاء</SelectItem>
                <SelectItem value="work">العمل</SelectItem>
                <SelectItem value="vip">كبار الشخصيات</SelectItem>
                <SelectItem value="other">أخرى</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="guest-notes">ملاحظات (اختياري)</Label>
            <Textarea id="guest-notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="أي ملاحظات إضافية عن المدعو..." />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>إلغاء</Button>
          <Button onClick={handleSubmit} loading={saving}>إضافة المدعو</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
