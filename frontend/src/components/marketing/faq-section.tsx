import { useI18n } from '@/i18n'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion'

const faqItemsAr = [
  { q: 'ما هي دعوتك؟', a: 'دعوتك منصة عربية ذكية تتيح لك إنشاء دعوات إلكترونية فاخرة، إرسالها للمدعوين، ومتابعة الحضور لحظيًا برمز QR فريد لكل دعوة.' },
  { q: 'كيف أُنشئ دعوة؟', a: 'أنشئ مناسبتك أولًا، ثم أضف المدعوين، اختر قالبًا مناسبًا، خصصه، وابدأ بإنشاء الدعوات وإرسالها في دقائق.' },
  { q: 'هل يمكن تخصيص اسم كل مدعو؟', a: 'نعم، تتيح دعوتك تخصيص اسم كل مدعو تلقائيًا على دعوته الخاصة دون أي جهد إضافي.' },
  { q: 'ما فائدة رمز QR؟', a: 'كل دعوة تحتوي على رمز QR فريد يستخدم عند الدخول للتحقق من صحة الدعوة وتسجيل الحضور لحظيًا.' },
  { q: 'هل يمكن معرفة من حضر؟', a: 'بالتأكيد، توفر لوحة التحكم إحصائيات لحظية للحضور والغياب، مع تقارير مفصلة قابلة للتصدير.' },
  { q: 'هل توجد خطة مجانية؟', a: 'نعم، نوفر خطة مجانية تسمح لك بإنشاء عدد محدود من الدعوات لتجربة المنصة قبل الترقية.' },
]

const faqItemsEn = [
  { q: 'What is Daawatak?', a: 'Daawatak is a smart digital invitation platform that allows you to design luxury invitations, send them to guests, and track live check-ins with unique QR codes.' },
  { q: 'How do I create an invitation?', a: 'Create your event, add your guest list, choose and customize a luxury template, and generate & send invitations in minutes.' },
  { q: 'Can I personalize each guest\'s name?', a: 'Yes! Daawatak automatically personalizes each guest\'s name and companion count directly onto their invitation card in one click.' },
  { q: 'What is the benefit of the QR code?', a: 'Every invite gets a tamper-proof encrypted QR code used at the entrance for fast 1-second check-in and preventing duplicate entries.' },
  { q: 'Can I track live guest check-ins?', a: 'Absolutely. The live dashboard provides real-time check-in counters, attendance rates, and exportable PDF/Excel reports.' },
  { q: 'Is there a free plan available?', a: 'Yes, we offer a Free plan allowing you to create invitations and experience the platform with up to 50 guests.' },
]

export function FaqSection() {
  const { t, locale } = useI18n()
  const isAr = locale === 'ar'
  const items = isAr ? faqItemsAr : faqItemsEn

  return (
    <section className="py-16 sm:py-24">
      <div className="container max-w-3xl">
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{t.faq.heading}</h2>
          <p className="mt-3 text-muted-foreground">{t.faq.subheading}</p>
        </div>
        <Accordion type="single" collapsible className="mt-10">
          {items.map((item, i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger className="text-start font-semibold">{item.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">{item.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
