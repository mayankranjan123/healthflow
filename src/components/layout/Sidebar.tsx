import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  CalendarDays, 
  CreditCard, 
  FileBarChart, 
  Stethoscope, 
  UserSquare2, 
  Settings, 
  LogOut,
  Activity,
  User
} from 'lucide-react';

interface SidebarProps {
  onLogout: () => void;
  currentUser: { firstName: string; lastName: string; role: string } | null;
}

export const Sidebar: React.FC<SidebarProps> = ({ onLogout, currentUser }) => {
  const navigate = useNavigate();

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, module: 'dashboard', defaultRoles: ['ADMIN', 'DOCTOR', 'STAFF'] },
    { name: 'Patients', path: '/patients', icon: Users, module: 'patients', defaultRoles: ['ADMIN', 'DOCTOR', 'STAFF'] },
    { name: 'Appointments', path: '/appointments', icon: CalendarDays, module: 'appointments', defaultRoles: ['ADMIN', 'DOCTOR', 'STAFF'] },
    { name: 'Billing', path: '/billing', icon: CreditCard, module: 'billing', defaultRoles: ['ADMIN', 'STAFF'] },
    { name: 'Reports', path: '/reports', icon: FileBarChart, module: 'reports', defaultRoles: ['ADMIN'] },
    { name: 'Doctors', path: '/doctors', icon: Stethoscope, module: 'doctors', defaultRoles: ['ADMIN'] },
    { name: 'Settings', path: '/settings', icon: Settings, module: 'settings', defaultRoles: ['ADMIN'] },
    { name: 'Profile', path: '/profile', icon: User, module: 'profile', defaultRoles: ['ADMIN', 'DOCTOR', 'STAFF'] },
  ];

  const filteredMenuItems = menuItems.filter(item => {
    if (!currentUser || !currentUser.role) return true;
    const userRole = currentUser.role.toUpperCase() as 'ADMIN' | 'DOCTOR' | 'STAFF';

    if (item.module === 'dashboard' || item.module === 'users' || item.module === 'profile') {
      return item.defaultRoles.includes(userRole);
    }

    const savedPerms = localStorage.getItem('healthflow_permissions');
    if (savedPerms) {
      try {
        const perms = JSON.parse(savedPerms);
        const modulePerm = perms.find((p: any) => p.module === item.module);
        if (modulePerm) {
          return !!modulePerm[userRole];
        }
      } catch (e) {
        console.error("Failed to parse permissions", e);
      }
    }

    return item.defaultRoles.includes(userRole);
  });

  return (
    <div className="w-64 bg-[#1e2530] text-slate-300 h-screen flex flex-col justify-between border-r border-slate-800/20 shrink-0">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-800/30 flex items-center gap-3">
        {/* Soft logo backdrop */}
        <div className="w-10 h-10 bg-blue-600/10 rounded-xl flex items-center justify-center border border-blue-500/20 shadow-inner">
          <Activity className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <h1 className="font-display font-bold text-lg text-white tracking-wide leading-none">HealthFlow</h1>
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Healthcare Management</span>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 px-4 py-6 overflow-y-auto space-y-1.5">
        {filteredMenuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) => `
                flex items-center gap-3.5 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-150 cursor-pointer group
                ${isActive 
                  ? 'bg-brand-primary text-white shadow-md' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                }
              `}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </div>

      {/* Logout Row */}
      <div className="p-4 border-t border-slate-800/30">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3.5 px-4 py-3 rounded-lg text-sm font-semibold text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 transition-all duration-150 cursor-pointer"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};
