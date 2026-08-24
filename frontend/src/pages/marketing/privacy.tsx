export default function PrivacyPage() {
  const sections = [
    { title: 'جمع المعلومات', body: 'نقوم بجمع المعلومات التي تقدمها عند إنشاء حساب أو استخدام خدمات دعوتك، مثل الاسم والبريد الإلكتروني ورقم الهاتف وبيانات المناسبات والمدعوين.' },
    { title: 'استخدام المعلومات', body: 'تُستخدم بياناتك لتقديم خدمات المنصة وتحسينها، بما في ذلك إنشاء الدعوات، إرسالها، وتتبع الحضور، دون مشاركتها مع أطراف ثالثة دون موافقتك.' },
    { title: 'حماية البيانات', body: 'نطبق معايير أمان تقنية وتنظيمية لحماية بياناتك من الوصول غير المصرح به، والتلاعب، أو الإفشاء.' },
    { title: 'حقوقك', body: 'يمكنك في أي وقت طلب الوصول إلى بياناتك، تعديلها، أو حذفها من خلال التواصل مع فريق الدعم.' },
    { title: 'ملفات تعريف الارتباط', body: 'نستخدم ملفات تعريف الارتباط لتحسين تجربتك على المنصة وتذكر تفضيلاتك مثل اللغة والمظهر.' },
    { title: 'التعديلات على السياسة', body: 'قد نقوم بتحديث سياسة الخصوصية من وقت لآخر، وسيتم إعلامك بأي تغييرات جوهرية عبر البريد الإلكتروني أو داخل المنصة.' },
  ]
  return (
    <section className="py-14 sm:py-20">
      <div className="container max-w-3xl">
        <h1 className="text-3xl font-extrabold tracking-tight">سياسة الخصوصية</h1>
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
