import { Badge } from '@/components/ui/badge'

const config: Record<string, { label: string; variant: 'default' | 'success' | 'warning' | 'secondary' | 'gold' }> = {
  family: { label: 'العائلة', variant: 'default' },
  friends: { label: 'الأصدقاء', variant: 'success' },
  work: { label: 'العمل', variant: 'secondary' },
  vip: { label: 'كبار الشخصيات', variant: 'gold' },
  other: { label: 'أخرى', variant: 'warning' },
}

export function GuestCategoryBadge({ category }: { category?: string }) {
  const normalized = (category || 'other').toLowerCase()
  const cfg = config[normalized] || { label: category || 'أخرى', variant: 'secondary' as const }
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>
}
