export interface DoctorProfileExtended {
  id: string;
  name: string;
  email: string;
  mobile: string;
  specialization: string;
  qualification: string;
  experience: string; // e.g. "12 yrs" or "12 Years"
  fee: number; // consultation fee
  followupFee: number; // e.g. 40 or 80
  workingHours: string; // e.g. "09:00 AM - 04:00 PM"
  isActive: boolean;
  registrationNumber: string;
  totalConsultations: number;
  joiningDate: string; // YYYY-MM-DD or string
  avatarUrl?: string;

  // Visual/Extended detail fields from Stitch image reference
  gender: string; // "Female" | "Male" | "Other"
  dateOfBirth: string; // e.g. "14 May 1985"
  languages: string[]; // e.g. ["English", "Hindi", "Gujarati"]
  primarySpecialty: string; // e.g. "Cardiovascular Diseases"
  secondarySpecialty?: string; // e.g. "Interventional Cardiology"
  registrationAgency?: string; // e.g. "Medical Council of Canada"
  affiliation?: string; // e.g. "City General Heart Institute"
}

export interface DoctorCalendarAppointment {
  id: string;
  patientName: string;
  patientNumber?: string;
  date: string; // YYYY-MM-DD
  startTime: string; // e.g. "09:00 AM" or "14:00"
  endTime?: string; // e.g. "10:45 AM"
  status: 'DONE' | 'CANCELLED' | 'LIVE' | 'CONFIRMED' | 'UPCOMING';
  reason?: string;
  notes?: string;
}
