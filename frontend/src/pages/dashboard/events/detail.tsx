import { useState, useEffect } from 'react'
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom'
import { initEcho } from '@/lib/echo'
import { useAuthStore } from '@/store/auth.store'
import {
  MoreVertical,
  Pencil,
  Copy,
  Archive,
  Trash2,
  CalendarDays,
  Clock,
  MapPin,
  Users,
  MailOpen,
  UserCheck,
  Sparkles,
  Send,
  Download,
  QrCode,
  Search,
  Plus,
  Upload,
  RadioTower,
  BarChart3,
  FileSpreadsheet,
  FileText,
  Save,
  AlertTriangle,
  MessageCircle,
  Eye,
  Share2,
} from 'lucide-react'
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/shared/empty-state'
import { ErrorState } from '@/components/shared/error-state'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { EventStatusBadge } from '@/components/events/event-status-badge'
import { eventTypeIcon } from '@/components/events/event-type-icon'
import { GuestCategoryBadge } from '@/components/guests/guest-category-badge'
import { InvitationStatusBadge } from '@/components/invitations/invitation-status-badge'
import { AddGuestModal } from '@/components/guests/add-guest-modal'
import { ImportGuestsModal } from '@/components/guests/import-guests-modal'
import { GenerateInvitationsDialog } from '@/components/invitations/generate-invitations-dialog'
import { SendInvitationsDialog } from '@/components/invitations/send-invitations-dialog'
import { ExportInvitationsDialog } from '@/components/invitations/export-invitations-dialog'
import { ReceptionistsTab } from '@/components/events/receptionists-tab'
import { InvitationWorkflowBanner } from '@/components/invitations/invitation-workflow-banner'
import { GuestInvitationModal } from '@/components/invitations/guest-invitation-modal'
import { useAsync, useDebouncedValue } from '@/hooks/use-async'
import { eventsService } from '@/services/events.service'
import { guestsService } from '@/services/guests.service'
import { invitationsService } from '@/services/invitations.service'
import { analyticsService } from '@/services/analytics.service'
import { reportsService, type ReportType } from '@/services/reports.service'
import { formatDate, formatDateTime, formatTime, formatNumber, formatPercent } from '@/lib/utils'
import { toast } from 'sonner'

