import { useState } from 'react'
import { toast } from 'sonner'
import {
  Bell,
  CheckCheck,
  CheckCircle2,
  Info,
  AlertTriangle,
  XCircle,
  Search,
  Trash2,
  Send,
  CalendarCheck,
  UserCheck,
  CreditCard,
  ShieldAlert,
  Sparkles,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/shared/empty-state'
import { ErrorState } from '@/components/shared/error-state'
import { useAsync, useDebouncedValue } from '@/hooks/use-async'
import { notificationsService } from '@/services/notifications.service'
import { cn, formatDateTime } from '@/lib/utils'
import { useI18n } from '@/i18n'
import type { AppNotification } from '@/types'

const typeConfig: Record<AppNotification['type'], { icon: typeof CheckCircle2; className: string; borderClass: string }> = {
  success: { icon: CheckCircle2, className: 'bg-success/15 text-success', borderClass: 'hover:border-success/40' },
  info: { icon: Info, className: 'bg-primary/15 text-primary', borderClass: 'hover:border-primary/40' },
  warning: { icon: AlertTriangle, className: 'bg-warning/15 text-warning', borderClass: 'hover:border-warning/40' },
  error: { icon: XCircle, className: 'bg-destructive/15 text-destructive', borderClass: 'hover:border-destructive/40' },
}

const categoryIcons: Record<string, typeof Bell> = {
  event: CalendarCheck,
  checkin: UserCheck,
  subscription: CreditCard,
  system: ShieldAlert,
}

const categoryLabelsAr: Record<string, string> = {
  all: 'كل الإشعارات',
  unread: 'غير المقروءة',
  checkin: 'تسجيل الحضور',
  event: 'المناسبات والدعوات',
  subscription: 'الاشتراكات والدفع',
  system: 'تنبيهات النظام',
}

const categoryLabelsEn: Record<string, string> = {
  all: 'All Notifications',
  unread: 'Unread',
  checkin: 'Check-ins',
  event: 'Events & Invites',
  subscription: 'Subscriptions',
  system: 'System Alerts',
}

export default function NotificationsPage() {
  const { t, locale } = useI18n()
  const isAr = locale === 'ar'
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')
  const [markingAll, setMarkingAll] = useState(false)
  const debouncedSearch = useDebouncedValue(search)

  const categoryLabels = isAr ? categoryLabelsAr : categoryLabelsEn

  const { data: notifications, isLoading, isError, refetch } = useAsync(
    () =>
      notificationsService.list({
        search: debouncedSearch,
        status: activeFilter === 'unread' ? 'unread' : 'all',
        category: activeFilter !== 'all' && activeFilter !== 'unread' ? activeFilter : undefined,
      }),
    [debouncedSearch, activeFilter]
  )

  const items = notifications ?? []
  const unreadCount = items.filter((n) => !n.read).length

  async function handleMarkRead(id: string) {
    try {
      await notificationsService.markRead(id)
      refetch()
    } catch {
      // best-effort
    }
  }

  async function handleDelete(id: string) {
    try {
      await notificationsService.remove(id)
      toast.success(isAr ? 'تم حذف الإشعار' : 'Notification deleted')
      refetch()
    } catch {
      toast.error(isAr ? 'حدث خطأ أثناء الحذف' : 'Failed to delete notification')
    }
  }

  async function handleMarkAllRead() {
    setMarkingAll(true)
    try {
      await notificationsService.markAllRead()
      toast.success(isAr ? 'تم تعليم جميع الإشعارات كمقروءة' : 'All notifications marked as read')
      refetch()
    } catch {
      toast.error(isAr ? 'حدث خطأ، حاول مرة أخرى' : 'Failed to update notifications')
    } finally {
      setMarkingAll(false)
    }
  }

  async function handleSendTestNotification() {
    const sampleTypes: AppNotification['type'][] = ['success', 'info', 'warning']
    const randomType = sampleTypes[Math.floor(Math.random() * sampleTypes.length)]
    
    const newNotif = await notificationsService.add({
      title: isAr ? 'إشعار فوري جديد من النظام 🔔' : 'New live system notification 🔔',
      message: isAr
        ? `تم تحديث حالة الحضور في تمام الساعة ${new Date().toLocaleTimeString('ar-YE')}`
        : `Check-in status updated at ${new Date().toLocaleTimeString()}`,
      type: randomType,
      category: 'checkin',
      read: false,
    })

    toast.info(newNotif.title, {
      description: newNotif.message,
    })

    refetch()
  }

  if (isError) {
    return <ErrorState variant="network" title={isAr ? 'تعذر تحميل الإشعارات' : 'Failed to load notifications'} onRetry={refetch} />
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">{t.dashboard.notifications}</h1>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="h-5 px-2 text-[11px] font-bold animate-pulse">
                {unreadCount} {isAr ? 'جديد' : 'new'}
              </Badge>
            )}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {isAr
              ? 'تابع لحظة بلحظة كافة التنبيهات المتعلقة بمناسباتك، حضور الضيوف، وحالة الدعوات.'
              : 'Track real-time alerts for your events, guest check-ins, and invitation status.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleSendTestNotification} className="gap-1.5 text-xs">
            <Sparkles className="h-4 w-4 text-gold" />
            <span>{isAr ? 'إشعار تجريبي' : 'Send Test'}</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            disabled={unreadCount === 0 || markingAll}
            loading={markingAll}
            onClick={handleMarkAllRead}
            className="gap-1.5 text-xs"
          >
            <CheckCheck className="h-4 w-4" />
            <span>{isAr ? 'تعليم الكل كمقروء' : 'Mark All Read'}</span>
          </Button>
        </div>
      </div>

      {/* Quick Category Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {Object.entries(categoryLabels).map(([key, label]) => {
          const isSelected = activeFilter === key
          return (
            <button
              key={key}
              onClick={() => setActiveFilter(key)}
              className={cn(
                'shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all duration-150',
                isSelected
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-card border border-border/70 text-muted-foreground hover:bg-accent hover:text-foreground'
              )}
            >
              {label}
            </button>
          )
        })}
      </div>

      {/* Search Input Bar */}
      <div className="relative max-w-md">
        <Search className="absolute top-1/2 -translate-y-1/2 start-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={isAr ? 'ابحث في نصوص وعناوين الإشعارات...' : 'Search notifications by keyword...'}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="ps-9 h-10"
        />
      </div>

      {/* Notifications List */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-2xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={Bell}
          title={isAr ? 'لا توجد إشعارات مطابقة' : 'No notifications found'}
          description={
            isAr
              ? 'جرّب تعديل عوامل التصفية أو البحث عن كلمات أخرى.'
              : 'Try changing your filter settings or search query.'
          }
        />
      ) : (
        <div className="space-y-3">
          {items.map((n) => {
            const isRead = n.read
            const { icon: Icon, className, borderClass } = typeConfig[n.type]
            const CategoryIcon = n.category ? categoryIcons[n.category] || Bell : Bell

            return (
              <Card
                key={n.id}
                className={cn(
                  'overflow-hidden rounded-2xl border transition-all duration-200 hover:shadow-soft',
                  borderClass,
                  !isRead
                    ? 'border-primary/40 bg-gradient-to-r from-primary/[0.04] to-transparent dark:from-primary/[0.08]'
                    : 'border-border/70 bg-card'
                )}
              >
                <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl shadow-xs', className)}>
                      <Icon className="h-5 w-5" />
                    </div>

                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className={cn('text-sm font-bold', !isRead ? 'text-foreground' : 'text-foreground/80')}>
                          {n.title}
                        </h3>

                        {!isRead && (
                          <Badge variant="default" className="h-4 px-1.5 text-[9px] font-bold">
                            {isAr ? 'جديد' : 'NEW'}
                          </Badge>
                        )}

                        {n.category && (
                          <Badge variant="outline" className="h-4 gap-1 px-1.5 text-[10px] text-muted-foreground">
                            <CategoryIcon className="h-3 w-3" />
                            <span>{categoryLabels[n.category] || n.category}</span>
                          </Badge>
                        )}
                      </div>

                      <p className="text-xs text-muted-foreground leading-relaxed">{n.message}</p>
                      <p className="text-[11px] text-muted-foreground/60">{formatDateTime(n.createdAt, locale)}</p>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-2 shrink-0 pt-2 border-t border-border/40 sm:border-none sm:pt-0">
                    {!isRead && (
                      <Button
                        variant="secondary"
                        size="sm"
                        className="h-8 text-xs font-medium"
                        onClick={() => handleMarkRead(n.id)}
                      >
                        <CheckCheck className="h-3.5 w-3.5" />
                        <span>{isAr ? 'تعليم كمقروء' : 'Mark Read'}</span>
                      </Button>
                    )}

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleDelete(n.id)}
                      title={isAr ? 'حذف الإشعار' : 'Delete'}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
