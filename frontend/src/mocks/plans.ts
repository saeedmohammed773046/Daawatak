import type { Plan, Subscription } from '@/types'

export const mockPlans: Plan[] = [
  {
    id: 'plan-free',
    name: 'Free',
    nameAr: 'مجانية',
    priceMonthly: 0,
    priceYearly: 0,
    maxInvitations: 50,
    maxEvents: 1,
    maxUsers: 1,
    features: ['حتى 50 دعوة', 'قوالب أساسية', 'رمز QR لكل دعوة', 'دعم عبر واتساب والبريد'],
  },
  {
    id: 'plan-pro',
    name: 'Professional',
    nameAr: 'احترافية',
    priceMonthly: 25000,
    priceYearly: 250000,
    maxInvitations: 1000,
    maxEvents: 10,
    maxUsers: 3,
    features: ['حتى 1000 دعوة', 'قوالب مميزة وفاخرة', 'تقارير مفصلة', 'إرسال واتساب ورسائل قصيرة', 'دعم فني يمني على مدار الساعة'],
    isPopular: true,
  },
  {
    id: 'plan-business',
    name: 'Business',
    nameAr: 'أعمال والشركات',
    priceMonthly: 60000,
    priceYearly: 600000,
    maxInvitations: 10000,
    maxEvents: 100,
    maxUsers: 15,
    features: ['دعوات غير محدودة', 'عدة مناسبات ومستخدمين', 'صلاحيات متقدمة', 'واجهة استقبال ومسح QR متعددة البوابات', 'مدير حساب مخصص'],
  },
]

export const mockCustomPlan: Plan = {
  id: 'plan-enterprise',
  name: 'Enterprise',
  nameAr: 'مخصصة',
  priceMonthly: 0,
  priceYearly: 0,
  maxInvitations: -1,
  maxEvents: -1,
  maxUsers: -1,
  features: ['حلول مخصصة بالكامل', 'تكامل API خاص', 'استضافة مخصصة'],
  isCustom: true,
}

export const mockSubscription: Subscription = {
  id: 'sub-1',
  planId: 'plan-pro',
  startedAt: '2026-01-15T00:00:00Z',
  expiresAt: '2027-01-15T00:00:00Z',
  invitationsUsed: 800,
  invitationsLimit: 1000,
  storageUsedMb: 640,
  storageLimitMb: 2048,
  status: 'active',
}
