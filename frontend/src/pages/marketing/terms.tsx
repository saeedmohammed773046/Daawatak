export default function TermsPage() {
  const sections = [
    { title: 'قبول الشروط', body: 'باستخدامك منصة دعوتك، فإنك توافق على الالتزام بهذه الشروط والأحكام وسياسة الخصوصية الخاصة بنا.' },
    { title: 'استخدام الخدمة', body: 'يجب استخدام المنصة لأغراض قانونية فقط، ويحظر استخدامها لإرسال محتوى مسيء أو مخالف للأنظمة المعمول بها.' },
    { title: 'الاشتراكات والفواتير', body: 'تُحصّل رسوم الاشتراك مقدمًا وفقًا للخطة المختارة، ولا يتم استرداد المبالغ المدفوعة إلا وفق سياسة الاسترجاع المعلنة.' },
    { title: 'الملكية الفكرية', body: 'جميع القوالب والتصاميم والمحتوى المتوفر على المنصة محمي بحقوق الملكية الفكرية ولا يجوز إعادة توزيعه دون إذن.' },
    { title: 'إنهاء الحساب', body: 'يحق لدعوتك تعليق أو إنهاء أي حساب يخالف الشروط والأحكام دون إشعار مسبق في حال الإخلال الجسيم.' },
    { title: 'حدود المسؤولية', body: 'لا تتحمل دعوتك مسؤولية أي أضرار غير مباشرة ناتجة عن استخدام المنصة أو الاعتماد على البيانات المعروضة فيها.' },
  ]
  return (
    <section className="py-14 sm:py-20">
      <div className="container max-w-3xl">
        <h1 className="text-3xl font-extrabold tracking-tight">الشروط والأحكام</h1>
        <p className="mt-2 text-sm text-muted-foreground">آخر تحديث: 1 يناير 2026</p>
        <div className="mt-10 flex flex-col gap-8">
          {sections.map((s) => (
            <div key={s.title}>
              <h2 className="text-lg font-semibold">{s.title}</h2>
              <p className="mt-2 leading-relaxed text-muted-foreground">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
