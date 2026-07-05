import { ReportsData, ReportsFilters, DoctorReportSummary, MonthlyRevenueItem } from '../types';

// Baseline data
const mockDoctorsBase: DoctorReportSummary[] = [
  {
    id: 'DOC-1',
    name: 'Dr. Aisha Mehta',
    initials: 'AM',
    specialization: 'Cardiologist',
    appointments: 92,
    revenue: 48500,
    pending: 2400,
    completedConsultations: 88,
    totalConsultations: 92,
  },
  {
    id: 'DOC-2',
    name: 'Dr. Rohit Sharma',
    initials: 'RS',
    specialization: 'General Physician',
    appointments: 74,
    revenue: 36200,
    pending: 4100,
    completedConsultations: 63,
    totalConsultations: 74,
  },
  {
    id: 'DOC-3',
    name: 'Dr. Kavya Nair',
    initials: 'KN',
    specialization: 'Pediatrician',
    appointments: 58,
    revenue: 29800,
    pending: 0,
    completedConsultations: 58,
    totalConsultations: 58,
  },
  {
    id: 'DOC-4',
    name: 'Dr. Amit Varma',
    initials: 'AV',
    specialization: 'Dermatologist',
    appointments: 52,
    revenue: 22100,
    pending: 1800,
    completedConsultations: 42,
    totalConsultations: 52,
  },
];

const mockMonthlyTrendBase: MonthlyRevenueItem[] = [
  { month: 'Jan', revenue: 85000, appointments: 150 },
  { month: 'Feb', revenue: 98000, appointments: 180 },
  { month: 'Mar', revenue: 112000, appointments: 210 },
  { month: 'Apr', revenue: 125000, appointments: 230 },
  { month: 'May', revenue: 138000, appointments: 270 },
  { month: 'Jun', revenue: 145000, appointments: 290 },
  { month: 'Jul', revenue: 156000, appointments: 326 },
];

export const mockReportsApi = {
  getReportsData: (filters: ReportsFilters): ReportsData => {
    // Generate realistic shifts based on filter type
    let multiplier = 1.0;
    let revChange = 12.5;
    let apptChange = 8.0;
    let pendChange = -4.0;

    if (filters.quickFilter === 'WEEKLY') {
      multiplier = 5.2;
      revChange = 14.2;
      apptChange = 11.5;
      pendChange = -2.8;
    } else if (filters.quickFilter === 'MONTHLY') {
      multiplier = 22.0;
      revChange = 18.9;
      apptChange = 15.2;
      pendChange = -6.5;
    }

    // If custom dates are active
    if (filters.fromDate && filters.toDate) {
      const start = new Date(filters.fromDate);
      const end = new Date(filters.toDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
      
      multiplier = Math.min(30, Math.max(0.5, diffDays / 1)); // scale relative to daily metrics
      revChange = 9.4;
      apptChange = 6.2;
      pendChange = -1.5;
    }

    const totalRevenue = Math.round(148500 * multiplier);
    const appointmentsCount = Math.round(326 * multiplier);
    const pendingPayments = Math.round(18300 * multiplier);

    const topDoctors: DoctorReportSummary[] = mockDoctorsBase.map(doc => {
      const docRevenue = Math.round(doc.revenue * multiplier);
      const docAppts = Math.round(doc.appointments * multiplier);
      const docPending = Math.round(doc.pending * multiplier);
      const docCompleted = Math.round(doc.completedConsultations * multiplier);
      
      return {
        ...doc,
        appointments: docAppts,
        revenue: docRevenue,
        pending: docPending,
        completedConsultations: docCompleted,
        totalConsultations: docAppts,
      };
    });

    const monthlyRevenueTrend: MonthlyRevenueItem[] = mockMonthlyTrendBase.map(item => {
      // Slightly vary if custom filter applied
      const variation = filters.quickFilter === 'TODAY' ? 1.0 : (filters.quickFilter === 'WEEKLY' ? 1.15 : 1.3);
      return {
        ...item,
        revenue: Math.round(item.revenue * variation),
        appointments: Math.round(item.appointments * variation),
      };
    });

    return {
      totalRevenue,
      revenueChangePercent: revChange,
      appointmentsCount,
      appointmentsChangePercent: apptChange,
      pendingPayments,
      pendingChangePercent: pendChange,
      monthlyRevenueTrend,
      topDoctors,
    };
  }
};
