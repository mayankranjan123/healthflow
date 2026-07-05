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

interface CurrentUser {
  firstName: string;
  lastName: string;
  role: string;
  email: string;
}

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

        {/* Private Dashboard Routes inside AppLayout */}
        <Route
          path="/*"
          element={
            currentUser ? (
              <AppLayout onLogout={handleLogout} currentUser={currentUser}>
                <Routes>
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/patients" element={<PatientsPage />} />
                  <Route path="/appointments" element={<AppointmentsPage />} />
                  <Route path="/billing" element={<BillingPage />} />
                  <Route path="/reports" element={<ReportsPage />} />
                  <Route path="/doctors" element={<DoctorsPage />} />
                  <Route path="/users" element={<UsersPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  
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
