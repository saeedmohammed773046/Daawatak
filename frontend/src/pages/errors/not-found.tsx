import { Link } from 'react-router-dom'
import { Compass } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/i18n'

export default function NotFoundPage() {
  const { t } = useI18n()
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Compass className="h-10 w-10" />
      </div>
      <h1 className="text-4xl font-bold">404</h1>
      <h2 className="text-lg font-semibold">هذه الصفحة غير موجودة</h2>
      <p className="max-w-sm text-sm text-muted-foreground">الصفحة التي تحاول الوصول إليها غير متوفرة أو تم نقلها إلى رابط آخر.</p>
      <Button asChild className="mt-2">
        <Link to="/">{t.common.goHome}</Link>
      </Button>
    </div>
  )
}
