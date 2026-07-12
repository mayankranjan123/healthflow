export interface AdminUser {
  id: string;
  name: string;
  email: string;
  mobile: string;
  avatarUrl?: string;
  isActive: boolean;
  gender?: string;
  dateOfBirth?: string;
}

export interface DoctorUser {
  id: string;
  name: string;
  email: string;
  mobile: string;
  specialization: string;
  qualification: string;
  experience: string; // e.g., "12 yrs"
  fee: number; // consultation fee
  followupFee?: number; // followup fee
  workingHours: string; // e.g., "09:00 AM - 04:00 PM"
  isActive: boolean;
  registrationNumber: string;
  totalConsultations: number;
  joiningDate: string;
  avatarUrl?: string;
  gender?: string;
  dateOfBirth?: string;
}

export interface StaffUser {
  id: string;
  name: string;
  email: string;
  mobile: string;
  avatarUrl?: string;
  isActive: boolean;
  gender?: string;
  dateOfBirth?: string;
}

export interface ModulePermission {
  module: string;
  label: string;
  description: string;
  ADMIN: boolean;
  DOCTOR: boolean;
  STAFF: boolean;
}
