import React, { useState } from 'react';
import { 
  Users, 
  CalendarDays, 
  CreditCard, 
  FileBarChart, 
  Download, 
  Plus, 
  Calendar, 
  MoreVertical,
  ChevronRight,
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import { StatCard } from '../../../components/ui/StatCard';
import { Card, CardHeader, CardBody } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { DatePicker } from '../../../components/ui/DatePicker';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  Legend
} from 'recharts';

// Mock Patient Flow data (Mon-Sun)
const patientFlowData = [
  { name: 'Mon', consultations: 25, followUps: 15 },
  { name: 'Tue', consultations: 32, followUps: 12 },
  { name: 'Wed', consultations: 28, followUps: 18 },
  { name: 'Thu', consultations: 35, followUps: 10 },
  { name: 'Fri', consultations: 30, followUps: 14 },
  { name: 'Sat', consultations: 15, followUps: 5 },
  { name: 'Sun', consultations: 8, followUps: 2 },
];

// Today's Timewise Appointments Count
const timewiseAppointmentsData = [
  { time: '08:00 AM', count: 3 },
  { time: '10:00 AM', count: 6 },
  { time: '12:00 PM', count: 4 },
  { time: '02:00 PM', count: 5 },
  { time: '04:00 PM', count: 4 },
  { time: '06:00 PM', count: 2 },
];

// Weekly Revenue Trend
const weeklyRevenueData = [
  { day: 'Mon', revenue: 1200 },
  { day: 'Tue', revenue: 1850 },
  { day: 'Wed', revenue: 1500 },
  { day: 'Thu', revenue: 2100 },
  { day: 'Fri', revenue: 1950 },
  { day: 'Sat', revenue: 900 },
  { day: 'Sun', revenue: 450 },
];

// Recent Appointments
const initialAppointments = [
  { id: '1', patientName: 'Arjun Singh', initials: 'AS', doctor: 'Dr. Sarah Chen', time: '09:30 AM', status: 'Confirmed', statusVariant: 'success' as const },
  { id: '2', patientName: 'Meera Patel', initials: 'MP', doctor: 'Dr. James Wilson', time: '10:45 AM', status: 'Checked In', statusVariant: 'neutral' as const },
  { id: '3', patientName: 'Rahul Kumar', initials: 'RK', doctor: 'Dr. Sarah Chen', time: '11:15 AM', status: 'Delayed', statusVariant: 'danger' as const },
  { id: '4', patientName: 'Vikram Das', initials: 'VD', doctor: 'Dr. Anita Rao', time: '01:30 PM', status: 'Scheduled', statusVariant: 'info' as const },
];

