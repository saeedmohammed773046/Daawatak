import { NavLink, useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { Logo } from '@/components/shared/logo'
import { adminNav, adminNavLabelsAr, adminNavLabelsEn, shieldIcon as ShieldIcon } from '@/config/nav'
import { useAuthStore } from '@/store/auth.store'
import { useI18n } from '@/i18n'
import { X, LogOut, User as UserIcon } from 'lucide-react'

export function AdminSidebar({ mobile, onClose }: { mobile?: boolean; onClose?: () => void }) {
  const { user, logout } = useAuthStore()
  const { locale } = useI18n()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    if (onClose) onClose()
    navigate('/login')
  }

  const isAr = locale === 'ar'

  return (
    <div className="flex h-full w-72 flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex items-center justify-between px-6 py-5">
        <Logo to="/admin" className="text-white [&_span]:text-white" />
        {mobile && (
          <button onClick={onClose} className="rounded-lg p-1.5 text-sidebar-foreground/70 hover:bg-sidebar-accent" aria-label="close">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
      <div className="mx-4 mb-3 flex items-center gap-2 rounded-lg bg-gold/15 px-3 py-2 text-xs font-medium text-gold">
        <ShieldIcon className="h-4 w-4" /> {isAr ? 'لوحة تحكم مدير النظام' : 'Super Admin Dashboard'}
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-2">
        <ul className="flex flex-col gap-1">
          {adminNav.map((item) => (
            <li key={item.href}>
              <NavLink
                to={item.href}
                end={item.href === '/admin'}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium text-sidebar-foreground/75 transition-colors hover:bg-sidebar-accent hover:text-white',
                    isActive && 'bg-sidebar-accent text-white'
                  )
                }
              >
                <item.icon className="h-[18px] w-[18px]" />
                {isAr ? adminNavLabelsAr[item.key] : adminNavLabelsEn[item.key]}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className="border-t border-sidebar-border px-4 py-4 space-y-3">
        {user && (
          <div className="flex items-center gap-2 px-2 text-xs min-w-0">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold/20 text-gold font-bold">
              {user.name ? user.name.charAt(0).toUpperCase() : <UserIcon className="h-4 w-4" />}
            </div>
            <div className="min-w-0">
              <p className="truncate font-semibold text-white/90 text-xs">{user.name}</p>
              <p className="truncate text-[10px] text-white/60">{user.email}</p>
            </div>
          </div>
        )}
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-destructive/15 px-3 py-2 text-xs font-semibold text-destructive transition-colors hover:bg-destructive/25"
        >
          <LogOut className="h-4 w-4" />
          <span>{isAr ? 'تسجيل الخروج' : 'Logout'}</span>
        </button>
      </div>
    </div>
  )
}
