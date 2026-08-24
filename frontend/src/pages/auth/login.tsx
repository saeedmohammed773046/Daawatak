import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Eye, EyeOff, ShieldCheck, Calendar, ScanLine, Zap, ArrowLeft } from 'lucide-react'
import { useI18n } from '@/i18n'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { authService } from '@/services/auth.service'
import { useAuthStore } from '@/store/auth.store'
import { toast } from 'sonner'

interface QuickAccount {
  roleTitle: string
  roleKey: string
  identifier: string
  phoneDisplay: string
  password: string
  target: string
  targetLabel: string
  icon: typeof ShieldCheck
  badgeColor: string
}

const quickAccounts: QuickAccount[] = [
  {
    roleTitle: 'منظم الفعاليات (Event Owner)',
    roleKey: 'owner',
    identifier: 'owner@daawatak.com',
    phoneDisplay: '770000002',
    password: 'password123',
    target: '/dashboard',
    targetLabel: 'لوحة التحكم',
    icon: Calendar,
    badgeColor: 'border-primary/30 bg-primary/10 text-primary',
  },
  {
    roleTitle: 'مدير النظام (Super Admin)',
    roleKey: 'admin',
    identifier: 'admin@gmail.com',
    phoneDisplay: '770000001',
    password: '123456789',
    target: '/admin',
    targetLabel: 'لوحة تحكم المدير',
    icon: ShieldCheck,
    badgeColor: 'border-gold/30 bg-gold/10 text-gold',
  },
]

export default function LoginPage() {
  const { t, locale } = useI18n()
  const navigate = useNavigate()
  const location = useLocation()
  const login = useAuthStore((s) => s.login)

  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(true)
  const [errors, setErrors] = useState<{ identifier?: string; password?: string }>({})
  const [loading, setLoading] = useState(false)
  const [quickLoading, setQuickLoading] = useState<string | null>(null)

  function validate() {
    const next: typeof errors = {}
    if (!identifier.trim()) next.identifier = 'هذا الحقل مطلوب'
    if (!password.trim()) next.password = 'كلمة المرور مطلوبة'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleLogin(targetIdentifier: string, targetPassword: string, defaultTarget?: string) {
    try {
      const { user, token } = await authService.login({ identifier: targetIdentifier, password: targetPassword })
      login(user, token)
      toast.success(`مرحباً بك، تم تسجيل الدخول كـ ${user.name}`)
      const from = (location.state as any)?.from
      const target = defaultTarget || (user.role === 'admin' ? '/admin' : user.role === 'reception' ? '/reception' : '/dashboard')
      navigate(from || target, { replace: true })
    } catch {
      toast.error('تعذر تسجيل الدخول، تحقق من البيانات المدخلة')
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      await handleLogin(identifier, password)
    } finally {
      setLoading(false)
    }
  }

  async function handleQuickLogin(account: QuickAccount) {
    setQuickLoading(account.roleKey)
    setIdentifier(account.identifier)
    setPassword(account.password)
    try {
      await handleLogin(account.identifier, account.password, account.target)
    } finally {
      setQuickLoading(null)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">{t.auth.loginTitle}</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">{t.auth.loginSubtitle}</p>
      </div>

      {/* Quick Login Accounts Section */}
      <div className="rounded-xl border border-border/80 bg-card/60 p-3.5 sm:p-4">
        <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-foreground">
          <Zap className="h-4 w-4 text-gold" />
          <span>تسجيل دخول سريع بنقرة واحدة (حسابات جاهزة):</span>
        </div>
        <div className="flex flex-col gap-2">
          {quickAccounts.map((acc) => {
            const Icon = acc.icon
            const isThisLoading = quickLoading === acc.roleKey
            return (
              <button
                key={acc.roleKey}
                type="button"
                disabled={loading || quickLoading !== null}
                onClick={() => handleQuickLogin(acc)}
                className="group relative flex items-center justify-between rounded-lg border border-border/60 bg-background/80 p-2.5 text-start transition-all hover:border-primary/60 hover:bg-accent/40 active:scale-[0.99] disabled:opacity-50"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-card border border-border/70 text-foreground group-hover:text-primary">
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold truncate text-foreground group-hover:text-primary">{acc.roleTitle}</p>
                    </div>
                    <p className="text-[11px] text-muted-foreground truncate dir-ltr text-end sm:text-start">
                      {acc.identifier} • {acc.phoneDisplay}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 ms-2">
                  <span className={`hidden sm:inline-block rounded-md border px-2 py-0.5 text-[10px] font-medium ${acc.badgeColor}`}>
                    {acc.targetLabel}
                  </span>
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-accent/60 text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    {isThisLoading ? (
                      <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    ) : (
                      <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-0 ltr:rotate-180" />
                    )}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
        <p className="mt-2 text-center text-[11px] text-muted-foreground">
          📱 موظفو الاستقبال وحراس البوابات يسجلون دخولهم عبر <strong className="text-foreground">تطبيق الهاتف (Flutter App)</strong> لمسح التذاكر بالكاميرا.
        </p>
      </div>

      <div className="relative flex items-center justify-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <span className="relative bg-background px-3 text-xs text-muted-foreground">أو أدخل بياناتك يدويًا</span>
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="identifier">{t.auth.emailOrPhone}</Label>
          <Input id="identifier" value={identifier} onChange={(e) => setIdentifier(e.target.value)} error={!!errors.identifier} placeholder="you@example.com أو 770000002" />
          {errors.identifier && <p className="text-xs text-destructive">{errors.identifier}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">{t.auth.password}</Label>
            <Link to="/forgot-password" className="text-xs font-medium text-primary hover:underline">
              {t.auth.forgotPassword}
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={!!errors.password}
              className="pe-10"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute inset-y-0 end-0 flex w-10 items-center justify-center text-muted-foreground"
              aria-label="toggle password visibility"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
        </div>

        <div className="flex items-center gap-2">
          <Checkbox id="remember" checked={remember} onCheckedChange={(v) => setRemember(!!v)} />
          <Label htmlFor="remember" className="cursor-pointer text-sm font-normal">
            {t.auth.rememberMe}
          </Label>
        </div>

        <Button type="submit" size="lg" loading={loading}>
          {t.auth.login}
        </Button>
      </form>

      <div className="rounded-lg border border-border/80 bg-muted/30 p-3 text-center text-xs text-muted-foreground">
        {locale === 'ar'
          ? 'ℹ️ يتم تزويد منظمي الفعاليات وموظفي الاستقبال بحساباتهم من قبل إدارة النظام حصراً.'
          : 'ℹ️ Organizer and Reception accounts are provisioned exclusively by the System Administration.'}
      </div>
    </div>
  )
}

