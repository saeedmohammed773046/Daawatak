import { Outlet } from 'react-router-dom'
import { Logo } from '@/components/shared/logo'
import { InvitationPreviewCard, defaultInvitationDesign } from '@/components/invitation/invitation-preview-card'

export function AuthLayout() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col justify-between px-6 py-8 sm:px-10 lg:px-16">
        <Logo />
        <div className="flex flex-1 items-center py-10">
          <div className="w-full max-w-sm mx-auto">
            <Outlet />
          </div>
        </div>
        <p className="text-center text-xs text-muted-foreground">© {new Date().getFullYear()} دعوتك — جميع الحقوق محفوظة</p>
      </div>

      <div className="relative hidden items-center justify-center overflow-hidden bg-brand-gradient lg:flex">
        <div className="absolute inset-0 bg-mesh opacity-40" />
        <div className="absolute -top-20 -end-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-20 -start-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="relative z-10 flex flex-col items-center gap-8 px-10 text-center text-white">
          <InvitationPreviewCard design={defaultInvitationDesign} qrValue="DAAWATAK-AUTH-DEMO" className="!shadow-2xl" />
          <div>
            <h2 className="text-xl font-bold">دعوات فاخرة تصنع انطباعًا لا يُنسى</h2>
            <p className="mt-2 max-w-sm text-sm text-white/80">
              انضم إلى آلاف المستخدمين الذين يديرون مناسباتهم باحترافية عبر دعوتك.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
