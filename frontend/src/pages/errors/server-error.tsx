import { Link } from 'react-router-dom'
import { ServerCrash } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/i18n'

export default function ServerErrorPage() {
  const { t } = useI18n()
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-warning/10 text-warning">
        <ServerCrash className="h-10 w-10" />
      </div>
      <h1 className="text-4xl font-bold">500</h1>
      <h2 className="text-lg font-semibold">حدث خطأ في الخادم</h2>
      <p className="max-w-sm text-sm text-muted-foreground">نعمل على حل المشكلة الآن، من فضلك حاول مرة أخرى بعد قليل.</p>
      <Button asChild className="mt-2">
        <Link to="/">{t.common.goHome}</Link>
      </Button>
    </div>
  )
}