const categoryLabels: Record<string, string> = { family: 'العائلة', friends: 'الأصدقاء', work: 'العمل', vip: 'كبار الشخصيات', other: 'أخرى' }
const categoryColorVar: Record<string, string> = {
  family: 'hsl(var(--primary))',
  friends: 'hsl(var(--success))',
  work: 'hsl(var(--muted-foreground))',
  vip: 'hsl(var(--gold))',
  other: 'hsl(var(--warning))',
}

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const tab = params.get('tab') || (params.get('edit') === '1' ? 'settings' : 'overview')
  const [deleteOpen, setDeleteOpen] = useState(false)

  const { data: event, isLoading, isError, refetch } = useAsync(() => eventsService.getById(id!), [id])

  function setTab(v: string) {
    setParams((p) => {
      p.set('tab', v)
      return p
    })
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-28 w-full rounded-xl" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
        </div>
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    )
  }

  if (isError) return <ErrorState variant="network" onRetry={refetch} />
  if (!event) {
    return (
      <EmptyState
        icon={CalendarDays}
        title="المناسبة غير موجودة"
        description="ربما تم حذف هذه المناسبة أو الرابط غير صحيح."
        actionLabel="العودة للمناسبات"
        onAction={() => navigate('/dashboard/events')}
      />
    )
  }

  const Icon = eventTypeIcon(event.type)
  const attendanceRate = event.invitationsCount ? Math.round((event.checkedInCount / event.invitationsCount) * 100) : 0

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-xl border border-border/70 bg-brand-gradient p-5 text-white sm:p-6">
        <div className="absolute inset-0 bg-mesh opacity-40" />
        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/15">
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-lg font-bold sm:text-xl">{event.title}</h1>
                <EventStatusBadge status={event.status} />
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-white/85 sm:text-sm">
                <span className="flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" /> {formatDate(event.date)}</span>
                <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {event.time}</span>
                <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {event.venue}، {event.city}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => setTab('settings')}>
              <Pencil className="h-3.5 w-3.5" /> تعديل
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15 hover:bg-white/25" aria-label="options">
                  <MoreVertical className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem><Copy className="h-4 w-4" /> تكرار المناسبة</DropdownMenuItem>
                <DropdownMenuItem><Archive className="h-4 w-4" /> أرشفة</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setDeleteOpen(true)} className="text-destructive focus:text-destructive">
                  <Trash2 className="h-4 w-4" /> حذف المناسبة
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card><CardContent className="flex items-center justify-between p-5">
          <div><p className="text-sm text-muted-foreground">المدعوون</p><p className="mt-1.5 text-2xl font-bold">{formatNumber(event.guestsCount)}</p></div>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary"><Users className="h-5.5 w-5.5" /></div>
        </CardContent></Card>
        <Card><CardContent className="flex items-center justify-between p-5">
          <div><p className="text-sm text-muted-foreground">الدعوات</p><p className="mt-1.5 text-2xl font-bold">{formatNumber(event.invitationsCount)}</p></div>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold/10 text-gold"><MailOpen className="h-5.5 w-5.5" /></div>
        </CardContent></Card>
        <Card><CardContent className="flex items-center justify-between p-5">
          <div><p className="text-sm text-muted-foreground">الحضور</p><p className="mt-1.5 text-2xl font-bold">{formatNumber(event.checkedInCount)}</p></div>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-success/10 text-success"><UserCheck className="h-5.5 w-5.5" /></div>
        </CardContent></Card>
        <Card><CardContent className="flex items-center justify-between p-5">
          <div><p className="text-sm text-muted-foreground">نسبة الحضور</p><p className="mt-1.5 text-2xl font-bold">{formatPercent(attendanceRate)}</p></div>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary text-secondary-foreground"><BarChart3 className="h-5.5 w-5.5" /></div>
        </CardContent></Card>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="w-full sm:w-auto overflow-x-auto scrollbar-none">
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="guests">المدعوون</TabsTrigger>
          <TabsTrigger value="invitations">الدعوات</TabsTrigger>
          <TabsTrigger value="checkins">الحضور المباشر</TabsTrigger>
          <TabsTrigger value="receptionists">فريق الاستقبال والبوابة</TabsTrigger>
          <TabsTrigger value="analytics">التحليلات</TabsTrigger>
          <TabsTrigger value="reports">التقارير</TabsTrigger>
          <TabsTrigger value="settings">الإعدادات</TabsTrigger>
        </TabsList>

        <TabsContent value="overview"><OverviewTab event={event} onNavigateTab={setTab} /></TabsContent>
        <TabsContent value="invitations"><InvitationsTab event={event} onEventUpdate={refetch} /></TabsContent>
        <TabsContent value="receptionists"><ReceptionistsTab event={event} onEventUpdate={refetch} /></TabsContent>
        <TabsContent value="analytics"><AnalyticsTab eventId={event.id} /></TabsContent>
        <TabsContent value="reports"><ReportsTab eventId={event.id} /></TabsContent>
        <TabsContent value="settings"><SettingsTab event={event} onDelete={() => setDeleteOpen(true)} /></TabsContent>
      </Tabs>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="هل أنت متأكد من حذف هذه المناسبة؟"
        description="سيتم حذف جميع البيانات المرتبطة بالمناسبة بما في ذلك المدعوين والدعوات، ولا يمكن التراجع عن هذا الإجراء."
        onConfirm={async () => {
          await eventsService.remove(event.id)
          toast.success('تم حذف المناسبة بنجاح')
          navigate('/dashboard/events')
        }}
      />
    </div>
  )
}

