import { toast } from 'sonner'
import { LayoutTemplate, Crown } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/shared/empty-state'
import { ErrorState } from '@/components/shared/error-state'
import { eventTypeIcon } from '@/components/events/event-type-icon'
import { useAsync } from '@/hooks/use-async'
import { templatesService } from '@/services/templates.service'
import { formatNumber } from '@/lib/utils'
import { useI18n } from '@/i18n'

export default function AdminTemplatesPage() {
  const { t, locale } = useI18n()
  const isAr = locale === 'ar'
  const { data: templates, isLoading, isError, refetch } = useAsync(() => templatesService.list(), [])

  async function handleTogglePublish(id: string, next: boolean) {
    try {
      await templatesService.togglePublish(id, next)
      toast.success(
        next
          ? isAr ? 'تم نشر القالب للمستخدمين' : 'Template published'
          : isAr ? 'تم إلغاء نشر القالب' : 'Template unpublished'
      )
      refetch()
    } catch {
      toast.error(isAr ? 'حدث خطأ، حاول مرة أخرى' : 'Failed to update template')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{isAr ? 'القوالب' : 'Templates Management'}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {isAr ? 'إدارة قوالب الدعوات المتاحة للمستخدمين والتحكم بالنشر والظهور.' : 'Manage public and premium invitation templates available on the platform.'}
        </p>
      </div>

      {isError ? (
        <ErrorState variant="network" onRetry={refetch} />
      ) : isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full rounded-xl" />
          ))}
        </div>
      ) : !templates || templates.length === 0 ? (
        <EmptyState
          icon={LayoutTemplate}
          title={isAr ? 'لا توجد قوالب' : 'No templates found'}
          description={isAr ? 'لم يتم إضافة أي قوالب حتى الآن.' : 'No templates have been added yet.'}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((tpl) => {
            const Icon = eventTypeIcon(tpl.category)
            return (
              <Card key={tpl.id} className="overflow-hidden rounded-2xl">
                <div
                  className="flex h-32 items-center justify-center relative"
                  style={{
                    background: tpl.previewUrl
                      ? `linear-gradient(to bottom, rgba(15,23,42,0.3), rgba(15,23,42,0.85)), url(${tpl.previewUrl}) center/cover no-repeat`
                      : `linear-gradient(135deg, ${tpl.colors[0]}, ${tpl.colors[1]})`,
                  }}
                >
                  <Icon className="h-9 w-9 text-white/90" />
                </div>
                <CardContent className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold">{tpl.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {isAr ? `استُخدم ${formatNumber(tpl.usageCount, locale)} مرة` : `Used ${formatNumber(tpl.usageCount, locale)} times`}
                      </p>
                    </div>
                    {tpl.isPremium && (
                      <Badge variant="gold" className="gap-1 shrink-0">
                        <Crown className="h-3 w-3" /> {isAr ? 'مميز' : 'VIP'}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center justify-between border-t border-border pt-3">
                    <span className="text-sm text-muted-foreground">
                      {isAr ? 'منشور للمستخدمين' : 'Published to Users'}
                    </span>
                    <Switch checked={tpl.isPublished} onCheckedChange={(v) => handleTogglePublish(tpl.id, v)} />
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
