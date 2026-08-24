import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Menu, X, Languages, Sun, Moon } from 'lucide-react'
import { Logo } from '@/components/shared/logo'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/i18n'
import { useUiStore } from '@/store/ui.store'
import { cn } from '@/lib/utils'

export function MarketingHeader() {
  const { t, locale, toggleLocale } = useI18n()
  const { theme, setTheme } = useUiStore()
  const [open, setOpen] = useState(false)

  const links = [
    { href: '/', label: t.nav.home },
    { href: '/features', label: t.nav.features },
    { href: '/#how-it-works', label: t.nav.howItWorks },
    { href: '/pricing', label: t.nav.pricing },
    { href: '/faq', label: t.nav.faq },
  ]

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-lg">
      <div className="container flex h-16 items-center justify-between">
        <Logo />

        <nav className="hidden items-center gap-1 lg:flex">
          {links.map((link) => (
            <NavLink
              key={link.href}
              to={link.href}
              className={({ isActive }) =>
                cn(
                  'rounded-md px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground',
                  isActive && 'text-foreground'
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <Button variant="ghost" size="icon" onClick={toggleLocale} aria-label="Toggle language" title="Language">
            <Languages className="h-4.5 w-4.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle theme"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
          </Button>
          <Button asChild>
            <Link to="/login">{t.nav.login}</Link>
          </Button>
        </div>

        <button
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-border lg:hidden"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 end-0 flex w-[85%] max-w-sm flex-col gap-6 bg-background p-6 shadow-elevated animate-fade-in-up">
            <div className="flex items-center justify-between">
              <Logo />
              <button onClick={() => setOpen(false)} aria-label="Close menu" className="rounded-lg border border-border p-2">
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex flex-col gap-1">
              {links.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-3 text-base font-medium hover:bg-accent"
                >
                  {link.label}
                </Link>
              ))}
              <Link to="/contact" onClick={() => setOpen(false)} className="rounded-lg px-3 py-3 text-base font-medium hover:bg-accent">
                {t.nav.contact}
              </Link>
            </nav>
            <div className="mt-auto flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Button variant="outline" className="flex-1" onClick={toggleLocale}>
                  <Languages className="h-4 w-4" /> {locale === 'ar' ? 'English' : 'العربية'}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                >
                  {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </Button>
              </div>
              <Button asChild>
                <Link to="/login" onClick={() => setOpen(false)}>{t.nav.login}</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
