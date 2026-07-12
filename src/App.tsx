import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { LoginPage } from './features/auth/pages/LoginPage';
import { ForgotPasswordPage } from './features/auth/pages/ForgotPasswordPage';
import { DashboardPage } from './features/dashboard/pages/DashboardPage';
import { PatientsPage } from './features/patients/pages/PatientsPage';
import { AppointmentsPage } from './features/appointments/pages/AppointmentsPage';
import { BillingPage } from './features/billing/pages/BillingPage';
import { ReportsPage } from './features/reports/pages/ReportsPage';
import { DoctorsPage } from './features/doctors/pages/DoctorsPage';
import { UsersPage } from './features/users/pages/UsersPage';
import { SettingsPage } from './features/settings/pages/SettingsPage';
import { SetPasswordPage } from './features/auth/pages/SetPasswordPage';
import { ProfilePage } from './features/profile/pages/ProfilePage';
import { mockUsersApi } from './features/users/utils/mockUsersApi';

interface CurrentUser {
  firstName: string;
  lastName: string;
  role: string;
  email: string;
}

const hasModulePermission = (moduleName: string, role: string): boolean => {
  const userRole = role.toUpperCase();
  const savedPerms = localStorage.getItem('healthflow_permissions');
  if (savedPerms) {
    try {
      const perms = JSON.parse(savedPerms);
      const modulePerm = perms.find((p: any) => p.module === moduleName);
      if (modulePerm) {
        return !!modulePerm[userRole];
      }
    } catch (e) {
      console.error(e);
    }
  }
  
  const defaultMapping: Record<string, string[]> = {
    patients: ['ADMIN', 'DOCTOR', 'STAFF'],
    appointments: ['ADMIN', 'DOCTOR', 'STAFF'],
    billing: ['ADMIN', 'STAFF'],
    reports: ['ADMIN'],
    doctors: ['ADMIN'],
    settings: ['ADMIN'],
    users: ['ADMIN'],
  };
  return defaultMapping[moduleName]?.includes(userRole) ?? false;
};

export default function App() {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  useEffect(() => {
    // Check for cached auth session
    const cached = localStorage.getItem('healthflow_user');
    if (cached) {
      try {
        setCurrentUser(JSON.parse(cached));
      } catch (e) {
        localStorage.removeItem('healthflow_user');
      }
    }
    setIsAuthChecking(false);
  }, []);

  const handleLoginSuccess = (user: CurrentUser) => {
    setCurrentUser(user);
  };

  useEffect(() => {
    if (currentUser) {
      mockUsersApi.getPermissions().catch(err => console.error("Error loading permissions", err));
    }
  }, [currentUser]);

  const handleLogout = () => {
    localStorage.removeItem('healthflow_user');
    setCurrentUser(null);
  };

  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center">
        <div className="w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
        <span className="text-slate-500 font-semibold mt-4 text-sm">Initializing HealthFlow...</span>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Auth Routes */}
        <Route 
          path="/login" 
          element={
            currentUser ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <LoginPage onLoginSuccess={handleLoginSuccess} />
            )
          } 
        />
        <Route 
          path="/forgot-password" 
          element={
            currentUser ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <ForgotPasswordPage />
            )
          } 
        />
        <Route 
          path="/set-password" 
          element={
            currentUser ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <SetPasswordPage />
            )
          } 
        />

        {/* Private Dashboard Routes inside AppLayout */}
        <Route
          path="/*"
          element={
            currentUser ? (
              <AppLayout onLogout={handleLogout} currentUser={currentUser}>
                <Routes>
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route 
                    path="/patients" 
                    element={hasModulePermission('patients', currentUser.role) ? <PatientsPage /> : <Navigate to="/dashboard" replace />} 
                  />
                  <Route 
                    path="/appointments" 
                    element={hasModulePermission('appointments', currentUser.role) ? <AppointmentsPage /> : <Navigate to="/dashboard" replace />} 
                  />
                  <Route 
                    path="/billing" 
                    element={hasModulePermission('billing', currentUser.role) ? <BillingPage /> : <Navigate to="/dashboard" replace />} 
                  />
                  <Route 
                    path="/reports" 
                    element={hasModulePermission('reports', currentUser.role) ? <ReportsPage /> : <Navigate to="/dashboard" replace />} 
                  />
                  <Route 
                    path="/doctors" 
                    element={hasModulePermission('doctors', currentUser.role) ? <DoctorsPage /> : <Navigate to="/dashboard" replace />} 
                  />
                  <Route 
                    path="/users" 
                    element={<Navigate to="/settings" replace />} 
                  />
                  <Route 
                    path="/settings" 
                    element={hasModulePermission('settings', currentUser.role) ? <SettingsPage /> : <Navigate to="/dashboard" replace />} 
                  />
                  <Route path="/profile" element={<ProfilePage />} />
                  
                  {/* Default Sub-Route Redirect */}
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </AppLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
