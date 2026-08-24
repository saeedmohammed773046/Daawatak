import { Heart, Gem, BookOpenCheck, GraduationCap, Cake, Presentation, Users2, Handshake, DoorOpen, Star } from 'lucide-react'
import type { EventType } from '@/types'

const map: Record<EventType, any> = {
  wedding: Heart,
  engagement: Gem,
  religious: BookOpenCheck,
  graduation: GraduationCap,
  birthday: Cake,
  conference: Presentation,
  training: Users2,
  meeting: Handshake,
  opening: DoorOpen,
  special: Star,
}

export function eventTypeIcon(type: EventType) {
  return map[type] || Star
}
