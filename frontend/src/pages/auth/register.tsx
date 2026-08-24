import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { useI18n } from '@/i18n'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { authService } from '@/services/auth.service'
import { useAuthStore } from '@/store/auth.store'
import { toast } from 'sonner'

type Form = { name: string; email: string; phone: string; password: string; confirmPassword: string; agree: boolean }
type Errors = Partial<Record<keyof Form, string>>

export default function RegisterPage() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const login = useAuthStore((s) => s.login)

  const [form, setForm] = useState<Form>({ name: '', email: '', phone: '', password: '', confirmPassword: '', agree: false })
  const [errors, setErrors] = useState<Errors>({})
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  function validate(): boolean {
    const next: Errors = {}
    if (!form.name.trim()) next.name = 'الاسم مطلوب'
    if (!form.email.trim()) next.email = 'البريد الإلكتروني مطلوب'
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = 'صيغة البريد غير صحيحة'
    if (!form.phone.trim()) next.phone = 'رقم الهاتف مطلوب'
    if (form.password.length < 8) next.password = 'كلمة المرور يجب أن تكون 8 أحرف على الأقل'
    if (form.confirmPassword !== form.password) next.confirmPassword = 'كلمتا المرور غير متطابقتين'
    if (!form.agree) next.agree = 'يجب الموافقة على الشروط والأحكام'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      const { user, token } = await authService.register(form)
      login(user, token)
      toast.success('تم إنشاء الحساب بنجاح، مرحبًا بك في دعوتك!')
      navigate('/dashboard', { replace: true })
    } catch {
      toast.error('تعذر إنشاء الحساب، حاول مرة أخرى')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">{t.auth.registerTitle}</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">{t.auth.registerSubtitle}</p>
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
        <div className="flex flex-col gap-2">
          <Label htmlFor="name">{t.auth.fullName}</Label>
          <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} error={!!errors.name} />
          {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">{t.common.email}</Label>
            <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} error={!!errors.email} />
            {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="phone">{t.common.phone}</Label>
            <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} error={!!errors.phone} />
            {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="password">{t.auth.password}</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              error={!!errors.password}
              className="pe-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute inset-y-0 end-0 flex w-10 items-center justify-center text-muted-foreground"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="confirmPassword">{t.auth.confirmPassword}</Label>
          <Input
            id="confirmPassword"
            type={showPassword ? 'text' : 'password'}
            value={form.confirmPassword}
            onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
            error={!!errors.confirmPassword}
          />
          {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword}</p>}
        </div>

        <div className="flex items-start gap-2">
          <Checkbox id="agree" checked={form.agree} onCheckedChange={(v) => setForm({ ...form, agree: !!v })} className="mt-0.5" />
          <Label htmlFor="agree" className="cursor-pointer text-sm font-normal leading-relaxed">
            {t.auth.agreeTerms}
          </Label>
        </div>
        {errors.agree && <p className="text-xs text-destructive">{errors.agree}</p>}

        <Button type="submit" size="lg" loading={loading}>
          {t.auth.createAccount}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        {t.auth.hasAccount}{' '}
        <Link to="/login" className="font-medium text-primary hover:underline">
          {t.auth.login}
        </Link>
      </p>
    </div>
  )
}
