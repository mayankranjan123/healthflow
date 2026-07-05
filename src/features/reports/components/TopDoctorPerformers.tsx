import React from 'react';
import { DoctorReportSummary } from '../types';

interface TopDoctorPerformersProps {
  doctors: DoctorReportSummary[];
}

export const TopDoctorPerformers: React.FC<TopDoctorPerformersProps> = ({ doctors }) => {
  // Find the max revenue among doctors to use as 100% basis for the relative progress bars
  const maxRevenue = Math.max(...doctors.map(d => d.revenue)) || 1;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between min-h-[360px]">
      <div className="space-y-1">
        <h3 className="font-display font-bold text-slate-900 text-base">Top Doctor Performers</h3>
        <p className="text-xs text-slate-400 font-semibold">Clinicians by billing & consultation revenue</p>
      </div>

      <div className="space-y-5.5 py-4">
        {doctors.map((doc) => {
          const percentage = Math.round((doc.revenue / maxRevenue) * 100);
          
          return (
            <div key={doc.id} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span className="font-sans text-slate-800">{doc.name}</span>
                <span className="font-mono text-slate-900">₹{doc.revenue.toLocaleString('en-IN')}</span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-600 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-[11px] font-semibold text-slate-400 leading-normal border-t border-slate-100 pt-3">
        * Contributions include OPD consulting fees, specialized procedure invoices, and associated clinical treatments.
      </div>
    </div>
  );
};