// ---------------------------- Overview Tab ----------------------------
function OverviewTab({ event, onNavigateTab }: { event: any; onNavigateTab: (t: string) => void }) {
  const invitationsPct = event.guestsCount ? Math.round((event.invitationsCount / event.guestsCount) * 100) : 0
  const checkedInPct = event.invitationsCount ? Math.round((event.checkedInCount / event.invitationsCount) * 100) : 0

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="flex flex-col gap-4 lg:col-span-2">
        <Card>
          <CardContent className="flex flex-col gap-4 p-5">
            <h3 className="text-base font-semibold">تفاصيل المناسبة</h3>
            <div className="grid gap-3 text-sm sm:grid-cols-2">
              <div><span className="text-muted-foreground">التاريخ: </span><span className="font-medium">{formatDate(event.date)}</span></div>
              <div><span className="text-muted-foreground">الوقت: </span><span className="font-medium">{event.time}</span></div>
              <div><span className="text-muted-foreground">الموقع: </span><span className="font-medium">{event.venue}</span></div>
              <div><span className="text-muted-foreground">المدينة: </span><span className="font-medium">{event.city}</span></div>
            </div>
            {event.description && <p className="rounded-lg bg-muted/40 p-3 text-sm text-muted-foreground">{event.description}</p>}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col gap-4 p-5">
            <h3 className="text-base font-semibold">تقدّم المناسبة</h3>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-sm"><span>الدعوات المُنشأة</span><span className="font-medium">{invitationsPct}%</span></div>
              <Progress value={invitationsPct} />
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-sm"><span>نسبة الحضور من الدعوات</span><span className="font-medium">{checkedInPct}%</span></div>
              <Progress value={checkedInPct} indicatorClassName="bg-success" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-3 p-5">
          <h3 className="text-base font-semibold">إجراءات سريعة</h3>
          <Button variant="outline" className="justify-start" onClick={() => onNavigateTab('guests')}>
            <Plus className="h-4 w-4" /> إضافة مدعوين
          </Button>
          <Button variant="outline" className="justify-start" onClick={() => onNavigateTab('invitations')}>
            <Sparkles className="h-4 w-4" /> إنشاء الدعوات
          </Button>
          <Button variant="outline" className="justify-start" asChild>
            <Link to={`/dashboard/invitations/designer?eventId=${event.id}`}>
              <QrCode className="h-4 w-4" /> مصمم الدعوات
            </Link>
          </Button>
          <Button variant="outline" className="justify-start" onClick={() => onNavigateTab('checkins')}>
            <RadioTower className="h-4 w-4" /> متابعة الحضور المباشر
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

// ---------------------------- Guests Tab ----------------------------
function GuestsTab({ eventId }: { eventId: string }) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [addOpen, setAddOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const debouncedSearch = useDebouncedValue(search)

  const { data, isLoading, isError, refetch } = useAsync(
    () => guestsService.list(eventId, { search: debouncedSearch, category, pageSize: 100 }),
    [eventId, debouncedSearch, category]
  )
  const guests = data?.data || []

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute top-1/2 -translate-y-1/2 start-3 h-4 w-4 text-muted-foreground" />
            <Input placeholder="ابحث بالاسم أو الهاتف..." value={search} onChange={(e) => setSearch(e.target.value)} className="ps-9" />
          </div>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="الفئة" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">كل الفئات</SelectItem>
              <SelectItem value="family">العائلة</SelectItem>
              <SelectItem value="friends">الأصدقاء</SelectItem>
              <SelectItem value="work">العمل</SelectItem>
              <SelectItem value="vip">كبار الشخصيات</SelectItem>
              <SelectItem value="other">أخرى</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setImportOpen(true)}><Upload className="h-4 w-4" /> استيراد</Button>
          <Button onClick={() => setAddOpen(true)}><Plus className="h-4 w-4" /> إضافة مدعو</Button>
        </div>
      </div>

      {isError ? (
        <ErrorState variant="network" onRetry={refetch} />
      ) : isLoading ? (
        <div className="flex flex-col gap-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-xl" />)}</div>
      ) : guests.length === 0 ? (
        <EmptyState icon={Users} title="لا يوجد مدعوون بعد" description="أضف مدعوين يدويًا أو استورد قائمة كاملة من ملف Excel." actionLabel="إضافة مدعو" onAction={() => setAddOpen(true)} />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border/70 bg-card">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-muted/40 text-xs text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-start">الاسم</th>
                <th className="px-3 py-3 text-start">الهاتف</th>
                <th className="px-3 py-3 text-start">الفئة</th>
                <th className="px-3 py-3 text-start">حالة الدعوة</th>
                <th className="px-3 py-3 text-start">الحضور</th>
                <th className="w-10 px-3 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {guests.map((g) => (
                <tr key={g.id} className="hover:bg-muted/20">
                  <td className="px-4 py-3 font-medium">{g.name}</td>
                  <td className="px-3 py-3 text-muted-foreground">{g.phone}</td>
                  <td className="px-3 py-3"><GuestCategoryBadge category={g.category} /></td>
                  <td className="px-3 py-3"><InvitationStatusBadge status={g.invitationStatus} /></td>
                  <td className="px-3 py-3">
                    <Badge variant={g.attendance === 'checked_in' ? 'success' : g.attendance === 'no_show' ? 'destructive' : 'secondary'}>
                      {g.attendance === 'checked_in' ? 'حاضر' : g.attendance === 'no_show' ? 'غائب' : 'بالانتظار'}
                    </Badge>
                  </td>
                  <td className="px-3 py-3">
                    <button onClick={() => setDeleteId(g.id)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive" aria-label="delete">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AddGuestModal open={addOpen} onOpenChange={setAddOpen} eventId={eventId} onAdded={refetch} />
      <ImportGuestsModal open={importOpen} onOpenChange={setImportOpen} eventId={eventId} onImported={refetch} />
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(v) => !v && setDeleteId(null)}
        title="هل تريد حذف هذا المدعو؟"
        onConfirm={async () => {
          if (!deleteId) return
          await guestsService.remove(deleteId)
          toast.success('تم حذف المدعو بنجاح')
          setDeleteId(null)
          refetch()
        }}
      />
    </div>
  )
}

