/**
 * HealthFlow Shared Types & Interfaces
 */

export type UserRole = 'ADMIN' | 'DOCTOR' | 'STAFF';

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phone?: string;
  isActive: boolean;
  avatarUrl?: string;
}

export interface Doctor {
  id: number;
  userId?: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialization: string;
  licenseNumber: string;
  isActive: boolean;
}

export interface Patient {
  id: number;
  patientNumber: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  phone: string;
  email: string;
  address?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  allergies?: string;
  existingDiseases?: string;
  clinicalNotes?: string;
}

export type AppointmentStatus = 'SCHEDULED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';

export interface Appointment {
  id: number;
  patientId: number;
  patientName: string;
  patientNumber: string;
  doctorId: number;
  doctorName: string;
  appointmentDate: string;
  status: AppointmentStatus;
  reason: string;
  notes?: string;
}

export type PaymentStatus = 'PAID' | 'PENDING' | 'PARTIAL' | 'VOID';

export interface Invoice {
  id: number;
  invoiceNumber: string;
  patientId: number;
  patientName: string;
  patientNumber: string;
  issueDate: string;
  dueDate: string;
  totalAmount: number;
  taxAmount: number;
  discountAmount: number;
  paymentStatus: PaymentStatus;
  items: InvoiceItem[];
}

export interface InvoiceItem {
  id: number;
  description: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface Prescription {
  id: number;
  patientId: number;
  patientName: string;
  patientNumber: string;
  doctorName: string;
  issueDate: string;
  notes?: string;
  medicines: PrescriptionMedicine[];
}

export interface PrescriptionMedicine {
  id: number;
  drugName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}
