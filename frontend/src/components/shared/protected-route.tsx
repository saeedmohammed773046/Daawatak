import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/auth.store'
import type { UserRole } from '@/types'
import { FullPageLoader } from './loaders'

export function ProtectedRoute({ allowedRoles }: { allowedRoles?: UserRole[] }) {
  const { isAuthenticated, isInitializing, user } = useAuthStore()
  const location = useLocation()

  if (isInitializing) return <FullPageLoader />

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/403" replace />
  }

  return <Outlet />
}

export function GuestOnlyRoute() {
  const { isAuthenticated, isInitializing, user } = useAuthStore()
  if (isInitializing) return <FullPageLoader />
  if (isAuthenticated && user) {
    const target = user.role === 'admin' ? '/admin' : user.role === 'reception' ? '/reception' : '/dashboard'
    return <Navigate to={target} replace />
  }
  return <Outlet />
}
