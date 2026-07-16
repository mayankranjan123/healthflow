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
    <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between h-32 sm:h-36">
      {/* Top row */}
      <div className="flex items-start justify-between w-full">
        {/* Rounded Icon */}
        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center [&_svg]:w-5 [&_svg]:h-5 sm:[&_svg]:w-6 sm:[&_svg]:h-6 ${iconBgColor} ${iconColor}`}>
          {icon}
        </div>
        
        {/* Optional Badge */}
        {badge && (
          <span className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold whitespace-nowrap ${badgeStyles[badge.variant]}`}>
            {badge.text}
          </span>
        )}
      </div>

      {/* Bottom info */}
      <div className="mt-3 sm:mt-4">
        <p className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5 truncate">{title}</p>
        <p className="text-xl sm:text-2xl font-bold font-display text-slate-900 tracking-tight leading-none truncate">{value}</p>
      </div>
    </div>
  );
};
