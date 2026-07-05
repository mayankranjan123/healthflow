import React from 'react';
import { Search } from 'lucide-react';

interface DoctorFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedSpecialization: string;
  onSpecializationChange: (value: string) => void;
  selectedStatus: string;
  onStatusChange: (value: string) => void;
  onReset: () => void;
  specializations: string[];
}

export const DoctorFilters: React.FC<DoctorFiltersProps> = ({
  searchTerm,
  onSearchChange,
  selectedSpecialization,
  onSpecializationChange,
  selectedStatus,
  onStatusChange,
  onReset,
  specializations,
}) => {
  return (
    <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm flex flex-col md:flex-row items-end gap-4">
      {/* Search Bar */}
      <div className="flex-1 w-full space-y-1.5">
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
          Search Doctor
        </label>
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
          <input
            id="doctor-search"
            type="text"
            placeholder="Name, ID or Email"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500 transition-all text-slate-700"
          />
        </div>
      </div>

      {/* Specialization Filter */}
      <div className="w-full md:w-56 space-y-1.5">
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
          Specialization
        </label>
        <select
          id="specialization-filter"
          value={selectedSpecialization}
          onChange={(e) => onSpecializationChange(e.target.value)}
          className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 outline-none focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500 transition-all appearance-none cursor-pointer"
          style={{
            backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3E%3C/svg%3E")`,
            backgroundPosition: 'right 0.5rem center',
            backgroundSize: '1.25rem 1.25rem',
            backgroundRepeat: 'no-repeat',
            paddingRight: '2.5rem'
          }}
        >
          <option value="All">All Specializations</option>
          {specializations.map((spec) => (
            <option key={spec} value={spec}>
              {spec}
            </option>
          ))}
        </select>
      </div>

      {/* Status Filter */}
      <div className="w-full md:w-48 space-y-1.5">
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
          Status
        </label>
        <select
          id="status-filter"
          value={selectedStatus}
          onChange={(e) => onStatusChange(e.target.value)}
          className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 outline-none focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500 transition-all appearance-none cursor-pointer"
          style={{
            backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3E%3C/svg%3E")`,
            backgroundPosition: 'right 0.5rem center',
            backgroundSize: '1.25rem 1.25rem',
            backgroundRepeat: 'no-repeat',
            paddingRight: '2.5rem'
          }}
        >
          <option value="All">All Status</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>

      {/* Reset Button */}
      <button
        id="reset-filters"
        type="button"
        onClick={onReset}
        className="text-sm font-semibold text-slate-500 hover:text-blue-600 transition-colors py-2 px-3 hover:bg-slate-50 rounded-lg shrink-0 w-full md:w-auto text-center"
      >
        Reset Filters
      </button>
    </div>
  );
};
