import { useState } from 'react'
import { toast } from 'sonner'
import {
  KeyRound,
  UserPlus,
  ShieldCheck,
  Trash2,
  Copy,
  ExternalLink,
  RefreshCw,
  Eye,
  EyeOff,
  Users,
  Smartphone,
  CheckCircle2,
  Lock,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { EmptyState } from '@/components/shared/empty-state'
import { ErrorState } from '@/components/shared/error-state'
import { useAsync } from '@/hooks/use-async'
import { receptionistsService } from '@/services/receptionists.service'
import { formatDate, initials } from '@/lib/utils'
import { useI18n } from '@/i18n'
import type { EventItem, ReceptionistStaff } from '@/types'

interface ReceptionistsTabProps {
  event: EventItem
  onEventUpdate?: () => void
}

export function ReceptionistsTab({ event, onEventUpdate }: ReceptionistsTabProps) {
  const { locale } = useI18n()
  const isAr = locale === 'ar'

  // PIN Management state
  const [currentPin, setCurrentPin] = useState(event.accessPin || '123456')
  const [editingPin, setEditingPin] = useState(false)
  const [newPin, setNewPin] = useState(currentPin)
  const [savingPin, setSavingPin] = useState(false)
  const [showPin, setShowPin] = useState(false)

  // Receptionists list state
  const {
    data: staffList,
    isLoading,
    isError,
    refetch,
  } = useAsync(() => receptionistsService.list(event.id), [event.id])

  const receptionists = staffList || []

  // Add Receptionist modal state
  const [addOpen, setAddOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [staffForm, setStaffForm] = useState({
    name: '',
    password: '',
  })
  const [showStaffPass, setShowStaffPass] = useState(false)

  // Delete modal state
  const [targetStaff, setTargetStaff] = useState<ReceptionistStaff | null>(null)
  const [deleting, setDeleting] = useState(false)

  async function handleSavePin(e?: React.FormEvent) {
    if (e) e.preventDefault()
    if (!newPin.trim() || newPin.trim().length < 4) {
      toast.error(isAr ? 'يجب أن يتكون رمز الدخول من 4 إلى 20 خانة' : 'PIN must be between 4 and 20 characters')
      return
    }
    setSavingPin(true)
    try {
      await receptionistsService.updateAccessPin(event.id, newPin.trim())
      setCurrentPin(newPin.trim())
      setEditingPin(false)
      toast.success(isAr ? 'تم تحديث رمز دخول الفعالية بنجاح' : 'Event PIN updated successfully')
      if (onEventUpdate) onEventUpdate()
    } catch {
      toast.error(isAr ? 'تعذر تحديث رمز الدخول' : 'Failed to update PIN')
    } finally {
      setSavingPin(false)
    }
  }

  function handleGeneratePin() {
    const randomPin = Math.floor(100000 + Math.random() * 900000).toString()
    setNewPin(randomPin)
  }

  async function handleCreateStaff(e: React.FormEvent) {
    e.preventDefault()
    if (!staffForm.name.trim() || !staffForm.password.trim()) {
      toast.error(isAr ? 'يرجى إدخال اسم الموظف وكلمة المرور' : 'Please enter staff name and password')
      return
    }
    setCreating(true)
    try {
      await receptionistsService.create(event.id, staffForm)
      toast.success(
        isAr
          ? `تم إضافة موظف الاستقبال "${staffForm.name}" وتعيين كلمة المرور بنجاح`
          : `Receptionist "${staffForm.name}" added successfully`
      )
      setAddOpen(false)
      setStaffForm({ name: '', password: '' })
      refetch()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || (isAr ? 'فشل إضافة موظف الاستقبال' : 'Failed to add receptionist'))
    } finally {
      setCreating(false)
    }
  }

  async function handleDeleteStaff() {
    if (!targetStaff) return
    setDeleting(true)
    try {
      await receptionistsService.delete(event.id, targetStaff.id)
      toast.success(isAr ? `تم إلغاء صلاحية موظف الاستقبال "${targetStaff.name}"` : `Receptionist removed`)
      setTargetStaff(null)
      refetch()
    } catch {
      toast.error(isAr ? 'حدث خطأ أثناء الحذف' : 'Failed to remove receptionist')
    } finally {
      setDeleting(false)
    }
  }

  function copyGateCredentials(staff?: ReceptionistStaff) {
    let message = ''
    if (staff) {
      message = isAr
        ? `بيانات الدخول لتطبيق موظف الاستقبال (تطبيق دعوتك):\nالمناسبة: ${event.title}\nالموظف: ${staff.name}\nكلمة المرور للدخول: ${staff.password || currentPin}`
        : `Daawatak Reception App Login:\nEvent: ${event.title}\nStaff: ${staff.name}\nPassword: ${staff.password || currentPin}`
    } else {
      message = isAr
        ? `بيانات الدخول لتطبيق موظف الاستقبال (تطبيق دعوتك):\nالمناسبة: ${event.title}\nرمز حماية الفعالية (Event PIN): ${currentPin}`
        : `Daawatak Reception App Login:\nEvent: ${event.title}\nEvent PIN: ${currentPin}`
    }
    navigator.clipboard.writeText(message)
    toast.success(isAr ? 'تم نسخ بيانات الدخول إلى الحافظة بنجاح' : 'Credentials copied to clipboard')
  }

  return (
    <div className="space-y-6">
      {/* 1. Quick Gate Access PIN Card */}
      <Card className="border-primary/20 bg-gradient-to-br from-card via-card to-primary/[0.03] shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <KeyRound className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base font-bold sm:text-lg">
                  {isAr ? 'رمز الدخول المباشر للبوابة (Event PIN)' : 'Event Gate Access PIN'}
                </CardTitle>
                <CardDescription className="text-xs">
                  {isAr
                    ? 'رمز المرور المباشر الذي يدخله موظف الاستقبال في تطبيق الهاتف (Flutter App) لمسح التذاكر.'
                    : 'The passcode used by gate staff on the Flutter Mobile App to scan guest passes.'}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs"
                onClick={() => copyGateCredentials()}
              >
                <Copy className="h-3.5 w-3.5" />
                <span>{isAr ? 'نسخ رمز الدخول' : 'Copy PIN'}</span>
              </Button>
              <Badge variant="secondary" className="gap-1.5 py-1.5 px-3 text-xs">
                <Smartphone className="h-3.5 w-3.5 text-primary" />
                <span>{isAr ? 'تطبيق الهاتف (Flutter)' : 'Flutter App'}</span>
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 rounded-xl border border-border/80 bg-background/80 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <span className="text-xs font-medium text-muted-foreground">
                {isAr ? 'رمز الحماية المعتمد للفعالية:' : 'Current Active Gate PIN:'}
              </span>
              <div className="flex items-center gap-3">
                <span className="font-mono text-2xl font-black tracking-widest text-primary">
                  {showPin ? currentPin : '••••••'}
                </span>
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                  title={showPin ? 'إخفاء' : 'إظهار'}
                >
                  {showPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {editingPin ? (
              <form onSubmit={handleSavePin} className="flex items-center gap-2">
                <Input
                  className="w-36 font-mono text-center font-bold"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  placeholder="123456"
                  maxLength={20}
                  autoFocus
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleGeneratePin}
                  title={isAr ? 'توليد رمز عشوائي' : 'Generate random'}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
                <Button size="sm" type="submit" loading={savingPin}>
                  {isAr ? 'حفظ' : 'Save'}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  type="button"
                  onClick={() => {
                    setEditingPin(false)
                    setNewPin(currentPin)
                  }}
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </Button>
              </form>
            ) : (
              <Button variant="outline" size="sm" onClick={() => setEditingPin(true)} className="gap-1.5">
                <Lock className="h-3.5 w-3.5 text-primary" />
                <span>{isAr ? 'تغيير رمز المرور' : 'Change PIN / Password'}</span>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 2. Assigned Receptionists Table / List */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <div>
                <CardTitle className="text-base font-bold sm:text-lg">
                  {isAr ? 'موظفو الاستقبال المعينون' : 'Assigned Reception Staff'}
                </CardTitle>
                <CardDescription className="text-xs">
                  {isAr
                    ? 'أضف موظفاً وحدد له كلمة مرور خاصة ليدخل بها على تطبيق الهاتف لمسح التذاكر.'
                    : 'Add designated gate operators with individual passwords to scan tickets on mobile.'}
                </CardDescription>
              </div>
            </div>
            <Button onClick={() => setAddOpen(true)} size="sm" className="gap-1.5">
              <UserPlus className="h-4 w-4" />
              <span>{isAr ? 'إضافة موظف استقبال جديد' : 'Add Receptionist'}</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isError ? (
            <ErrorState variant="network" onRetry={refetch} />
          ) : isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-xl" />
              ))}
            </div>
          ) : receptionists.length === 0 ? (
            <EmptyState
              icon={Smartphone}
              title={isAr ? 'لم يتم تعيين موظفي استقبال بعد' : 'No receptionists assigned'}
              description={
                isAr
                  ? 'أضف موظفي الاستقبال أو حراس البوابات بتحديد أسمائهم وكلمات المرور الخاصة بهم لمسح التذاكر.'
                  : 'Add receptionists with their names and passwords to scan guest passes.'
              }
              actionLabel={isAr ? 'إضافة موظف استقبال' : 'Add Receptionist'}
              onAction={() => setAddOpen(true)}
            />
          ) : (
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-start text-sm">
                <thead className="border-b border-border bg-muted/40 text-xs font-semibold text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 text-start">{isAr ? 'اسم الموظف / البوابة' : 'Staff Name'}</th>
                    <th className="px-4 py-3 text-start">{isAr ? 'كلمة المرور' : 'Password'}</th>
                    <th className="px-4 py-3 text-start">{isAr ? 'الحالة' : 'Status'}</th>
                    <th className="px-4 py-3 text-end">{isAr ? 'الإجراءات' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {receptionists.map((staff) => (
                    <tr key={staff.id} className="transition-colors hover:bg-muted/20">
                      <td className="px-4 py-3.5 font-medium">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 font-bold text-primary text-xs">
                            {initials(staff.name)}
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">{staff.name}</p>
                            <p className="text-[11px] text-muted-foreground">
                              {staff.createdAt ? formatDate(staff.createdAt) : isAr ? 'نشط' : 'Active'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-xs">
                        <span className="rounded bg-muted px-2 py-1 text-primary font-bold">
                          {staff.password || currentPin}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge variant="success" className="gap-1 text-[11px] font-medium">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>{isAr ? 'مصرح له' : 'Authorized'}</span>
                        </Badge>
                      </td>
                      <td className="px-4 py-3.5 text-end">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 gap-1 text-xs"
                            onClick={() => copyGateCredentials(staff)}
                            title={isAr ? 'نسخ بيانات الدخول للموظف' : 'Copy Credentials'}
                          >
                            <Copy className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">{isAr ? 'نسخ كلمة المرور' : 'Copy'}</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => setTargetStaff(staff)}
                            title={isAr ? 'حذف / سحب الصلاحية' : 'Revoke Access'}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Staff Modal */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">
              {isAr ? 'إضافة موظف استقبال جديد' : 'Add Event Receptionist'}
            </DialogTitle>
            <DialogDescription className="text-xs">
              {isAr
                ? `اكتب اسم الموظف وحدد له كلمة مرور ليسجل بها دخوله مباشرة في تطبيق الهاتف لمناسبة "${event.title}".`
                : `Enter staff name and password to login directly on the Flutter mobile app for "${event.title}".`}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateStaff} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="staff-name">{isAr ? 'اسم الموظف أو مسمى البوابة *' : 'Staff / Gate Name *'}</Label>
              <Input
                id="staff-name"
                required
                placeholder={isAr ? 'مثال: حارس البوابة 1 أو أحمد علي' : 'e.g. Gate 1 Operator'}
                value={staffForm.name}
                onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })}
                autoFocus
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="staff-pass">{isAr ? 'كلمة المرور الخاصة بالموظف *' : 'Password *'}</Label>
                <button
                  type="button"
                  onClick={() => {
                    const pass = 'Pass' + Math.floor(1000 + Math.random() * 9000)
                    setStaffForm({ ...staffForm, password: pass })
                  }}
                  className="text-xs text-primary hover:underline font-medium"
                >
                  {isAr ? 'توليد كلمة مرور' : 'Generate Password'}
                </button>
              </div>
              <div className="relative">
                <Input
                  id="staff-pass"
                  type={showStaffPass ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={staffForm.password}
                  onChange={(e) => setStaffForm({ ...staffForm, password: e.target.value })}
                  className="pe-10 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowStaffPass(!showStaffPass)}
                  className="absolute inset-y-0 end-0 flex w-10 items-center justify-center text-muted-foreground hover:text-foreground"
                >
                  {showStaffPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>
                {isAr ? 'إلغاء' : 'Cancel'}
              </Button>
              <Button type="submit" loading={creating}>
                {isAr ? 'إضافة الموظف واعتماد كلمة المرور' : 'Create & Assign Staff'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Staff Confirmation Dialog */}
      <ConfirmDialog
        open={!!targetStaff}
        onOpenChange={(o) => !o && setTargetStaff(null)}
        title={isAr ? 'إلغاء صلاحية موظف الاستقبال' : 'Revoke Receptionist Access'}
        description={
          isAr
            ? `هل أنت متأكد من إلغاء صلاحية "${targetStaff?.name}"؟ لن يتمكن من تسجيل الدخول أو مسح تذاكر هذه المناسبة.`
            : `Are you sure you want to revoke access for "${targetStaff?.name}"?`
        }
        confirmLabel={isAr ? 'إلغاء الصلاحية' : 'Revoke'}
        variant="destructive"
        loading={deleting}
        onConfirm={handleDeleteStaff}
      />
    </div>
  )
}
