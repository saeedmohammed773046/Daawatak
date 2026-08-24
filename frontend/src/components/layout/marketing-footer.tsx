import { Link } from 'react-router-dom'
import { Logo } from '@/components/shared/logo'
import { useI18n } from '@/i18n'
import { Facebook, Instagram, Twitter, Linkedin } from 'lucide-react'

export function MarketingFooter() {
  const { t } = useI18n()

  const columns = [
    {
      title: t.footer.product,
      links: [
        { label: t.nav.features, href: '/features' },
        { label: t.nav.pricing, href: '/pricing' },
        { label: t.nav.howItWorks, href: '/#how-it-works' },
        { label: t.nav.faq, href: '/faq' },
      ],
    },
    {
      title: t.footer.support,
      links: [
        { label: t.nav.contact, href: '/contact' },
        { label: t.nav.blog, href: '/blog' },
        { label: t.nav.faq, href: '/faq' },
      ],
    },
    {
      title: t.footer.legal,
      links: [
        { label: t.footer.privacy, href: '/privacy' },
        { label: t.footer.terms, href: '/terms' },
      ],
    },
  ]

  return (
    <footer className="border-t border-border bg-muted/40">
      <div className="container grid gap-10 py-14 lg:grid-cols-[1.4fr,1fr,1fr,1fr]">
        <div className="flex flex-col gap-4">
          <Logo />
          <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">{t.footer.tagline}</p>
          <div className="flex items-center gap-3">
            {[Facebook, Instagram, Twitter, Linkedin].map((Icon, i) => (
              <a
                key={i}
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                aria-label="social-link"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
        {columns.map((col) => (
          <div key={col.title} className="flex flex-col gap-3">
            <h4 className="text-sm font-semibold">{col.title}</h4>
            <ul className="flex flex-col gap-2.5">
              {col.links.map((link) => (
                <li key={link.label + link.href}>
                  <Link to={link.href} className="text-sm text-muted-foreground transition-colors hover:text-primary">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border py-5">
        <div className="container flex flex-col items-center justify-between gap-2 text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} {t.common.brand} — {t.footer.rights}</p>
          <p className="flex items-center gap-1">Made with care in Saudi Arabia 🇸🇦</p>
        </div>
      </div>
    </footer>
  )
}
