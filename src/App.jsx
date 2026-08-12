import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Layout wrappers
import OwnerLayout from './layouts/OwnerLayout';
import AdminLayout from './layouts/AdminLayout';

// Public pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';

// Admin pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsersList from './pages/admin/AdminUsersList';
import AdminVehiclesList from './pages/admin/AdminVehiclesList';
import AdminServiceCategories from './pages/admin/AdminServiceCategories';

// Owner pages
import Dashboard from './pages/Dashboard';
import VehiclesList from './pages/VehiclesList';
import VehicleAddEdit from './pages/VehicleAddEdit';
import VehicleDetails from './pages/VehicleDetails';
import AiAssistant from './pages/AiAssistant';
import AiAnalysisDetails from './pages/AiAnalysisDetails';
import ServiceHistory from './pages/ServiceHistory';
import Reminders from './pages/Reminders';
import Expenses from './pages/Expenses';
import ServiceCenters from './pages/ServiceCenters';
import Profile from './pages/Profile';

// Settings Page - placeholder since user has it in sidebar but it's optional, let's map it safely to Profile
function SettingsPlaceholder() {
  return <Navigate to="/profile" replace />;
}

// Protected Route Guard Component
function RequireAuth({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-slate-400 font-mono">Authenticating System Access...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If admin tries to access owner page, redirect to admin dashboard, and vice versa
    return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/dashboard'} replace />;
  }

  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routing */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* User Owner Protected Routing */}
          <Route
            path="/dashboard"
            element={
              <RequireAuth allowedRoles={['owner', 'admin']}>
                <OwnerLayout>
                  <Dashboard />
                </OwnerLayout>
              </RequireAuth>
            }
          />
          <Route
            path="/vehicles"
            element={
              <RequireAuth allowedRoles={['owner', 'admin']}>
                <OwnerLayout>
                  <VehiclesList />
                </OwnerLayout>
              </RequireAuth>
            }
          />
          <Route
            path="/vehicles/add"
            element={
              <RequireAuth allowedRoles={['owner', 'admin']}>
                <OwnerLayout>
                  <VehicleAddEdit />
                </OwnerLayout>
              </RequireAuth>
            }
          />
          <Route
            path="/vehicles/:id"
            element={
              <RequireAuth allowedRoles={['owner', 'admin']}>
                <OwnerLayout>
                  <VehicleDetails />
                </OwnerLayout>
              </RequireAuth>
            }
          />
          <Route
            path="/vehicles/:id/edit"
            element={
              <RequireAuth allowedRoles={['owner', 'admin']}>
                <OwnerLayout>
                  <VehicleAddEdit />
                </OwnerLayout>
              </RequireAuth>
            }
          />
          <Route
            path="/ai-assistant"
            element={
              <RequireAuth allowedRoles={['owner', 'admin']}>
                <OwnerLayout>
                  <AiAssistant />
                </OwnerLayout>
              </RequireAuth>
            }
          />
          <Route
            path="/ai-analysis/:id"
            element={
              <RequireAuth allowedRoles={['owner', 'admin']}>
                <OwnerLayout>
                  <AiAnalysisDetails />
                </OwnerLayout>
              </RequireAuth>
            }
          />
          <Route
            path="/service-history"
            element={
              <RequireAuth allowedRoles={['owner', 'admin']}>
                <OwnerLayout>
                  <ServiceHistory />
                </OwnerLayout>
              </RequireAuth>
            }
          />
          <Route
            path="/reminders"
            element={
              <RequireAuth allowedRoles={['owner', 'admin']}>
                <OwnerLayout>
                  <Reminders />
                </OwnerLayout>
              </RequireAuth>
            }
          />
          <Route
            path="/expenses"
            element={
              <RequireAuth allowedRoles={['owner', 'admin']}>
                <OwnerLayout>
                  <Expenses />
                </OwnerLayout>
              </RequireAuth>
            }
          />
          <Route
            path="/service-centers"
            element={
              <RequireAuth allowedRoles={['owner', 'admin']}>
                <OwnerLayout>
                  <ServiceCenters />
                </OwnerLayout>
              </RequireAuth>
            }
          />
          <Route
            path="/profile"
            element={
              <RequireAuth allowedRoles={['owner', 'admin']}>
                <OwnerLayout>
                  <Profile />
                </OwnerLayout>
              </RequireAuth>
            }
          />
          <Route
            path="/settings"
            element={
              <RequireAuth allowedRoles={['owner', 'admin']}>
                <OwnerLayout>
                  <SettingsPlaceholder />
                </OwnerLayout>
              </RequireAuth>
            }
          />

          {/* System Admin Protected Routing */}
          <Route
            path="/admin/dashboard"
            element={
              <RequireAuth allowedRoles={['admin']}>
                <AdminLayout>
                  <AdminDashboard />
                </AdminLayout>
              </RequireAuth>
            }
          />
          <Route
            path="/admin/users"
            element={
              <RequireAuth allowedRoles={['admin']}>
                <AdminLayout>
                  <AdminUsersList />
                </AdminLayout>
              </RequireAuth>
            }
          />
          <Route
            path="/admin/vehicles"
            element={
              <RequireAuth allowedRoles={['admin']}>
                <AdminLayout>
                  <AdminVehiclesList />
                </AdminLayout>
              </RequireAuth>
            }
          />

          <Route
            path="/admin/service-centers"
            element={
              <RequireAuth allowedRoles={['admin']}>
                <AdminLayout>
                  <ServiceCenters />
                </AdminLayout>
              </RequireAuth>
            }
          />
          <Route
            path="/admin/categories"
            element={
              <RequireAuth allowedRoles={['admin']}>
                <AdminLayout>
                  <AdminServiceCategories />
                </AdminLayout>
              </RequireAuth>
            }
          />

          {/* Fallback check directs to standard Dashboard or Login state */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
