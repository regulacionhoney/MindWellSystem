import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from "react-router";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/common/protected-route";
import { RoleRoute } from "@/components/common/role-route";
import { AppLayout } from "@/components/common/app-layout";
import LoginPage from "@/pages/guest/login";
import RegisterPage from "@/pages/guest/register";
import OAuthCallbackPage from "@/pages/guest/oauth-callback";
import ForgotPasswordPage from "@/pages/guest/forgot-password";
import ResetPasswordPage from "@/pages/guest/reset-password";
import ProfilePage from "@/pages/profile";
import StudentDashboardPage from "@/pages/student/dashboard";
import StudentCounselingRequestPage from "@/pages/student/counseling-request";
import StudentAppointmentsPage from "@/pages/student/appointments";
import StudentResourcesPage from "@/pages/student/resources";
import StudentNotificationsPage from "@/pages/student/notifications";
import CounselorDashboardPage from "@/pages/counselor/dashboard";
import CounselorRequestsPage from "@/pages/counselor/requests";
import CounselorAppointmentsPage from "@/pages/counselor/appointments";
import CounselorRecordsPage from "@/pages/counselor/records";
import CounselorFollowUpsPage from "@/pages/counselor/follow-ups";
import AdminDashboardPage from "@/pages/admin/dashboard";
import AdminUsersPage from "@/pages/admin/users";
import AdminCounselorsPage from "@/pages/admin/counselors";
import AdminResourcesPage from "@/pages/admin/resources";
import AdminReportsPage from "@/pages/admin/reports";
import AdminSettingsPage from "@/pages/admin/settings";

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function HomeRedirect() {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user) return <Navigate to="/login" replace />;

  const target = user.role === "admin" ? "/admin/dashboard" : `/${user.role}/dashboard`;
  return <Navigate to={target} replace />;
}

function Router() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomeRedirect />} />

        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/oauth-callback" element={<OAuthCallbackPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/profile" element={<ProfilePage />} />

          <Route
            path="/student"
            element={
              <RoleRoute role="student">
                <Outlet />
              </RoleRoute>
            }
          >
            <Route path="dashboard" element={<StudentDashboardPage />} />
            <Route path="counseling-request" element={<StudentCounselingRequestPage />} />
            <Route path="appointments" element={<StudentAppointmentsPage />} />
            <Route path="resources" element={<StudentResourcesPage />} />
            <Route path="notifications" element={<StudentNotificationsPage />} />
          </Route>

          <Route
            path="/counselor"
            element={
              <RoleRoute role="counselor">
                <Outlet />
              </RoleRoute>
            }
          >
            <Route path="dashboard" element={<CounselorDashboardPage />} />
            <Route path="requests" element={<CounselorRequestsPage />} />
            <Route path="appointments" element={<CounselorAppointmentsPage />} />
            <Route path="records" element={<CounselorRecordsPage />} />
            <Route path="follow-ups" element={<CounselorFollowUpsPage />} />
          </Route>

          <Route
            path="/admin"
            element={
              <RoleRoute role="admin">
                <Outlet />
              </RoleRoute>
            }
          >
            <Route path="dashboard" element={<AdminDashboardPage />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="counselors" element={<AdminCounselorsPage />} />
            <Route path="resources" element={<AdminResourcesPage />} />
            <Route path="reports" element={<AdminReportsPage />} />
            <Route path="settings" element={<AdminSettingsPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router />
    </AuthProvider>
  );
}