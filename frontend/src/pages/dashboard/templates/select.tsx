import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Search, Crown, LayoutTemplate, Sparkles, Eye, QrCode } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { EmptyState } from '@/components/shared/empty-state'
import { ErrorState } from '@/components/shared/error-state'
import { useAsync, useDebouncedValue } from '@/hooks/use-async'
import { templatesService } from '@/services/templates.service'
import { Skeleton } from '@/components/ui/skeleton'
import { useI18n } from '@/i18n'
import { toast } from 'sonner'
import type { Template } from '@/types'

const categoryLabelsAr: Record<string, string> = {
  all: 'كل الأنواع',
  wedding: 'حفلات زفاف',
  engagement: 'خطوبة',
  religious: 'عقد قران',
  graduation: 'تخرج',
  conference: 'مؤتمرات ومعارض',
  training: 'دورات وتدريب',
  birthday: 'أعياد ميلاد',
  opening: 'افتتاح وتدشين',
  special: 'مناسبات خاصة',
}

const categoryLabelsEn: Record<string, string> = {
  all: 'All Types',
  wedding: 'Weddings',
  engagement: 'Engagement',
  religious: 'Nikah & Religious',
  graduation: 'Graduation',
  conference: 'Conferences & Expos',
  training: 'Workshops & Training',
  birthday: 'Birthdays',
  opening: 'Inauguration & Opening',
  special: 'Special Occasions',
}

