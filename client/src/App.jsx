import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ProtectedRoute } from './components/routing/ProtectedRoute';
import { Layout } from './components/layout/Layout';

// Pages
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ChangePasswordPage } from './pages/auth/ChangePasswordPage';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { UserManagementPage } from './pages/admin/UserManagementPage';
import { StoreManagementPage } from './pages/admin/StoreManagementPage';
import { UserDashboard } from './pages/user/UserDashboard';
import { StoreListingPage } from './pages/user/StoreListingPage';
import { MyRatingsPage } from './pages/user/MyRatingsPage';
import { StoreOwnerDashboard } from './pages/storeOwner/StoreOwnerDashboard';
import { StoreOwnerRatingsPage } from './pages/storeOwner/StoreOwnerRatingsPage';

// Root redirect based on active role
const RootRedirect = () => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) return null;

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'ADMIN') {
    return <Navigate to="/admin/dashboard" replace />;
  } else if (user.role === 'STORE_OWNER') {
    return <Navigate to="/store-owner/dashboard" replace />;
  } else {
    return <Navigate to="/user/dashboard" replace />;
  }
};

export const App = () => {
  return (
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Auth Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected Routes inside App Shell Layout */}
            <Route
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              {/* Root Route */}
              <Route path="/" element={<RootRedirect />} />

              {/* Common Authenticated Routes */}
              <Route path="/change-password" element={<ChangePasswordPage />} />
              <Route path="/stores" element={<StoreListingPage />} />

              {/* Admin Exclusive Routes */}
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <UserManagementPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/stores"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <StoreManagementPage />
                  </ProtectedRoute>
                }
              />

              {/* Normal User Routes */}
              <Route
                path="/user/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['USER']}>
                    <UserDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/user/my-ratings"
                element={
                  <ProtectedRoute allowedRoles={['USER']}>
                    <MyRatingsPage />
                  </ProtectedRoute>
                }
              />

              {/* Store Owner Routes */}
              <Route
                path="/store-owner/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['STORE_OWNER']}>
                    <StoreOwnerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/store-owner/ratings"
                element={
                  <ProtectedRoute allowedRoles={['STORE_OWNER']}>
                    <StoreOwnerRatingsPage />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* Catch-all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ToastProvider>
  );
};

export default App;
