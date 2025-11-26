import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/hooks/useAuth';
import { LoginPage } from './pages/LoginPage';
import { ExpertDashboard } from './pages/ExpertDashboard';
import { ManagerDashboard } from './pages/ManagerDashboard';
import { ClientDashboard } from './pages/ClientDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { ProjectsPage } from './pages/ProjectsPage';
import { ProjectDetailsPage } from './pages/ProjectDetailsPage';
import { NewProjectPage } from './pages/NewProjectPage';
import { DocumentsPage } from './pages/DocumentsPage';
import { DocumentDetailsPage } from './pages/DocumentDetailsPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { CertificatesPage } from './pages/CertificatesPage';
import { AdminUsersPage } from './pages/AdminUsersPage';
import { AdminAuditLogsPage } from './pages/AdminAuditLogsPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuth();

  useEffect(() => {
    console.log(
      'ProtectedRoute - isAuthenticated:',
      isAuthenticated,
      'isLoading:',
      isLoading,
      'user:',
      user?.username,
    );
  }, [isAuthenticated, isLoading, user]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">در حال بررسی وضعیت ورود...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log('ProtectedRoute - Not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function DashboardRedirect() {
  const { user } = useAuth();

  useEffect(() => {
    console.log('DashboardRedirect - user:', user?.username, 'role:', user?.role);
  }, [user]);

  if (!user) {
    console.log('DashboardRedirect - No user, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  const dashboardRoutes: Record<string, string> = {
    expert: '/expert/dashboard',
    manager: '/manager/dashboard',
    client: '/client/dashboard',
    admin: '/admin/dashboard',
  };

  const targetRoute = dashboardRoutes[user.role] ?? '/client/dashboard';
  console.log('DashboardRedirect - Redirecting to:', targetRoute);
  return <Navigate to={targetRoute} replace />;
}

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardRedirect />
              </ProtectedRoute>
            }
          />

          {/* Dashboards */}
          <Route
            path="/expert/dashboard"
            element={
              <ProtectedRoute>
                <ExpertDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager/dashboard"
            element={
              <ProtectedRoute>
                <ManagerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/client/dashboard"
            element={
              <ProtectedRoute>
                <ClientDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Projects */}
          <Route
            path="/projects"
            element={
              <ProtectedRoute>
                <ProjectsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects/new"
            element={
              <ProtectedRoute>
                <NewProjectPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects/:id"
            element={
              <ProtectedRoute>
                <ProjectDetailsPage />
              </ProtectedRoute>
            }
          />

          {/* Documents */}
          <Route
            path="/documents"
            element={
              <ProtectedRoute>
                <DocumentsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/documents/:id"
            element={
              <ProtectedRoute>
                <DocumentDetailsPage />
              </ProtectedRoute>
            }
          />

          {/* Notifications */}
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <NotificationsPage />
              </ProtectedRoute>
            }
          />

          {/* Certificates */}
          <Route
            path="/certificates"
            element={
              <ProtectedRoute>
                <CertificatesPage />
              </ProtectedRoute>
            }
          />

          {/* Admin */}
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute>
                <AdminUsersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/audit-logs"
            element={
              <ProtectedRoute>
                <AdminAuditLogsPage />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

