import { ExtendedAppointment } from '../types';
import { appointmentService } from '../../../lib/apiClient';

function parseDateTimeToInstant(date: string, time: string): string {
  try {
    const timeClean = time.trim();
    const spaceParts = timeClean.split(' ');
    const hmParts = spaceParts[0].split(':');
    let hours = Number(hmParts[0]);
    const minutes = Number(hmParts[1] || '0');
    const ampm = spaceParts[1]?.toUpperCase() || 'AM';

    if (ampm === 'PM' && hours < 12) {
      hours += 12;
    } else if (ampm === 'AM' && hours === 12) {
      hours = 0;
    }

    const dtStr = `${date}T${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
    // We parse it as a local date/time in the current timezone or UTC
    const dateObj = new Date(dtStr);
    return dateObj.toISOString();
  } catch (e) {
    return new Date().toISOString();
  }
}

function mapToFrontend(a: any): ExtendedAppointment {
  const dt = new Date(a.appointmentDateTime);
  const dateStr = dt.toISOString().split('T')[0];
  const timeStr = dt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

  return {
    id: a.id.toString(),
    patientId: a.patientId.toString(),
    patientName: a.patientName,
    patientNumber: a.appointmentCode || '',
    patientPhone: a.patientMobile || '',
    patientGender: 'MALE',
    doctorId: a.doctorId.toString(),
    doctorName: a.doctorName,
    doctorSpecialization: a.doctorSpecialization || 'General',
    doctorAvatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=250&auto=format&fit=crop',
    appointmentDate: dateStr,
    appointmentTime: timeStr,
    status: a.status as any || 'SCHEDULED',
    reason: a.appointmentReason || '',
    notes: a.cancellationReason || '',
    visitType: a.visitType || 'In-person Visit',
    tokenNumber: '#10',
    createdBy: 'System',
    lastUpdated: a.updatedAt ? new Date(a.updatedAt).toLocaleDateString() : ''
  };
}

export const mockAppointmentsApi = {
  async getAppointments(params?: {
    pageNo?: number;
    pageSize?: number;
    doctorName?: string;
    status?: string;
    fromDate?: string;
    toDate?: string;
    patientName?: string;
    patientMobile?: string;
    visitType?: string;
    patientId?: string;
  }): Promise<any> {
    if (!params) {
      const data = await appointmentService.getAppointments(1000000000, { size: 1000 });
      return (data.content || []).map(mapToFrontend);
    }
    const data = await appointmentService.getAppointments(1000000000, {
      page: params.pageNo,
      size: params.pageSize,
      doctorName: params.doctorName,
      status: params.status === 'ALL' ? undefined : params.status,
      fromDate: params.fromDate,
      toDate: params.toDate,
      patientName: params.patientName,
      patientMobile: params.patientMobile,
      visitType: params.visitType === 'ALL' ? undefined : params.visitType,
      patientId: params.patientId,
    });
    return {
      items: (data.content || []).map(mapToFrontend),
      totalItems: data.totalElements || 0,
      totalPages: data.totalPages || 1,
      pageNo: data.number || 0,
      pageSize: data.size || 5,
    };
  },

  async getAppointmentById(id: string): Promise<ExtendedAppointment | undefined> {
    try {
      const a = await appointmentService.getAppointmentById(id, 1);
      return mapToFrontend(a);
    } catch {
      return undefined;
    }
  },

  async addAppointment(appt: ExtendedAppointment): Promise<void> {
    const instantStr = parseDateTimeToInstant(appt.appointmentDate, appt.appointmentTime);
    await appointmentService.createAppointment(1000000000, {
      patientId: appt.patientId,
      doctorId: appt.doctorId,
      appointmentDateTime: instantStr,
      appointmentReason: appt.reason,
      visitType: appt.visitType
    });
  },

  async updateAppointment(updated: ExtendedAppointment): Promise<void> {
    const instantStr = parseDateTimeToInstant(updated.appointmentDate, updated.appointmentTime);
    await appointmentService.updateAppointment(updated.id, 1, {
      patientId: updated.patientId,
      doctorId: updated.doctorId,
      appointmentDateTime: instantStr,
      appointmentReason: updated.reason,
      visitType: updated.visitType
    });
  },

  async deleteAppointment(id: string): Promise<void> {
    await appointmentService.cancelAppointment(id, 1, {
      cancellationReason: 'Cancelled by patient/staff'
    });
  },

  async completeAppointment(id: string): Promise<void> {
    await appointmentService.completeAppointment(id, 1);
  }
};
