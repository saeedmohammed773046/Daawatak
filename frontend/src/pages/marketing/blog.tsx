import { CalendarDays, ArrowUpRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'

const posts = [
  { id: 1, title: '10 أفكار لتصميم دعوة زفاف لا تُنسى', category: 'تصميم', date: '2026-06-02', excerpt: 'اكتشف أحدث الاتجاهات في تصميم دعوات الزفاف الإلكترونية التي تترك انطباعًا رائعًا لدى ضيوفك.' },
  { id: 2, title: 'كيف تدير حضور فعاليتك باستخدام رمز QR؟', category: 'إدارة الفعاليات', date: '2026-05-20', excerpt: 'دليل عملي لاستخدام رموز QR في تسريع عملية تسجيل الحضور وتقليل الازدحام عند بوابات الدخول.' },
  { id: 3, title: 'أفضل ممارسات إرسال الدعوات عبر واتساب', category: 'التسويق', date: '2026-05-05', excerpt: 'تعرف على أفضل الأوقات والطرق لإرسال دعواتك عبر واتساب لضمان أعلى معدل استجابة من ضيوفك.' },
  { id: 4, title: 'دليلك الشامل لتنظيم مؤتمر أعمال ناجح', category: 'الشركات', date: '2026-04-18', excerpt: 'خطوات عملية لتنظيم مؤتمرات الأعمال من التخطيط وحتى إدارة الحضور والتقارير النهائية.' },
]

export default function BlogPage() {
  return (
    <section className="py-14 sm:py-20">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-3xl font-extrabold tracking-tight">مدونة دعوتك</h1>
          <p className="mt-3 text-muted-foreground">نصائح وأفكار لتنظيم فعالياتك ومناسباتك باحترافية</p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {posts.map((post) => (
            <Card key={post.id} className="group cursor-pointer transition-all hover:-translate-y-1 hover:shadow-elevated">
              <div className="h-40 w-full rounded-t-xl bg-brand-gradient opacity-90" />
              <CardContent className="flex flex-col gap-3 p-6">
                <div className="flex items-center gap-3">
                  <Badge>{post.category}</Badge>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {formatDate(post.date)}
                  </span>
                </div>
                <h3 className="text-lg font-semibold group-hover:text-primary">{post.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{post.excerpt}</p>
                <span className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-primary">
                  اقرأ المزيد <ArrowUpRight className="h-3.5 w-3.5" />
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
