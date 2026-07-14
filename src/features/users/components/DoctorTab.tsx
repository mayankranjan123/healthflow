import React, { useState } from 'react';
import { Search, Edit2, Eye, ToggleLeft, ToggleRight, Plus, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { DoctorUser } from '../types';

interface DoctorTabProps {
  doctors: DoctorUser[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  searchTerm: string;
  setSearchTerm: (s: string) => void;
  statusFilter: 'ALL' | 'ACTIVE' | 'INACTIVE';
  setStatusFilter: (s: 'ALL' | 'ACTIVE' | 'INACTIVE') => void;
  onPageChange: (p: number) => void;
  onToggleStatus: (id: string) => void;
  onEdit: (doctor: DoctorUser) => void;
  onAdd: () => void;
  onView: (doctor: DoctorUser) => void;
}

export const DoctorTab: React.FC<DoctorTabProps> = ({
  doctors,
  totalItems,
  totalPages,
  currentPage,
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  onPageChange,
  onToggleStatus,
  onEdit,
  onAdd,
  onView,
}) => {
  const [specFilter, setSpecFilter] = useState('ALL');
  const itemsPerPage = 5;
  const startIndex = (currentPage - 1) * itemsPerPage;

  // Extract all unique specializations for filter dropdown
  const specializations = Array.from(new Set(doctors.map(d => d.specialization)));

  // Client-side specialization filter on top of server results
  const filtered = doctors.filter((doc) => {
    return specFilter === 'ALL' || doc.specialization === specFilter;
  });

  const resetFilters = () => {
    setSearchTerm('');
    setSpecFilter('ALL');
    setStatusFilter('ALL');
    onPageChange(1);
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Search and Action Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row gap-4 items-end justify-between">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full lg:flex-1">
            {/* Search */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Search Doctor</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Name, ID or Email"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    onPageChange(1);
                  }}
                  className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-600 transition-all font-medium text-slate-700"
                />
              </div>
            </div>

            {/* Specialization Filter */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Specialization</label>
              <select
                value={specFilter}
                onChange={(e) => {
                  setSpecFilter(e.target.value);
                  onPageChange(1);
                }}
                className="bg-white border border-slate-200 rounded-lg text-sm font-semibold px-3 py-2 outline-none text-slate-700 focus:border-blue-600 h-[38px]"
              >
                <option value="ALL">All Specializations</option>
                {specializations.map((spec) => (
                  <option key={spec} value={spec}>{spec}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Status</label>
              <div className="flex gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    onPageChange(1);
                  }}
                  className="bg-white border border-slate-200 rounded-lg text-sm font-semibold px-3 py-2 outline-none text-slate-700 focus:border-blue-600 flex-1 h-[38px]"
                >
                  <option value="ALL">All Status</option>
                  <option value="ACTIVE">Active Only</option>
                  <option value="INACTIVE">Inactive Only</option>
                </select>
                <button
                  onClick={resetFilters}
                  title="Reset Filters"
                  className="p-2 border border-slate-200 hover:border-slate-300 rounded-lg bg-slate-50 hover:bg-slate-100 transition-all cursor-pointer flex items-center justify-center shrink-0 w-[38px] h-[38px]"
                >
                  <RefreshCw className="w-4 h-4 text-slate-500" />
                </button>
              </div>
            </div>
          </div>

          <div className="shrink-0 w-full lg:w-auto text-right">
            <Button onClick={onAdd} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-2.5 px-4 rounded-lg w-full lg:w-auto">
              <Plus className="w-4 h-4" />
              <span>Add New Doctor</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Doctor Table Card */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Doctor Details</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Specialization</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Qualification</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">Exp.</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right">Consultation Fee</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right">Total Completed Consultations</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right">Followup Fee</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Working Hours</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center w-28">Status</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right w-28">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-6 py-10 text-center text-sm text-slate-400 font-medium">
                    No doctor profiles found.
                  </td>
                </tr>
              ) : (
                filtered.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/50 transition-colors">
                    {/* Doctor Details */}
                    <td className="px-6 py-4.5">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-full overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                          {doc.avatarUrl ? (
                            <img src={doc.avatarUrl} alt={doc.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-sm font-bold text-slate-600 uppercase">
                              {doc.name.replace('Dr. ', '').split(' ').map((n) => n[0]).join('').substring(0, 2)}
                            </span>
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-800 text-sm">{doc.name}</div>
                          <div className="text-[11px] text-slate-400 font-medium font-mono">{doc.email}</div>
                        </div>
                      </div>
                    </td>
                    {/* Specialization */}
                    <td className="px-6 py-4.5 text-sm font-semibold text-slate-700">
                      {doc.specialization}
                    </td>
                    {/* Qualification */}
                    <td className="px-6 py-4.5 text-sm text-slate-600 font-medium">
                      {doc.qualification}
                    </td>
                    {/* Exp */}
                    <td className="px-6 py-4.5 text-sm text-slate-600 font-semibold text-center">
                      {doc.experience}
                    </td>
                    {/* Consultation Fee */}
                    <td className="px-6 py-4.5 text-sm font-bold text-blue-600 text-right">
                      ₹{doc.fee.toFixed(2)}
                    </td>
                    {/* Total Completed Consultations */}
                    <td className="px-6 py-4.5 text-sm font-bold text-slate-700 text-right">
                      {doc.totalConsultations.toLocaleString()}
                    </td>
                    {/* Followup Fee (calculated as 1/3 of consultation fee or defaulted to ₹40.00 for Aisha / Rohit / Samuel / Kavya based on standard clinical math) */}
                    <td className="px-6 py-4.5 text-sm font-bold text-blue-600 text-right">
                      ₹{doc.followupFee.toFixed(2)}
                    </td>
                    {/* Working Hours */}
                    <td className="px-6 py-4.5 text-sm text-slate-600 font-medium font-mono">
                      {doc.workingHours}
                    </td>
                    {/* Status Badge & Toggle */}
                    <td className="px-6 py-4.5 text-center">
                      <div className="flex flex-col items-center gap-1.5 justify-center">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${doc.isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-slate-100 text-slate-500 border border-slate-200'
                          }`}>
                          {doc.isActive ? 'Active' : 'Inactive'}
                        </span>
                        <button
                          onClick={() => onToggleStatus(doc.id)}
                          className="cursor-pointer text-slate-400 hover:text-slate-600 transition-all"
                        >
                          {doc.isActive ? (
                            <ToggleRight className="w-8 h-5 text-emerald-500 fill-emerald-50" />
                          ) : (
                            <ToggleLeft className="w-8 h-5 text-slate-300" />
                          )}
                        </button>
                      </div>
                    </td>
                    {/* Actions */}
                    <td className="px-6 py-4.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onView(doc)}
                          className="text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100/80 border border-blue-100 px-3 py-1.5 rounded-md transition-all cursor-pointer"
                        >
                          View
                        </button>
                        <button
                          onClick={() => onEdit(doc)}
                          title="Edit Profile"
                          className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-all cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer with Pagination */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-500 font-semibold">
            Showing <span className="text-slate-800">{Math.min(startIndex + 1, totalItems)}</span>-
            <span className="text-slate-800">{Math.min(startIndex + itemsPerPage, totalItems)}</span> of{' '}
            <span className="text-slate-800">{totalItems}</span> doctors
          </div>
          {totalPages > 1 && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`p-1.5 rounded-lg border border-slate-200 bg-white text-slate-500 transition-all ${currentPage === 1 ? 'opacity-40 cursor-not-allowed' : 'hover:bg-slate-50 cursor-pointer'
                  }`}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => onPageChange(page)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${page === currentPage
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer'
                    }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`p-1.5 rounded-lg border border-slate-200 bg-white text-slate-500 transition-all ${currentPage === totalPages ? 'opacity-40 cursor-not-allowed' : 'hover:bg-slate-50 cursor-pointer'
                  }`}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
