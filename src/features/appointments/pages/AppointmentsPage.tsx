import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Calendar, CalendarDays, SlidersHorizontal, CheckCircle2, Search, Filter, Clock, User, ChevronLeft, ChevronRight, X, Eye } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Drawer } from '../../../components/ui/Drawer';
import { Badge } from '../../../components/ui/Badge';
import { ExtendedAppointment } from '../types';
import { mockAppointmentsApi } from '../utils/mockAppointmentsApi';
import { AppointmentFilters, FilterState } from '../components/AppointmentFilters';
import { AppointmentsTable } from '../components/AppointmentsTable';
import { AddAppointmentForm } from '../components/AddAppointmentForm';
import { ViewAppointmentModal } from '../components/ViewAppointmentModal';
import { CancelConfirmationModal } from '../components/CancelConfirmationModal';

export const AppointmentsPage: React.FC = () => {
  // Mobile responsive hook
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < 768);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState<boolean>(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // States
  const [appointments, setAppointments] = useState<ExtendedAppointment[]>([]);
  const [isAddOpen, setIsAddOpen] = useState<boolean>(false);
  const [isViewOpen, setIsViewOpen] = useState<boolean>(false);
  const [isCancelOpen, setIsCancelOpen] = useState<boolean>(false);
  const [selectedAppointment, setSelectedAppointment] = useState<ExtendedAppointment | null>(null);

  // Stats for mobile
  const [todayStats, setTodayStats] = useState({ totalToday: 0, pending: 0, completed: 0 });

  // Pagination & Loading States
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalElements, setTotalElements] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const itemsPerPage = 5;

  // Get default doctor name if logged in as doctor
  const getDefaultDoctorSearch = (): string => {
    const cached = localStorage.getItem('healthflow_user');
    if (cached) {
      try {
        const u = JSON.parse(cached);
        if (u && u.role?.toUpperCase() === 'DOCTOR') {
          return u.firstName && u.lastName ? `${u.firstName} ${u.lastName}` : '';
        }
      } catch (e) {}
    }
    return '';
  };

  const isDoctor = useMemo(() => {
    const cached = localStorage.getItem('healthflow_user');
    if (cached) {
      try {
        const u = JSON.parse(cached);
        return u?.role?.toUpperCase() === 'DOCTOR';
      } catch (e) {}
    }
    return false;
  }, []);

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    doctorSearch: getDefaultDoctorSearch(),
    fromDate: '',
    toDate: '',
    patientSearch: '',
    status: 'ALL',
    visitType: 'ALL',
  });

  // Temporary filters state for mobile drawer
  const [tempFilters, setTempFilters] = useState<FilterState>({
    doctorSearch: getDefaultDoctorSearch(),
    fromDate: '',
    toDate: '',
    patientSearch: '',
    status: 'ALL',
    visitType: 'ALL',
  });

  // Debouncing filters to prevent multiple API hits
  const [debouncedDoctorSearch, setDebouncedDoctorSearch] = useState(getDefaultDoctorSearch());
  const [debouncedPatientSearch, setDebouncedPatientSearch] = useState('');

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedDoctorSearch(filters.doctorSearch);
      setCurrentPage(1);
    }, 450);
    return () => clearTimeout(handler);
  }, [filters.doctorSearch]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedPatientSearch(filters.patientSearch);
      setCurrentPage(1);
    }, 450);
    return () => clearTimeout(handler);
  }, [filters.patientSearch]);

  // Load today's appointment stats dynamically
  const loadTodayStats = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const parsedFrom = new Date(todayStr + 'T00:00:00Z').toISOString();
    const parsedTo = new Date(todayStr + 'T23:59:59Z').toISOString();

    mockAppointmentsApi.getAppointments({
      pageNo: 0,
      pageSize: 1000,
      fromDate: parsedFrom,
      toDate: parsedTo
    })
      .then((res: any) => {
        const items = res.items || [];
        const total = items.length;
        const pending = items.filter((a: any) => a.status === 'SCHEDULED').length;
        const completed = items.filter((a: any) => a.status === 'COMPLETED').length;
        setTodayStats({ totalToday: total, pending, completed });
      })
      .catch((err) => {
        console.error("Failed to load today stats", err);
      });
  };

  // Load appointments dynamically
  const loadAppointments = () => {
    setIsLoading(true);
    // Convert LocalDate string range to Instant string (beginning & end of days) if set
    let parsedFrom: string | undefined = undefined;
    if (filters.fromDate) {
      parsedFrom = new Date(filters.fromDate + 'T00:00:00Z').toISOString();
    }
    let parsedTo: string | undefined = undefined;
    if (filters.toDate) {
      parsedTo = new Date(filters.toDate + 'T23:59:59Z').toISOString();
    }

    mockAppointmentsApi.getAppointments({
      pageNo: currentPage - 1,
      pageSize: itemsPerPage,
      doctorName: debouncedDoctorSearch,
      status: filters.status,
      fromDate: parsedFrom,
      toDate: parsedTo,
      patientName: debouncedPatientSearch,
      patientMobile: debouncedPatientSearch,
      visitType: filters.visitType
    })
      .then((res: any) => {
        setAppointments(res.items || []);
        setTotalElements(res.totalItems || 0);
        setTotalPages(res.totalPages || 1);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    loadAppointments();
    loadTodayStats();
  }, [currentPage, debouncedDoctorSearch, debouncedPatientSearch, filters.fromDate, filters.toDate, filters.status, filters.visitType]);

  // Handle apply filters
  const handleApplyFilters = (newFilters: FilterState) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  // Handle reset filters
  const handleResetFilters = () => {
    setFilters({
      doctorSearch: getDefaultDoctorSearch(),
      fromDate: '',
      toDate: '',
      patientSearch: '',
      status: 'ALL',
      visitType: 'ALL',
    });
    setCurrentPage(1);
  };

  // Handle booking action
  const handleBookAppointmentSubmit = (formData: any) => {
    // Generate new Appointment ID
    const nextNum = appointments.reduce((max, a) => {
      const match = a.id.match(/APT-(\d+)/);
      if (match) {
        const n = parseInt(match[1], 10);
        return n > max ? n : max;
      }
      return max;
    }, 1000) + 1;

    const newAppt: ExtendedAppointment = {
      id: `APT-${nextNum}`,
      patientId: formData.patientId || `PT-${Math.floor(1000 + Math.random() * 9000)}`,
      patientName: formData.patientName,
      patientNumber: formData.patientNumber,
      patientPhone: formData.patientPhone,
      patientGender: formData.patientGender,
      doctorId: formData.doctorId || 'DOC-002',
      doctorName: formData.doctorName,
      doctorSpecialization: formData.doctorSpecialization,
      doctorAvatarUrl: formData.doctorAvatarUrl,
      appointmentDate: formData.appointmentDate,
      appointmentTime: formData.appointmentTime,
      status: formData.status,
      reason: formData.reason,
      notes: formData.notes,
      visitType: formData.visitType,
      tokenNumber: formData.tokenNumber,
      createdBy: formData.createdBy,
      lastUpdated: formData.lastUpdated,
    };

    mockAppointmentsApi.addAppointment(newAppt).then(() => {
      loadAppointments();
    });
    setIsAddOpen(false);
  };

  // Handle View click
  const handleViewAppointment = (appt: ExtendedAppointment) => {
    setSelectedAppointment(appt);
    setIsViewOpen(true);
  };

  // Handle Cancel click from View modal
  const handleCancelClick = (appt: ExtendedAppointment) => {
    setSelectedAppointment(appt);
    setIsCancelOpen(true);
  };

  // Handle confirm cancel
  const handleConfirmCancel = () => {
    if (!selectedAppointment) return;

    const updatedAppt: ExtendedAppointment = {
      ...selectedAppointment,
      status: 'CANCELLED',
      lastUpdated: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + `, ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`
    };

    mockAppointmentsApi.deleteAppointment(selectedAppointment.id).then(() => {
      loadAppointments();
    });

    // Keep state updated for views
    setSelectedAppointment(updatedAppt);
    setIsCancelOpen(false);
    // Let's close the detail view too so the status update is seen instantly in the table
    setIsViewOpen(false);
  };

  const handleMarkCompleted = (appt: ExtendedAppointment) => {
    mockAppointmentsApi.completeAppointment(appt.id).then(() => {
      loadAppointments();
      setIsViewOpen(false);
    });
  };

  const formatDateHeader = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      {isMobile ? (
        <div className="space-y-5 pb-24 animate-fade-in-up">
          {/* Mobile Header */}
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-display font-bold text-slate-900 tracking-tight">Appointments</h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMobileDrawerOpen(true)}
                className="w-10 h-10 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer"
              >
                <Search className="w-5 h-5" />
              </button>
              <div className="w-8.5 h-8.5 rounded-full bg-brand-primary text-white flex items-center justify-center font-bold text-xs select-none">
                AD
              </div>
            </div>
          </div>

          {/* Stats Grid: 3 symmetric columns (No clipping) */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="bg-brand-primary text-white rounded-xl p-3.5 shadow-sm flex flex-col justify-between h-[84px]">
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-90 leading-none">Today</span>
              <span className="text-2xl font-extrabold font-display leading-none mt-1">{todayStats.totalToday}</span>
            </div>
            <div className="bg-slate-100 text-slate-800 border border-slate-200/80 rounded-xl p-3.5 shadow-sm flex flex-col justify-between h-[84px]">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none">Pending</span>
              <span className="text-2xl font-extrabold font-display leading-none mt-1 text-slate-700">{todayStats.pending}</span>
            </div>
            <div className="bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-xl p-3.5 shadow-sm flex flex-col justify-between h-[84px]">
              <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider leading-none">Completed</span>
              <span className="text-2xl font-extrabold font-display leading-none mt-1 text-emerald-700">{todayStats.completed}</span>
            </div>
          </div>

          {/* Search bar input for Mobile */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search patients..."
                value={filters.patientSearch}
                onChange={(e) => handleApplyFilters({ ...filters, patientSearch: e.target.value })}
                className="w-full pl-10 pr-3 h-11 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-brand-primary focus:bg-white focus:ring-1 focus:ring-brand-primary transition-all text-slate-700 font-medium shadow-2xs"
              />
            </div>
            <button
              onClick={() => setIsMobileDrawerOpen(true)}
              className={`w-11 h-11 rounded-xl border flex items-center justify-center transition-all bg-white shadow-2xs cursor-pointer ${(filters.fromDate || filters.toDate || filters.doctorSearch || filters.visitType !== 'ALL')
                  ? 'border-brand-primary text-brand-primary bg-blue-50/30'
                  : 'border-slate-200 text-slate-500 hover:text-slate-750'
                }`}
            >
              <SlidersHorizontal className="w-4.5 h-4.5" />
            </button>
          </div>

          {/* Horizontal scrollable quick-status tabs */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar scroll-smooth pb-1 -mx-4 px-4">
            {[
              { label: 'All', value: 'ALL' },
              { label: 'Scheduled', value: 'SCHEDULED' },
              { label: 'Completed', value: 'COMPLETED' },
              { label: 'Cancelled', value: 'CANCELLED' }
            ].map((tab) => {
              const isActive = filters.status === tab.value;
              return (
                <button
                  key={tab.value}
                  onClick={() => handleApplyFilters({ ...filters, status: tab.value })}
                  className={`px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all shadow-3xs cursor-pointer ${isActive
                      ? 'bg-brand-primary text-white font-extrabold shadow-sm'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                    }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Active Advanced Filters Badges */}
          {(filters.fromDate || filters.toDate || filters.doctorSearch || filters.visitType !== 'ALL') && (
            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
              {filters.fromDate && (
                <Badge variant="info" className="flex items-center gap-1">
                  <span>From: {filters.fromDate}</span>
                  <button onClick={() => handleApplyFilters({ ...filters, fromDate: '' })} className="hover:text-blue-900 font-bold ml-1 text-xs">×</button>
                </Badge>
              )}
              {filters.toDate && (
                <Badge variant="info" className="flex items-center gap-1">
                  <span>To: {filters.toDate}</span>
                  <button onClick={() => handleApplyFilters({ ...filters, toDate: '' })} className="hover:text-blue-900 font-bold ml-1 text-xs">×</button>
                </Badge>
              )}
              {filters.doctorSearch && (
                <Badge variant="success" className="flex items-center gap-1">
                  <span>Dr. {filters.doctorSearch.split(' ').pop()}</span>
                  <button onClick={() => handleApplyFilters({ ...filters, doctorSearch: '' })} className="hover:text-emerald-900 font-bold ml-1 text-xs">×</button>
                </Badge>
              )}
              {filters.visitType !== 'ALL' && (
                <Badge variant="warning" className="flex items-center gap-1">
                  <span>Type: {filters.visitType}</span>
                  <button onClick={() => handleApplyFilters({ ...filters, visitType: 'ALL' })} className="hover:text-amber-900 font-bold ml-1 text-xs">×</button>
                </Badge>
              )}
              <button
                onClick={handleResetFilters}
                className="text-xs text-slate-500 hover:text-brand-primary font-bold px-2 py-0.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Clear All
              </button>
            </div>
          )}

          {/* Appointment list cards */}
          <div className="space-y-4 pt-1">
            {isLoading ? (
              <div className="py-12 bg-white border border-slate-200 rounded-2xl flex flex-col justify-center items-center gap-3 shadow-sm">
                <div className="w-8 h-8 border-3 border-brand-primary border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-slate-400 font-medium">Loading Appointments...</span>
              </div>
            ) : appointments.length === 0 ? (
              <div className="py-12 bg-white border border-slate-200 rounded-2xl text-center text-slate-400 font-medium text-sm shadow-sm">
                No appointments found.
              </div>
            ) : (
              <div className="space-y-3.5">
                {appointments.map((appt) => {
                  const statusStyle = appt.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border-emerald-150' :
                    appt.status === 'SCHEDULED' ? 'bg-blue-50 text-blue-750 border-blue-150' :
                      'bg-rose-50 text-rose-700 border-rose-150';

                  return (
                    <div
                      key={appt.id}
                      onClick={() => handleViewAppointment(appt)}
                      className="bg-white border border-slate-200 rounded-2xl p-4.5 shadow-sm hover:shadow-md transition-all active:scale-[0.995] cursor-pointer flex flex-col gap-3 relative overflow-hidden"
                    >
                      {/* Top Row: Name, ID, status badge */}
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <h4 className="text-base font-bold text-slate-800 tracking-tight leading-snug">{appt.patientName}</h4>
                          <span className="text-[10px] text-slate-400 font-bold font-mono tracking-wider mt-0.5 inline-block bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">ID: #{appt.patientId}</span>
                        </div>
                        <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wide border ${statusStyle}`}>
                          {appt.status}
                        </span>
                      </div>

                      {/* Mid Row: Date and Time with Icons */}
                      <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-slate-600 bg-slate-50/70 rounded-xl p-2.5 border border-slate-100">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{formatDateHeader(appt.appointmentDate)}</span>
                        </div>
                        <div className="flex items-center gap-2 border-l border-slate-200/80 pl-2">
                          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{appt.appointmentTime}</span>
                        </div>
                      </div>

                      {/* Bottom Row: Doctor info and Visit Type */}
                      <div className="flex justify-between items-center pt-0.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-extrabold text-slate-655 font-display shrink-0 select-none">
                            {appt.doctorName.split(' ').filter(Boolean).pop()?.slice(0, 2).toUpperCase() || 'DR'}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-800">{appt.doctorName}</p>
                            <p className="text-[10px] font-medium text-slate-400 mt-0.2">Dr. ID: {appt.doctorId}</p>
                          </div>
                        </div>
                        <span className="text-[11px] font-bold text-brand-primary bg-blue-50/45 border border-blue-100/50 px-2.5 py-1 rounded-lg">
                          {appt.visitType || 'Consultation'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Mobile Pagination Controls */}
            {totalElements > 0 && !isLoading && (
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-slate-500 font-semibold">
                  Page {currentPage} of {totalPages}
                </span>
                <div className="flex gap-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    className="p-2.5 border border-slate-200 rounded-xl bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 cursor-pointer shadow-3xs"
                  >
                    <ChevronLeft className="w-4.5 h-4.5 text-slate-600" />
                  </button>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    className="p-2.5 border border-slate-200 rounded-xl bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 cursor-pointer shadow-3xs"
                  >
                    <ChevronRight className="w-4.5 h-4.5 text-slate-600" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* Header action row */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-display font-bold text-slate-900 tracking-tight">Appointments</h2>
              <p className="text-sm text-slate-500 font-medium">View, search and manage clinic appointments</p>
            </div>
            <Button
              onClick={() => setIsAddOpen(true)}
              className="shadow-sm bg-brand-primary hover:bg-indigo-700 text-white font-semibold text-sm px-5 h-11 transition-all rounded-lg flex items-center gap-2 cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-4.5 h-4.5 shrink-0" />
              <span>Create New Appointment</span>
            </Button>
          </div>

          {/* Interactive Filters Panel */}
          <AppointmentFilters
            initialFilters={filters}
            onApplyFilters={handleApplyFilters}
            onResetFilters={handleResetFilters}
            isFilteredToTodayByDefault={false}
          />

          {/* Appointment Data List Table */}
          <AppointmentsTable
            appointments={appointments}
            totalItems={totalElements}
            totalPages={totalPages}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            itemsPerPage={itemsPerPage}
            isLoading={isLoading}
            onView={handleViewAppointment}
          />
        </>
      )}

      {/* Drawer: Add Appointment Form */}
      <Drawer
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Book New Appointment"
      >
        <AddAppointmentForm
          onSubmit={handleBookAppointmentSubmit}
          onCancel={() => setIsAddOpen(false)}
        />
      </Drawer>

      {/* Modal: View Appointment Details */}
      <ViewAppointmentModal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        appointment={selectedAppointment}
        onCancelClick={handleCancelClick}
        onCompleteClick={handleMarkCompleted}
      />

      {/* Modal: Cancel Appointment Confirmation */}
      <CancelConfirmationModal
        isOpen={isCancelOpen}
        onClose={() => setIsCancelOpen(false)}
        appointment={selectedAppointment}
        onConfirm={handleConfirmCancel}
      />

      {/* Mobile Advanced Filters Drawer */}
      {isMobile && (
        <Drawer
          isOpen={isMobileDrawerOpen}
          onClose={() => setIsMobileDrawerOpen(false)}
          title="Filter Appointments"
        >
          <div className="flex flex-col h-full justify-between pb-8">
            <div className="space-y-6">
              {/* Date Range */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Date Range</label>
                <div className="space-y-3">
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                      type="date"
                      value={tempFilters.fromDate}
                      onChange={(e) => setTempFilters({ ...tempFilters, fromDate: e.target.value })}
                      className="w-full pl-10 pr-3 h-11 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary text-slate-700 font-medium"
                    />
                  </div>
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                      type="date"
                      value={tempFilters.toDate}
                      onChange={(e) => setTempFilters({ ...tempFilters, toDate: e.target.value })}
                      className="w-full pl-10 pr-3 h-11 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary text-slate-700 font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Doctor Search */}
              {!isDoctor && (
                <div className="space-y-2.5">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Doctor Name</label>
                  <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search doctor..."
                      value={tempFilters.doctorSearch}
                      onChange={(e) => setTempFilters({ ...tempFilters, doctorSearch: e.target.value })}
                      className="w-full pl-10 pr-3 h-11 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary text-slate-700 font-medium"
                    />
                  </div>
                </div>
              )}

              {/* Visit Type */}
              <div className="space-y-2.5">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Visit Type</label>
                <select
                  value={tempFilters.visitType}
                  onChange={(e) => setTempFilters({ ...tempFilters, visitType: e.target.value })}
                  className="w-full px-3.5 h-11 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary text-slate-700 font-medium cursor-pointer"
                >
                  <option value="ALL">All Types</option>
                  <option value="Consultation">Consultation</option>
                  <option value="In-person Visit">In-person Visit</option>
                </select>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3.5 pt-6 border-t border-slate-200/60 mt-10">
              <button
                onClick={() => {
                  setTempFilters({
                    doctorSearch: getDefaultDoctorSearch(),
                    fromDate: '',
                    toDate: '',
                    patientSearch: filters.patientSearch,
                    status: filters.status,
                    visitType: 'ALL',
                  });
                  handleResetFilters();
                  setIsMobileDrawerOpen(false);
                }}
                className="flex-1 py-3 border border-slate-200 rounded-xl font-bold text-slate-600 bg-white hover:bg-slate-50 active:scale-[0.99] transition-all cursor-pointer text-center text-sm"
              >
                Reset
              </button>
              <button
                onClick={() => {
                  handleApplyFilters(tempFilters);
                  setIsMobileDrawerOpen(false);
                }}
                className="flex-1 py-3 bg-brand-primary text-white rounded-xl font-bold hover:bg-blue-700 active:scale-[0.99] transition-all cursor-pointer text-center text-sm"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </Drawer>
      )}

      {/* Floating Action Button (FAB) */}
      {isMobile && (
        <button
          onClick={() => setIsAddOpen(true)}
          className="fixed bottom-20 right-5 z-45 bg-brand-primary text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all cursor-pointer animate-scale-in"
        >
          <Plus className="w-6 h-6" />
        </button>
      )}
    </div>
  );
};
