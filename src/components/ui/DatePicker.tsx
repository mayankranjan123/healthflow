import React from 'react';

interface DatePickerProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  label,
  error,
  className = '',
  id,
  ...props
}) => {
  const dateId = id || `date-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label htmlFor={dateId} className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={dateId}
          type="date"
          className={`
            w-full py-2.5 px-3.5 text-sm rounded-lg border bg-white transition-all duration-200 outline-none cursor-pointer
            ${error 
              ? 'border-rose-300 focus:border-rose-500 focus:ring-1 focus:ring-rose-500' 
              : 'border-slate-200 hover:border-slate-300 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary'
            }
            text-slate-900
            ${className}
          `}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}
    </div>
  );
};
