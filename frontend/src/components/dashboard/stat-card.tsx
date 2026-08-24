import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowUp, ArrowDown } from 'lucide-react'

interface StatCardProps {
  icon: LucideIcon
  label: string
  value: string | number
  trend?: number
  colorClass?: string
}

export function StatCard({ icon: Icon, label, value, trend, colorClass = 'text-primary bg-primary/10' }: StatCardProps) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between gap-3 p-5">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-1.5 text-2xl font-bold">{value}</p>
          {trend !== undefined && (
            <div className={cn('mt-1.5 flex items-center gap-1 text-xs font-medium', trend >= 0 ? 'text-success' : 'text-destructive')}>
              {trend >= 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
              {Math.abs(trend)}% عن الشهر الماضي
            </div>
          )}
        </div>
        <div className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-xl', colorClass)}>
          <Icon className="h-6 w-6" />
        </div>
      </CardContent>
    </Card>
  )
}

export function StatCardSkeleton() {
  return (
    <Card>
      <CardContent className="flex items-center justify-between gap-3 p-5">
        <div className="flex-1">
          <div className="skeleton h-3.5 w-24 rounded" />
          <div className="skeleton mt-2 h-6 w-16 rounded" />
        </div>
        <div className="skeleton h-12 w-12 rounded-xl" />
      </CardContent>
    </Card>
  )
}