export default function TemplateSelectPage() {
  const { t, locale } = useI18n()
  const isAr = locale === 'ar'
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const eventId = params.get('eventId') || 'event-1'
  
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [tier, setTier] = useState<'all' | 'free' | 'premium'>('all')
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null)
  const debouncedSearch = useDebouncedValue(search)

  const { data, isLoading, isError, refetch } = useAsync(
    () => templatesService.list({ search: debouncedSearch, category, tier }),
    [debouncedSearch, category, tier]
  )

  const templates = data || []
  const categoryLabels = isAr ? categoryLabelsAr : categoryLabelsEn

  function handleUseTemplate(tpl: Template) {
    toast.success(isAr ? `تم اختيار قالب "${tpl.name}" بنجاح` : `Template "${tpl.name}" selected`)
    navigate(`/dashboard/invitations/designer?eventId=${eventId}&templateId=${tpl.id}`)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold sm:text-2xl">
            {isAr ? 'معرض قوالب الدعوات الإلكترونية' : 'Digital Invitation Templates Gallery'}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isAr
              ? 'مجموعة واسعة من القوالب الفاخرة المصممة خصيصاً لكافة مناسباتك في الجمهورية اليمنية.'
              : 'A wide range of luxury invitation templates crafted for all your events.'}
          </p>
        </div>
        <Badge variant="outline" className="w-fit gap-1 text-xs py-1 px-3">
          <Sparkles className="h-3.5 w-3.5 text-gold" />
          <span>{templates.length} {isAr ? 'قوالب متاحة' : 'Templates Available'}</span>
        </Badge>
      </div>

      {/* Category quick tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {Object.entries(categoryLabels).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setCategory(key)}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
              category === key
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-card border border-border/70 text-muted-foreground hover:bg-accent hover:text-foreground'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Search & Tier Filter */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 -translate-y-1/2 start-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={isAr ? 'ابحث بالاسم أو المناسبة (مثال: زفاف ذهبي، تخرج، مؤتمر...)' : 'Search templates by name or event type...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="ps-9"
          />
        </div>
        <Select value={tier} onValueChange={(v) => setTier(v as any)}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder={isAr ? 'فئة الباقة' : 'Tier'} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{isAr ? 'كل الفئات' : 'All Tiers'}</SelectItem>
            <SelectItem value="free">{isAr ? 'قوالب مجانية' : 'Free Templates'}</SelectItem>
            <SelectItem value="premium">{isAr ? 'قوالب مميزة (VIP)' : 'VIP Templates'}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isError ? (
        <ErrorState variant="network" onRetry={refetch} />
      ) : isLoading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-80 w-full rounded-2xl" />
          ))}
        </div>
      ) : templates.length === 0 ? (
        <EmptyState
          icon={LayoutTemplate}
          title={isAr ? 'لا توجد قوالب مطابقة لبحثك' : 'No matching templates found'}
          description={isAr ? 'جرّب تعديل عوامل التصفية أو البحث عن كلمة أخرى.' : 'Try adjusting your filters or search query.'}
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {templates.map((tpl) => (
            <div
              key={tpl.id}
              className="group flex flex-col overflow-hidden rounded-2xl border border-border/80 bg-card transition-all duration-200 hover:-translate-y-1.5 hover:shadow-elevated"
            >
              {/* Card visual preview */}
              <div
                className="relative flex aspect-[4/5] items-center justify-center overflow-hidden bg-slate-900"
                style={{
                  background: tpl.previewUrl
                    ? `linear-gradient(to bottom, rgba(15,23,42,0.2), rgba(15,23,42,0.85)), url(${tpl.previewUrl}) center/cover no-repeat`
                    : `linear-gradient(145deg, ${tpl.colors[0]}, ${tpl.colors[1]}dd)`,
                }}
              >
                <div className="absolute inset-3 rounded-xl border border-white/20 transition-all group-hover:border-gold/60" />

                <div className="absolute top-3.5 start-3.5 flex items-center gap-1.5">
                  <Badge variant="secondary" className="bg-background/80 text-[10px] backdrop-blur-md">
                    {categoryLabels[tpl.category] || tpl.category}
                  </Badge>
                </div>

                {tpl.isPremium && (
                  <span className="absolute top-3.5 end-3.5 flex items-center gap-1 rounded-full bg-gold px-2.5 py-0.5 text-[11px] font-bold text-slate-950 shadow-md">
                    <Crown className="h-3 w-3 fill-slate-950" /> VIP
                  </span>
                )}

                <div className="relative z-10 px-4 text-center text-white">
                  <p className="text-[11px] font-medium tracking-wide text-gold">{isAr ? 'دعوة كريمة' : 'Invitation'}</p>
                  <h4 className="mt-1 font-bold text-sm leading-tight drop-shadow-md">{tpl.name}</h4>
                  <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-[10px] text-white/90 backdrop-blur-md border border-white/15">
                    <QrCode className="h-3 w-3 text-gold" />
                    <span>{isAr ? 'رمز دخول ذكي' : 'Smart QR Pass'}</span>
                  </div>
                </div>

                <div className="absolute inset-0 flex items-center justify-center gap-2 bg-slate-950/60 opacity-0 backdrop-blur-xs transition-opacity group-hover:opacity-100">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="h-8 gap-1.5 text-xs bg-white text-slate-950 hover:bg-white/90"
                    onClick={() => setPreviewTemplate(tpl)}
                  >
                    <Eye className="h-3.5 w-3.5" /> {isAr ? 'معاينة' : 'Preview'}
                  </Button>
                </div>
              </div>

              {/* Card Footer Details */}
              <div className="flex flex-1 flex-col justify-between gap-3 p-4">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <p className="line-clamp-1 text-sm font-semibold text-foreground">{tpl.name}</p>
                    <Badge variant={tpl.isPremium ? 'gold' : 'success'} className="shrink-0 text-[10px]">
                      {tpl.isPremium ? (isAr ? 'مميز' : 'VIP') : (isAr ? 'مجاني' : 'Free')}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {isAr ? `استُخدم ${tpl.usageCount} مرة` : `Used ${tpl.usageCount} times`}
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-1 border-t border-border/50">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 text-xs h-8"
                    onClick={() => setPreviewTemplate(tpl)}
                  >
                    {isAr ? 'معاينة' : 'Preview'}
                  </Button>
                  <Button
                    size="sm"
                    variant={tpl.isPremium ? 'gold' : 'default'}
                    className="flex-1 text-xs h-8"
                    onClick={() => handleUseTemplate(tpl)}
                  >
                    {isAr ? 'تطبيق القالب' : 'Use Template'}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Live Template Preview Modal */}
      {previewTemplate && (
        <Dialog open={!!previewTemplate} onOpenChange={(open) => !open && setPreviewTemplate(null)}>
          <DialogContent className="max-w-md p-0 overflow-hidden bg-card border-border">
            <div
              className="relative flex flex-col items-center justify-center p-8 text-center text-white aspect-[3/4]"
              style={{
                background: previewTemplate.previewUrl
                  ? `linear-gradient(to bottom, rgba(15,23,42,0.4), rgba(15,23,42,0.9)), url(${previewTemplate.previewUrl}) center/cover no-repeat`
                  : `linear-gradient(145deg, ${previewTemplate.colors[0]}, ${previewTemplate.colors[1]})`,
              }}
            >
              <div className="absolute inset-4 rounded-2xl border-2 border-gold/40" />

              <span className="relative z-10 text-xs font-semibold tracking-widest text-gold uppercase mb-2">
                {isAr ? 'بطاقة دعوة إلكترونية رسمية' : 'Official Digital Invitation'}
              </span>

              <h2 className="relative z-10 text-2xl font-black mb-2 text-white drop-shadow-md">
                {previewTemplate.name}
              </h2>

              <p className="relative z-10 text-xs text-white/80 max-w-xs mb-6">
                {isAr
                  ? 'نتشرف بدعوة سيادتكم الكريمة لحضور ومشاركتنا أبهى اللحظات في هذه المناسبة المباركة'
                  : 'We are honored to invite you to celebrate this special event with us.'}
              </p>

              {/* Sample Guest Name Tag */}
              <div className="relative z-10 w-full max-w-xs rounded-xl bg-white/10 border border-white/20 p-3 mb-6 backdrop-blur-md text-start">
                <p className="text-[10px] text-gold font-medium">{isAr ? 'المدعو الكريم:' : 'Guest Name:'}</p>
                <p className="text-sm font-bold text-white">د. وضاح بن عبد الله الأهدل</p>
                <p className="text-[11px] text-white/70">{isAr ? 'بوابة كبار الشخصيات VIP • + مرافق 1' : 'VIP Gate • + 1 Companion'}</p>
              </div>

              {/* Sample QR Container */}
              <div className="relative z-10 flex flex-col items-center justify-center rounded-xl bg-white p-3 shadow-elevated">
                <div className="flex h-24 w-24 items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 text-slate-900">
                  <QrCode className="h-16 w-16 text-slate-800" />
                </div>
                <p className="mt-1.5 text-[10px] font-bold text-slate-800">
                  {isAr ? 'امسح للدخول عند البوابة' : 'Scan for entry at gate'}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 p-4 bg-card border-t border-border">
              <div>
                <p className="text-xs font-semibold text-foreground">{previewTemplate.name}</p>
                <p className="text-[11px] text-muted-foreground">{categoryLabels[previewTemplate.category]}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={() => setPreviewTemplate(null)}>
                  {t.common.close}
                </Button>
                <Button
                  size="sm"
                  variant={previewTemplate.isPremium ? 'gold' : 'default'}
                  onClick={() => {
                    const tpl = previewTemplate
                    setPreviewTemplate(null)
                    handleUseTemplate(tpl)
                  }}
                >
                  {isAr ? 'استخدام هذا القالب' : 'Use This Template'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
