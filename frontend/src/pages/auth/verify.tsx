import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'
import { useI18n } from '@/i18n'
import { Button } from '@/components/ui/button'
import { authService } from '@/services/auth.service'
import { toast } from 'sonner'

export default function VerifyPage() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const [code, setCode] = useState<string[]>(Array(6).fill(''))
  const [loading, setLoading] = useState(false)
  const inputsRef = useRef<(HTMLInputElement | null)[]>([])

  function handleChange(index: number, value: string) {
    if (!/^\d?$/.test(value)) return
    const next = [...code]
    next[index] = value
    setCode(next)
    if (value && index < 5) inputsRef.current[index + 1]?.focus()
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputsRef.current[index - 1]?.focus()
    }
  }

  async function onVerify() {
    setLoading(true)
    try {
      await authService.verifyAccount(code.join(''))
      toast.success('تم تفعيل حسابك بنجاح')
      navigate('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <ShieldCheck className="h-8 w-8" />
      </div>
      <div>
        <h1 className="text-2xl font-bold">{t.auth.verifyTitle}</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">{t.auth.verifySubtitle}</p>
      </div>

      <div className="flex justify-center gap-2" dir="ltr">
        {code.map((digit, i) => (
          <input
            key={i}
            ref={(el) => (inputsRef.current[i] = el)}
            value={digit}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            maxLength={1}
            inputMode="numeric"
            className="h-12 w-11 rounded-lg border border-input bg-background text-center text-lg font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        ))}
      </div>

      <Button size="lg" className="w-full" loading={loading} onClick={onVerify} disabled={code.some((c) => !c)}>
        {t.auth.verify}
      </Button>
      <button className="text-sm font-medium text-primary hover:underline">{t.auth.resendCode}</button>
    </div>
  )
}
