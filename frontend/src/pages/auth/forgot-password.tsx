import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MailCheck } from 'lucide-react'
import { useI18n } from '@/i18n'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { authService } from '@/services/auth.service'

export default function ForgotPasswordPage() {
  const { t } = useI18n()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) {
      setError('يرجى إدخال بريد إلكتروني صحيح')
      return
    }
    setError('')
    setLoading(true)
    try {
      await authService.forgotPassword(email)
      setSent(true)
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-success/10 text-success">
          <MailCheck className="h-8 w-8" />
        </div>
        <h1 className="text-xl font-bold">تم إرسال الرابط بنجاح</h1>
        <p className="text-sm text-muted-foreground">
          تحقق من بريدك الإلكتروني <span className="font-medium text-foreground">{email}</span> واتبع التعليمات لإعادة تعيين كلمة المرور.
        </p>
        <Button variant="outline" asChild className="mt-2">
          <Link to="/login">{t.auth.backToLogin}</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">{t.auth.forgotTitle}</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">{t.auth.forgotSubtitle}</p>
      </div>
      <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
        <div className="flex flex-col gap-2">
          <Label htmlFor="email">{t.common.email}</Label>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} error={!!error} />
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
        <Button type="submit" size="lg" loading={loading}>
          {t.auth.sendResetLink}
        </Button>
      </form>
      <Link to="/login" className="text-center text-sm font-medium text-primary hover:underline">
        {t.auth.backToLogin}
      </Link>
    </div>
  )
}
