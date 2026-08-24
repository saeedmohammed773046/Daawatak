import { QRCodeSVG } from 'qrcode.react'
import { cn } from '@/lib/utils'
import { useI18n } from '@/i18n'

export interface InvitationDesign {
  eventTitle: string
  eventNames: string
  guestName: string
  date: string
  venue: string
  primaryColor: string
  secondaryColor: string
  fontFamily?: string
  guestNameSize: number
  guestNameWeight: number
  guestNameAlign: 'start' | 'center' | 'end'
  showQr: boolean
  qrSize: number
  bodyText: string
  guestLabel?: string
}

export const defaultInvitationDesign: InvitationDesign = {
  eventTitle: 'دعوة زفاف',
  eventNames: 'أحمد & سارة',
  guestName: 'سارة أحمد',
  date: '12 أغسطس 2026 — 8:00 مساءً',
  venue: 'قاعة أبوللو الكبرى للاحتفالات، حدة، صنعاء',
  primaryColor: '#5b21b6',
  secondaryColor: '#c9a24b',
  guestNameSize: 18,
  guestNameWeight: 600,
  guestNameAlign: 'center',
  showQr: true,
  qrSize: 88,
  bodyText: 'نتشرف بدعوتكم لمشاركتنا فرحتنا بحضوركم الكريم',
}

export function InvitationPreviewCard({
  design = defaultInvitationDesign,
  className,
  qrValue = 'DAAWATAK-DEMO-0001',
}: {
  design?: InvitationDesign
  className?: string
  qrValue?: string
}) {
  const { locale } = useI18n()
  const isAr = locale === 'ar'

  const eventTitle = !isAr && design.eventTitle === 'دعوة زفاف' ? 'Wedding Invitation' : design.eventTitle
  const eventNames = !isAr && (design.eventNames === 'أحمد & سارة' || design.eventNames === 'صادق & ريم') ? 'Ahmed & Sara' : design.eventNames
  const bodyText =
    !isAr && design.bodyText === 'نتشرف بدعوتكم لمشاركتنا فرحتنا بحضوركم الكريم'
      ? 'We are honored to invite you to celebrate our special day with us'
      : design.bodyText
  const guestLabel = design.guestLabel || (isAr ? 'الدعوة باسم' : 'Invitation for')
  const guestName = !isAr && design.guestName === 'سارة أحمد' ? 'Sara Ahmed' : design.guestName
  const date = !isAr && design.date === '12 أغسطس 2026 — 8:00 مساءً' ? 'Aug 12, 2026 — 8:00 PM' : design.date
  const venue =
    !isAr && (design.venue.includes('أبوللو') || design.venue.includes('الرياض') || design.venue.includes('صنعاء'))
      ? 'Apollo Grand Hall, Sana\'a'
      : design.venue

  return (
    <div
      className={cn(
        'relative flex aspect-[3/4] w-full max-w-sm flex-col items-center justify-between overflow-hidden rounded-2xl p-7 text-center shadow-elevated transition-all duration-300',
        className
      )}
      style={{
        background: `linear-gradient(160deg, ${design.primaryColor} 0%, ${design.primaryColor}cc 55%, ${design.secondaryColor}55 130%)`,
        color: '#fff',
      }}
    >
      <div className="absolute inset-4 rounded-xl border border-white/25" />
      <div className="absolute -top-10 -end-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
      <div className="absolute -bottom-10 -start-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />

      <div className="relative z-10 flex flex-col items-center gap-2 pt-3">
        <span
          className="rounded-full px-3 py-1 text-[11px] font-medium tracking-wide"
          style={{ backgroundColor: `${design.secondaryColor}33`, color: '#fff' }}
        >
          {eventTitle}
        </span>
        <h3 className="mt-2 text-2xl font-bold">{eventNames}</h3>
        <p className="max-w-[220px] text-xs leading-relaxed text-white/85">{bodyText}</p>
      </div>

      <div className="relative z-10 flex flex-col items-center gap-1">
        <span className="text-[11px] text-white/70">{guestLabel}</span>
        <span
          style={{
            fontSize: design.guestNameSize,
            fontWeight: design.guestNameWeight,
            textAlign: design.guestNameAlign,
          }}
        >
          {guestName}
        </span>
      </div>

      {design.showQr && (
        <div className="relative z-10 rounded-xl bg-white p-2.5 shadow-soft">
          <QRCodeSVG value={qrValue} size={design.qrSize} bgColor="#ffffff" fgColor="#111111" />
        </div>
      )}

      <div className="relative z-10 flex flex-col items-center gap-1 pb-2 text-[11px] text-white/85">
        <span>{date}</span>
        <span>{venue}</span>
      </div>
    </div>
  )
}
