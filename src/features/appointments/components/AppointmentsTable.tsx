import React, { useState, useMemo } from 'react';
import { Eye, ArrowUpDown, ChevronLeft, ChevronRight, Calendar, AlertCircle } from 'lucide-react';
import { ExtendedAppointment } from '../types';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';

interface AppointmentsTableProps {
  appointments: ExtendedAppointment[];
  onView: (appt: ExtendedAppointment) => void;
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
  totalItems: number;
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  itemsPerPage: number;
}

export const AppointmentsTable: React.FC<AppointmentsTableProps> = ({
  appointments,
  onView,
  isLoading = false,
  isError = false,
  errorMessage = 'Failed to load appointments. Please try again.',
  totalItems,
  totalPages,
  currentPage,
  onPageChange,
  itemsPerPage,
}) => {
  // Sorting State
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Toggle sorting direction
  const handleSortToggle = () => {
    setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  };

  // Sorted appointments
  const paginatedAppointments = useMemo(() => {
    const list = [...appointments];
    list.sort((a, b) => {
      // Combine date and time to parse correctly
      const getVal = (appt: ExtendedAppointment) => {
        // Convert '11:15 AM' to 24h format for simple comparison or use appointmentDate + time
        const [hourStr, minAndAmPm] = appt.appointmentTime.split(':');
        const [minStr, amPm] = minAndAmPm.split(' ');
        let hours = parseInt(hourStr, 10);
        if (amPm === 'PM' && hours !== 12) hours += 12;
        if (amPm === 'AM' && hours === 12) hours = 0;
        
        const pad = (n: number) => String(n).padStart(2, '0');
        const timeStr = `${pad(hours)}:${minStr}:00`;
        return new Date(`${appt.appointmentDate}T${timeStr}`).getTime();
      };

      const valA = getVal(a);
      const valB = getVal(b);
      return sortDirection === 'asc' ? valA - valB : valB - valA;
    });
    return list;
  }, [appointments, sortDirection]);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return {
          bg: 'bg-blue-50/70 border border-blue-200/60',
          text: 'text-blue-600',
          dot: 'bg-blue-500',
          label: 'Scheduled',
        };
      case 'COMPLETED':
        return {
          bg: 'bg-emerald-50/70 border border-emerald-200/60',
          text: 'text-emerald-700',
          dot: 'bg-emerald-500',
          label: 'Completed',
        };
      case 'CANCELLED':
        return {
          bg: 'bg-rose-50/70 border border-rose-200/60',
          text: 'text-rose-600',
          dot: 'bg-rose-500',
          label: 'Cancelled',
        };
      default:
        return {
          bg: 'bg-slate-100 border border-slate-200',
          text: 'text-slate-600',
          dot: 'bg-slate-400',
          label: status,
        };
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .filter(n => n.toLowerCase() !== 'dr.' && n.length > 0)
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  // Helper for generating initials background colors
  const getInitialsBg = (name: string) => {
    const chars = getInitials(name);
    const sum = chars.charCodeAt(0) + (chars.charCodeAt(1) || 0);
    const colors = [
      'bg-indigo-100 text-indigo-700 border-indigo-200',
      'bg-emerald-100 text-emerald-700 border-emerald-200',
      'bg-amber-100 text-amber-700 border-amber-200',
      'bg-rose-100 text-rose-700 border-rose-200',
      'bg-sky-100 text-sky-700 border-sky-200',
      'bg-purple-100 text-purple-700 border-purple-200',
    ];
    return colors[sum % colors.length];
  };

  // Helper to format date nicely
  const formatDateHeader = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-xl shadow-sm overflow-hidden flex flex-col">
      {/* Table Area with scroll for responsiveness */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider select-none">
              <th className="py-4 px-6 font-semibold">Appointment ID</th>
              <th className="py-4 px-6 font-semibold">
                <button
                  type="button"
                  onClick={handleSortToggle}
                  className="flex items-center gap-1.5 hover:text-slate-800 transition-colors font-semibold uppercase tracking-wider text-[11px] outline-none"
                >
                  <span>Date & Time</span>
                  <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </th>
              <th className="py-4 px-6 font-semibold">Patient ID</th>
              <th className="py-4 px-6 font-semibold">Patient Name</th>
              <th className="py-4 px-6 font-semibold">Doctor Name</th>
              <th className="py-4 px-6 font-semibold">Visit Type</th>
              <th className="py-4 px-6 font-semibold">Status</th>
              <th className="py-4 px-6 font-semibold text-right pr-8">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, idx) => (
                <tr key={idx} className="animate-pulse">
                  <td className="py-4.5 px-6"><div className="h-4 bg-slate-200 rounded w-16" /></td>
                  <td className="py-4.5 px-6">
                    <div className="h-4 bg-slate-200 rounded w-28 mb-1" />
                    <div className="h-3 bg-slate-150 rounded w-14" />
                  </td>
                  <td className="py-4.5 px-6"><div className="h-4 bg-slate-200 rounded w-12 font-mono" /></td>
                  <td className="py-4.5 px-6">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-slate-200 shrink-0" />
                      <div className="h-4 bg-slate-200 rounded w-28" />
                    </div>
                  </td>
                  <td className="py-4.5 px-6"><div className="h-4 bg-slate-200 rounded w-24" /></td>
                  <td className="py-4.5 px-6"><div className="h-4 bg-slate-200 rounded w-20" /></td>
                  <td className="py-4.5 px-6"><div className="h-6 bg-slate-200 rounded-full w-20" /></td>
                  <td className="py-4.5 px-6 text-right pr-8"><div className="h-4 bg-slate-200 rounded w-8 ml-auto" /></td>
                </tr>
              ))
            ) : isError ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center gap-2 text-rose-500">
                    <AlertCircle className="w-8 h-8 stroke-[2.25]" />
                    <span className="font-bold text-slate-800">Connection Error</span>
                    <span className="text-xs text-slate-400 font-medium">{errorMessage}</span>
                  </div>
                </td>
              </tr>
            ) : paginatedAppointments.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Calendar className="w-8 h-8 text-slate-300" />
                    <span className="font-medium text-sm">No appointments matching the active filter.</span>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedAppointments.map((appt) => {
                const statusInfo = getStatusStyle(appt.status);
                const initials = getInitials(appt.patientName);
                const avatarColor = getInitialsBg(appt.patientName);

                return (
                  <tr
                    key={appt.id}
                    className="hover:bg-slate-50/50 transition-colors group text-sm text-slate-700"
                  >
                    {/* Appointment ID */}
                    <td className="py-4 px-6">
                      <button
                        type="button"
                        onClick={() => onView(appt)}
                        className="font-bold text-brand-primary hover:text-indigo-700 transition-colors cursor-pointer outline-none text-left"
                      >
                        {appt.id}
                      </button>
                    </td>

                    {/* Date & Time */}
                    <td className="py-4 px-6">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800">
                          {formatDateHeader(appt.appointmentDate)}
                        </span>
                        <span className="text-[11px] text-slate-400 font-bold font-mono">
                          {appt.appointmentTime}
                        </span>
                      </div>
                    </td>

                    {/* Patient ID */}
                    <td className="py-4 px-6 font-mono text-xs font-semibold text-slate-500">
                      {appt.patientId}
                    </td>

                    {/* Patient Name with Avatar */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full border flex items-center justify-center font-bold text-xs shrink-0 ${avatarColor}`}>
                          {initials}
                        </div>
                        <span className="font-semibold text-slate-800 text-[14px]">
                          {appt.patientName}
                        </span>
                      </div>
                    </td>

                    {/* Doctor Name */}
                    <td className="py-4 px-6 font-medium text-slate-700">
                      {appt.doctorName}
                    </td>

                    {/* Visit Type */}
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-50 text-slate-600 border border-slate-100">
                        {appt.visitType || 'In-person Visit'}
                      </span>
                    </td>

                    {/* Status Pill */}
                    <td className="py-4 px-6">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${statusInfo.bg} ${statusInfo.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot}`} />
                        <span>{statusInfo.label}</span>
                      </div>
                    </td>

                    {/* View Actions */}
                    <td className="py-4 px-6 text-right pr-8">
                      <button
                        type="button"
                        onClick={() => onView(appt)}
                        className="p-2 text-slate-400 hover:text-brand-primary hover:bg-slate-100 rounded-lg transition-all inline-flex items-center justify-center cursor-pointer"
                        title="View Details"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalItems > 0 && (
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="text-sm text-slate-500 font-medium">
            Showing <span className="font-semibold text-slate-700">{Math.min(totalItems, (currentPage - 1) * itemsPerPage + 1)}</span> to{' '}
            <span className="font-semibold text-slate-700">
              {Math.min(totalItems, currentPage * itemsPerPage)}
            </span>{' '}
            of <span className="font-semibold text-slate-700">{totalItems}</span> results
          </div>

          <div className="flex items-center gap-1.5 self-center sm:self-auto select-none">
            {/* Prev Button */}
            <button
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className={`p-1.5 rounded-lg border border-slate-200 transition-all ${
                currentPage === 1
                  ? 'text-slate-300 bg-slate-50 cursor-not-allowed'
                  : 'text-slate-600 bg-white hover:bg-slate-50 active:scale-95 cursor-pointer'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Pagination numbers */}
            {Array.from({ length: totalPages }).map((_, idx) => {
              const pageNum = idx + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => onPageChange(pageNum)}
                  className={`w-8 h-8 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                    currentPage === pageNum
                      ? 'bg-brand-primary text-white border-brand-primary shadow-sm'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            {/* Next Button */}
            <button
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className={`p-1.5 rounded-lg border border-slate-200 transition-all ${
                currentPage === totalPages
                  ? 'text-slate-300 bg-slate-50 cursor-not-allowed'
                  : 'text-slate-600 bg-white hover:bg-slate-50 active:scale-95 cursor-pointer'
              }`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
