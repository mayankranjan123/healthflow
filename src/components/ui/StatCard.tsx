import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  iconBgColor?: string;
  iconColor?: string;
  badge?: {
    text: string;
    variant: 'success' | 'warning' | 'info' | 'danger' | 'neutral';
  };
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  iconBgColor = 'bg-blue-50',
  iconColor = 'text-blue-600',
  badge,
}) => {
  const badgeStyles = {
    success: 'bg-emerald-50 text-emerald-700',
    warning: 'bg-amber-50 text-amber-700',
    info: 'bg-blue-50 text-blue-700',
    danger: 'bg-rose-50 text-rose-700',
    neutral: 'bg-slate-50 text-slate-700',
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between h-36">
      {/* Top row */}
      <div className="flex items-start justify-between w-full">
        {/* Rounded Icon */}
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${iconBgColor} ${iconColor}`}>
          {icon}
        </div>
        
        {/* Optional Badge */}
        {badge && (
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${badgeStyles[badge.variant]}`}>
            {badge.text}
          </span>
        )}
      </div>

      {/* Bottom info */}
      <div className="mt-4">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5">{title}</p>
        <p className="text-2xl font-bold font-display text-slate-900 tracking-tight leading-none">{value}</p>
      </div>
    </div>
  );
};
