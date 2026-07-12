import React, { useState, useEffect } from 'react';
import { Search, Calendar, User, SlidersHorizontal, RefreshCw, Info, CheckSquare, ShieldAlert } from 'lucide-react';
import { Card, CardBody } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { DatePicker } from '../../../components/ui/DatePicker';
import { AppointmentStatus } from '../../../types';

export interface FilterState {
  doctorSearch: string;
  fromDate: string;
  toDate: string;
  patientSearch: string;
  status: AppointmentStatus | 'ALL';
  visitType: string;
}

interface AppointmentFiltersProps {
  initialFilters: FilterState;
  onApplyFilters: (newFilters: FilterState) => void;
  onResetFilters: () => void;
  isFilteredToTodayByDefault: boolean;
}

export const AppointmentFilters: React.FC<AppointmentFiltersProps> = ({
  initialFilters,
  onApplyFilters,
  onResetFilters,
  isFilteredToTodayByDefault,
}) => {
  const [tempFilters, setTempFilters] = useState<FilterState>(initialFilters);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const cached = localStorage.getItem('healthflow_user');
    if (cached) {
      try {
        setCurrentUser(JSON.parse(cached));
      } catch (e) {}
    }
  }, []);

  // Keep local temp filter state in sync if parent resets
  useEffect(() => {
    setTempFilters(initialFilters);
  }, [initialFilters]);

  const handleApply = () => {
    onApplyFilters(tempFilters);
  };

  const handleReset = () => {
    onResetFilters();
  };

  const isDoctor = currentUser?.role?.toUpperCase() === 'DOCTOR';

  return (
    <Card className="border border-slate-200/80 shadow-sm bg-white overflow-visible">
      <CardBody className="p-6 space-y-6">
        <div className={`grid grid-cols-1 ${isDoctor ? 'md:grid-cols-5' : 'md:grid-cols-6'} gap-4`}>
          {/* Search Doctor */}
          {!isDoctor && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                Search Doctor
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <SlidersHorizontal className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  value={tempFilters.doctorSearch}
                  onChange={(e) => setTempFilters({ ...tempFilters, doctorSearch: e.target.value })}
                  placeholder="e.g. Dr. Smith"
                  className="w-full pl-10 pr-3 py-2 text-sm rounded-lg border border-slate-200 bg-white hover:border-slate-300 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-all text-slate-900 placeholder:text-slate-400"
                />
              </div>
            </div>
          )}

          {/* From Date */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
              From Date
            </label>
            <input
              type="date"
              value={tempFilters.fromDate}
              onChange={(e) => setTempFilters({ ...tempFilters, fromDate: e.target.value })}
              className="w-full py-2 px-3 text-sm rounded-lg border border-slate-200 bg-white hover:border-slate-300 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-all text-slate-900 cursor-pointer"
            />
          </div>

          {/* To Date */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
              To Date
            </label>
            <input
              type="date"
              value={tempFilters.toDate}
              onChange={(e) => setTempFilters({ ...tempFilters, toDate: e.target.value })}
              className="w-full py-2 px-3 text-sm rounded-lg border border-slate-200 bg-white hover:border-slate-300 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-all text-slate-900 cursor-pointer"
            />
          </div>

          {/* Search Patient */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
              Search Patient
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                <User className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={tempFilters.patientSearch}
                onChange={(e) => setTempFilters({ ...tempFilters, patientSearch: e.target.value })}
                placeholder="Name, mobile or ID"
                className="w-full pl-10 pr-3 py-2 text-sm rounded-lg border border-slate-200 bg-white hover:border-slate-300 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-all text-slate-900 placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Status */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Status
            </label>
            <select
              value={tempFilters.status}
              onChange={(e) => setTempFilters({ ...tempFilters, status: e.target.value as AppointmentStatus | 'ALL' })}
              className="w-full py-2 px-3 text-sm rounded-lg border border-slate-200 bg-white hover:border-slate-300 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-all text-slate-900 cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          {/* Visit Type */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Visit Type
            </label>
            <select
              value={tempFilters.visitType || 'ALL'}
              onChange={(e) => setTempFilters({ ...tempFilters, visitType: e.target.value })}
              className="w-full py-2 px-3 text-sm rounded-lg border border-slate-200 bg-white hover:border-slate-300 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-all text-slate-900 cursor-pointer"
            >
              <option value="ALL">All Visit Types</option>
              <option value="In-person Visit">In-person Visit</option>
              <option value="Teleconsultation">Teleconsultation</option>
              <option value="Follow-up">Follow-up</option>
            </select>
          </div>
        </div>

        {/* Info indicator row & action buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 w-fit">
            <Info className="w-4 h-4 text-brand-primary shrink-0" />
            {isFilteredToTodayByDefault ? (
              <span>Showing today's appointments by default</span>
            ) : (
              <span>Custom active search filters applied</span>
            )}
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              className="text-slate-600 hover:bg-slate-50 text-sm font-medium border-slate-200 px-4 h-10 transition-all rounded-lg"
            >
              Reset Filters
            </Button>
            <Button
              type="button"
              onClick={handleApply}
              className="bg-[#0f6c58] hover:bg-[#0c5948] text-white border-0 text-sm font-semibold px-5 h-10 transition-all shadow-sm rounded-lg flex items-center gap-2"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Apply Filters</span>
            </Button>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};
