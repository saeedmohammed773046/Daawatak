import type { AppNotification } from '@/types'

const STORAGE_KEY = 'daawatak_notifications'

const initialNotifications: AppNotification[] = [
  {
    id: 'notif-1',
    title: 'تسجيل حضور ضيف VIP: د. وضاح الأهدل',
    message: 'تم مسح رمز QR بنجاح عند بوابة كبار الشخصيات لمناسبة "حفل زفاف صادق وريم".',
    type: 'success',
    category: 'checkin',
    read: false,
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  },
  {
    id: 'notif-2',
    title: 'اكتمل إنشاء قوالب الدعوات الذكية',
    message: 'تم تجهيز 10 دعوات رقمية مع رمز QR فريد جاهزة للإرسال عبر واتساب.',
    type: 'info',
    category: 'event',
    read: false,
    createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
  },
  {
    id: 'notif-3',
    title: 'تأكيد استلام دفعة الاشتراك بنجاح',
    message: 'تم تفعيل باقة الاشتراك الاحترافية عبر الكريمي إكسبرس (60,000 ر.ي).',
    type: 'success',
    category: 'subscription',
    read: true,
    createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
  },
  {
    id: 'notif-4',
    title: 'تسجيل دخول موظف الاستقبال',
    message: 'بدأت سارة الحميري جلسة التحقق من التذاكر عبر واجهة الاستقبال.',
    type: 'info',
    category: 'system',
    read: true,
    createdAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
  },
  {
    id: 'notif-5',
    title: 'تذكير: اقتراب موعد حفل التخرج 🎓',
    message: 'تبقى 3 أيام على موعد حفل تخرج الدفعة 32 - كلية الحاسوب في قاعة قصر الشباب.',
    type: 'warning',
    category: 'event',
    read: true,
    createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'notif-6',
    title: 'تحديث أمني للنظام',
    message: 'تم تعزيز خوارزمية تشفير رموز الدخول QR وربطها بالتحقق الفوري المباشر.',
    type: 'info',
    category: 'system',
    read: true,
    createdAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
  },
]

function getLocalNotifications(): AppNotification[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch (_) {}
  return initialNotifications
}

function saveLocalNotifications(list: AppNotification[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
  } catch (_) {}
}

export interface NotificationFilters {
  category?: string
  status?: 'all' | 'unread' | 'read'
  search?: string
}

export const notificationsService = {
  async list(filters: NotificationFilters = {}): Promise<AppNotification[]> {
    let list = getLocalNotifications()

    if (filters.search) {
      const q = filters.search.toLowerCase()
      list = list.filter((n) => n.title.toLowerCase().includes(q) || n.message.toLowerCase().includes(q))
    }

    if (filters.status === 'unread') {
      list = list.filter((n) => !n.read)
    } else if (filters.status === 'read') {
      list = list.filter((n) => n.read)
    }

    if (filters.category && filters.category !== 'all') {
      list = list.filter((n) => n.category === filters.category)
    }

    return list
  },

  async markAllRead() {
    const list = getLocalNotifications().map((n) => ({ ...n, read: true }))
    saveLocalNotifications(list)
    return { success: true }
  },

  async markRead(id: string) {
    const list = getLocalNotifications().map((n) => (n.id === id ? { ...n, read: true } : n))
    saveLocalNotifications(list)
    return { success: true }
  },

  async remove(id: string) {
    const list = getLocalNotifications().filter((n) => n.id !== id)
    saveLocalNotifications(list)
    return { success: true }
  },

  async clearAll() {
    saveLocalNotifications([])
    return { success: true }
  },

  async resetDefault() {
    saveLocalNotifications(initialNotifications)
    return initialNotifications
  },

  async add(notif: Omit<AppNotification, 'id' | 'createdAt'>) {
    const list = getLocalNotifications()
    const newItem: AppNotification = {
      ...notif,
      id: `notif-${Date.now()}`,
      createdAt: new Date().toISOString(),
    }
    saveLocalNotifications([newItem, ...list])
    return newItem
  },
}
