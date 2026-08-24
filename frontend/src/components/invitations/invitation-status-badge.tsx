import { Badge } from '@/components/ui/badge'
import type { GuestInvitationStatus } from '@/types'

const config: Record<GuestInvitationStatus, { label: string; variant: 'secondary' | 'default' | 'success' | 'gold' }> = {
  not_created: { label: 'لم تُنشأ', variant: 'secondary' },
  ready: { label: 'جاهزة', variant: 'default' },
  sent: { label: 'مُرسلة', variant: 'gold' },
  used: { label: 'مُستخدمة', variant: 'success' },
}

export function InvitationStatusBadge({ status }: { status: GuestInvitationStatus }) {
  const cfg = config[status]
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>
}