export const DashboardPage: React.FC = () => {
  // Get today's date formatted as YYYY-MM-DD
  const todayStr = new Date().toISOString().split('T')[0];
  
  // Date states
  const [fromDate, setFromDate] = useState(todayStr);
  const [toDate, setToDate] = useState(todayStr);
  const [appointments, setAppointments] = useState(initialAppointments);
  
  // Action state for adding appointment or quick stats changes
  const [showExportSuccess, setShowExportSuccess] = useState(false);

  const handleExport = () => {
    setShowExportSuccess(true);
    setTimeout(() => {
      setShowExportSuccess(false);
    }, 2000);
  };

  const handleDateChange = (type: 'from' | 'to', value: string) => {
    if (type === 'from') {
      setFromDate(value);
    } else {
      setToDate(value);
    }
    
    // Simulate updating appointments list slightly based on filters for a realistic feel
    if (value) {
      const randomized = [...initialAppointments].sort(() => Math.random() - 0.5);
      setAppointments(randomized);
    }
  };

  return (
    <div className="space-y-8 pb-12 animate-fade-in-up">
      {/* Top Welcome Header & Date Actions Row */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900 tracking-tight leading-tight">
            Welcome back, Neha!
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Here's what's happening at <span className="font-semibold text-slate-700">HealthFlow</span> clinic today.
          </p>
        </div>

        {/* Date Filter Panel & Export Button */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Quick inline date range */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 shadow-sm">
            <Calendar className="w-4 h-4 text-slate-400" />
            <div className="flex items-center gap-1.5">
              <input 
                type="date" 
                value={fromDate} 
                onChange={(e) => handleDateChange('from', e.target.value)} 
                className="bg-transparent border-none focus:outline-none cursor-pointer text-slate-700 font-bold"
              />
              <span className="text-slate-300">to</span>
              <input 
                type="date" 
                value={toDate} 
                onChange={(e) => handleDateChange('to', e.target.value)} 
                className="bg-transparent border-none focus:outline-none cursor-pointer text-slate-700 font-bold"
              />
            </div>
          </div>

          <Button onClick={handleExport} size="sm" variant="primary" className="shadow-sm">
            <Download className="w-4 h-4" />
            <span>{showExportSuccess ? 'Exported!' : 'Export Report'}</span>
          </Button>
        </div>
      </div>

      {/* Top Level 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Patients"
          value="1,284"
          icon={<Users className="w-5 h-5" />}
          iconBgColor="bg-blue-50"
          iconColor="text-blue-600"
          badge={{ text: '+12% vs last month', variant: 'success' }}
        />
        <StatCard
          title="Appointments Today"
          value="24"
          icon={<CalendarDays className="w-5 h-5" />}
          iconBgColor="bg-emerald-50"
          iconColor="text-emerald-600"
          badge={{ text: '8 slots left', variant: 'info' }}
        />
        <StatCard
          title="Pending Billing"
          value="$4,250"
          icon={<CreditCard className="w-5 h-5" />}
          iconBgColor="bg-rose-50"
          iconColor="text-rose-600"
          badge={{ text: 'Action Required', variant: 'danger' }}
        />
        <StatCard
          title="New Reports"
          value="5"
          icon={<FileBarChart className="w-5 h-5" />}
          iconBgColor="bg-slate-100"
          iconColor="text-slate-600"
          badge={{ text: '3 urgent', variant: 'warning' }}
        />
      </div>

      {/* Two Columns Section: Left table + charts, Right widget flow */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (2/3 width) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Recent Appointments table matching design */}
          <Card>
            <CardHeader>
              <div>
                <h3 className="font-display font-bold text-lg text-slate-900">Recent Appointments</h3>
                <p className="text-xs text-slate-500 font-medium">Overview of today's incoming patients</p>
              </div>
              <button className="text-xs font-semibold text-brand-primary hover:text-blue-700 transition-colors cursor-pointer">
                View All
              </button>
            </CardHeader>
            <CardBody className="p-0 overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50/60 border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Patient Name</th>
                    <th className="px-6 py-4">Doctor</th>
                    <th className="px-6 py-4">Time</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {appointments.map((appt) => (
                    <tr key={appt.id} className="hover:bg-slate-50/30 transition-colors group">
                      <td className="px-6 py-4 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center font-bold text-xs text-blue-600">
                          {appt.initials}
                        </div>
                        <span className="font-semibold text-slate-800">{appt.patientName}</span>
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-600">{appt.doctor}</td>
                      <td className="px-6 py-4 font-mono text-slate-500 font-medium">{appt.time}</td>
                      <td className="px-6 py-4">
                        <Badge variant={appt.statusVariant}>{appt.status}</Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-50 transition-all cursor-pointer">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardBody>
          </Card>

          {/* Today’s Appointment Timewise Count Graph */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <div>
                  <h3 className="font-display font-bold text-base text-slate-900">Appointments Timewise Count</h3>
                  <p className="text-xs text-slate-500 font-medium">Hourly schedule loading for today</p>
                </div>
              </CardHeader>
              <CardBody className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={timewiseAppointmentsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ background: '#0f172a', borderRadius: '8px', color: '#fff', border: 'none', fontSize: '12px' }}
                      labelStyle={{ fontWeight: 'bold' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="count" 
                      stroke="#005ae2" 
                      strokeWidth={3} 
                      dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} 
                      activeDot={{ r: 6 }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardBody>
            </Card>

            {/* Weekly Revenue Trend Graph */}
            <Card>
              <CardHeader>
                <div>
                  <h3 className="font-display font-bold text-base text-slate-900">Weekly Revenue Trend</h3>
                  <p className="text-xs text-slate-500 font-medium">Revenue earnings mapped by day</p>
                </div>
              </CardHeader>
              <CardBody className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={weeklyRevenueData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.25}/>
                        <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ background: '#0f172a', borderRadius: '8px', color: '#fff', border: 'none', fontSize: '12px' }}
                      formatter={(val) => [`$${val}`, 'Revenue']}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#0ea5e9" 
                      strokeWidth={2.5} 
                      fillOpacity={1} 
                      fill="url(#colorRevenue)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardBody>
            </Card>
          </div>

        </div>

        {/* Right Column Widgets (1/3 width) */}
        <div className="space-y-8">
          
          {/* Patient Flow week chart matching image */}
          <Card>
            <CardHeader className="flex items-center justify-between">
              <div>
                <h3 className="font-display font-bold text-slate-900">Patient Flow</h3>
                <p className="text-xs text-slate-500 font-medium">Consultations vs Follow-ups</p>
              </div>
              <select className="text-xs font-semibold text-slate-600 bg-slate-50 px-2 py-1 border border-slate-200 rounded-lg outline-none cursor-pointer">
                <option>This Week</option>
                <option>Last Week</option>
                <option>This Month</option>
              </select>
            </CardHeader>
            <CardBody className="space-y-6">
              {/* Dynamic Bar graph */}
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={patientFlowData} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: '#0f172a', color: '#fff', fontSize: '11px', borderRadius: '6px' }} />
                    <Bar dataKey="consultations" fill="#005ae2" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="followUps" fill="#cbd5e1" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Indicator legend row */}
              <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Weekly Average</span>
                  <p className="text-lg font-bold text-slate-800">
                    42 <span className="text-xs font-semibold text-slate-500">Patients/Day</span>
                  </p>
                </div>
                
                <div className="flex gap-4 text-xs font-semibold">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                    <span className="text-slate-600">Consults</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                    <span className="text-slate-600">Follow-ups</span>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* HealthFlow Premium banner match */}
          <div className="relative bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white overflow-hidden shadow-lg shadow-blue-600/10 flex flex-col justify-between h-56 group">
            {/* Soft decorative plus sign overlay on back */}
            <div className="absolute right-[-10%] bottom-[-10%] opacity-15 pointer-events-none transform group-hover:scale-110 transition-transform duration-500">
              <Plus className="w-48 h-48" strokeWidth={1} />
            </div>

            <div className="space-y-2 relative z-10">
              <div className="inline-flex items-center gap-1 bg-white/10 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase backdrop-blur-sm">
                <Sparkles className="w-3.5 h-3.5 text-blue-300" />
                <span>Premium Access</span>
              </div>
              <h4 className="font-display font-bold text-lg leading-tight">HealthFlow Premium</h4>
              <p className="text-xs text-blue-100 leading-relaxed font-medium">
                Unlock advanced analytics and AI-powered diagnostic assistants for your medical staff.
              </p>
            </div>

            <div className="relative z-10">
              <button className="bg-white text-blue-600 hover:bg-blue-50 text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer">
                Upgrade Subscription
              </button>
            </div>
          </div>

          {/* Compliance Score circle gauge card */}
          <Card>
            <CardBody className="flex items-center gap-5">
              {/* Radial Score Gauge */}
              <div className="relative flex items-center justify-center shrink-0">
                {/* SVG Radial Gauge */}
                <svg className="w-20 h-20 transform -rotate-90">
                  <circle cx="40" cy="40" r="32" stroke="#f1f5f9" strokeWidth="8" fill="transparent" />
                  <circle 
                    cx="40" 
                    cy="40" 
                    r="32" 
                    stroke="#005ae2" 
                    strokeWidth="8" 
                    fill="transparent" 
                    strokeDasharray={200}
                    strokeDashoffset={200 - (200 * 78) / 100}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute font-display font-bold text-base text-slate-800">78%</span>
              </div>

              {/* Information Side */}
              <div className="space-y-1.5 flex-1">
                <h4 className="font-display font-bold text-slate-800 text-sm leading-tight">Compliance Score</h4>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                  You are doing great! Complete the remaining 3 security tasks to reach 100%.
                </p>
                <a href="#compliance" className="text-xs font-bold text-brand-primary hover:text-blue-700 transition-colors inline-flex items-center gap-1 group">
                  <span>Review Security Settings</span>
                  <ChevronRight className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 transition-transform" />
                </a>
              </div>
            </CardBody>
          </Card>

        </div>
      </div>
    </div>
  );
};
