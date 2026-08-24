import { Menu, Search, Bell, Sun, Moon, Languages, LogOut, User as UserIcon, Settings as SettingsIcon } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { useUiStore } from '@/store/ui.store'
import { useI18n } from '@/i18n'
import { useAuthStore } from '@/store/auth.store'
import { useNavigate, Link } from 'react-router-dom'
import { initials, cn } from '@/lib/utils'
import { notificationsService } from '@/services/notifications.service'
import { useAsync } from '@/hooks/use-async'

export function DashboardTopbar({ onMenuClick, basePath = '/dashboard' }: { onMenuClick: () => void; basePath?: string }) {
  const { theme, setTheme } = useUiStore()
  const { toggleLocale, locale } = useI18n()
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const { data: notificationsData } = useAsync(() => notificationsService.list(), [])
  const notifications = notificationsData || []
  const unread = notifications.filter((n) => !n.read).length

  const isAr = locale === 'ar'

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/90 px-4 backdrop-blur-lg sm:px-6">
      <button onClick={onMenuClick} className="flex h-9 w-9 items-center justify-center rounded-lg border border-border lg:hidden" aria-label="menu">
        <Menu className="h-5 w-5" />
      </button>

      <div className="relative hidden max-w-sm flex-1 sm:block">
        <Search className="absolute top-1/2 -translate-y-1/2 start-3 h-4 w-4 text-muted-foreground" />
        <Input placeholder={isAr ? 'بحث...' : 'Search...'} className="ps-9" />
      </div>

      <div className="flex-1 sm:hidden" />

      <div className="flex items-center gap-1.5">
        <Button variant="ghost" size="icon" onClick={toggleLocale} title={isAr ? 'English' : 'العربية'}>
          <Languages className="h-4.5 w-4.5" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} title={isAr ? 'المظهر' : 'Theme'}>
          {theme === 'dark' ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative" title={isAr ? 'الإشعارات' : 'Notifications'}>
              <Bell className="h-4.5 w-4.5" />
              {unread > 0 && (
                <span className="absolute end-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white">
                  {unread}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 sm:w-96 p-0 overflow-hidden bg-card border-border">
            <div className="flex items-center justify-between px-4 py-3 bg-muted/40 border-b border-border">
              <span className="font-bold text-sm text-foreground">{isAr ? 'الإشعارات' : 'Notifications'}</span>
              {unread > 0 && (
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                  {unread} {isAr ? 'غير مقروءة' : 'unread'}
                </span>
              )}
            </div>
            <div className="max-h-80 overflow-y-auto divide-y divide-border">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-xs text-muted-foreground">{isAr ? 'لا توجد إشعارات جديدة' : 'No new notifications'}</div>
              ) : (
                notifications.slice(0, 5).map((n) => (
                  <div
                    key={n.id}
                    onClick={async () => {
                      if (!n.read) {
                        await notificationsService.markRead(n.id)
                      }
                      navigate(`${basePath}/notifications`)
                    }}
                    className={cn(
                      'flex items-start gap-3 p-3.5 cursor-pointer transition-colors hover:bg-muted/30',
                      !n.read && 'bg-primary/[0.04]'
                    )}
                  >
                    <span className={cn('mt-1 h-2 w-2 shrink-0 rounded-full', !n.read ? 'bg-primary' : 'bg-transparent')} />
                    <div className="flex-1 space-y-0.5 min-w-0">
                      <p className={cn('text-xs font-semibold truncate', !n.read ? 'text-foreground font-bold' : 'text-foreground/80')}>
                        {n.title}
                      </p>
                      <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">{n.message}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="p-2 border-t border-border bg-muted/20 text-center">
              <Link
                to={`${basePath}/notifications`}
                className="block text-xs font-semibold text-primary hover:underline py-1"
              >
                {isAr ? 'عرض مركز الإشعارات بالكامل ←' : 'View all in Notification Center →'}
              </Link>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="ms-1 flex items-center gap-2 rounded-full border border-border p-1 pe-2.5 transition-colors hover:bg-accent">
              <Avatar className="h-7 w-7">
                <AvatarImage src={user?.avatarUrl} />
                <AvatarFallback>{initials(user?.name || 'U')}</AvatarFallback>
              </Avatar>
              <span className="hidden text-sm font-medium sm:inline">{user?.name}</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>{user?.email}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to={`${basePath}/profile`}>
                <UserIcon className="h-4 w-4" /> {isAr ? 'الملف الشخصي' : 'Profile'}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to={`${basePath}/settings`}>
                <SettingsIcon className="h-4 w-4" /> {isAr ? 'الإعدادات' : 'Settings'}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                logout()
                navigate('/login')
              }}
              className="text-destructive focus:text-destructive"
            >
              <LogOut className="h-4 w-4" /> {isAr ? 'تسجيل الخروج' : 'Logout'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
