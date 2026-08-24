import { mockResolve } from '@/lib/http'

export interface ContactPayload {
  name: string
  email: string
  phone?: string
  subject: string
  message: string
}

export const contactService = {
  async send(_payload: ContactPayload): Promise<{ success: boolean }> {
    await new Promise((r) => setTimeout(r, 1400))
    return { success: true }
  },
}
