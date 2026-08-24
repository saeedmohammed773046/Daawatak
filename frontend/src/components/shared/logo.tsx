import { cn } from '@/lib/utils'
import { Link } from 'react-router-dom'

export function LogoMark({ className }: { className?: string }) {
  return (
    <div className={cn('relative flex h-9 w-9 items-center justify-center rounded-lg bg-brand-gradient text-white shadow-soft', className)}>
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
        <path
          d="M4 8L12 3L20 8V17C20 18.1046 19.1046 19 18 19H6C4.89543 19 4 18.1046 4 17V8Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path d="M9 19V13H15V19" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <circle cx="12" cy="9" r="1.4" fill="currentColor" />
      </svg>
    </div>
  )
}

export function Logo({ className, showText = true, to = '/' }: { className?: string; showText?: boolean; to?: string }) {
  return (
    <Link to={to} className={cn('flex items-center gap-2.5', className)}>
      <LogoMark />
      {showText && <span className="text-xl font-bold tracking-tight">دعوتك</span>}
    </Link>
  )
}