// ---------------------------- Invitations Tab ----------------------------
function InvitationsTab({ event, onEventUpdate }: { event: any; onEventUpdate: () => void }) {
  const navigate = useNavigate()
  const eventId = event.id
  const guestsCount = event.guestsCount || 0
  const [genOpen, setGenOpen] = useState(false)
  const [sendOpen, setSendOpen] = useState(false)
  const [exportOpen, setExportOpen] = useState(false)
  const [selectedGuest, setSelectedGuest] = useState<{ id: string; name: string; phone?: string; qrCode?: string } | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const { data: summary, refetch: refetchSummary } = useAsync(() => invitationsService.summary(eventId), [eventId])
  const { data, isLoading, isError, refetch } = useAsync(() => invitationsService.list(eventId, { pageSize: 100 }), [eventId])
  const invitations = data?.data || []
  const guestsToGenerate = Math.max(guestsCount - (summary?.total || 0), 0)
  const hasCustomTemplate = Boolean(event.themeConfig && Object.keys(event.themeConfig).length > 0)

  function refreshAll() {
    refetch()
    refetchSummary()
    onEventUpdate()
  }

  function openGuestModal(inv: any) {
    setSelectedGuest({
      id: inv.guestId || inv.id,
      name: inv.guestName,
      phone: inv.phone,
      qrCode: inv.qrCode,
    })
    setModalOpen(true)
  }

  function handleDirectWhatsApp(inv: any) {
    const rawPhone = (inv.phone || '').replace(/[^0-9]/g, '')
    const shareableUrl = `${window.location.origin}/dashboard/invitations?eventId=${eventId}&guestId=${inv.guestId || inv.id}`
    const greeting = `مرحباً ${inv.guestName}، يسعدنا ويشرفنا دعوتكم لحضور ${event.title}.\n\nيمكنكم عرض بطاقة الدعوة ورمز الدخول من الرابط:\n${shareableUrl}`
    const url = rawPhone ? `https://wa.me/${rawPhone}?text=${encodeURIComponent(greeting)}` : `https://api.whatsapp.com/send?text=${encodeURIComponent(greeting)}`
    window.open(url, '_blank')
  }

  return (
    <div className="flex flex-col gap-5">
      {/* 4-Step Mandatory Invitation Workflow Banner */}
      <InvitationWorkflowBanner
        eventId={eventId}
        guestsCount={guestsCount}
        hasCustomTemplate={hasCustomTemplate}
        invitationsReadyCount={summary?.ready || 0}
        onGenerateClick={() => setGenOpen(true)}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-base font-semibold">قائمة الدعوات المخصصة</h3>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link to={`/dashboard/invitations/designer?eventId=${eventId}`}><QrCode className="h-3.5 w-3.5" /> مصمم القالب</Link>
          </Button>
          <Button variant="outline" size="sm" onClick={() => setExportOpen(true)}><Download className="h-3.5 w-3.5" /> تصدير الكل</Button>
          <Button variant="outline" size="sm" onClick={() => setSendOpen(true)} disabled={!summary?.ready}><Send className="h-3.5 w-3.5" /> إرسال جماعي</Button>
          <Button size="sm" onClick={() => setGenOpen(true)} disabled={guestsToGenerate === 0}><Sparkles className="h-3.5 w-3.5" /> توليد الدعوات ({guestsToGenerate})</Button>
        </div>
      </div>

      {summary && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Card><CardContent className="p-4"><p className="text-xl font-bold">{summary.total}</p><p className="text-xs text-muted-foreground">إجمالي الدعوات</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-xl font-bold text-primary">{summary.ready}</p><p className="text-xs text-muted-foreground">جاهزة للمشاركة</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-xl font-bold text-gold">{summary.sent}</p><p className="text-xs text-muted-foreground">مُرسلة</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-xl font-bold text-success">{summary.used}</p><p className="text-xs text-muted-foreground">مُستخدمة (حضور)</p></CardContent></Card>
        </div>
      )}

      {isError ? (
        <ErrorState variant="network" onRetry={refetch} />
      ) : isLoading ? (
        <div className="flex flex-col gap-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 w-full rounded-xl" />)}</div>
      ) : invitations.length === 0 ? (
        <EmptyState
          icon={MailOpen}
          title="لا توجد دعوات بعد"
          description={guestsCount === 0 ? "أضف المدعوين أولاً ثم اعتمد قالب الدعوة لإنشاء البطاقات." : "تمت إضافة المدعوين، يمكنك الآن اعتماد القالب وتوليد الدعوات بضغطة واحدة."}
          actionLabel={guestsCount === 0 ? "إضافة مدعوين" : "توليد الدعوات الآن"}
          onAction={() => guestsCount === 0 ? navigate(`/dashboard/events/${eventId}?tab=guests`) : setGenOpen(true)}
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border/70 bg-card">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-muted/40 text-xs text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-start">المدعو</th>
                <th className="px-4 py-3 text-start">الحالة</th>
                <th className="px-4 py-3 text-start">تاريخ الإنشاء</th>
                <th className="px-4 py-3 text-end">إدارة ومشاركة الدعوة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {invitations.map((inv) => (
                <tr key={inv.id} className="hover:bg-muted/20">
                  <td className="px-4 py-3 font-medium">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">{inv.guestName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3"><InvitationStatusBadge status={inv.status} /></td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{formatDateTime(inv.createdAt)}</td>
                  <td className="px-4 py-3 text-end">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 px-2.5 text-xs text-[#25D366] hover:bg-[#25D366]/10 hover:text-[#25D366]"
                        onClick={() => handleDirectWhatsApp(inv)}
                        title="إرسال واتساب مباشر"
                      >
                        <MessageCircle className="h-4 w-4 me-1" />
                        واتساب
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-8 px-2.5 text-xs"
                        onClick={() => openGuestModal(inv)}
                      >
                        <Eye className="h-3.5 w-3.5 me-1" />
                        عرض وتحميل
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modals & Dialogs */}
      <GuestInvitationModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        guest={selectedGuest}
        event={event}
      />
      <GenerateInvitationsDialog open={genOpen} onOpenChange={setGenOpen} eventId={eventId} guestCount={guestsToGenerate} onGenerated={refreshAll} />
      <SendInvitationsDialog open={sendOpen} onOpenChange={setSendOpen} eventId={eventId} total={summary?.ready || 0} onSent={refreshAll} />
      <ExportInvitationsDialog open={exportOpen} onOpenChange={setExportOpen} eventId={eventId} />
    </div>
  )
}

// ---------------------------- Check-ins Tab ----------------------------
function CheckinsTab({ eventId }: { eventId: string }) {
  const { data, isLoading, isError, refetch } = useAsync(() => analyticsService.getCheckInFeed(eventId), [eventId])
  const feed = data || []

  useEffect(() => {
    if (!eventId) return
    const token = useAuthStore.getState().token || localStorage.getItem('daawatak_token') || ''
    const echo = initEcho(token)
    if (!echo) return

    const channel = echo.private(`event.${eventId}`)
    channel.listen('.attendance.scanned', (e: any) => {
      if (e.status === 'ACCEPTED') {
        toast.success(`دخول جديد: ${e.guestName || 'ضيف'}`)
        refetch()
      }
    })

    return () => {
      channel.stopListening('.attendance.scanned')
      echo.leave(`event.${eventId}`)
    }
  }, [eventId, refetch])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-success" />
          </span>
          <h3 className="text-base font-semibold">سجل الحضور المباشر</h3>
        </div>
        <Button variant="outline" size="sm" onClick={refetch}>تحديث</Button>
      </div>

      {isError ? (
        <ErrorState variant="network" onRetry={refetch} />
      ) : isLoading ? (
        <div className="flex flex-col gap-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-xl" />)}</div>
      ) : feed.length === 0 ? (
        <EmptyState icon={RadioTower} title="لا توجد عمليات دخول حتى الآن" description="ستظهر عمليات تسجيل الحضور هنا لحظيًا بمجرد مسح رموز QR عند البوابة." />
      ) : (
        <div className="rounded-xl border border-border/70 bg-card">
          <ul className="divide-y divide-border">
            {feed.map((c: any) => (
              <li key={c.id} className="flex items-center gap-3 px-4 py-3.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-success/10 text-success">
                  <UserCheck className="h-4.5 w-4.5" />
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="truncate text-sm font-medium">{c.guestName}</p>
                  <p className="text-xs text-muted-foreground">{c.gate} {c.companions ? `• +${c.companions} مرافق` : ''}</p>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">{formatTime(c.time)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

// ---------------------------- Analytics Tab ----------------------------
function AnalyticsTab({ eventId }: { eventId: string }) {
  const { data, isLoading, isError, refetch } = useAsync(() => analyticsService.getEventAnalytics(eventId), [eventId])

  if (isError) return <ErrorState variant="network" onRetry={refetch} />
  if (isLoading || !data) {
    return (
      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-72 w-full rounded-xl" />
        <Skeleton className="h-72 w-full rounded-xl" />
      </div>
    )
  }

  if (data.totalGuests === 0) {
    return <EmptyState icon={BarChart3} title="لا توجد بيانات كافية" description="أضف مدعوين وسجل الحضور لعرض التحليلات." />
  }

  const pieData = data.categoryBreakdown
    .filter((c: any) => c.count > 0)
    .map((c: any) => ({ name: categoryLabels[c.category] || c.category, value: c.count, key: c.category }))

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card><CardContent className="p-4 text-center"><p className="text-xl font-bold">{data.totalGuests}</p><p className="text-xs text-muted-foreground">إجمالي المدعوين</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-xl font-bold text-success">{data.checkedIn}</p><p className="text-xs text-muted-foreground">حاضر</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-xl font-bold text-destructive">{data.noShow}</p><p className="text-xs text-muted-foreground">غائب</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-xl font-bold text-gold">{formatPercent(data.attendanceRate)}</p><p className="text-xs text-muted-foreground">نسبة الحضور</p></CardContent></Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="p-5">
            <h3 className="mb-3 text-sm font-semibold">توزيع المدعوين حسب الفئة</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2}>
                    {pieData.map((entry: any) => (
                      <Cell key={entry.key} fill={categoryColorVar[entry.key] || 'hsl(var(--primary))'} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: 8, color: 'hsl(var(--popover-foreground))' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 flex flex-wrap justify-center gap-3 text-xs">
              {pieData.map((entry: any) => (
                <span key={entry.key} className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: categoryColorVar[entry.key] || 'hsl(var(--primary))' }} />
                  {entry.name} ({entry.value})
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <h3 className="mb-3 text-sm font-semibold">عمليات تسجيل الحضور بالساعة</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.hourlyCheckIns}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="hour" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} width={28} />
                  <Tooltip contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: 8, color: 'hsl(var(--popover-foreground))' }} />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]} fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// ---------------------------- Reports Tab ----------------------------
function ReportsTab({ eventId }: { eventId: string }) {
  const [type, setType] = useState<ReportType>('attendance')
  const [loadingFormat, setLoadingFormat] = useState<string | null>(null)
  const { data: recent, isLoading, refetch } = useAsync(() => reportsService.listRecent(eventId), [eventId])

  async function handleGenerate(format: 'excel' | 'pdf') {
    setLoadingFormat(format)
    try {
      const res = await reportsService.generate(eventId, type, format)
      toast.success(`تم تجهيز التقرير: ${res.fileName}`)
      refetch()
    } catch {
      toast.error('تعذر إنشاء التقرير، حاول مرة أخرى')
    } finally {
      setLoadingFormat(null)
    }
  }

  const reportTypes: { key: ReportType; label: string; icon: any }[] = [
    { key: 'attendance', label: 'تقرير الحضور', icon: UserCheck },
    { key: 'invitations', label: 'تقرير الدعوات', icon: MailOpen },
    { key: 'sending', label: 'تقرير الإرسال', icon: Send },
  ]

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardContent className="flex flex-col gap-4 p-5">
          <h3 className="text-base font-semibold">إنشاء تقرير جديد</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {reportTypes.map((r) => (
              <button
                key={r.key}
                onClick={() => setType(r.key)}
                className={`flex items-center gap-3 rounded-xl border p-3.5 text-start transition-all ${
                  type === r.key ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/30'
                }`}
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${type === r.key ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                  <r.icon className="h-5 w-5" />
                </div>
                <span className="text-sm font-medium">{r.label}</span>
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={() => handleGenerate('excel')} loading={loadingFormat === 'excel'}>
              <FileSpreadsheet className="h-4 w-4" /> تصدير Excel
            </Button>
            <Button variant="outline" onClick={() => handleGenerate('pdf')} loading={loadingFormat === 'pdf'}>
              <FileText className="h-4 w-4" /> تصدير PDF
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ---------------------------- Settings Tab ----------------------------
const eventTypeOptions = [
  { value: 'wedding', label: 'حفل زفاف' },
  { value: 'engagement', label: 'خطوبة' },
  { value: 'graduation', label: 'حفل تخرج' },
  { value: 'birthday', label: 'عيد ميلاد' },
  { value: 'conference', label: 'مؤتمر' },
  { value: 'meeting', label: 'اجتماع' },
  { value: 'opening', label: 'افتتاح' },
  { value: 'special', label: 'مناسبة خاصة' },
]

function SettingsTab({ event, onDelete, onEventUpdate }: { event: any; onDelete: () => void; onEventUpdate?: () => void }) {
  const [title, setTitle] = useState(event.title || '')
  const [type, setType] = useState(event.type || 'wedding')
  const [date, setDate] = useState(event.date ? (event.date.includes('T') ? event.date.split('T')[0] : event.date) : '')
  const [time, setTime] = useState(event.time || '8:00 مساءً')
  const [venue, setVenue] = useState(event.venue || '')
  const [city, setCity] = useState(event.city || '')
  const [accessPin, setAccessPin] = useState(event.accessPin || '123456')
  const [status, setStatus] = useState(event.status || 'published')
  const [description, setDescription] = useState(event.description || '')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setTitle(event.title || '')
    setType(event.type || 'wedding')
    setDate(event.date ? (event.date.includes('T') ? event.date.split('T')[0] : event.date) : '')
    setTime(event.time || '8:00 مساءً')
    setVenue(event.venue || '')
    setCity(event.city || '')
    setAccessPin(event.accessPin || '123456')
    setStatus(event.status || 'published')
    setDescription(event.description || '')
  }, [event])

  async function handleSave() {
    setSaving(true)
    try {
      await eventsService.update(event.id, {
        title,
        type,
        date,
        time,
        venue,
        city,
        accessPin,
        status,
        description,
      })
      toast.success('تم حفظ وتحديث بيانات المناسبة بنجاح')
      onEventUpdate?.()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'تعذر حفظ التغييرات')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardContent className="flex flex-col gap-5 p-5 sm:p-6">
          <div>
            <h3 className="text-lg font-bold">تعديل بيانات المناسبة</h3>
            <p className="text-xs text-muted-foreground mt-0.5">قم بتعديل بيانات المناسبة وتحديث التاريخ والموقع وسيتم حفظها في النظام فوراً.</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="settings-title">اسم المناسبة <span className="text-destructive">*</span></Label>
              <Input id="settings-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="مثال: حفل زفاف أحمد & سارة" />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="settings-type">نوع المناسبة</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger id="settings-type">
                  <SelectValue placeholder="اختر نوع المناسبة" />
                </SelectTrigger>
                <SelectContent>
                  {eventTypeOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="settings-date">تاريخ المناسبة <span className="text-destructive">*</span></Label>
              <Input id="settings-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="settings-time">وقت المناسبة</Label>
              <Input id="settings-time" value={time} onChange={(e) => setTime(e.target.value)} placeholder="مثال: 8:00 مساءً" />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="settings-venue">القاعة / الموقع <span className="text-destructive">*</span></Label>
              <Input id="settings-venue" value={venue} onChange={(e) => setVenue(e.target.value)} placeholder="مثال: قاعة الفورسيزونز" />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="settings-city">المدينة</Label>
              <Input id="settings-city" value={city} onChange={(e) => setCity(e.target.value)} placeholder="مثال: الرياض" />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="settings-pin">رمز دخول البوابة (Access PIN)</Label>
              <Input id="settings-pin" value={accessPin} maxLength={6} onChange={(e) => setAccessPin(e.target.value)} placeholder="6 أرقام" />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="settings-status">حالة الفعالية</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger id="settings-status">
                  <SelectValue placeholder="اختر حالة الفعالية" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="published">منشورة (نشطة)</SelectItem>
                  <SelectItem value="draft">مسودة</SelectItem>
                  <SelectItem value="completed">مكتملة</SelectItem>
                  <SelectItem value="archived">مؤرشفة</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="settings-desc">وصف المناسبة</Label>
            <Textarea id="settings-desc" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="ملاحظات أو تفاصيل إضافية حول المناسبة..." />
          </div>

          <div className="flex justify-start pt-2">
            <Button onClick={handleSave} loading={saving} className="min-w-[140px]">
              <Save className="h-4 w-4" /> حفظ التغييرات
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-destructive/30">
        <CardContent className="flex flex-col gap-4 p-5">
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            <h3 className="text-base font-semibold">منطقة الخطر</h3>
          </div>
          <p className="text-sm text-muted-foreground">حذف المناسبة سيؤدي إلى إزالة جميع المدعوين والدعوات المرتبطة بها بشكل نهائي، ولا يمكن التراجع عن هذا الإجراء.</p>
          <div>
            <Button variant="destructive" onClick={onDelete}><Trash2 className="h-4 w-4" /> حذف المناسبة نهائيًا</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
