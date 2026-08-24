import { useState } from 'react'
import { toast } from 'sonner'
import { Globe2, ShieldCheck } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useI18n } from '@/i18n'

export default function AdminSettingsPage() {
  const { t, locale } = useI18n()
  const isAr = locale === 'ar'
  const [platformName, setPlatformName] = useState(isAr ? 'دعوتك' : 'Daawatak')
  const [maintenance, setMaintenance] = useState(false)
  const [allowRegistrations, setAllowRegistrations] = useState(true)

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{isAr ? 'إعدادات النظام' : 'System Settings'}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {isAr ? 'التحكم في الإعدادات العامة لمنصة دعوتك وسياسات الأمان.' : 'Manage platform configuration, registration rules, and system maintenance.'}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe2 className="h-4.5 w-4.5" /> {isAr ? 'الإعدادات العامة' : 'General Configuration'}
          </CardTitle>
          <CardDescription>
            {isAr ? 'اسم المنصة والمعلومات الأساسية.' : 'Platform identity, brand name, and public metadata.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="platform-name">{isAr ? 'اسم المنصة' : 'Platform Name'}</Label>
            <Input id="platform-name" value={platformName} onChange={(e) => setPlatformName(e.target.value)} />
          </div>
          <div className="flex justify-end">
            <Button onClick={() => toast.success(isAr ? 'تم حفظ الإعدادات العامة بنجاح' : 'General settings saved successfully')}>
              {t.common.save}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-4.5 w-4.5" /> {isAr ? 'الوصول والأمان' : 'Access & Security'}
          </CardTitle>
          <CardDescription>
            {isAr ? 'التحكم في وصول المستخدمين إلى المنصة.' : 'User registration control and system maintenance mode.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border border-border p-3.5">
            <div>
              <Label htmlFor="allow-registrations" className="font-semibold text-sm">
                {isAr ? 'السماح بتسجيل حسابات جديدة' : 'Allow New User Registrations'}
              </Label>
              <p className="text-xs text-muted-foreground">
                {isAr ? 'عند التعطيل، لن يتمكن مستخدمون جدد من إنشاء حسابات.' : 'When disabled, new users cannot register on the platform.'}
              </p>
            </div>
            <Switch id="allow-registrations" checked={allowRegistrations} onCheckedChange={setAllowRegistrations} />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border p-3.5">
            <div>
              <Label htmlFor="maintenance-mode" className="font-semibold text-sm">
                {isAr ? 'وضع الصيانة' : 'Maintenance Mode'}
              </Label>
              <p className="text-xs text-muted-foreground">
                {isAr ? 'عند التفعيل، ستظهر رسالة صيانة لجميع المستخدمين عدا المدراء.' : 'When enabled, a maintenance splash will be shown to non-admin users.'}
              </p>
            </div>
            <Switch id="maintenance-mode" checked={maintenance} onCheckedChange={setMaintenance} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
