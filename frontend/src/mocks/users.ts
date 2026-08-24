import type { User, AuditLog } from '@/types'

export const currentUser: User = {
  id: 'u-1',
  name: 'خالد المطيري',
  email: 'khaled@example.com',
  phone: '+966 50 123 4567',
  avatarUrl: '',
  role: 'user',
  planId: 'plan-pro',
  createdAt: '2025-11-02T10:00:00Z',
  status: 'active',
}

export const adminUser: User = {
  id: 'admin-1',
  name: 'سلمى الأحمدي',
  email: 'admin@daawatak.com',
  phone: '+966 55 999 0000',
  avatarUrl: '',
  role: 'admin',
  planId: 'plan-business',
  createdAt: '2025-01-15T10:00:00Z',
  status: 'active',
}

export const receptionUser: User = {
  id: 'reception-1',
  name: 'موظف الاستقبال',
  email: 'reception@daawatak.com',
  phone: '+966 50 000 1111',
  avatarUrl: '',
  role: 'reception',
  planId: 'plan-business',
  createdAt: '2025-06-01T10:00:00Z',
  status: 'active',
}

const names = [
  'محمد العتيبي', 'نورة القحطاني', 'فيصل الدوسري', 'ريم الشهري', 'عبدالله السبيعي',
  'لينا الحربي', 'سعود الغامدي', 'هدى الزهراني', 'ياسر المالكي', 'دانة العنزي',
  'طارق الرشيد', 'منى الجهني', 'بدر الشمري', 'عبير القرشي', 'أنس بخاري',
]

export const mockUsers: User[] = names.map((name, i) => ({
  id: `user-${i + 1}`,
  name,
  email: `user${i + 1}@example.com`,
  phone: `+966 5${i}1 23${i}4 5${i}0`,
  role: 'user',
  planId: i % 3 === 0 ? 'plan-business' : i % 2 === 0 ? 'plan-pro' : 'plan-free',
  createdAt: new Date(Date.now() - i * 86400000 * 7).toISOString(),
  status: i === 4 ? 'suspended' : 'active',
}))

export const mockAuditLogs: AuditLog[] = Array.from({ length: 20 }, (_, i) => ({
  id: `log-${i + 1}`,
  actor: i % 2 === 0 ? adminUser.name : mockUsers[i % mockUsers.length].name,
  action: ['تسجيل دخول', 'تعديل خطة', 'إنشاء مناسبة', 'حذف مدعو', 'تعليق حساب', 'نشر قالب'][i % 6],
  target: ['المستخدم #1023', 'مناسبة زفاف أحمد', 'خطة Business', 'قالب زفاف ذهبي'][i % 4],
  createdAt: new Date(Date.now() - i * 3600000 * 5).toISOString(),
  ip: `192.168.1.${10 + i}`,
}))
