import { useState } from 'react'
import { CheckCircle2, XCircle, Clock, ScanLine, LogOut, ArrowRight, Users, Calendar as CalendarIcon, KeyRound, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { EventStatusBadge } from '@/components/events/event-status-badge'
import { eventTypeIcon } from '@/components/events/event-type-icon'
import { FullPageLoader } from '@/components/shared/loaders'
import { ErrorState } from '@/components/shared/error-state'
import { EmptyState } from '@/components/shared/empty-state'
import { useAsync } from '@/hooks/use-async'
import { receptionService, type ScanResultStatus } from '@/services/reception.service'
import { useAuthStore } from '@/store/auth.store'
import { formatDate } from '@/lib/utils'
import { toast } from 'sonner'
import type { EventItem } from '@/types'

type Screen = 'events' | 'scan' | 'result'

const resultConfig: Record<
  ScanResultStatus,
  { label: string; sub: string; icon: typeof CheckCircle2; classes: string }
> = {
  success: { label: 'دخول ناجح', sub: 'تم تسجيل الحضور بنجاح', icon: CheckCircle2, classes: 'bg-emerald-500 text-white' },
  used: { label: 'تم الاستخدام مسبقًا', sub: 'هذه الدعوة تم مسحها من قبل', icon: Clock, classes: 'bg-amber-500 text-white' },
  invalid: { label: 'دعوة غير صالحة', sub: 'الرمز غير معروف لدى النظام', icon: XCircle, classes: 'bg-destructive text-destructive-foreground' },
  expired: { label: 'دعوة منتهية', sub: 'انتهت صلاحية هذه الدعوة', icon: XCircle, classes: 'bg-slate-500 text-white' },
}

export default function ReceptionPage() {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const { data: events, status, error, refetch } = useAsync(() => receptionService.listEvents(), [])

  const [screen, setScreen] = useState<Screen>('events')
  const [activeEvent, setActiveEvent] = useState<EventItem | null>(null)
  const [code, setCode] = useState('')
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState<{ status: ScanResultStatus; companions?: number } | null>(null)

  // Event PIN verification modal
  const [pinOpen, setPinOpen] = useState(false)
  const [pendingEvent, setPendingEvent] = useState<EventItem | null>(null)
  const [enteredPin, setEnteredPin] = useState('')
  const [verifyingPin, setVerifyingPin] = useState(false)

  function selectEvent(ev: EventItem) {
    setPendingEvent(ev)
    setEnteredPin('')
    setPinOpen(true)
  }

  async function handleVerifyPin(e: React.FormEvent) {
    e.preventDefault()
    if (!enteredPin.trim() || !pendingEvent) return
    setVerifyingPin(true)
    try {
      const check = await receptionService.verifyPin(pendingEvent.id, enteredPin.trim())
      if (check.success) {
        toast.success('تم التحقق من رمز حماية الفعالية بنجاح')
        setActiveEvent(pendingEvent)
        setPinOpen(false)
        setPendingEvent(null)
        setScreen('scan')
      } else {
        toast.error(check.message || 'رمز حماية الفعالية غير صحيح!')
      }
    } catch {
      toast.error('رمز حماية الفعالية غير صحيح!')
    } finally {
      setVerifyingPin(false)
    }
  }

  async function submitScan(e: React.FormEvent) {
    e.preventDefault()
    if (!code.trim()) return
    setScanning(true)
    try {
      const res = await receptionService.scanCode(code.trim(), activeEvent?.id)
      setResult(res)
      setScreen('result')
    } finally {
      setScanning(false)
    }
  }

  function scanNext() {
    setCode('')
    setResult(null)
    setScreen('scan')
  }

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <header className="flex items-center justify-between border-b bg-background px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2 font-bold text-primary">
          <ScanLine className="h-5 w-5" />
          <span>واجهة الاستقبال — دعوتك</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-muted-foreground sm:inline">{user?.name}</span>
          <Button variant="ghost" size="sm" onClick={logout}>
            <LogOut className="h-4 w-4" />
            خروج
          </Button>
        </div>
      </header>

      <main className="flex flex-1 items-start justify-center p-4 sm:p-8">
        <div className="w-full max-w-3xl">
          {screen === 'events' && (
            <>
              <h1 className="mb-4 text-xl font-bold sm:text-2xl">اختر الفعالية</h1>
              {status === 'loading' && <FullPageLoader />}
              {status === 'error' && <ErrorState onRetry={refetch} description={error?.message} />}
              {status === 'success' && events && events.length === 0 && (
                <EmptyState icon={CalendarIcon} title="لا توجد فعاليات نشطة" description="لا توجد فعاليات قادمة أو جارية حاليًا." />
              )}
              {status === 'success' && events && events.length > 0 && (
                <div className="grid gap-3 sm:grid-cols-2">
                  {events.map((ev) => {
                    const Icon = eventTypeIcon(ev.type)
                    return (
                      <Card
                        key={ev.id}
                        className="cursor-pointer transition hover:border-primary hover:shadow-md"
                        onClick={() => selectEvent(ev)}
                      >
                        <CardContent className="flex items-start gap-3 p-4">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <p className="font-semibold">{ev.title}</p>
                              <EventStatusBadge status={ev.status} />
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {formatDate(ev.date)} · {ev.venue}، {ev.city}
                            </p>
                            <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                              <Users className="h-3.5 w-3.5" />
                              {ev.checkedInCount} / {ev.invitationsCount} تم تسجيل حضورهم
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </>
          )}

          {screen === 'scan' && activeEvent && (
            <div className="flex flex-col items-center gap-6 text-center">
              <button
                onClick={() => setScreen('events')}
                className="flex items-center gap-1 self-start text-sm text-muted-foreground hover:text-foreground"
              >
                <ArrowRight className="h-4 w-4" />
                تغيير الفعالية
              </button>

              <div>
                <h2 className="text-lg font-bold">{activeEvent.title}</h2>
                <p className="text-sm text-muted-foreground">{activeEvent.venue}، {activeEvent.city}</p>
              </div>

              <div className="flex h-40 w-40 items-center justify-center rounded-3xl border-4 border-dashed border-primary/40 text-primary sm:h-52 sm:w-52">
                <ScanLine className="h-16 w-16 animate-pulse sm:h-20 sm:w-20" />
              </div>

              <form onSubmit={submitScan} className="flex w-full max-w-sm flex-col gap-3">
                <Input
                  autoFocus
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="ضع مؤشر القارئ هنا أو أدخل رمز الدعوة"
                  className="text-center text-lg"
                />
                <Button type="submit" size="lg" loading={scanning}>
                  مسح / تحقق
                </Button>
              </form>
              <p className="max-w-sm text-xs text-muted-foreground">
                وجّه قارئ الباركود إلى رمز QR الموجود في الدعوة، أو أدخل الرمز يدويًا ثم اضغط "مسح / تحقق".
              </p>
            </div>
          )}

          {screen === 'result' && result && (
            <div className="flex flex-col items-center gap-6 text-center">
              {(() => {
                const cfg = resultConfig[result.status]
                const Icon = cfg.icon
                return (
                  <div className={`flex w-full flex-col items-center gap-4 rounded-3xl p-10 ${cfg.classes}`}>
                    <Icon className="h-24 w-24 sm:h-32 sm:w-32" />
                    <h2 className="text-2xl font-extrabold sm:text-4xl">{cfg.label}</h2>
                    <p className="text-base opacity-90 sm:text-lg">{cfg.sub}</p>
                    {result.status === 'success' && result.companions ? (
                      <p className="text-sm opacity-90">+{result.companions} من المرافقين</p>
                    ) : null}
                  </div>
                )
              })()}
              <div className="flex w-full max-w-sm gap-3">
                <Button size="lg" className="flex-1" onClick={scanNext}>
                  مسح دعوة أخرى
                </Button>
                <Button size="lg" variant="outline" className="flex-1" onClick={() => setScreen('events')}>
                  تغيير الفعالية
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Event PIN Verification Modal */}
      <Dialog open={pinOpen} onOpenChange={setPinOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <KeyRound className="h-6 w-6" />
            </div>
            <DialogTitle className="text-center text-lg font-bold">
              التحقق من رمز حماية الفعالية (Event PIN)
            </DialogTitle>
            <DialogDescription className="text-center text-xs">
              أدخل رمز المرور المكون من 6 أرقام المسلم لك من منظم الفعالية للدخول على مناسبة &quot;{pendingEvent?.title}&quot;.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleVerifyPin} className="space-y-4 py-2">
            <div className="space-y-2">
              <Input
                type="password"
                maxLength={20}
                required
                autoFocus
                placeholder="أدخل رمز PIN هنا..."
                value={enteredPin}
                onChange={(e) => setEnteredPin(e.target.value)}
                className="text-center font-mono text-xl tracking-widest"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={() => setPinOpen(false)}>
                إلغاء
              </Button>
              <Button type="submit" className="w-full sm:w-auto" loading={verifyingPin}>
                تحقق ودخول
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
