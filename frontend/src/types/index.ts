export type ID = string

export type UserRole = 'user' | 'admin' | 'reception'

export interface User {
  id: ID
  name: string
  email: string
  phone?: string
  avatarUrl?: string
  role: UserRole
  planId: string
  createdAt: string
  status: 'active' | 'suspended'
}

export type EventType =
  | 'wedding'
  | 'engagement'
  | 'religious'
  | 'graduation'
  | 'birthday'
  | 'conference'
  | 'training'
  | 'meeting'
  | 'opening'
  | 'special'

export type EventStatus = 'draft' | 'upcoming' | 'ongoing' | 'completed' | 'archived'

export interface EventItem {
  id: ID
  title: string
  type: EventType
  status: EventStatus
  date: string
  time: string
  venue: string
  city: string
  description?: string
  coverUrl?: string
  accessPin?: string
  guestsCount: number
  invitationsCount: number
  checkedInCount: number
  createdAt: string
}

export interface ReceptionistStaff {
  id: ID
  name: string
  password?: string
  email?: string
  phone?: string
  createdAt?: string
}

export type GuestCategory = 'family' | 'friends' | 'work' | 'vip' | 'other'
export type GuestInvitationStatus = 'not_created' | 'ready' | 'sent' | 'used'
export type GuestAttendance = 'pending' | 'checked_in' | 'no_show'

export interface Guest {
  id: ID
  eventId: ID
  name: string
  phone: string
  email?: string
  category: GuestCategory
  notes?: string
  invitationStatus: GuestInvitationStatus
  attendance: GuestAttendance
  checkedInAt?: string
  companions: number
  createdAt: string
}

export type InvitationChannel = 'whatsapp' | 'email' | 'sms' | 'link'
export type InvitationDeliveryStatus = 'pending' | 'sent' | 'delivered' | 'failed'

export interface Invitation {
  id: ID
  eventId: ID
  guestId: ID
  guestName: string
  status: GuestInvitationStatus
  channel?: InvitationChannel
  deliveryStatus?: InvitationDeliveryStatus
  qrCode: string
  createdAt: string
  sentAt?: string
  usedAt?: string
}

export interface CheckInRecord {
  id: ID
  eventId: ID
  guestName: string
  time: string
  gate?: string
  companions: number
}

export interface Template {
  id: ID
  name: string
  category: EventType
  previewUrl: string
  isPremium: boolean
  isPublished: boolean
  usageCount: number
  createdAt: string
  colors: string[]
}

export interface Plan {
  id: ID
  name: string
  nameAr: string
  priceMonthly: number
  priceYearly: number
  maxInvitations: number
  maxEvents: number
  maxUsers: number
  features: string[]
  isPopular?: boolean
  isCustom?: boolean
}

export interface Subscription {
  id: ID
  planId: string
  startedAt: string
  expiresAt: string
  invitationsUsed: number
  invitationsLimit: number
  storageUsedMb: number
  storageLimitMb: number
  status: 'active' | 'expired' | 'trial'
}

export interface AppNotification {
  id: ID
  type: 'success' | 'error' | 'info' | 'warning'
  category?: 'event' | 'checkin' | 'subscription' | 'system'
  title: string
  message: string
  createdAt: string
  read: boolean
  link?: string
}

export interface AuditLog {
  id: ID
  actor: string
  action: string
  target: string
  createdAt: string
  ip: string
}

export interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
}

export interface AnalyticsSnapshot {
  totalGuests: number
  checkedIn: number
  noShow: number
  pending: number
  attendanceRate: number
  hourlyCheckIns: { hour: string; count: number }[]
  categoryBreakdown: { category: GuestCategory; count: number }[]
}
