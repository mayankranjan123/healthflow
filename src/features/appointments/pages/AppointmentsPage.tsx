import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Calendar, CalendarDays, SlidersHorizontal, CheckCircle2 } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Drawer } from '../../../components/ui/Drawer';
import { ExtendedAppointment } from '../types';
import { mockAppointmentsApi } from '../utils/mockAppointmentsApi';
import { AppointmentFilters, FilterState } from '../components/AppointmentFilters';
import { AppointmentsTable } from '../components/AppointmentsTable';
import { AddAppointmentForm } from '../components/AddAppointmentForm';
import { ViewAppointmentModal } from '../components/ViewAppointmentModal';
import { CancelConfirmationModal } from '../components/CancelConfirmationModal';

export const AppointmentsPage: React.FC = () => {
  const [appointments, setAppointments] = useState<ExtendedAppointment[]>([]);
  const [isAddOpen, setIsAddOpen] = useState<boolean>(false);
  const [isViewOpen, setIsViewOpen] = useState<boolean>(false);
  const [isCancelOpen, setIsCancelOpen] = useState<boolean>(false);
  const [selectedAppointment, setSelectedAppointment] = useState<ExtendedAppointment | null>(null);

  // Pagination & Loading States
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalElements, setTotalElements] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const itemsPerPage = 5;

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    doctorSearch: '',
    fromDate: '',
    toDate: '',
    patientSearch: '',
    status: 'ALL',
    visitType: 'ALL',
  });

  // Debouncing filters to prevent multiple API hits
  const [debouncedDoctorSearch, setDebouncedDoctorSearch] = useState('');
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
  }, [currentPage, debouncedDoctorSearch, debouncedPatientSearch, filters.fromDate, filters.toDate, filters.status, filters.visitType]);

  // Handle apply filters
  const handleApplyFilters = (newFilters: FilterState) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  // Handle reset filters
  const handleResetFilters = () => {
    setFilters({
      doctorSearch: '',
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

  return (
    <div className="space-y-6">
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
    </div>
  );
};
