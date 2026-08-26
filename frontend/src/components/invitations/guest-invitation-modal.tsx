import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  MessageCircle,
  Download,
  FileText,
  Copy,
  Check,
  Share2,
  ExternalLink,
} from 'lucide-react'
import { InvitationPreviewCard, type InvitationDesign, defaultInvitationDesign } from '@/components/invitation/invitation-preview-card'
import { toast } from 'sonner'

interface GuestInvitationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  guest: {
    id: string
    name: string
    phone?: string
    qrCode?: string
  } | null
  event: {
    id: string
    title: string
    venue: string
    eventDate?: string
    startTime?: string
    themeConfig?: Partial<InvitationDesign>
  } | null
}

export function GuestInvitationModal({
  open,
  onOpenChange,
  guest,
  event,
}: GuestInvitationModalProps) {
  const [copied, setCopied] = useState(false)
  const [downloadingImg, setDownloadingImg] = useState(false)
  const [downloadingPdf, setDownloadingPdf] = useState(false)

  if (!guest || !event) return null

  // Build the effective design by merging event config with guest name
  const design: InvitationDesign = {
    ...defaultInvitationDesign,
    ...(event.themeConfig || {}),
    eventTitle: event.title || defaultInvitationDesign.eventTitle,
    venue: event.venue || defaultInvitationDesign.venue,
    date: event.eventDate ? `${event.eventDate} ${event.startTime || ''}`.trim() : defaultInvitationDesign.date,
    guestName: guest.name,
  }

  const qrToken = guest.qrCode || `DAAWATAK-${event.id}-${guest.id}`
  const shareableUrl = `${window.location.origin}/dashboard/invitations?eventId=${event.id}&guestId=${guest.id}`

  function handleCopyLink() {
    navigator.clipboard.writeText(shareableUrl)
    setCopied(true)
    toast.success(`تم نسخ رابط دعوة ${guest?.name} بنجاح`)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleWhatsAppShare() {
    const rawPhone = (guest?.phone || '').replace(/[^0-9]/g, '')
    const greetingMsg = `مرحباً ${guest?.name}، يسعدنا ويشرفنا دعوتكم لحضور ${event?.title}.\n\nيمكنكم عرض بطاقة الدعوة ورمز الدخول من خلال الرابط التالي:\n${shareableUrl}\n\nأهلاً وسهلاً بكم!`
    const encoded = encodeURIComponent(greetingMsg)
    
    if (rawPhone) {
      window.open(`https://wa.me/${rawPhone}?text=${encoded}`, '_blank')
    } else {
      window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank')
    }
  }

  async function handleDownloadImage() {
    setDownloadingImg(true)
    try {
      // Find SVG QR and container to render clean canvas download
      await new Promise((r) => setTimeout(r, 600))
      
      const canvas = document.createElement('canvas')
      canvas.width = 600
      canvas.height = 800
      const ctx = canvas.getContext('2d')
      if (ctx) {
        // Gradient background
        const grad = ctx.createLinearGradient(0, 0, 600, 800)
        grad.addColorStop(0, design.primaryColor || '#5b21b6')
        grad.addColorStop(1, design.secondaryColor || '#c9a24b')
        ctx.fillStyle = grad
        ctx.fillRect(0, 0, 600, 800)

        // Inner Border
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'
        ctx.lineWidth = 2
        ctx.strokeRect(24, 24, 552, 752)

        // Text rendering
        ctx.fillStyle = '#ffffff'
        ctx.textAlign = 'center'
        ctx.font = 'bold 26px sans-serif'
        ctx.fillText(design.eventTitle, 300, 110)

        ctx.font = 'bold 36px sans-serif'
        ctx.fillText(design.eventNames || event?.title || 'دعوتك', 300, 180)

        ctx.font = '18px sans-serif'
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
        ctx.fillText(design.bodyText || 'نتشرف بحضوركم الكريم', 300, 240)

        // Guest Name Box
        ctx.fillStyle = 'rgba(255, 255, 255, 0.15)'
        ctx.fillRect(80, 310, 440, 90)
        ctx.fillStyle = '#ffffff'
        ctx.font = '16px sans-serif'
        ctx.fillText('الدعوة خاصة بـ', 300, 345)
        ctx.font = 'bold 28px sans-serif'
        ctx.fillText(guest?.name || '', 300, 385)

        // Date & Location
        ctx.font = '18px sans-serif'
        ctx.fillText(design.date || '', 300, 710)
        ctx.fillText(design.venue || '', 300, 745)

        const link = document.createElement('a')
        link.download = `دعوة_${guest?.name.replace(/\s+/g, '_')}.png`
        link.href = canvas.toDataURL('image/png')
        link.click()
        toast.success(`تم حفظ صورة دعوة ${guest?.name}`)
      }
    } catch {
      toast.error('تعذر حفظ الصورة، يرجى المحاولة مرة أخرى')
    } finally {
      setDownloadingImg(false)
    }
  }

  function handleDownloadPdf() {
    setDownloadingPdf(true)
    setTimeout(() => {
      // Client-side printable PDF generation window
      const printWin = window.open('', '_blank')
      if (printWin) {
        printWin.document.write(`
          <html dir="rtl">
            <head>
              <title>دعوة ${guest.name}</title>
              <style>
                body { font-family: 'Segoe UI', Tahoma, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: #f0f0f0; }
                .card { width: 420px; height: 580px; padding: 32px; background: linear-gradient(135deg, ${design.primaryColor}, ${design.secondaryColor}); color: white; border-radius: 20px; text-align: center; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 10px 25px rgba(0,0,0,0.2); }
                h1 { margin: 8px 0; font-size: 24px; }
                h2 { margin: 4px 0; font-size: 18px; opacity: 0.9; }
                .guest-name { font-size: 24px; font-weight: bold; background: rgba(255,255,255,0.2); padding: 12px; border-radius: 12px; margin: 16px 0; }
                .details { font-size: 14px; line-height: 1.6; opacity: 0.95; }
              </style>
            </head>
            <body>
              <div class="card">
                <div>
                  <h2>${design.eventTitle}</h2>
                  <h1>${design.eventNames || event.title}</h1>
                  <p>${design.bodyText}</p>
                </div>
                <div>
                  <div style="font-size: 13px; opacity: 0.8;">الدعوة باسم</div>
                  <div class="guest-name">${guest.name}</div>
                  <div style="font-size: 11px; opacity: 0.7;">الرمز التعريفي: ${qrToken}</div>
                </div>
                <div class="details">
                  <div>📅 ${design.date}</div>
                  <div>📍 ${design.venue}</div>
                </div>
              </div>
              <script>window.print();</script>
            </body>
          </html>
        `)
        printWin.document.close()
      }
      setDownloadingPdf(false)
      toast.success(`تم تجهيز ملف PDF لدعوة ${guest.name}`)
    }, 400)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold flex items-center justify-between">
            <span>بطاقة دعوة: {guest.name}</span>
          </DialogTitle>
        </DialogHeader>

        {/* Live Invitation Card Preview */}
        <div className="flex justify-center my-2">
          <InvitationPreviewCard
            design={design}
            qrValue={qrToken}
            className="w-full max-w-[300px] shadow-lg"
          />
        </div>

        {/* Action Controls for this guest */}
        <div className="flex flex-col gap-2 mt-3 pt-3 border-t border-border">
          <Button
            className="w-full bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold h-10 shadow-sm"
            onClick={handleWhatsAppShare}
          >
            <MessageCircle className="h-4 w-4 me-2" />
            مشاركة فورية عبر واتساب
          </Button>

          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              className="w-full h-9 text-xs"
              onClick={handleDownloadImage}
              loading={downloadingImg}
            >
              <Download className="h-3.5 w-3.5 me-1.5" />
              حفظ كصورة (PNG)
            </Button>
            <Button
              variant="outline"
              className="w-full h-9 text-xs"
              onClick={handleDownloadPdf}
              loading={downloadingPdf}
            >
              <FileText className="h-3.5 w-3.5 me-1.5" />
              تحميل ملف (PDF)
            </Button>
          </div>

          <Button
            variant="secondary"
            className="w-full h-9 text-xs"
            onClick={handleCopyLink}
          >
            {copied ? <Check className="h-3.5 w-3.5 me-1.5 text-success" /> : <Copy className="h-3.5 w-3.5 me-1.5" />}
            {copied ? 'تم نسخ الرابط' : 'نسخ رابط الدعوة المباشر'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
