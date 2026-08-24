import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { AdminSidebar } from './admin-sidebar'
import { DashboardTopbar } from './dashboard-topbar'
import { Menu } from 'lucide-react'

export function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  return (
    <div className="flex min-h-screen bg-muted/30">
      <aside className="fixed inset-y-0 start-0 hidden lg:flex">
        <AdminSidebar />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="absolute inset-y-0 start-0 animate-fade-in-up">
            <AdminSidebar mobile onClose={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex min-h-screen flex-1 flex-col lg:ps-72">
        <DashboardTopbar onMenuClick={() => setMobileOpen(true)} basePath="/admin" />
        <main className="flex-1 px-4 py-6 sm:px-6">
          <Outlet />
        </main>
      </div>

      <button
        onClick={() => setMobileOpen(true)}
        className="fixed bottom-5 end-5 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-elevated lg:hidden"
        aria-label="menu"
      >
        <Menu className="h-5 w-5" />
      </button>
    </div>
  )
}
