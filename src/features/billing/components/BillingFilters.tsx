import React, { useState, useEffect } from 'react';
import { RotateCcw, Search, Calendar, User, UserCheck } from 'lucide-react';
import { mockDoctorsApi } from '../../doctors/utils/mockDoctorsApi';
import { DoctorProfileExtended } from '../../doctors/types';
import { BillingFilters as FiltersType } from '../types';
import { PaymentStatus } from '../../../types';

interface BillingFiltersProps {
  initialFilters: FiltersType;
  onApplyFilters: (filters: FiltersType) => void;
  onResetFilters: () => void;
}

export const BillingFilters: React.FC<BillingFiltersProps> = ({
  initialFilters,
  onApplyFilters,
  onResetFilters,
}) => {
  const [patientOrInvoiceId, setPatientOrInvoiceId] = useState(initialFilters.patientOrInvoiceId);
  const [fromDate, setFromDate] = useState(initialFilters.fromDate);
  const [toDate, setToDate] = useState(initialFilters.toDate);
  const [status, setStatus] = useState<PaymentStatus | 'ALL'>(initialFilters.status);
  const [doctorId, setDoctorId] = useState(initialFilters.doctorId);
  const [doctors, setDoctors] = useState<DoctorProfileExtended[]>([]);

  useEffect(() => {
    // Load doctors dynamically
    mockDoctorsApi.getDoctors().then(setDoctors).catch(err => console.error(err));
  }, []);

  // Update component states if parent states change
  useEffect(() => {
    setPatientOrInvoiceId(initialFilters.patientOrInvoiceId);
    setFromDate(initialFilters.fromDate);
    setToDate(initialFilters.toDate);
    setStatus(initialFilters.status);
    setDoctorId(initialFilters.doctorId);
  }, [initialFilters]);

  const handleApply = () => {
    onApplyFilters({
      patientOrInvoiceId,
      fromDate,
      toDate,
      status,
      doctorId,
    });
  };

  const handleResetClick = () => {
    setPatientOrInvoiceId('');
    setFromDate('');
    setToDate('');
    setStatus('ALL');
    setDoctorId('');
    onResetFilters();
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Search */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
            Patient / Invoice ID
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search..."
              value={patientOrInvoiceId}
              onChange={(e) => setPatientOrInvoiceId(e.target.value)}
              className="w-full pl-9 pr-3 h-10 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-brand-primary focus:bg-white focus:ring-1 focus:ring-brand-primary transition-all text-slate-700 font-medium"
            />
          </div>
        </div>

        {/* From Date */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
            From
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full pl-9 pr-3 h-10 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-brand-primary focus:bg-white focus:ring-1 focus:ring-brand-primary transition-all text-slate-700 font-medium"
            />
          </div>
        </div>

        {/* To Date */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
            To
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full pl-9 pr-3 h-10 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-brand-primary focus:bg-white focus:ring-1 focus:ring-brand-primary transition-all text-slate-700 font-medium"
            />
          </div>
        </div>

        {/* Status */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
            Status
          </label>
          <div className="relative">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as PaymentStatus | 'ALL')}
              className="w-full pl-3 pr-8 h-10 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none appearance-none focus:border-brand-primary focus:bg-white focus:ring-1 focus:ring-brand-primary transition-all text-slate-700 font-medium cursor-pointer"
            >
              <option value="ALL">All Status</option>
              <option value="PAID">Paid</option>
              <option value="PARTIAL">Partial</option>
              <option value="PENDING">Pending</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              ▼
            </div>
          </div>
        </div>

        {/* Doctor */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
            Doctor
          </label>
          <div className="relative">
            <select
              value={doctorId}
              onChange={(e) => setDoctorId(e.target.value)}
              className="w-full pl-3 pr-8 h-10 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none appearance-none focus:border-brand-primary focus:bg-white focus:ring-1 focus:ring-brand-primary transition-all text-slate-700 font-medium cursor-pointer"
            >
              <option value="">All Doctors</option>
              {doctors.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {doc.name}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              ▼
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2.5 pt-1">
        <button
          onClick={handleResetClick}
          title="Reset Filters"
          className="flex items-center justify-center w-10 h-10 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-4.5 h-4.5" />
        </button>

        <button
          onClick={handleApply}
          className="bg-brand-primary hover:bg-indigo-700 text-white font-semibold text-sm px-5 h-10 rounded-lg shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
};
