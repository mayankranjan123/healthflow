import React, { useState } from 'react';
import { Search, Edit2, Eye, ToggleLeft, ToggleRight, Plus, ChevronLeft, ChevronRight, Download, Phone, Mail } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Card, CardBody } from '../../../components/ui/Card';
import { AdminUser } from '../types';

interface AdminTabProps {
  admins: AdminUser[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  searchTerm: string;
  setSearchTerm: (s: string) => void;
  statusFilter: 'ALL' | 'ACTIVE' | 'INACTIVE';
  setStatusFilter: (s: 'ALL' | 'ACTIVE' | 'INACTIVE') => void;
  onPageChange: (p: number) => void;
  onToggleStatus: (id: string) => void;
  onEdit: (admin: AdminUser) => void;
  onAdd: () => void;
  onView: (admin: AdminUser) => void;
  isMobile?: boolean;
}

export const AdminTab: React.FC<AdminTabProps> = ({
  admins,
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
  const itemsPerPage = 5;
  const startIndex = (currentPage - 1) * itemsPerPage;

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + ["ID,Name,Email,Mobile,Status"].join(",") + "\n"
      + admins.map(a => `${a.id},"${a.name}",${a.email},${a.mobile},${a.isActive ? 'ACTIVE' : 'INACTIVE'}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "healthflow_admins.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

      {/* Cards list */}
      <div className="space-y-4">
        {admins.length === 0 ? (
          <div className="py-12 bg-white border border-slate-200 rounded-2xl text-center text-slate-400 font-semibold text-xs">
            No administrator accounts found.
          </div>
        ) : (
          admins.map((admin) => {
            const initials = admin.name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();
            return (
              <div key={admin.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-3xs flex flex-col gap-4 relative">
                {/* Top: Avatar, Name, ID, Toggle */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-blue-50 border border-slate-200 flex items-center justify-center font-bold text-blue-600 text-xs shrink-0">
                      {admin.avatarUrl ? (
                        <img src={admin.avatarUrl} alt={admin.name} className="w-full h-full object-cover" />
                      ) : (
                        initials
                      )}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-800 text-sm leading-tight">{admin.name}</h4>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-blue-50 text-blue-600 mt-1.5 border border-blue-100">
                        {admin.id}
                      </span>
                    </div>
                  </div>

                  {/* Toggle Switch */}
                  <button
                    type="button"
                    onClick={() => onToggleStatus(admin.id)}
                    className="cursor-pointer focus:outline-none shrink-0"
                  >
                    <div className={`w-11 h-6 rounded-full p-0.5 transition-colors flex ${admin.isActive ? 'bg-[#0F766E] justify-end' : 'bg-slate-200 justify-start'} items-center`}>
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
                    <span>{admin.mobile}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="truncate">{admin.email}</span>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="flex items-center justify-end gap-1 pt-1.5 border-t border-slate-50">
                  <button
                    type="button"
                    onClick={() => onView(admin)}
                    className="p-2 text-slate-400 hover:text-blue-600 rounded-xl hover:bg-slate-50 transition-all cursor-pointer"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onEdit(admin)}
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
          <span className="text-slate-800">{totalItems}</span> Admins
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
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto flex-1 max-w-2xl">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
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

        <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
          <Button variant="outline" className="gap-2 border-slate-250 text-slate-700 bg-white" onClick={handleExport}>
            <Download className="w-4 h-4" />
            <span className="font-semibold text-xs">Export Data</span>
          </Button>
          <Button onClick={onAdd} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-sm font-semibold text-xs py-2.5 px-4 rounded-lg">
            <Plus className="w-4 h-4" />
            <span>Add New Admin</span>
          </Button>
        </div>
      </div>

      {/* Admin Table Card */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider w-24">Profile</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Admin Name</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Mobile</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Email</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center w-32">Status</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right w-28">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {admins.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-sm text-slate-400 font-medium">
                    No administrator accounts found.
                  </td>
                </tr>
              ) : (
                admins.map((admin) => (
                  <tr key={admin.id} className="hover:bg-slate-50/50 transition-colors">
                    {/* Profile */}
                    <td className="px-6 py-4.5">
                      <div className="w-11 h-11 rounded-full overflow-hidden bg-slate-100 border border-slate-205 flex items-center justify-center">
                        {admin.avatarUrl ? (
                          <img src={admin.avatarUrl} alt={admin.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-sm font-bold text-slate-600 uppercase">
                            {admin.name.split(' ').map((n) => n[0]).join('').substring(0, 2)}
                          </span>
                        )}
                      </div>
                    </td>
                    {/* Name */}
                    <td className="px-6 py-4.5">
                      <div className="font-semibold text-slate-800 text-sm">{admin.name}</div>
                      <div className="text-[11px] text-slate-400 font-medium font-mono">{admin.id}</div>
                    </td>
                    {/* Mobile */}
                    <td className="px-6 py-4.5 text-sm text-slate-600 font-medium">
                      {admin.mobile}
                    </td>
                    {/* Email */}
                    <td className="px-6 py-4.5 text-sm text-slate-600 font-medium">
                      {admin.email}
                    </td>
                    {/* Status Toggle */}
                    <td className="px-6 py-4.5 text-center">
                      <button
                        onClick={() => onToggleStatus(admin.id)}
                        className="inline-flex items-center justify-center cursor-pointer text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {admin.isActive ? (
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
                          onClick={() => onView(admin)}
                          title="View Details"
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onEdit(admin)}
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
            <span className="text-slate-800">{totalItems}</span> Admins
          </div>
          {totalPages > 1 && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`p-1.5 rounded-lg border border-slate-200 bg-white text-slate-505 transition-all ${
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
                className={`p-1.5 rounded-lg border border-slate-200 bg-white text-slate-505 transition-all ${
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
