import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, MailOpen, Sparkles, Send, Download, QrCode, MessageCircle, Eye } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { EmptyState } from '@/components/shared/empty-state'
import { ErrorState } from '@/components/shared/error-state'
import { EventPicker } from '@/components/events/event-picker'
import { InvitationStatusBadge } from '@/components/invitations/invitation-status-badge'
import { GenerateInvitationsDialog } from '@/components/invitations/generate-invitations-dialog'
import { SendInvitationsDialog } from '@/components/invitations/send-invitations-dialog'
import { ExportInvitationsDialog } from '@/components/invitations/export-invitations-dialog'
import { InvitationWorkflowBanner } from '@/components/invitations/invitation-workflow-banner'
import { GuestInvitationModal } from '@/components/invitations/guest-invitation-modal'
import { useAsync, useDebouncedValue } from '@/hooks/use-async'
import { invitationsService } from '@/services/invitations.service'
import { eventsService } from '@/services/events.service'
import { formatDateTime } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'

export default function InvitationsListPage() {
  const navigate = useNavigate()
  const { data: eventsData } = useAsync(() => eventsService.list({ pageSize: 100 }), [])
  const events = eventsData?.data || []
  const [eventId, setEventId] = useState('')
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [genOpen, setGenOpen] = useState(false)
  const [sendOpen, setSendOpen] = useState(false)
  const [exportOpen, setExportOpen] = useState(false)
  const [selectedGuest, setSelectedGuest] = useState<{ id: string; name: string; phone?: string; qrCode?: string } | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const debouncedSearch = useDebouncedValue(search)

  const activeEventId = eventId || events[0]?.id || ''
  const activeEvent = events.find((e) => e.id === activeEventId)

  const { data: summary, refetch: refetchSummary } = useAsync(
    () => (activeEventId ? invitationsService.summary(activeEventId) : Promise.resolve({ total: 0, ready: 0, sent: 0, used: 0, notUsed: 0 })),
    [activeEventId]
  )

  const { data, isLoading, isError, refetch } = useAsync(
    () => (activeEventId ? invitationsService.list(activeEventId, { search: debouncedSearch, status, pageSize: 100 }) : Promise.resolve({ data: [], total: 0, page: 1, pageSize: 100 })),
    [activeEventId, debouncedSearch, status]
  )

  const invitations = data?.data || []
  const guestsToGenerate = activeEvent ? Math.max(activeEvent.guestsCount - (summary?.total || 0), 0) : 0
  const hasCustomTemplate = Boolean(activeEvent?.themeConfig && Object.keys(activeEvent.themeConfig).length > 0)

  function refreshAll() {
    refetch()
    refetchSummary()
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
    const shareableUrl = `${window.location.origin}/dashboard/invitations?eventId=${activeEventId}&guestId=${inv.guestId || inv.id}`
    const greeting = `مرحباً ${inv.guestName}، يسعدنا ويشرفنا دعوتكم لحضور ${activeEvent?.title || 'المناسبة'}.\n\nيمكنكم عرض بطاقة الدعوة ورمز الدخول من الرابط:\n${shareableUrl}`
    const url = rawPhone ? `https://wa.me/${rawPhone}?text=${encodeURIComponent(greeting)}` : `https://api.whatsapp.com/send?text=${encodeURIComponent(greeting)}`
    window.open(url, '_blank')
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold sm:text-2xl">الدعوات الإلكترونية</h1>
          <p className="mt-1 text-sm text-muted-foreground">صمم، ولد، وأرسل دعواتك المخصصة لكل ضيف آلياً وبسهولة.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => navigate(`/dashboard/invitations/designer?eventId=${activeEventId}`)} disabled={!activeEventId}>
            <QrCode className="h-4 w-4" /> مصمم القالب
          </Button>
          <Button variant="outline" onClick={() => setExportOpen(true)} disabled={!activeEventId}>
            <Download className="h-4 w-4" /> تصدير الكل
          </Button>
          <Button variant="outline" onClick={() => setSendOpen(true)} disabled={!activeEventId || !summary?.ready}>
            <Send className="h-4 w-4" /> إرسال جماعي
          </Button>
          <Button onClick={() => setGenOpen(true)} disabled={!activeEventId || guestsToGenerate === 0}>
            <Sparkles className="h-4 w-4" /> توليد الدعوات ({guestsToGenerate})
          </Button>
        </div>
      </div>

      <EventPicker events={events} value={activeEventId} onChange={setEventId} />

      {activeEventId && (
        <InvitationWorkflowBanner
          eventId={activeEventId}
          guestsCount={activeEvent?.guestsCount || 0}
          hasCustomTemplate={hasCustomTemplate}
          invitationsReadyCount={summary?.ready || 0}
          onGenerateClick={() => setGenOpen(true)}
        />
      )}

      {summary && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Card><CardContent className="p-4"><p className="text-2xl font-bold">{summary.total}</p><p className="text-xs text-muted-foreground">إجمالي الدعوات</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-2xl font-bold text-primary">{summary.ready}</p><p className="text-xs text-muted-foreground">جاهزة للمشاركة</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-2xl font-bold text-gold">{summary.sent}</p><p className="text-xs text-muted-foreground">مُرسلة</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-2xl font-bold text-success">{summary.used}</p><p className="text-xs text-muted-foreground">مُستخدمة (حضور)</p></CardContent></Card>
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 -translate-y-1/2 start-3 h-4 w-4 text-muted-foreground" />
          <Input placeholder="ابحث باسم المدعو..." value={search} onChange={(e) => setSearch(e.target.value)} className="ps-9" />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="الحالة" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل الحالات</SelectItem>
            <SelectItem value="ready">جاهزة</SelectItem>
            <SelectItem value="sent">مُرسلة</SelectItem>
            <SelectItem value="used">مُستخدمة</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {!activeEventId ? (
        <EmptyState icon={MailOpen} title="لا توجد مناسبات" description="أنشئ مناسبة أولًا للبدء بإنشاء الدعوات." />
      ) : isError ? (
        <ErrorState variant="network" onRetry={refetch} />
      ) : isLoading ? (
        <div className="flex flex-col gap-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-xl" />)}</div>
      ) : invitations.length === 0 ? (
        <EmptyState
          icon={MailOpen}
          title="لا توجد دعوات بعد"
          description="اعتمد قالب الدعوة وقم بتوليد البطاقات لجميع الضيوف بضغطة واحدة."
          actionLabel="توليد الدعوات"
          onAction={() => setGenOpen(true)}
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border/70 bg-card">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-muted/40 text-xs text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-start">المدعو</th>
                <th className="px-4 py-3 text-start">الحالة</th>
                <th className="hidden px-4 py-3 text-start sm:table-cell">تاريخ الإنشاء</th>
                <th className="px-4 py-3 text-end">إدارة ومشاركة الدعوة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {invitations.map((inv) => (
                <tr key={inv.id} className="hover:bg-muted/20">
                  <td className="px-4 py-3 font-medium">
                    <span className="font-semibold text-foreground">{inv.guestName}</span>
                  </td>
                  <td className="px-4 py-3"><InvitationStatusBadge status={inv.status} /></td>
                  <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">{formatDateTime(inv.createdAt)}</td>
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

      {activeEventId && (
        <>
          <GuestInvitationModal
            open={modalOpen}
            onOpenChange={setModalOpen}
            guest={selectedGuest}
            event={activeEvent || null}
          />
          <GenerateInvitationsDialog open={genOpen} onOpenChange={setGenOpen} eventId={activeEventId} guestCount={guestsToGenerate} onGenerated={refreshAll} />
          <SendInvitationsDialog open={sendOpen} onOpenChange={setSendOpen} eventId={activeEventId} total={summary?.ready || 0} onSent={refreshAll} />
          <ExportInvitationsDialog open={exportOpen} onOpenChange={setExportOpen} eventId={activeEventId} />
        </>
      )}
    </div>
  )
}
