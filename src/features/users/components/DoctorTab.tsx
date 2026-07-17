import React, { useState } from 'react';
import { Search, Edit2, Eye, ToggleLeft, ToggleRight, Plus, ChevronLeft, ChevronRight, RefreshCw, Phone, Mail } from 'lucide-react';
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
  isMobile?: boolean;
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
  isMobile,
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

  return isMobile ? (
    <div className="space-y-4 animate-fade-in text-left">
      {/* Mobile Search bar */}
      <div className="relative w-full">
        <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            onPageChange(1);
          }}
          className="w-full pl-11 pr-4 h-11 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-all"
        />
      </div>

      {/* Specialization & Status Filters */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Specialization</label>
          <select
            value={specFilter}
            onChange={(e) => {
              setSpecFilter(e.target.value);
              onPageChange(1);
            }}
            className="w-full px-3 h-11 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none focus:border-blue-500"
          >
            <option value="ALL">All Specialities</option>
            {specializations.map((spec) => (
              <option key={spec} value={spec}>{spec}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as any);
              onPageChange(1);
            }}
            className="w-full px-3 h-11 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none focus:border-blue-500"
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active Only</option>
            <option value="INACTIVE">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Cards list */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="py-12 bg-white border border-slate-200 rounded-2xl text-center text-slate-400 font-semibold text-xs">
            No doctors found matching filters.
          </div>
        ) : (
          filtered.map((doctor) => {
            const initials = doctor.name.replace('Dr. ', '').split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();
            return (
              <div key={doctor.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-3xs flex flex-col gap-4 relative">
                {/* Top: Avatar, Name, ID, Toggle */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-blue-50 border border-slate-200 flex items-center justify-center font-bold text-blue-600 text-xs shrink-0">
                      {doctor.avatarUrl ? (
                        <img src={doctor.avatarUrl} alt={doctor.name} className="w-full h-full object-cover" />
                      ) : (
                        initials
                      )}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-800 text-sm leading-tight">{doctor.name}</h4>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-blue-50 text-blue-600 border border-blue-100">
                          {doctor.id}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                          {doctor.specialization}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Toggle Switch */}
                  <button
                    type="button"
                    onClick={() => onToggleStatus(doctor.id)}
                    className="cursor-pointer focus:outline-none shrink-0"
                  >
                    <div className={`w-11 h-6 rounded-full p-0.5 transition-colors flex ${doctor.isActive ? 'bg-[#0F766E] justify-end' : 'bg-slate-200 justify-start'} items-center`}>
                      <div className="w-5 h-5 bg-white rounded-full shadow-md" />
                    </div>
                  </button>
                </div>

                {/* Divider */}
                <div className="h-px bg-slate-100 -mx-5" />

                {/* Contact Info */}
                <div className="space-y-2 text-xs font-semibold text-slate-500">
                  <div className="flex items-center gap-2.5">
                    <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>{doctor.mobile}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="truncate">{doctor.email}</span>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="flex items-center justify-end gap-1 pt-1.5 border-t border-slate-50">
                  <button
                    type="button"
                    onClick={() => onView(doctor)}
                    className="p-2 text-slate-400 hover:text-blue-600 rounded-xl hover:bg-slate-50 transition-all cursor-pointer"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onEdit(doctor)}
                    className="p-2 text-slate-400 hover:text-blue-600 rounded-xl hover:bg-slate-50 transition-all cursor-pointer"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination footer */}
      <div className="flex items-center justify-between gap-4 mt-6 pb-6">
        <div className="text-xs text-slate-500 font-semibold">
          Showing <span className="text-slate-800">{startIndex + 1}</span>-
          <span className="text-slate-800">{Math.min(startIndex + itemsPerPage, totalItems)}</span> of{' '}
          <span className="text-slate-800">{totalItems}</span> Doctors
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5 text-slate-600" />
          </button>
          <button
            type="button"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer"
          >
            <ChevronRight className="w-5 h-5 text-slate-600" />
          </button>
        </div>
      </div>
    </div>
  ) : (
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
                    setStatusFilter(e.target.value as any);
                    onPageChange(1);
                  }}
                  className="bg-white border border-slate-200 rounded-lg text-sm font-semibold px-3 py-2 outline-none text-slate-700 focus:border-blue-600 h-[38px] flex-1"
                >
                  <option value="ALL">All Status</option>
                  <option value="ACTIVE">Active Only</option>
                  <option value="INACTIVE">Inactive Only</option>
                </select>
                <button
                  onClick={resetFilters}
                  title="Reset Filters"
                  className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shrink-0 cursor-pointer h-[38px] w-[38px] flex items-center justify-center text-slate-500"
                >
                  <RefreshCw className="w-4 h-4" />
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
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider w-24">Profile</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Doctor Name</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Specialization</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Mobile</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Email</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center w-32">Status</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right w-28">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-sm text-slate-400 font-medium">
                    No doctor profiles found.
                  </td>
                </tr>
              ) : (
                filtered.map((doctor) => (
                  <tr key={doctor.id} className="hover:bg-slate-50/50 transition-colors">
                    {/* Profile */}
                    <td className="px-6 py-4.5">
                      <div className="w-11 h-11 rounded-full overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center">
                        {doctor.avatarUrl ? (
                          <img src={doctor.avatarUrl} alt={doctor.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-sm font-bold text-slate-600 uppercase">
                            {doctor.name.replace('Dr. ', '').split(' ').map((n) => n[0]).join('').substring(0, 2)}
                          </span>
                        )}
                      </div>
                    </td>
                    {/* Name */}
                    <td className="px-6 py-4.5">
                      <div className="font-semibold text-slate-800 text-sm">{doctor.name}</div>
                      <div className="text-[11px] text-slate-400 font-medium font-mono">{doctor.id}</div>
                    </td>
                    {/* Specialization */}
                    <td className="px-6 py-4.5">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700">
                        {doctor.specialization}
                      </span>
                    </td>
                    {/* Mobile */}
                    <td className="px-6 py-4.5 text-sm text-slate-600 font-medium">
                      {doctor.mobile}
                    </td>
                    {/* Email */}
                    <td className="px-6 py-4.5 text-sm text-slate-600 font-medium">
                      {doctor.email}
                    </td>
                    {/* Status Toggle */}
                    <td className="px-6 py-4.5 text-center">
                      <button
                        onClick={() => onToggleStatus(doctor.id)}
                        className="inline-flex items-center justify-center cursor-pointer text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {doctor.isActive ? (
                          <ToggleRight className="w-10 h-6 text-emerald-600 fill-emerald-100" />
                        ) : (
                          <ToggleLeft className="w-10 h-6 text-slate-300" />
                        )}
                      </button>
                    </td>
                    {/* Actions */}
                    <td className="px-6 py-4.5 text-right">
                      <div className="flex items-center justify-end gap-2.5">
                        <button
                          onClick={() => onView(doctor)}
                          title="View Details"
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onEdit(doctor)}
                          title="Edit Profile"
                          className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-all cursor-pointer"
                        >
                          <Edit2 className="w-4 h-4" />
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
