import type { LucideIcon } from 'lucide-react'
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  MailOpen,
  ScanLine,
  BarChart3,
  Palette,
  CreditCard,
  Bell,
  Settings,
  ShieldCheck,
  LayoutTemplate,
  Wallet,
  ReceiptText,
  FileClock,
  Cog,
} from 'lucide-react'

export type NavItem = {
  key: string
  href: string
  icon: LucideIcon
}

export const dashboardNav: NavItem[] = [
  { key: 'home', href: '/dashboard', icon: LayoutDashboard },
  { key: 'events', href: '/dashboard/events', icon: CalendarDays },
  { key: 'guests', href: '/dashboard/guests', icon: Users },
  { key: 'invitations', href: '/dashboard/invitations', icon: MailOpen },
  { key: 'checkins', href: '/dashboard/check-ins', icon: ScanLine },
  { key: 'receptionists', href: '/dashboard/receptionists', icon: ShieldCheck },
  { key: 'reports', href: '/dashboard/reports', icon: BarChart3 },
  { key: 'templates', href: '/dashboard/templates', icon: Palette },
  { key: 'notifications', href: '/dashboard/notifications', icon: Bell },
  { key: 'settings', href: '/dashboard/settings', icon: Settings },
]

export const adminNav: NavItem[] = [
  { key: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { key: 'Users', href: '/admin/users', icon: Users },
  { key: 'Events', href: '/admin/events', icon: CalendarDays },
  { key: 'Templates', href: '/admin/templates', icon: LayoutTemplate },
  { key: 'Plans', href: '/admin/plans', icon: Wallet },
  { key: 'Subscriptions', href: '/admin/subscriptions', icon: ReceiptText },
  { key: 'Reports', href: '/admin/reports', icon: BarChart3 },
  { key: 'AuditLogs', href: '/admin/audit-logs', icon: FileClock },
  { key: 'Settings', href: '/admin/settings', icon: Cog },
]

export const adminNavLabelsAr: Record<string, string> = {
  Dashboard: 'الرئيسية',
  Users: 'المستخدمون',
  Events: 'المناسبات',
  Templates: 'القوالب',
  Plans: 'الخطط',
  Subscriptions: 'الاشتراكات',
  Reports: 'التقارير',
  AuditLogs: 'سجل النشاطات',
  Settings: 'الإعدادات',
}

export const adminNavLabelsEn: Record<string, string> = {
  Dashboard: 'Dashboard',
  Users: 'Users',
  Events: 'Events',
  Templates: 'Templates',
  Plans: 'Plans',
  Subscriptions: 'Subscriptions',
  Reports: 'Reports',
  AuditLogs: 'Audit Logs',
  Settings: 'Settings',
}

export const shieldIcon = ShieldCheck
