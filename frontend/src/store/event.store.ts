import { create } from 'zustand'
import type { EventItem } from '@/types'

interface EventState {
  selectedEvent: EventItem | null
  setSelectedEvent: (event: EventItem | null) => void
}

export const useEventStore = create<EventState>((set) => ({
  selectedEvent: null,
  setSelectedEvent: (event) => set({ selectedEvent: event }),
}))
