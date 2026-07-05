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

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    doctorSearch: '',
    fromDate: '',
    toDate: '',
    patientSearch: '',
    status: 'ALL',
    visitType: 'ALL',
  });

  // Load appointments on mount
  useEffect(() => {
    mockAppointmentsApi.getAppointments().then(setAppointments);
  }, []);

  // Filtered list of appointments
  const filteredAppointments = useMemo(() => {
    return appointments.filter((appt) => {
      // 1. Doctor Search
      if (filters.doctorSearch) {
        const query = filters.doctorSearch.toLowerCase();
        if (!appt.doctorName.toLowerCase().includes(query)) {
          return false;
        }
      }

      // 2. Patient Search (Name, Phone, ID, Number)
      if (filters.patientSearch) {
        const query = filters.patientSearch.toLowerCase();
        const matchesName = appt.patientName.toLowerCase().includes(query);
        const matchesId = appt.patientId.toLowerCase().includes(query);
        const matchesNum = appt.patientNumber.toLowerCase().includes(query);
        const matchesPhone = appt.patientPhone.toLowerCase().includes(query);
        if (!matchesName && !matchesId && !matchesNum && !matchesPhone) {
          return false;
        }
      }

      // 3. Status Search
      if (filters.status !== 'ALL') {
        if (appt.status !== filters.status) {
          return false;
        }
      }

      // 4. From Date Range
      if (filters.fromDate) {
        if (appt.appointmentDate < filters.fromDate) {
          return false;
        }
      }

      // 5. To Date Range
      if (filters.toDate) {
        if (appt.appointmentDate > filters.toDate) {
          return false;
        }
      }

      // 6. Visit Type Search
      if (filters.visitType && filters.visitType !== 'ALL') {
        if (appt.visitType !== filters.visitType) {
          return false;
        }
      }

      return true;
    });
  }, [appointments, filters]);

  // Handle apply filters
  const handleApplyFilters = (newFilters: FilterState) => {
    setFilters(newFilters);
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
      mockAppointmentsApi.getAppointments().then(setAppointments);
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
      mockAppointmentsApi.getAppointments().then(setAppointments);
    });

    // Keep state updated for views
    setSelectedAppointment(updatedAppt);
    setIsCancelOpen(false);
    // Let's close the detail view too so the status update is seen instantly in the table
    setIsViewOpen(false);
  };

  const handleMarkCompleted = (appt: ExtendedAppointment) => {
    mockAppointmentsApi.completeAppointment(appt.id).then(() => {
      mockAppointmentsApi.getAppointments().then(setAppointments);
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
        appointments={filteredAppointments}
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
