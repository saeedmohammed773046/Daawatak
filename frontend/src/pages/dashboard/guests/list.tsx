import { useState } from 'react'
import { Plus, Search, Upload, Users, MoreVertical, Pencil, Trash2, Phone, Mail } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import { Checkbox } from '@/components/ui/checkbox'
import { EmptyState } from '@/components/shared/empty-state'
import { ErrorState } from '@/components/shared/error-state'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { EventPicker } from '@/components/events/event-picker'
import { GuestCategoryBadge } from '@/components/guests/guest-category-badge'
import { AddGuestModal } from '@/components/guests/add-guest-modal'
import { ImportGuestsModal } from '@/components/guests/import-guests-modal'
import { useAsync, useDebouncedValue } from '@/hooks/use-async'
import { guestsService } from '@/services/guests.service'
import { eventsService } from '@/services/events.service'
import { useI18n } from '@/i18n'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'

const attendanceLabelsAr: Record<string, string> = { pending: 'بالانتظار', checked_in: 'حاضر', no_show: 'غائب' }
const attendanceLabelsEn: Record<string, string> = { pending: 'Pending', checked_in: 'Checked In', no_show: 'Absent' }
const attendanceVariant: Record<string, 'secondary' | 'success' | 'destructive'> = { pending: 'secondary', checked_in: 'success', no_show: 'destructive' }

const invitationLabelsAr: Record<string, string> = { not_created: 'لم تُنشأ', ready: 'جاهزة', sent: 'مُرسلة', used: 'مُستخدمة' }
const invitationLabelsEn: Record<string, string> = { not_created: 'Not Created', ready: 'Ready', sent: 'Sent', used: 'Used' }

