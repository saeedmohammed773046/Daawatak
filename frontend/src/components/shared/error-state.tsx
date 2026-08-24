import { AlertTriangle, WifiOff, ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useI18n } from '@/i18n'

interface ErrorStateProps {
  variant?: 'generic' | 'network' | 'unauthorized'
  title?: string
  description?: string
  onRetry?: () => void
  className?: string
}

export function ErrorState({ variant = 'generic', title, description, onRetry, className }: ErrorStateProps) {
  const { t } = useI18n()
  const Icon = variant === 'network' ? WifiOff : variant === 'unauthorized' ? ShieldAlert : AlertTriangle
  const defaultTitle =
    variant === 'network' ? 'تعذر الاتصال بالشبكة' : variant === 'unauthorized' ? 'غير مصرح لك بالوصول' : 'حدث خطأ غير متوقع'
  const defaultDesc =
    variant === 'network'
      ? 'تحقق من اتصالك بالإنترنت وحاول مرة أخرى.'
      : variant === 'unauthorized'
      ? 'ليس لديك صلاحية لعرض هذا المحتوى.'
      : 'نعمل على حل المشكلة، من فضلك حاول مرة أخرى بعد قليل.'

  return (
    <div className={cn('flex flex-col items-center justify-center gap-3 rounded-xl border border-border bg-card px-6 py-16 text-center', className)}>
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
        <Icon className="h-8 w-8" />
      </div>
      <h3 className="text-lg font-semibold">{title || defaultTitle}</h3>
      <p className="max-w-sm text-sm text-muted-foreground">{description || defaultDesc}</p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry} className="mt-2">
          {t.common.tryAgain}
        </Button>
      )}
    </div>
  )
}
