import { useState } from 'react'
import { toast } from 'sonner'
import { Sun, Moon, Laptop, Globe, Bell, ShieldCheck, User, KeyRound } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { useUiStore, type ThemeMode } from '@/store/ui.store'
import { useI18n } from '@/i18n'
import { useAuthStore } from '@/store/auth.store'
import { cn } from '@/lib/utils'

const themeOptions: { value: ThemeMode; label: string; icon: typeof Sun }[] = [
  { value: 'light', label: 'فاتح', icon: Sun },
  { value: 'dark', label: 'داكن', icon: Moon },
  { value: 'system', label: 'حسب النظام', icon: Laptop },
]

export default function SettingsPage() {
  const { theme, setTheme } = useUiStore()
  const { locale, setLocale } = useI18n()
  const { logout } = useAuthStore()
  const [notifPrefs, setNotifPrefs] = useState({ email: true, whatsapp: true, sms: false, marketing: false })
  const [deleteOpen, setDeleteOpen] = useState(false)

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">الإعدادات</h1>
        <p className="mt-1 text-sm text-muted-foreground">تحكم في إعدادات حسابك ومظهر التطبيق وخصوصيتك.</p>
      </div>

      <Tabs defaultValue="account">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="account"><User className="h-4 w-4" /><span className="hidden sm:inline">الحساب</span></TabsTrigger>
          <TabsTrigger value="appearance"><Sun className="h-4 w-4" /><span className="hidden sm:inline">المظهر</span></TabsTrigger>
          <TabsTrigger value="language"><Globe className="h-4 w-4" /><span className="hidden sm:inline">اللغة</span></TabsTrigger>
          <TabsTrigger value="notifications"><Bell className="h-4 w-4" /><span className="hidden sm:inline">الإشعارات</span></TabsTrigger>
          <TabsTrigger value="security"><ShieldCheck className="h-4 w-4" /><span className="hidden sm:inline">الأمان</span></TabsTrigger>
        </TabsList>

        {/* Account */}
        <TabsContent value="account" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>معلومات الحساب</CardTitle>
              <CardDescription>عدّل بياناتك الأساسية من صفحة الملف الشخصي.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" asChild>
                <a href="/dashboard/profile">الانتقال إلى الملف الشخصي</a>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance */}
        <TabsContent value="appearance" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>المظهر</CardTitle>
              <CardDescription>اختر المظهر المناسب لك — يدعم التطبيق الوضع الفاتح والداكن بشكل كامل.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                {themeOptions.map((opt) => {
                  const Icon = opt.icon
                  const active = theme === opt.value
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setTheme(opt.value)}
                      className={cn(
                        'flex flex-col items-center gap-2 rounded-xl border p-4 text-sm transition-colors',
                        active ? 'border-primary bg-primary/5 text-primary' : 'border-border hover:bg-accent'
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      {opt.label}
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Language */}
        <TabsContent value="language" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>اللغة والاتجاه</CardTitle>
              <CardDescription>يدعم التطبيق العربية (RTL) والإنجليزية (LTR) بالكامل.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setLocale('ar')}
                  className={cn(
                    'rounded-xl border p-4 text-center text-sm transition-colors',
                    locale === 'ar' ? 'border-primary bg-primary/5 text-primary' : 'border-border hover:bg-accent'
                  )}
                >
                  العربية
                </button>
                <button
                  type="button"
                  onClick={() => setLocale('en')}
                  className={cn(
                    'rounded-xl border p-4 text-center text-sm transition-colors',
                    locale === 'en' ? 'border-primary bg-primary/5 text-primary' : 'border-border hover:bg-accent'
                  )}
                >
                  English
                </button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>تفضيلات الإشعارات</CardTitle>
              <CardDescription>اختر القنوات التي تريد استقبال الإشعارات من خلالها.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {([
                ['email', 'إشعارات البريد الإلكتروني'],
                ['whatsapp', 'إشعارات واتساب'],
                ['sms', 'إشعارات الرسائل النصية'],
                ['marketing', 'رسائل تسويقية وعروض'],
              ] as const).map(([key, label]) => (
                <div key={key} className="flex items-center justify-between rounded-lg border p-3.5">
                  <Label htmlFor={`notif-${key}`} className="font-normal">{label}</Label>
                  <Switch
                    id={`notif-${key}`}
                    checked={notifPrefs[key]}
                    onCheckedChange={(v) => setNotifPrefs((p) => ({ ...p, [key]: v }))}
                  />
                </div>
              ))}
              <div className="flex justify-end pt-2">
                <Button onClick={() => toast.success('تم حفظ تفضيلات الإشعارات')}>حفظ التفضيلات</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security */}
        <TabsContent value="security" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><KeyRound className="h-4.5 w-4.5" /> تغيير كلمة المرور</CardTitle>
              <CardDescription>يفضّل استخدام كلمة مرور قوية لا تُستخدم في مواقع أخرى.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">كلمة المرور الحالية</Label>
                <Input id="current-password" type="password" dir="ltr" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="new-password">كلمة المرور الجديدة</Label>
                  <Input id="new-password" type="password" dir="ltr" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">تأكيد كلمة المرور</Label>
                  <Input id="confirm-password" type="password" dir="ltr" />
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <Button onClick={() => toast.success('تم تحديث كلمة المرور بنجاح')}>تحديث كلمة المرور</Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-destructive/30">
            <CardHeader>
              <CardTitle className="text-destructive">حذف الحساب</CardTitle>
              <CardDescription>حذف حسابك سيؤدي إلى إزالة جميع مناسباتك ودعواتك بشكل نهائي.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="destructive" onClick={() => setDeleteOpen(true)}>حذف الحساب نهائيًا</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="حذف الحساب نهائيًا"
        description="سيتم حذف جميع بياناتك ومناسباتك ودعواتك بشكل نهائي ولا يمكن التراجع عن هذا الإجراء. هل أنت متأكد؟"
        confirmLabel="حذف الحساب"
        variant="destructive"
        onConfirm={() => {
          setDeleteOpen(false)
          logout()
          toast.success('تم حذف الحساب')
        }}
      />
    </div>
  )
}
