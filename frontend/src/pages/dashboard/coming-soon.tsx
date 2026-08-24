import { Construction } from 'lucide-react'
import { EmptyState } from '@/components/shared/empty-state'

interface ComingSoonPageProps {
  title?: string
  description?: string
}

export default function ComingSoonPage({
  title = 'قريبًا',
  description = 'نعمل على إنجاز هذه الصفحة، ستكون متاحة قريبًا.',
}: ComingSoonPageProps) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <EmptyState icon={Construction} title={title} description={description} />
    </div>
  )
}
