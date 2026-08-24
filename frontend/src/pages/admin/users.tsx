import { useState } from 'react'
import { toast } from 'sonner'
import { Search, Users, ShieldOff, ShieldCheck, MoreVertical, UserPlus, Eye, EyeOff } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/shared/empty-state'
import { ErrorState } from '@/components/shared/error-state'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { useAsync, useDebouncedValue } from '@/hooks/use-async'
import { usersService } from '@/services/users.service'
import { formatDate, initials } from '@/lib/utils'
import { useI18n } from '@/i18n'
import type { User } from '@/types'

export default function AdminUsersPage() {
  const { t, locale } = useI18n()
  const isAr = locale === 'ar'
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<'all' | 'active' | 'suspended'>('all')
  const debouncedSearch = useDebouncedValue(search)
  const [targetUser, setTargetUser] = useState<User | null>(null)
  const [updating, setUpdating] = useState(false)

  // Create User modal state
  const [createOpen, setCreateOpen] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'user' as 'user' | 'reception' | 'admin',
  })
  const [showPassword, setShowPassword] = useState(false)

  const { data, isLoading, isError, refetch } = useAsync(
    () => usersService.list({ search: debouncedSearch, status, pageSize: 50 }),
    [debouncedSearch, status]
  )

  const users = data?.data ?? []

  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault()
    if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim()) {
      toast.error(isAr ? 'يرجى ملء كافة الحقول المطلوبة' : 'Please fill all required fields')
      return
    }
    setCreateLoading(true)
    try {
      await usersService.create(formData)
      toast.success(isAr ? `تم إضافة المستخدم "${formData.name}" بنجاح!` : `User "${formData.name}" added successfully!`)
      setCreateOpen(false)
      setFormData({ name: '', email: '', phone: '', password: '', role: 'user' })
      refetch()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || (isAr ? 'فشل إضافة المستخدم، تأكد من صحة البيانات' : 'Failed to add user'))
    } finally {
      setCreateLoading(false)
    }
  }

  async function handleToggleStatus() {
    if (!targetUser) return
    setUpdating(true)
    const nextStatus = targetUser.status === 'active' ? 'suspended' : 'active'
    try {
      await usersService.setStatus(targetUser.id, nextStatus)
      toast.success(
        nextStatus === 'suspended'
          ? isAr ? `تم تعليق حساب ${targetUser.name}` : `User ${targetUser.name} suspended`
          : isAr ? `تم إعادة تفعيل حساب ${targetUser.name}` : `User ${targetUser.name} reactivated`
      )
      setTargetUser(null)
      refetch()
    } catch {
      toast.error(isAr ? 'حدث خطأ، حاول مرة أخرى' : 'Failed to update user status')
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{isAr ? 'المستخدمون' : 'Users Management'}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isAr
              ? 'إدارة وإنشاء حسابات منظمي الفعاليات وموظفي الاستقبال والتحكم بصلاحياتهم وحالات التفعيل.'
              : 'Provision and manage Event Owner & Reception accounts and configure access.'}
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="gap-2 shadow-sm">
          <UserPlus className="h-4 w-4" />
          <span>{isAr ? 'إضافة منظم أو موظف جديد' : 'Add New Account'}</span>
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={isAr ? 'بحث بالاسم أو البريد أو الهاتف...' : 'Search by name, email or phone...'}
            className="ps-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'active', 'suspended'] as const).map((s) => (
            <Button key={s} size="sm" variant={status === s ? 'default' : 'outline'} onClick={() => setStatus(s)}>
              {s === 'all' ? (isAr ? 'الكل' : 'All') : s === 'active' ? (isAr ? 'نشط' : 'Active') : (isAr ? 'معلّق' : 'Suspended')}
            </Button>
          ))}
        </div>
      </div>

      {isError ? (
        <ErrorState variant="network" onRetry={refetch} />
      ) : isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : users.length === 0 ? (
        <EmptyState
          icon={Users}
          title={isAr ? 'لا يوجد مستخدمون مطابقون' : 'No matching users found'}
          description={isAr ? 'جرّب تعديل معايير البحث.' : 'Try adjusting your search query.'}
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border/70 bg-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-start">{isAr ? 'المستخدم' : 'User'}</th>
                  <th className="px-3 py-3 text-start">{t.common.phone}</th>
                  <th className="px-3 py-3 text-start">{isAr ? 'الخطة' : 'Plan'}</th>
                  <th className="px-3 py-3 text-start">{isAr ? 'تاريخ الانضمام' : 'Joined Date'}</th>
                  <th className="px-3 py-3 text-start">{t.common.status}</th>
                  <th className="w-10 px-3 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-muted/20">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                          {initials(u.name)}
                        </span>
                        <div>
                          <p className="font-medium">{u.name}</p>
                          <p className="text-xs text-muted-foreground">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-muted-foreground" dir="ltr">
                      {u.phone || '—'}
                    </td>
                    <td className="px-3 py-3">
                      <Badge variant="secondary">{u.planId}</Badge>
                    </td>
                    <td className="px-3 py-3 text-muted-foreground">{formatDate(u.createdAt, locale)}</td>
                    <td className="px-3 py-3">
                      <Badge variant={u.status === 'active' ? 'success' : 'destructive'}>
                        {u.status === 'active' ? (isAr ? 'نشط' : 'Active') : (isAr ? 'معلّق' : 'Suspended')}
                      </Badge>
                    </td>
                    <td className="px-3 py-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" aria-label="actions">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setTargetUser(u)}>
                            {u.status === 'active' ? (
                              <>
                                <ShieldOff className="h-4 w-4" /> {isAr ? 'تعليق الحساب' : 'Suspend Account'}
                              </>
                            ) : (
                              <>
                                <ShieldCheck className="h-4 w-4" /> {isAr ? 'إعادة التفعيل' : 'Reactivate Account'}
                              </>
                            )}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!targetUser}
        onOpenChange={(o) => !o && setTargetUser(null)}
        title={
          targetUser?.status === 'active'
            ? isAr ? 'تعليق الحساب' : 'Suspend User Account'
            : isAr ? 'إعادة تفعيل الحساب' : 'Reactivate User Account'
        }
        description={
          targetUser?.status === 'active'
            ? isAr
              ? `سيتم تعليق حساب "${targetUser?.name}" وإنهاء جلساته فوراً ومنعه من تسجيل الدخول.`
              : `User "${targetUser?.name}" will be suspended, active sessions terminated, and logins blocked.`
            : isAr
            ? `سيتم إعادة تفعيل حساب "${targetUser?.name}" وتمكينه من الدخول.`
            : `User "${targetUser?.name}" will be reactivated.`
        }
        confirmLabel={targetUser?.status === 'active' ? (isAr ? 'تعليق' : 'Suspend') : (isAr ? 'تفعيل' : 'Reactivate')}
        variant={targetUser?.status === 'active' ? 'destructive' : 'default'}
        loading={updating}
        onConfirm={handleToggleStatus}
      />

      {/* Add New User Modal */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{isAr ? 'إضافة حساب جديد للنظام' : 'Add New Account'}</DialogTitle>
            <DialogDescription>
              {isAr
                ? 'أنشئ حساباً لمنظم الفعاليات أو موظف الاستقبال وسلّمه بيانات الاعتماد للدخول مباشرة.'
                : 'Create an Event Owner or Receptionist account with login credentials.'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateUser} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="create-name">{isAr ? 'الاسم الكامل *' : 'Full Name *'}</Label>
              <Input
                id="create-name"
                required
                placeholder={isAr ? 'مثال: محمد بن علي الحاشدي' : 'e.g. John Doe'}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="create-email">{isAr ? 'البريد الإلكتروني *' : 'Email Address *'}</Label>
              <Input
                id="create-email"
                type="email"
                required
                placeholder="name@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="create-phone">{isAr ? 'رقم الهاتف (اختياري)' : 'Phone (Optional)'}</Label>
              <Input
                id="create-phone"
                placeholder="770000000"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="create-role">{isAr ? 'نوع الدور والصلاحية *' : 'Role *'}</Label>
              <Select
                value={formData.role}
                onValueChange={(val: any) => setFormData({ ...formData, role: val })}
              >
                <SelectTrigger id="create-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">
                    {isAr ? '👑 منظم فعاليات (Event Owner)' : '👑 Event Owner'}
                  </SelectItem>
                  <SelectItem value="reception">
                    {isAr ? '📱 موظف استقبال ومسح (Receptionist)' : '📱 Receptionist'}
                  </SelectItem>
                  <SelectItem value="admin">
                    {isAr ? '🛡️ مدير نظام (Super Admin)' : '🛡️ Super Admin'}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="create-pass">{isAr ? 'كلمة المرور الابتدائية *' : 'Initial Password *'}</Label>
              <div className="relative">
                <Input
                  id="create-pass"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="pe-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 end-0 flex w-10 items-center justify-center text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                {t.common.cancel}
              </Button>
              <Button type="submit" loading={createLoading}>
                {isAr ? 'إنشاء الحساب فوراً' : 'Create Account'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
