import { http, mockResolve } from '@/lib/http'
import { env } from '@/config/env'
import { mockTemplates } from '@/mocks/templates'
import type { EventType, Template } from '@/types'

export interface TemplateFilters {
  category?: string
  tier?: 'all' | 'free' | 'premium'
  search?: string
}

function mapTemplate(t: any): Template {
  return {
    id: String(t.id),
    name: t.name,
    category: (t.coordinates_config?.category || t.category || 'wedding') as EventType,
    previewUrl: t.base_image_url || t.previewUrl || '',
    isPremium: !t.is_public,
    isPublished: true,
    usageCount: t.usage_count || 0,
    createdAt: t.created_at || new Date().toISOString(),
    colors: t.coordinates_config?.colors || ['#D4AF37', '#0F172A'],
  }
}

export const templatesService = {
  async list(filters: TemplateFilters = {}): Promise<Template[]> {
    if (env.useMock) {
      let data = [...mockTemplates]
      if (filters.category && filters.category !== 'all') data = data.filter((t) => t.category === filters.category)
      if (filters.tier === 'free') data = data.filter((t) => !t.isPremium)
      if (filters.tier === 'premium') data = data.filter((t) => t.isPremium)
      if (filters.search) data = data.filter((t) => t.name.toLowerCase().includes(filters.search!.toLowerCase()))
      return mockResolve(data)
    }

    try {
      const res = await http.get<{ success: boolean; data: any[] }>('/templates')
      let items = (Array.isArray(res.data) && res.data.length > 0) ? res.data.map(mapTemplate) : mockTemplates

      if (filters.category && filters.category !== 'all') items = items.filter((t) => t.category === filters.category)
      if (filters.tier === 'free') items = items.filter((t) => !t.isPremium)
      if (filters.tier === 'premium') items = items.filter((t) => t.isPremium)
      if (filters.search) items = items.filter((t) => t.name.toLowerCase().includes(filters.search!.toLowerCase()))

      return items
    } catch {
      return mockTemplates
    }
  },

  async create(payload: Partial<Template>): Promise<Template> {
    if (env.useMock) {
      return mockResolve({
        id: `tpl-${Date.now()}`,
        name: payload.name || 'قالب جديد',
        category: payload.category || 'special',
        previewUrl: payload.previewUrl || '',
        isPremium: payload.isPremium ?? false,
        isPublished: true,
        usageCount: 0,
        createdAt: new Date().toISOString(),
        colors: payload.colors || ['#7c3aed', '#c9a24b'],
      })
    }

    const res = await http.post<{ success: boolean; data: any }>('/admin/templates', {
      name: payload.name,
      base_image_url: payload.previewUrl || 'https://daawatak-assets.s3.amazonaws.com/covers/wedding_default.jpg',
      coordinates_config: {
        guest_name: { x: 540, y: 800, font_size: 48, color: '#D4AF37' },
        colors: payload.colors || ['#D4AF37', '#0F172A'],
      },
      is_public: !payload.isPremium,
    })

    return mapTemplate(res.data)
  },

  async togglePublish(id: string, isPublished: boolean) {
    if (env.useMock) return mockResolve({ id, isPublished })
    const res = await http.put<{ success: boolean }>(`/admin/templates/${id}`, {
      is_public: isPublished,
    })
    return res
  },

  async delete(id: string) {
    if (env.useMock) return mockResolve({ success: true })
    const res = await http.delete<{ success: boolean }>(`/admin/templates/${id}`)
    return res
  },
}

