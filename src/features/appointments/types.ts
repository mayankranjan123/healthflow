import { AppointmentStatus } from '../../types';

export interface ExtendedAppointment {
  id: string; // e.g., 'APT-1001'
  patientId: string; // e.g., 'PT-1082'
  patientName: string;
  patientNumber: string;
  patientPhone: string;
  patientGender?: 'MALE' | 'FEMALE' | 'OTHER';
  doctorId: string; // e.g., 'DOC-002'
  doctorName: string;
  doctorSpecialization: string;
  doctorAvatarUrl?: string;
  appointmentDate: string; // YYYY-MM-DD
  appointmentTime: string; // e.g., '09:30 AM' or '09:30:00'
  status: AppointmentStatus;
  reason: string;
  notes?: string;
  visitType?: string; // e.g., 'In-person Visit' or 'Teleconsultation'
  tokenNumber?: string; // e.g., '#42'
  createdBy?: string; // e.g., 'Sarah Mitchell'
  lastUpdated?: string; // e.g., 'Oct 26, 09:14 AM'
}
