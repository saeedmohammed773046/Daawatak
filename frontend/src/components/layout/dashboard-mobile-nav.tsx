import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { LayoutDashboard, CalendarDays, Users, MailOpen, ScanLine } from 'lucide-react'

const items = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'الرئيسية', end: true },
  { href: '/dashboard/events', icon: CalendarDays, label: 'المناسبات' },
  { href: '/dashboard/guests', icon: Users, label: 'المدعوون' },
  { href: '/dashboard/invitations', icon: MailOpen, label: 'الدعوات' },
  { href: '/dashboard/check-ins', icon: ScanLine, label: 'الحضور' },
]

export function DashboardMobileNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-around border-t border-border bg-background/95 py-1.5 backdrop-blur-lg lg:hidden">
      {items.map((item) => (
        <NavLink
          key={item.href}
          to={item.href}
          end={item.end}
          className={({ isActive }) =>
            cn(
              'flex flex-1 flex-col items-center gap-1 rounded-lg py-1.5 text-[11px] font-medium text-muted-foreground transition-colors',
              isActive && 'text-primary'
            )
          }
        >
          <item.icon className="h-5 w-5" />
          {item.label}
        </NavLink>
      ))}
    </nav>
  )
}
