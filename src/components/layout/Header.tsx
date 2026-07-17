import React from 'react';
import { Search, Bell, Menu, Activity } from 'lucide-react';

interface HeaderProps {
  onMenuToggle: () => void;
  currentUser: { firstName: string; lastName: string; role: string; email: string; avatarUrl?: string } | null;
}

export const Header: React.FC<HeaderProps> = ({ onMenuToggle, currentUser }) => {
  const defaultUser = {
    firstName: 'Neha',
    lastName: 'Kapoor',
    role: 'ADMIN',
    avatarUrl: ''
  };

  const user = currentUser || defaultUser;

  return (
    <header className="h-20 border-b border-slate-200 bg-white px-6 md:px-8 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      {/* Mobile Menu & Search Column */}
      <div className="flex items-center gap-4 flex-1">
        {/* <button
          onClick={onMenuToggle}
          className="md:hidden text-slate-500 hover:text-slate-800 p-1.5 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer shrink-0"
        >
          <Menu className="w-5 h-5" />
        </button> */}

        {/* Mobile Heartbeat Brand Logo */}
        <div className="flex md:hidden items-center gap-2 shrink-0">
          <Activity className="w-5 h-5 text-blue-600 shrink-0" />
          <span className="font-display font-black text-slate-800 text-base tracking-wide leading-none">HealthFlow</span>
        </div>

        {/* Global Search Bar */}
        {/* <div className="relative max-w-md w-full hidden sm:block">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search patients, records, or help..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-full text-sm outline-none focus:border-brand-primary focus:bg-white focus:ring-1 focus:ring-brand-primary transition-all text-slate-700"
          />
        </div> */}
      </div>

      {/* Notifications & Profile Area */}
      <div className="flex items-center gap-5 shrink-0">
        {/* Notifications Icon with dot */}
        {/* <button className="relative p-2.5 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-full transition-colors cursor-pointer">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border border-white" />
        </button> */}

        {/* Vertical Separator */}
        <div className="h-8 w-px bg-slate-200" />

        {/* User Card */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex flex-col items-end">
            <span className="text-sm font-semibold text-slate-800">
              {user.firstName} {user.lastName}
            </span>
            <span className="text-[10px] font-bold text-white bg-blue-600 px-2 py-0.5 rounded-md mt-0.5 tracking-wider uppercase">
              {user.role}
            </span>
          </div>

          {/* Avatar Picture */}
          <div className="relative">
            <img
              src={user.avatarUrl || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=120&auto=format&fit=crop"}
              alt={`${user.firstName} ${user.lastName}`}
              className="w-10 h-10 rounded-full object-cover border-2 border-slate-100 shadow-sm"
              referrerPolicy="no-referrer"
            />
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white" />
          </div>
        </div>
      </div>
    </header>
  );
};
