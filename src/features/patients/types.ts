export interface PatientAttachment {
  id: string;
  fileName: string;
  uploadedDate: string; // YYYY-MM-DD
  category: 'Lab Report' | 'Other' | 'X-ray' | 'Prescription' | 'Scan';
  size: string; // e.g., "1.2 MB"
  fileType: string; // e.g., "PDF", "JPEG", "PNG"
  uploadId?: string;
}

export interface PatientAppointment {
  id: string;
  appointmentDate: string; // YYYY-MM-DD HH:MM
  status: 'SCHEDULED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';
  doctorId: string;
  doctorName: string;
  doctorAvatarUrl?: string;
  reason: string;
}

export interface PatientMedicine {
  id: string;
  medicineName: string;
  dosage: string; // e.g. "500 mg"
  frequency: string; // e.g. "Once daily" or "1-0-1"
  duration: string; // e.g. "5 Days"
  instructions?: string; // e.g. "After food"
}

export interface PatientPrescription {
  id: string;
  patientId: string;
  patientName: string;
  patientNumber: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialization: string;
  doctorAvatarUrl?: string;
  issueDate: string; // YYYY-MM-DD
  diagnosis: string;
  symptoms: string;
  clinicalNotes?: string;
  medicines: PatientMedicine[];
  testsRecommended?: string;
  advice?: string;
  nextVisitDate?: string; // YYYY-MM-DD
  headerLayout?: 'CLASSIC_LEFT' | 'CENTERED_PROFESSIONAL';
}

export interface PatientProfileExtended {
  id: string;
  patientNumber: string; // e.g., "PT-1082"
  firstName: string;
  lastName: string;
  dateOfBirth: string; // YYYY-MM-DD
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  phone: string;
  email: string;
  address: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  allergies: string;
  existingDiseases: string;
  clinicalNotes: string;
  bloodGroup: string; // e.g. "O+", "A-", etc.
  purpose: string; // Purpose text box
  avatarUrl?: string;
  lastVisit: string; // YYYY-MM-DD or "None"
  nextVisit: string; // YYYY-MM-DD or "None"
  attachments: PatientAttachment[];
  appointments: PatientAppointment[];
  prescriptions: PatientPrescription[];
}
