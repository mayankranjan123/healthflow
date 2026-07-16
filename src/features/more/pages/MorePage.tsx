import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, BarChart3, Briefcase, Settings, LogOut, ChevronRight, Bell } from 'lucide-react';

interface MorePageProps {
  currentUser: { firstName: string; lastName: string; role: string; email: string } | null;
  onLogout: () => void;
}

export const MorePage: React.FC<MorePageProps> = ({ currentUser, onLogout }) => {
  const navigate = useNavigate();

  const user = currentUser || {
    firstName: 'Sarah',
    lastName: 'Jenkins',
    role: 'DOCTOR',
    email: 'sarah.jenkins@healthflow.com',
  };

  const getDepartment = () => {
    if (user.role.toUpperCase() === 'ADMIN') return 'Administration';
    if (user.role.toUpperCase() === 'STAFF') return 'Clinic Operations';
    return 'Surgical Dept.';
  };

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  // Helper check for role permission badges
  const hasPermission = (moduleName: string) => {
    const role = user.role.toUpperCase();
    const defaultMapping: Record<string, string[]> = {
      profile: ['ADMIN', 'DOCTOR', 'STAFF'],
      reports: ['ADMIN'],
      doctors: ['ADMIN'],
      settings: ['ADMIN'],
    };
    return defaultMapping[moduleName]?.includes(role) ?? true;
  };

  return (
    <div className="space-y-6 pb-20 animate-fade-in-up md:max-w-md md:mx-auto">
      {/* Mobile Header block (Only visible on mobile path /more) */}
      {/* <div className="flex justify-between items-center bg-white -mx-6 -mt-6 p-6 border-b border-slate-200/80 sticky top-0 z-30 md:hidden">
        <div className="flex items-center gap-3">
          <img
            src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=120&auto=format&fit=crop"
            alt={`${user.firstName} ${user.lastName}`}
            className="w-9 h-9 rounded-full object-cover border border-slate-100"
          />
          <h2 className="text-xl font-display font-bold text-slate-900">More</h2>
        </div>
        <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full cursor-pointer">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-primary rounded-full border border-white" />
        </button>
      </div> */}

      {/* User Profile Card */}
      <div className="bg-white border border-slate-250/60 rounded-2xl p-5 shadow-xs flex items-center gap-4.5 mt-2">
        <div className="relative shrink-0">
          <img
            src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=120&auto=format&fit=crop"
            alt={`${user.firstName} ${user.lastName}`}
            className="w-16 h-16 rounded-full object-cover border border-slate-100 shadow-sm"
          />
          <span className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white" />
        </div>
        <div className="space-y-1">
          <h3 className="font-bold text-slate-800 text-lg leading-snug">
            {user.role.toUpperCase() === 'DOCTOR' ? `Dr. ${user.firstName} ${user.lastName}` : `${user.firstName} ${user.lastName}`}
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-white bg-brand-primary px-2 py-0.5 rounded-full tracking-wider uppercase">
              {user.role}
            </span>
            <span className="text-xs text-slate-500 font-medium">{getDepartment()}</span>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-5">
        {/* Practice Management section */}
        <div className="space-y-2">
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Practice Management</h4>
          <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-2xs divide-y divide-slate-100">
            {/* Profile Row */}
            <button
              onClick={() => handleNavigation('/profile')}
              className="w-full px-5 py-4 flex items-center justify-between hover:bg-slate-50 active:bg-slate-100 transition-colors cursor-pointer text-left"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-55 flex items-center justify-center text-blue-600">
                  <User className="w-5 h-5" />
                </div>
                <span className="text-sm font-semibold text-slate-700">Profile</span>
              </div>
              <ChevronRight className="w-4.5 h-4.5 text-slate-400" />
            </button>

            {/* Reports Row */}
            {hasPermission('reports') && (
              <button
                onClick={() => handleNavigation('/reports')}
                className="w-full px-5 py-4 flex items-center justify-between hover:bg-slate-50 active:bg-slate-100 transition-colors cursor-pointer text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-55 flex items-center justify-center text-emerald-600">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-semibold text-slate-700">Reports</span>
                </div>
                <ChevronRight className="w-4.5 h-4.5 text-slate-400" />
              </button>
            )}

            {/* Doctors Row */}
            {hasPermission('doctors') && (
              <button
                onClick={() => handleNavigation('/doctors')}
                className="w-full px-5 py-4 flex items-center justify-between hover:bg-slate-50 active:bg-slate-100 transition-colors cursor-pointer text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-55 flex items-center justify-center text-indigo-600">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-semibold text-slate-700">Doctors</span>
                </div>
                <ChevronRight className="w-4.5 h-4.5 text-slate-400" />
              </button>
            )}
          </div>
        </div>

        {/* Application section */}
        <div className="space-y-2">
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Application</h4>
          <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-2xs divide-y divide-slate-100">
            {/* Settings Row */}
            {hasPermission('settings') && (
              <button
                onClick={() => handleNavigation('/settings')}
                className="w-full px-5 py-4 flex items-center justify-between hover:bg-slate-50 active:bg-slate-100 transition-colors cursor-pointer text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-55 flex items-center justify-center text-slate-600">
                    <Settings className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-semibold text-slate-700">Settings</span>
                </div>
                <ChevronRight className="w-4.5 h-4.5 text-slate-400" />
              </button>
            )}
          </div>
        </div>

        {/* Logout section */}
        <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-2xs">
          <button
            onClick={onLogout}
            className="w-full px-5 py-4 flex items-center justify-between hover:bg-rose-50/30 active:bg-rose-50 transition-colors cursor-pointer text-left"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-rose-55 flex items-center justify-center text-rose-600">
                <LogOut className="w-5 h-5" />
              </div>
              <span className="text-sm font-bold text-rose-600">Logout</span>
            </div>
            <ChevronRight className="w-4.5 h-4.5 text-rose-500" />
          </button>
        </div>
      </div>

      {/* Footer Info */}
      <div className="text-center pt-6 pb-4 space-y-1">
        <p className="text-[11px] font-semibold text-slate-400/80">HealthFlow v4.12.0 Professional</p>
        <p className="text-[10px] font-bold text-slate-400/70">Hospital Instance ID: HF-LDN-019</p>
      </div>
    </div>
  );
};
