import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { DashboardSidebar } from './dashboard-sidebar'
import { DashboardTopbar } from './dashboard-topbar'
import { DashboardMobileNav } from './dashboard-mobile-nav'

export function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-muted/30">
      <aside className="fixed inset-y-0 start-0 hidden lg:flex">
        <DashboardSidebar />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="absolute inset-y-0 start-0 animate-fade-in-up">
            <DashboardSidebar mobile onClose={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex min-h-screen flex-1 flex-col lg:ps-72">
        <DashboardTopbar onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 px-4 py-6 pb-24 sm:px-6 lg:pb-8">
          <Outlet />
        </main>
      </div>

      <DashboardMobileNav />
    </div>
  )
}
