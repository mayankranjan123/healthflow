import React, { useState } from 'react';
import { Search, Edit2, Eye, ToggleLeft, ToggleRight, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { StaffUser } from '../types';

interface StaffTabProps {
  staffList: StaffUser[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  searchTerm: string;
  setSearchTerm: (s: string) => void;
  statusFilter: 'ALL' | 'ACTIVE' | 'INACTIVE';
  setStatusFilter: (s: 'ALL' | 'ACTIVE' | 'INACTIVE') => void;
  onPageChange: (p: number) => void;
  onToggleStatus: (id: string) => void;
  onEdit: (staff: StaffUser) => void;
  onAdd: () => void;
  onView: (staff: StaffUser) => void;
}

export const StaffTab: React.FC<StaffTabProps> = ({
  staffList,
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
  const itemsPerPage = 5;
  const startIndex = (currentPage - 1) * itemsPerPage;

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Search and Action Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto flex-1 max-w-2xl">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search staff by name or email..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                onPageChange(1);
              }}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all text-slate-700 font-medium"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-semibold shrink-0">Filter by status:</span>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as any);
                onPageChange(1);
              }}
              className="bg-white border border-slate-200 rounded-lg text-xs font-semibold px-3 py-2 outline-none text-slate-700 focus:border-blue-600"
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active Only</option>
              <option value="INACTIVE">Inactive Only</option>
            </select>
          </div>
        </div>

        <div className="shrink-0 w-full sm:w-auto text-right">
          <Button onClick={onAdd} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-2.5 px-4 rounded-lg w-full sm:w-auto">
            <Plus className="w-4 h-4" />
            <span>Add New Staff</span>
          </Button>
        </div>
      </div>

      {/* Staff Table Card */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider w-24">Profile</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Staff Name</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Mobile</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Email</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center w-32">Status</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right w-28">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {staffList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-sm text-slate-400 font-medium">
                    No staff accounts found.
                  </td>
                </tr>
              ) : (
                staffList.map((staff) => (
                  <tr key={staff.id} className="hover:bg-slate-50/50 transition-colors">
                    {/* Profile */}
                    <td className="px-6 py-4.5">
                      <div className="w-11 h-11 rounded-full overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center">
                        {staff.avatarUrl ? (
                          <img src={staff.avatarUrl} alt={staff.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-sm font-bold text-slate-600 uppercase">
                            {staff.name.split(' ').map((n) => n[0]).join('').substring(0, 2)}
                          </span>
                        )}
                      </div>
                    </td>
                    {/* Name */}
                    <td className="px-6 py-4.5">
                      <div className="font-semibold text-slate-800 text-sm">{staff.name}</div>
                      <div className="text-[11px] text-slate-400 font-medium font-mono">{staff.id}</div>
                    </td>
                    {/* Mobile */}
                    <td className="px-6 py-4.5 text-sm text-slate-600 font-medium">
                      {staff.mobile}
                    </td>
                    {/* Email */}
                    <td className="px-6 py-4.5 text-sm text-slate-600 font-medium">
                      {staff.email}
                    </td>
                    {/* Status Toggle */}
                    <td className="px-6 py-4.5 text-center">
                      <button
                        onClick={() => onToggleStatus(staff.id)}
                        className="inline-flex items-center justify-center cursor-pointer text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {staff.isActive ? (
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
                          onClick={() => onView(staff)}
                          title="View Details"
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onEdit(staff)}
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
            <span className="text-slate-800">{totalItems}</span> Staff
          </div>
          {totalPages > 1 && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`p-1.5 rounded-lg border border-slate-200 bg-white text-slate-500 transition-all ${
                  currentPage === 1 ? 'opacity-40 cursor-not-allowed' : 'hover:bg-slate-50 cursor-pointer'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => onPageChange(page)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                    page === currentPage
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
                className={`p-1.5 rounded-lg border border-slate-200 bg-white text-slate-500 transition-all ${
                  currentPage === totalPages ? 'opacity-40 cursor-not-allowed' : 'hover:bg-slate-50 cursor-pointer'
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
