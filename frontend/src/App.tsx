import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { ProtectedRoute, GuestOnlyRoute } from '@/components/shared/protected-route'

// Layouts
import { MarketingLayout } from '@/components/layout/marketing-layout'
import { AuthLayout } from '@/components/layout/auth-layout'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { AdminLayout } from '@/components/layout/admin-layout'

// Marketing pages
import HomePage from '@/pages/marketing/home'
import FeaturesPage from '@/pages/marketing/features'
import PricingPage from '@/pages/marketing/pricing'
import FaqPage from '@/pages/marketing/faq'
import ContactPage from '@/pages/marketing/contact'
import BlogPage from '@/pages/marketing/blog'
import PrivacyPage from '@/pages/marketing/privacy'
import TermsPage from '@/pages/marketing/terms'

// Auth pages
import LoginPage from '@/pages/auth/login'
import RegisterPage from '@/pages/auth/register'
import ForgotPasswordPage from '@/pages/auth/forgot-password'
import ResetPasswordPage from '@/pages/auth/reset-password'
import VerifyPage from '@/pages/auth/verify'

// Dashboard pages
import DashboardHomePage from '@/pages/dashboard/home'
import EventsListPage from '@/pages/dashboard/events/list'
import EventCreateWizardPage from '@/pages/dashboard/events/create'
import EventDetailPage from '@/pages/dashboard/events/detail'
import GuestsListPage from '@/pages/dashboard/guests/list'
import InvitationsListPage from '@/pages/dashboard/invitations/list'
import InvitationDesignerPage from '@/pages/dashboard/invitations/designer'
import TemplateSelectPage from '@/pages/dashboard/templates/select'
import CheckinsDashboardPage from '@/pages/dashboard/checkins'
import ReceptionistsManagementPage from '@/pages/dashboard/receptionists'
import ReportsPage from '@/pages/dashboard/reports'
import NotificationsPage from '@/pages/dashboard/notifications'
import DashboardSettingsPage from '@/pages/dashboard/settings'
import ProfilePage from '@/pages/dashboard/profile'


// Admin pages
import AdminHomePage from '@/pages/admin/home'
import AdminUsersPage from '@/pages/admin/users'
import AdminEventsPage from '@/pages/admin/events'
import AdminTemplatesPage from '@/pages/admin/templates'
import AdminPlansPage from '@/pages/admin/plans'
import AdminSubscriptionsPage from '@/pages/admin/subscriptions'
import AdminReportsPage from '@/pages/admin/reports'
import AdminAuditLogsPage from '@/pages/admin/audit-logs'
import AdminSettingsPage from '@/pages/admin/settings'

// Error pages
import NotFoundPage from '@/pages/errors/not-found'
import ForbiddenPage from '@/pages/errors/forbidden'
import ServerErrorPage from '@/pages/errors/server-error'

export default function App() {
  return (
    <>
      <Toaster />
      <Routes>
        {/* Marketing (public) */}
        <Route element={<MarketingLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/features" element={<FeaturesPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/faq" element={<FaqPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
        </Route>

        {/* Auth (guest-only) */}
        <Route element={<GuestOnlyRoute />}>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<Navigate to="/login" replace />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/verify" element={<VerifyPage />} />
          </Route>
        </Route>

        {/* Dashboard (authenticated users) */}
        <Route element={<ProtectedRoute allowedRoles={['user', 'admin']} />}>
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardHomePage />} />
            <Route path="events" element={<EventsListPage />} />
            <Route path="events/create" element={<EventCreateWizardPage />} />
            <Route path="events/:id" element={<EventDetailPage />} />
            <Route path="guests" element={<GuestsListPage />} />
            <Route path="invitations" element={<InvitationsListPage />} />
            <Route path="invitations/designer" element={<InvitationDesignerPage />} />
            <Route path="templates" element={<TemplateSelectPage />} />
            <Route path="check-ins" element={<CheckinsDashboardPage />} />
            <Route path="receptionists" element={<ReceptionistsManagementPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="settings" element={<DashboardSettingsPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>
        </Route>

        {/* Admin (admin-only) */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminHomePage />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="events" element={<AdminEventsPage />} />
            <Route path="templates" element={<AdminTemplatesPage />} />
            <Route path="plans" element={<AdminPlansPage />} />
            <Route path="subscriptions" element={<AdminSubscriptionsPage />} />
            <Route path="reports" element={<AdminReportsPage />} />
            <Route path="audit-logs" element={<AdminAuditLogsPage />} />
            <Route path="settings" element={<AdminSettingsPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>
        </Route>

        {/* Error pages */}
        <Route path="/403" element={<ForbiddenPage />} />
        <Route path="/500" element={<ServerErrorPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  )
}
