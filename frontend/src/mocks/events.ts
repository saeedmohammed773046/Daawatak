import type { EventItem, EventType, EventStatus } from '@/types'

const eventTitles: Record<EventType, string[]> = {
  wedding: ['حفل زفاف أحمد وسارة', 'زفاف فيصل ونوف'],
  engagement: ['خطوبة محمد وريم'],
  religious: ['عقد قران خالد وهند'],
  graduation: ['حفل تخرج دفعة 2026'],
  birthday: ['عيد ميلاد لمى الخامس'],
  conference: ['مؤتمر التقنية السنوي'],
  training: ['دورة القيادة التنفيذية'],
  meeting: ['اجتماع مجلس الإدارة'],
  opening: ['افتتاح فرع الرياض الجديد'],
  special: ['حفل تكريم الموظفين'],
}

const types: EventType[] = ['wedding', 'engagement', 'religious', 'graduation', 'birthday', 'conference', 'training', 'meeting', 'opening', 'special']
const statuses: EventStatus[] = ['upcoming', 'upcoming', 'ongoing', 'completed', 'completed', 'draft', 'archived']
const cities = ['الرياض', 'جدة', 'الدمام', 'مكة المكرمة', 'المدينة المنورة', 'الخبر']
const venues = ['قصر الأفراح الملكي', 'فندق الريتز كارلتون', 'قاعة الماسة', 'المركز الثقافي', 'فندق فورسيزنز', 'قاعة الاحتفالات الكبرى']

function pick<T>(arr: T[], i: number) { return arr[i % arr.length] }

export const mockEvents: EventItem[] = Array.from({ length: 14 }, (_, i) => {
  const type = pick(types, i)
  const titles = eventTitles[type]
  const daysOffset = (i - 5) * 9
  const date = new Date(Date.now() + daysOffset * 86400000)
  const guestsCount = 60 + i * 35
  const invitationsCount = Math.round(guestsCount * (0.7 + (i % 3) * 0.1))
  const checkedInCount = Math.round(invitationsCount * (0.4 + (i % 4) * 0.12))
  return {
    id: `event-${i + 1}`,
    title: pick(titles, i),
    type,
    status: pick(statuses, i),
    date: date.toISOString(),
    time: `${6 + (i % 5)}:00 مساءً`,
    venue: pick(venues, i),
    city: pick(cities, i),
    description: 'يسعدنا دعوتكم لمشاركتنا هذه المناسبة الغالية على قلوبنا، حضوركم يزيدنا سعادة وفخرًا.',
    coverUrl: '',
    guestsCount,
    invitationsCount,
    checkedInCount,
    createdAt: new Date(Date.now() - (30 - i) * 86400000).toISOString(),
  }
})

export function getEventById(id: string) {
  return mockEvents.find((e) => e.id === id)
}