export default function GuestsListPage() {
  const { t, locale } = useI18n()
  const isAr = locale === 'ar'
  const { data: eventsData } = useAsync(() => eventsService.list({ pageSize: 100 }), [])
  const events = eventsData?.data || []
  const [eventId, setEventId] = useState('')
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [addOpen, setAddOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [selected, setSelected] = useState<string[]>([])
  const debouncedSearch = useDebouncedValue(search)

  const activeEventId = eventId || events[0]?.id || ''

  const { data, isLoading, isError, refetch } = useAsync(
    () => (activeEventId ? guestsService.list(activeEventId, { search: debouncedSearch, category, pageSize: 100 }) : Promise.resolve({ data: [], total: 0, page: 1, pageSize: 100 })),
    [activeEventId, debouncedSearch, category]
  )

  const guests = data?.data || []

  function toggleSelect(id: string) {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))
  }

  const attendanceLabel = isAr ? attendanceLabelsAr : attendanceLabelsEn
  const invitationLabel = isAr ? invitationLabelsAr : invitationLabelsEn

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold sm:text-2xl">{t.dashboard.guests}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isAr ? 'إدارة قوائم الضيوف والمدعوين لمناسباتك بسهولة.' : 'Easily manage guest lists and attendance for your events.'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setImportOpen(true)} disabled={!activeEventId}>
            <Upload className="h-4 w-4" /> {t.common.import}
          </Button>
          <Button onClick={() => setAddOpen(true)} disabled={!activeEventId}>
            <Plus className="h-4 w-4" /> {isAr ? 'إضافة مدعو' : 'Add Guest'}
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <EventPicker events={events} value={activeEventId} onChange={setEventId} />
        <div className="relative flex-1">
          <Search className="absolute top-1/2 -translate-y-1/2 start-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={isAr ? 'ابحث بالاسم أو الهاتف...' : 'Search by name or phone...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="ps-9"
          />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder={isAr ? 'الفئة' : 'Category'} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{isAr ? 'كل الفئات' : 'All Categories'}</SelectItem>
            <SelectItem value="family">{isAr ? 'العائلة' : 'Family'}</SelectItem>
            <SelectItem value="friends">{isAr ? 'الأصدقاء' : 'Friends'}</SelectItem>
            <SelectItem value="work">{isAr ? 'العمل' : 'Work'}</SelectItem>
            <SelectItem value="vip">{isAr ? 'كبار الشخصيات' : 'VIP'}</SelectItem>
            <SelectItem value="other">{isAr ? 'أخرى' : 'Other'}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {!activeEventId ? (
        <EmptyState
          icon={Users}
          title={isAr ? 'لا توجد مناسبات' : 'No Events Found'}
          description={isAr ? 'أنشئ مناسبة أولًا لتتمكن من إضافة مدعوين.' : 'Create an event first to add guests.'}
        />
      ) : isError ? (
        <ErrorState variant="network" onRetry={refetch} />
      ) : isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : guests.length === 0 ? (
        <EmptyState
          icon={Users}
          title={isAr ? 'لا يوجد مدعوون بعد' : 'No guests added yet'}
          description={isAr ? 'أضف مدعوين يدويًا أو استورد قائمة كاملة من ملف Excel.' : 'Add guests manually or import a complete list from Excel.'}
          actionLabel={isAr ? 'إضافة مدعو' : 'Add Guest'}
          onAction={() => setAddOpen(true)}
        />
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-hidden rounded-xl border border-border/70 bg-card lg:block">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs text-muted-foreground">
                <tr>
                  <th className="w-10 px-4 py-3"></th>
                  <th className="px-3 py-3 text-start">{t.common.name}</th>
                  <th className="px-3 py-3 text-start">{t.common.phone}</th>
                  <th className="px-3 py-3 text-start">{isAr ? 'الفئة' : 'Category'}</th>
                  <th className="px-3 py-3 text-start">{isAr ? 'حالة الدعوة' : 'Invitation Status'}</th>
                  <th className="px-3 py-3 text-start">{t.dashboard.attendance}</th>
                  <th className="w-10 px-3 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {guests.map((g) => (
                  <tr key={g.id} className="hover:bg-muted/20">
                    <td className="px-4 py-3">
                      <Checkbox checked={selected.includes(g.id)} onCheckedChange={() => toggleSelect(g.id)} />
                    </td>
                    <td className="px-3 py-3">
                      <p className="font-medium">{g.name}</p>
                      {g.email && <p className="text-xs text-muted-foreground">{g.email}</p>}
                    </td>
                    <td className="px-3 py-3 text-muted-foreground">{g.phone}</td>
                    <td className="px-3 py-3">
                      <GuestCategoryBadge category={g.category} />
                    </td>
                    <td className="px-3 py-3 text-muted-foreground">{invitationLabel[g.invitationStatus] || g.invitationStatus}</td>
                    <td className="px-3 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          attendanceVariant[g.attendance] === 'success'
                            ? 'bg-success/10 text-success'
                            : attendanceVariant[g.attendance] === 'destructive'
                            ? 'bg-destructive/10 text-destructive'
                            : 'bg-secondary text-secondary-foreground'
                        }`}
                      >
                        {attendanceLabel[g.attendance] || g.attendance}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent" aria-label="options">
                            <MoreVertical className="h-4 w-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Pencil className="h-4 w-4" /> {t.common.edit}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setDeleteId(g.id)} className="text-destructive focus:text-destructive">
                            <Trash2 className="h-4 w-4" /> {t.common.delete}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="flex flex-col gap-3 lg:hidden">
            {guests.map((g) => (
              <div key={g.id} className="flex flex-col gap-3 rounded-xl border border-border/70 bg-card p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{g.name}</p>
                    <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                      <Phone className="h-3 w-3" /> {g.phone}
                    </p>
                    {g.email && (
                      <p className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Mail className="h-3 w-3" /> {g.email}
                      </p>
                    )}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent" aria-label="options">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Pencil className="h-4 w-4" /> {t.common.edit}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setDeleteId(g.id)} className="text-destructive focus:text-destructive">
                        <Trash2 className="h-4 w-4" /> {t.common.delete}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <GuestCategoryBadge category={g.category} />
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      attendanceVariant[g.attendance] === 'success'
                        ? 'bg-success/10 text-success'
                        : attendanceVariant[g.attendance] === 'destructive'
                        ? 'bg-destructive/10 text-destructive'
                        : 'bg-secondary text-secondary-foreground'
                    }`}
                  >
                    {attendanceLabel[g.attendance] || g.attendance}
                  </span>
                  <span className="text-xs text-muted-foreground">{invitationLabel[g.invitationStatus] || g.invitationStatus}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {activeEventId && (
        <>
          <AddGuestModal open={addOpen} onOpenChange={setAddOpen} eventId={activeEventId} onAdded={refetch} />
          <ImportGuestsModal open={importOpen} onOpenChange={setImportOpen} eventId={activeEventId} onImported={refetch} />
        </>
      )}

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(v) => !v && setDeleteId(null)}
        title={isAr ? 'هل تريد حذف هذا المدعو؟' : 'Do you want to delete this guest?'}
        description={isAr ? 'سيتم حذف بيانات المدعو ودعوته بشكل نهائي.' : 'This guest and their invitation QR will be permanently removed.'}
        confirmLabel={t.common.delete}
        onConfirm={async () => {
          if (!deleteId) return
          await guestsService.remove(deleteId)
          toast.success(isAr ? 'تم حذف المدعو بنجاح' : 'Guest deleted successfully')
          setDeleteId(null)
          refetch()
        }}
      />
    </div>
  )
}
