import { useState } from 'react'
import { toast } from 'sonner'
import { Camera, Shield, CalendarClock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useAuthStore } from '@/store/auth.store'
import { formatDate, initials } from '@/lib/utils'

export default function ProfilePage() {
  const { user, login, token } = useAuthStore()
  const [name, setName] = useState(user?.name ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [phone, setPhone] = useState(user?.phone ?? '')
  const [saving, setSaving] = useState(false)

  if (!user) return null

  async function handleSave() {
    if (!user) return
    setSaving(true)
    await new Promise((r) => setTimeout(r, 600))
    login({ ...user, name, email, phone }, token ?? '')
    setSaving(false)
    toast.success('تم تحديث الملف الشخصي بنجاح')
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">الملف الشخصي</h1>
        <p className="mt-1 text-sm text-muted-foreground">إدارة معلومات حسابك الشخصية.</p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center gap-4 p-6 sm:flex-row sm:items-center sm:gap-6">
          <div className="relative">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
              {initials(user.name)}
            </div>
            <button
              type="button"
              className="absolute -bottom-1 -end-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-background bg-secondary text-secondary-foreground shadow-soft"
              aria-label="تغيير الصورة"
              onClick={() => toast.info('ميزة تغيير الصورة الشخصية قيد التطوير')}
            >
              <Camera className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="flex-1 space-y-1 text-center sm:text-start">
            <h2 className="text-lg font-semibold">{user.name}</h2>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <div className="flex flex-wrap items-center justify-center gap-2 pt-1 sm:justify-start">
              <Badge variant={user.role === 'admin' ? 'gold' : 'secondary'} className="gap-1">
                <Shield className="h-3 w-3" />
                {user.role === 'admin' ? 'مدير النظام' : 'مستخدم'}
              </Badge>
              <Badge variant="outline" className="gap-1">
                <CalendarClock className="h-3 w-3" />
                عضو منذ {formatDate(user.createdAt)}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>المعلومات الأساسية</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="profile-name">الاسم الكامل</Label>
              <Input id="profile-name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-phone">رقم الهاتف</Label>
              <Input id="profile-phone" value={phone} onChange={(e) => setPhone(e.target.value)} dir="ltr" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="profile-email">البريد الإلكتروني</Label>
            <Input id="profile-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} dir="ltr" />
          </div>
          <div className="flex justify-end pt-2">
            <Button onClick={handleSave} loading={saving}>
              حفظ التغييرات
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
