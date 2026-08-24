import { Outlet } from 'react-router-dom'
import { MarketingHeader } from './marketing-header'
import { MarketingFooter } from './marketing-footer'

export function MarketingLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <MarketingHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <MarketingFooter />
    </div>
  )
}
