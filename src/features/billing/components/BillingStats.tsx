import React from 'react';
import { TrendingUp, Clock, CheckCircle2, PieChart } from 'lucide-react';
import { StatCard } from '../../../components/ui/StatCard';
import { BillingStats as BillingStatsType } from '../types';

interface BillingStatsProps {
  stats: BillingStatsType;
}

export const BillingStats: React.FC<BillingStatsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {/* Revenue Today */}
      <StatCard
        title="Revenue Today"
        value={`₹${stats.revenueToday.toLocaleString('en-IN')}`}
        icon={<TrendingUp className="w-6 h-6" />}
        iconBgColor="bg-emerald-50"
        iconColor="text-emerald-600"
        badge={{
          text: '+12.5%',
          variant: 'success',
        }}
      />

      {/* Pending Payments */}
      <StatCard
        title="Pending Payments"
        value={`₹${stats.pendingPayments.toLocaleString('en-IN')}`}
        icon={<Clock className="w-6 h-6" />}
        iconBgColor="bg-rose-50"
        iconColor="text-rose-600"
        badge={{
          text: 'Action Req',
          variant: 'danger',
        }}
      />

      {/* Paid Invoices */}
      <StatCard
        title="Paid Invoices"
        value={stats.paidInvoicesCount}
        icon={<CheckCircle2 className="w-6 h-6" />}
        iconBgColor="bg-teal-50"
        iconColor="text-teal-600"
        badge={{
          text: 'Completed',
          variant: 'info',
        }}
      />

      {/* Partial Payments */}
      <StatCard
        title="Partial Payments"
        value={stats.partialPaymentsCount}
        icon={<PieChart className="w-6 h-6" />}
        iconBgColor="bg-indigo-50"
        iconColor="text-indigo-600"
        badge={{
          text: 'Outstanding',
          variant: 'warning',
        }}
      />
    </div>
  );
};
