import { Badge } from '@/components/ui/badge'

const config: Record<string, { label: string; variant: 'default' | 'success' | 'warning' | 'secondary' | 'outline' }> = {
  published: { label: 'منشورة', variant: 'default' },
  upcoming: { label: 'قادمة', variant: 'default' },
  ongoing: { label: 'جارية الآن', variant: 'success' },
  active: { label: 'نشطة', variant: 'success' },
  draft: { label: 'مسودة', variant: 'secondary' },
  completed: { label: 'مكتملة', variant: 'outline' },
  archived: { label: 'مؤرشفة', variant: 'secondary' },
}

export function EventStatusBadge({ status }: { status?: string }) {
  const normalized = (status || 'draft').toLowerCase()
  const cfg = config[normalized] || { label: status || 'مسودة', variant: 'secondary' as const }
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>
}
