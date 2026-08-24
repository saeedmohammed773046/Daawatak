import Link from "next/link";
import { Layers, CheckCircle, ShieldCheck, Sparkles, Smartphone, BarChart3 } from "lucide-react";

export default function LandingPage() {
  const features = [
    {
      title: "تخصيص كامل لكل مدعو",
      desc: "قم بتخصيص كروت الدعوة بإضافة اسم كل ضيف تلقائياً وتغيير حجم الخطوط ليتناسب مع التصميم.",
      icon: Sparkles
    },
    {
      title: "رموز QR مشفرة وآمنة",
      desc: "يتم إنشاء رمز استجابة سريعة فريد لكل ضيف يحتوي على معرف مشفر عشوائي لحماية خصوصيته.",
      icon: ShieldCheck
    },
    {
      title: "تطبيق موظف الاستقبال (فلتر)",
      desc: "تطبيق جوال مخصص للاستقبال للتحقق الفوري من صلاحية التذاكر دون كشف البيانات الشخصية للضيوف.",
      icon: Smartphone
    },
    {
      title: "لوحة تحكم وتحليلات حية",
      desc: "راقب إحصائيات الدخول والغياب ونسب الحضور لحظة بلحظة عبر لوحة تحكم تفاعلية متطورة.",
      icon: BarChart3
    }
  ];

  return (
    <div className="min-h-screen bg-[#0B0E14] text-white flex flex-col relative overflow-hidden">
      
      {/* Background Decorative Gradients */}
      <div className="absolute top-[-30%] right-[-10%] h-[800px] w-[800px] rounded-full bg-[#D4AF37]/5 blur-[150px]" />
      <div className="absolute bottom-[-35%] left-[-15%] h-[800px] w-[800px] rounded-full bg-blue-500/5 blur-[150px]" />

      {/* Header / Navbar */}
      <header className="container mx-auto px-6 h-20 flex items-center justify-between border-b border-white/5 relative z-10">
        <Link href="/" className="flex items-center gap-3 group">
          <img 
            src="/logo-dark.svg" 
            alt="دعوتك - Daawatak" 
            className="h-12 w-auto object-contain transition-transform duration-200 group-hover:scale-105" 
          />
        </Link>
        
        <Link 
          href="/login" 
          className="rounded-xl border border-white/10 bg-white/[0.02] px-5 py-2 text-sm font-semibold text-slate-200 hover:bg-white/[0.06] hover:text-white transition-all duration-200"
        >
          لوحة التحكم
        </Link>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col justify-center items-center px-6 py-20 relative z-10 text-center">
        <div className="max-w-3xl space-y-8">
          
          <div className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/20 bg-[#D4AF37]/5 px-4.5 py-1.5 text-xs font-semibold text-[#D4AF37]">
            <span>جديد: منصة دعوتك لإدارة المناسبات الاحترافية</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight">
            دعوات إلكترونية بلمسة احترافية
          </h1>
          
          <p className="text-base sm:text-lg text-slate-400 font-medium max-w-xl mx-auto leading-relaxed">
            أنشئ دعواتك المخصصة بأسماء ضيوفك، وأرسلها رقمياً، وقم بمسحها والتحقق منها بأمان تام عند المدخل بمعدل استجابة فائق السرعة.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link
              href="/login"
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-gradient-to-tr from-[#D4AF37] to-[#AA7C11] px-8 py-3.5 text-sm font-bold text-[#0B0E14] shadow-lg hover:opacity-90 active:scale-[0.98] transition-all duration-200"
            >
              ابدأ الآن مجاناً
            </Link>
            <a
              href="#features"
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.01] px-8 py-3.5 text-sm font-semibold text-slate-300 hover:bg-white/[0.04] transition-all"
            >
              اكتشف المزايا
            </a>
          </div>

        </div>

        {/* Mockup Dashboard Section */}
        <section id="features" className="container mx-auto max-w-5xl mt-32 space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white">لماذا تختار دعوتك؟</h2>
            <p className="text-slate-400 text-sm sm:text-base max-w-md mx-auto">منظومة ذكية متكاملة لإدارة حضور مناسباتك بخصوصية وسرعة فائقة.</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feat, idx) => (
              <div 
                key={idx} 
                className="rounded-2xl border border-white/5 bg-[#121620]/30 p-6 backdrop-blur-md hover:border-[#D4AF37]/20 transition-all duration-300 text-right group"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/[0.02] border border-white/5 text-[#D4AF37] group-hover:bg-[#D4AF37]/10 group-hover:scale-105 transition-all duration-300">
                  <feat.icon className="h-5.5 w-5.5" />
                </div>
                <h3 className="mt-4.5 text-base font-bold text-white">{feat.title}</h3>
                <p className="mt-2 text-xs text-slate-400 leading-relaxed font-medium">{feat.desc}</p>
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 text-center text-xs text-slate-500 font-medium z-10 bg-[#0B0E14]">
        <div className="container mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} دعوتك (Daawatak). جميع الحقوق محفوظة.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-slate-400">سياسة الخصوصية</a>
            <a href="#" className="hover:text-slate-400">شروط الاستخدام</a>
            <a href="#" className="hover:text-slate-400">الدعم الفني</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
