import type { AppNotification } from '@/types'

export const mockNotifications: AppNotification[] = [
  {
    id: 'n-1',
    type: 'success',
    title: 'تم إنشاء الدعوات بنجاح',
    message: 'تم إنشاء 500 دعوة لمناسبة "حفل زفاف أحمد وسارة" بنجاح.',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    read: false,
  },
  {
    id: 'n-2',
    type: 'info',
    title: 'اكتمل تصدير التقرير',
    message: 'تقرير الحضور لمناسبة "مؤتمر التقنية السنوي" جاهز للتحميل.',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    read: false,
  },
  {
    id: 'n-3',
    type: 'error',
    title: 'فشل إرسال بعض الدعوات',
    message: '12 دعوة عبر واتساب لم يتم إرسالها بسبب أرقام غير صحيحة.',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    read: true,
  },
  {
    id: 'n-4',
    type: 'warning',
    title: 'اشتراكك سينتهي قريبًا',
    message: 'تنتهي خطتك الاحترافية بعد 7 أيام، جدد الآن لتجنب الانقطاع.',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    read: true,
  },
  {
    id: 'n-5',
    type: 'success',
    title: 'تم تحديث الاشتراك',
    message: 'تم ترقية خطتك إلى الخطة الاحترافية بنجاح.',
    createdAt: new Date(Date.now() - 259200000).toISOString(),
    read: true,
  },
]
