import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { Users, Calendar, DollarSign, Activity } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const Dashboard = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState<any>(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await api.get('/dashboard/summary');
        setSummary(response.data);
      } catch (error) {
        console.error('Error fetching dashboard summary:', error);
      }
    };
    fetchSummary();
  }, []);

  const revenueData = [
    { name: 'Mon', revenue: 4000 },
    { name: 'Tue', revenue: 3000 },
    { name: 'Wed', revenue: 5000 },
    { name: 'Thu', revenue: 2780 },
    { name: 'Fri', revenue: 6890 },
    { name: 'Sat', revenue: 2390 },
    { name: 'Sun', revenue: 3490 },
  ];

  const appointmentData = [
    { time: '09:00', count: 4 },
    { time: '10:00', count: 6 },
    { time: '11:00', count: 8 },
    { time: '12:00', count: 3 },
    { time: '14:00', count: 7 },
    { time: '15:00', count: 5 },
    { time: '16:00', count: 2 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Hello {user?.role.replace('ROLE_', '')} {user?.name.split(' ')[0]}
          </h1>
          <p className="text-gray-500">Welcome back to HealthFlow</p>
        </div>
        <div className="flex gap-2">
           <input type="date" className="border border-gray-300 rounded-md px-3 py-1.5 text-sm" />
           <span className="text-gray-500 self-center">to</span>
           <input type="date" className="border border-gray-300 rounded-md px-3 py-1.5 text-sm" />
           <button className="bg-teal-600 text-white px-4 py-1.5 rounded-md text-sm hover:bg-teal-700">Apply</button>
           <button className="bg-white border border-gray-300 text-gray-700 px-4 py-1.5 rounded-md text-sm hover:bg-gray-50">Reset</button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden rounded-xl shadow-sm border border-gray-100 p-5 flex items-center">
          <div className="p-3 rounded-full bg-blue-50 text-blue-600 mr-4">
            <Calendar size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 truncate">Total Appointments</p>
            <p className="text-2xl font-semibold text-gray-900">{summary?.totalAppointments || 0}</p>
          </div>
        </div>
        <div className="bg-white overflow-hidden rounded-xl shadow-sm border border-gray-100 p-5 flex items-center">
          <div className="p-3 rounded-full bg-teal-50 text-teal-600 mr-4">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 truncate">Total Revenue</p>
            <p className="text-2xl font-semibold text-gray-900">${summary?.totalRevenue || 0}</p>
          </div>
        </div>
        <div className="bg-white overflow-hidden rounded-xl shadow-sm border border-gray-100 p-5 flex items-center">
          <div className="p-3 rounded-full bg-orange-50 text-orange-600 mr-4">
            <Activity size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 truncate">Pending Payments</p>
            <p className="text-2xl font-semibold text-gray-900">${summary?.pendingAmount || 0}</p>
          </div>
        </div>
        <div className="bg-white overflow-hidden rounded-xl shadow-sm border border-gray-100 p-5 flex items-center">
          <div className="p-3 rounded-full bg-purple-50 text-purple-600 mr-4">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 truncate">Total Patients</p>
            <p className="text-2xl font-semibold text-gray-900">{summary?.totalPatients || 0}</p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
           <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue Trend (This Week)</h3>
           <div className="h-72">
             <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0d9488" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#0d9488" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} />
                  <Tooltip />
                  <Area type="monotone" dataKey="revenue" stroke="#0d9488" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
           </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
           <h3 className="text-lg font-medium text-gray-900 mb-4">Today's Appointments</h3>
           <div className="h-72">
             <ResponsiveContainer width="100%" height="100%">
                <BarChart data={appointmentData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} />
                  <Tooltip cursor={{fill: '#f3f4f6'}} />
                  <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
