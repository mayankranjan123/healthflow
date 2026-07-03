
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LayoutDashboard, Users, Calendar, FileText, Settings, LogOut, Activity, UserRound } from 'lucide-react';
import clsx from 'clsx';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard, roles: ['ROLE_ADMIN', 'ROLE_DOCTOR', 'ROLE_STAFF'] },
    { name: 'Patients', path: '/patients', icon: UserRound, roles: ['ROLE_ADMIN', 'ROLE_DOCTOR', 'ROLE_STAFF'] },
    { name: 'Appointments', path: '/appointments', icon: Calendar, roles: ['ROLE_ADMIN', 'ROLE_DOCTOR', 'ROLE_STAFF'] },
    { name: 'Billing', path: '/billing', icon: FileText, roles: ['ROLE_ADMIN', 'ROLE_STAFF'] },
    { name: 'Report', path: '/reports', icon: Activity, roles: ['ROLE_ADMIN'] },
    { name: 'Doctors', path: '/doctors', icon: Activity, roles: ['ROLE_ADMIN', 'ROLE_STAFF'] },
    { name: 'Users', path: '/users', icon: Users, roles: ['ROLE_ADMIN'] },
    { name: 'Settings', path: '/settings', icon: Settings, roles: ['ROLE_ADMIN'] },
  ];

  const allowedNavItems = navItems.filter(item =>
    !user || item.roles.includes(user.role)
  );

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-4 flex items-center gap-2">
          <Activity className="text-teal-400" />
          <span className="text-xl font-bold">HealthFlow</span>
        </div>
        <nav className="flex-1 mt-6">
          <ul className="space-y-2">
            {allowedNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
              return (
                <li key={item.name}>
                  <Link
                    to={item.path}
                    className={clsx(
                      'flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-colors',
                      isActive ? 'bg-teal-500 text-white' : 'text-gray-300 hover:bg-slate-800'
                    )}
                  >
                    <Icon size={20} />
                    <span>{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="p-4">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2 w-full text-gray-300 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6">
          <h1 className="text-lg font-semibold text-gray-800">
             {allowedNavItems.find(n => n.path === location.pathname)?.name || 'Dashboard'}
          </h1>
          <div className="flex items-center gap-4">
            <div className="text-sm text-right">
              <div className="font-medium text-gray-900">{user?.name}</div>
              <div className="text-gray-500 capitalize">{user?.role?.replace('ROLE_', '')}</div>
            </div>
            <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center text-teal-700 font-bold">
               {user?.name?.charAt(0)}
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6 bg-slate-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
