import { PatientProfileExtended } from '../types';
import { patientService, PatientRequestDto } from '../../../lib/apiClient';

// Helper to map backend PatientResponseDto to PatientProfileExtended
function mapToFrontend(p: any): PatientProfileExtended {
  const nameParts = (p.fullName || '').split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  return {
    id: p.id.toString(),
    patientNumber: p.patientCode || '',
    firstName,
    lastName,
    dateOfBirth: p.dateOfBirth || '',
    gender: (p.gender === 'OTHER' ? 'OTHER' : p.gender) as any || 'MALE',
    phone: p.mobile || '',
    email: p.email || '',
    address: p.address || '',
    emergencyContactName: p.emergencyContactName || '',
    emergencyContactPhone: p.emergencyContactPhone || '',
    allergies: p.allergies || '',
    existingDiseases: p.existingDiseases || '',
    clinicalNotes: p.clinicalNotes || '',
    bloodGroup: p.bloodGroup || '',
    purpose: p.purpose || '',
    avatarUrl: p.profileImageUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop',
    lastVisit: p.lastVisit ? p.lastVisit.split('T')[0] : 'None',
    nextVisit: p.nextVisit ? p.nextVisit.split('T')[0] : 'None',
    attachments: [],
    appointments: [],
    prescriptions: []
  };
}

// Helper to map frontend PatientProfileExtended to PatientRequestDto
function mapToBackend(p: Partial<PatientProfileExtended>): PatientRequestDto {
  return {
    fullName: `${p.firstName || ''} ${p.lastName || ''}`.trim(),
    gender: (p.gender || 'MALE') as any,
    mobile: p.phone || '',
    email: p.email || undefined,
    profileImageUrl: p.avatarUrl || undefined,
    purpose: p.purpose || undefined,
    allergies: p.allergies || undefined,
    dateOfBirth: p.dateOfBirth || '1990-01-01',
    address: p.address || undefined,
    emergencyContactName: p.emergencyContactName || undefined,
    emergencyContactPhone: p.emergencyContactPhone || undefined,
    bloodGroup: p.bloodGroup || undefined,
    existingDiseases: p.existingDiseases || undefined,
    clinicalNotes: p.clinicalNotes || undefined,
    status: 'ACTIVE'
  };
}

export const mockPatientsApi = {
  async getPatients(): Promise<PatientProfileExtended[]> {
    const data = await patientService.getPatients(1, { size: 1000 });
    return (data.content || []).map(mapToFrontend);
  },

  async getPatientById(id: string): Promise<PatientProfileExtended | undefined> {
    try {
      const p = await patientService.getPatientById(id, 1);
      return mapToFrontend(p);
    } catch {
      return undefined;
    }
  },

  async addPatient(patient: PatientProfileExtended): Promise<PatientProfileExtended> {
    const created = await patientService.createPatient(1, mapToBackend(patient));
    return mapToFrontend(created);
  },

  async updatePatient(updated: PatientProfileExtended): Promise<void> {
    await patientService.updatePatient(updated.id, 1, mapToBackend(updated));
  }
};
