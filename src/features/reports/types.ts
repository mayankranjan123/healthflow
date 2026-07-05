export interface DoctorReportSummary {
  id: string;
  name: string;
  initials: string;
  specialization: string;
  appointments: number;
  revenue: number;
  pending: number;
  completedConsultations: number;
  totalConsultations: number;
}

export interface MonthlyRevenueItem {
  month: string;
  revenue: number;
  appointments: number;
}

export interface ReportsData {
  totalRevenue: number;
  revenueChangePercent: number;
  appointmentsCount: number;
  appointmentsChangePercent: number;
  pendingPayments: number;
  pendingChangePercent: number;
  monthlyRevenueTrend: MonthlyRevenueItem[];
  topDoctors: DoctorReportSummary[];
}

export interface ReportsFilters {
  quickFilter: 'TODAY' | 'WEEKLY' | 'MONTHLY';
  fromDate: string;
  toDate: string;
}
