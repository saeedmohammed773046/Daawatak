import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'
import { useI18n } from '@/i18n'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { authService } from '@/services/auth.service'
import { toast } from 'sonner'

export default function ResetPasswordPage() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const token = params.get('token') || 'mock-token'

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [errors, setErrors] = useState<{ password?: string; confirm?: string }>({})
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const next: typeof errors = {}
    if (password.length < 8) next.password = 'كلمة المرور يجب أن تكون 8 أحرف على الأقل'
    if (confirm !== password) next.confirm = 'كلمتا المرور غير متطابقتين'
    setErrors(next)
    if (Object.keys(next).length) return
    setLoading(true)
    try {
      await authService.resetPassword(token, password)
      setDone(true)
      toast.success('تم تعيين كلمة المرور الجديدة بنجاح')
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <CheckCircle2 className="h-14 w-14 text-success" />
        <h1 className="text-xl font-bold">تم تعيين كلمة المرور</h1>
        <p className="text-sm text-muted-foreground">يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة.</p>
        <Button onClick={() => navigate('/login')}>{t.auth.backToLogin}</Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">{t.auth.resetTitle}</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">{t.auth.resetSubtitle}</p>
      </div>
      <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
        <div className="flex flex-col gap-2">
          <Label htmlFor="password">{t.auth.password}</Label>
          <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} error={!!errors.password} />
          {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="confirm">{t.auth.confirmPassword}</Label>
          <Input id="confirm" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} error={!!errors.confirm} />
          {errors.confirm && <p className="text-xs text-destructive">{errors.confirm}</p>}
        </div>
        <Button type="submit" size="lg" loading={loading}>
          {t.auth.resetPassword}
        </Button>
      </form>
    </div>
  )
}
