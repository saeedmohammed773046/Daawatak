import { Link } from 'react-router-dom'
import { ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/i18n'
import { useAuthStore } from '@/store/auth.store'

export default function ForbiddenPage() {
  const { t } = useI18n()
  const { user } = useAuthStore()
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
        <ShieldAlert className="h-10 w-10" />
      </div>
      <h1 className="text-4xl font-bold">403</h1>
      <h2 className="text-lg font-semibold">غير مصرح لك بالوصول لهذه الصفحة</h2>
      <p className="max-w-sm text-sm text-muted-foreground">ليس لديك الصلاحيات الكافية لعرض هذا المحتوى. تواصل مع مدير النظام إذا كنت تعتقد أن هذا خطأ.</p>
      <Button asChild className="mt-2">
        <Link to={user?.role === 'admin' ? '/admin' : '/dashboard'}>{t.common.goDashboard}</Link>
      </Button>
    </div>
  )
}
