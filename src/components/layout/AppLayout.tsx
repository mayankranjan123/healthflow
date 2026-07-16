import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { AnimatePresence, motion } from 'motion/react';
import { X, LayoutDashboard, Users, CalendarDays, CreditCard, Menu } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';

interface AppLayoutProps {
  children: React.ReactNode;
  onLogout: () => void;
  currentUser: { firstName: string; lastName: string; role: string; email: string } | null;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children, onLogout, currentUser }) => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen((prev) => !prev);
  };

  return (
    <div className="flex h-screen bg-slate-50/50 overflow-hidden">
      {/* Desktop Sidebar (Static) */}
      <div className="hidden md:block">
        <Sidebar onLogout={onLogout} currentUser={currentUser} />
      </div>

      {/* Mobile Drawer Sidebar */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={toggleMobileSidebar}
              className="fixed inset-0 bg-slate-950"
            />

            {/* Sidebar drawer container */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="relative w-64 h-full bg-[#1e2530] flex flex-col z-10"
            >
              {/* Close Button on sidebar */}
              <button
                onClick={toggleMobileSidebar}
                className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <Sidebar onLogout={() => {
                toggleMobileSidebar();
                onLogout();
              }} currentUser={currentUser} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Container Area */}
      <div className="flex-1 flex flex-col overflow-hidden h-full relative">
        {/* Header */}
        {(!isMobile || location.pathname !== '/more') && (
          <Header onMenuToggle={toggleMobileSidebar} currentUser={currentUser} />
        )}

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50 pb-20 md:pb-8">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="max-w-7xl mx-auto space-y-8"
          >
            {children}
          </motion.div>
        </main>

        {/* Mobile Bottom Navigation Bar */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-200/80 flex items-center justify-around z-40 px-2 shadow-[0_-4px_12px_rgba(0,0,0,0.03)]">
          <NavLink
            to="/dashboard"
            className={({ isActive }) => `flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-bold ${
              isActive ? 'text-slate-900' : 'text-slate-500'
            }`}
          >
            {({ isActive }) => (
              <>
                <div className={`p-2 px-4 rounded-full transition-all ${isActive ? 'bg-[#5eead4] text-slate-950 scale-105 shadow-sm' : ''}`}>
                  <LayoutDashboard className="w-5 h-5" />
                </div>
                <span className="mt-0.5">Dashboard</span>
              </>
            )}
          </NavLink>

          <NavLink
            to="/patients"
            className={({ isActive }) => `flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-bold ${
              isActive ? 'text-slate-900' : 'text-slate-500'
            }`}
          >
            {({ isActive }) => (
              <>
                <div className={`p-2 px-4 rounded-full transition-all ${isActive ? 'bg-[#5eead4] text-slate-950 scale-105 shadow-sm' : ''}`}>
                  <Users className="w-5 h-5" />
                </div>
                <span className="mt-0.5">Patients</span>
              </>
            )}
          </NavLink>

          <NavLink
            to="/appointments"
            className={({ isActive }) => `flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-bold ${
              isActive ? 'text-slate-900' : 'text-slate-500'
            }`}
          >
            {({ isActive }) => (
              <>
                <div className={`p-2 px-4 rounded-full transition-all ${isActive ? 'bg-[#5eead4] text-slate-950 scale-105 shadow-sm' : ''}`}>
                  <CalendarDays className="w-5 h-5" />
                </div>
                <span className="mt-0.5">Calendar</span>
              </>
            )}
          </NavLink>

          <NavLink
            to="/billing"
            className={({ isActive }) => `flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-bold ${
              isActive ? 'text-slate-900' : 'text-slate-500'
            }`}
          >
            {({ isActive }) => (
              <>
                <div className={`p-2 px-4 rounded-full transition-all ${isActive ? 'bg-[#5eead4] text-slate-950 scale-105 shadow-sm' : ''}`}>
                  <CreditCard className="w-5 h-5" />
                </div>
                <span className="mt-0.5">Billing</span>
              </>
            )}
          </NavLink>

          <NavLink
            to="/more"
            className={({ isActive }) => `flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-bold ${
              isActive ? 'text-slate-900' : 'text-slate-500'
            }`}
          >
            {({ isActive }) => (
              <>
                <div className={`p-2 px-4 rounded-full transition-all ${isActive ? 'bg-[#5eead4] text-slate-950 scale-105 shadow-sm' : ''}`}>
                  <Menu className="w-5 h-5" />
                </div>
                <span className="mt-0.5">More</span>
              </>
            )}
          </NavLink>
        </div>
      </div>
    </div>
  );
};
