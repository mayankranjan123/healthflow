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
  async getPatients(params?: {
    pageNo?: number;
    pageSize?: number;
    patientId?: string;
    patientMobile?: string;
    patientName?: string;
    gender?: string;
  }): Promise<any> {
    if (!params) {
      const data = await patientService.getPatients(1000000000, { size: 1000 });
      return (data.content || []).map(mapToFrontend);
    }
    const data = await patientService.getPatients(1000000000, {
      page: params.pageNo,
      size: params.pageSize,
      patientId: params.patientId,
      patientMobile: params.patientMobile,
      patientName: params.patientName,
      gender: params.gender === 'All' ? undefined : params.gender,
    });
    return {
      items: (data.content || []).map(mapToFrontend),
      totalItems: data.totalElements || 0,
      totalPages: data.totalPages || 1,
      pageNo: data.number || 0,
      pageSize: data.size || 5,
    };
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
    const created = await patientService.createPatient(1000000000, mapToBackend(patient));
    return mapToFrontend(created);
  },

  async updatePatient(updated: PatientProfileExtended): Promise<void> {
    await patientService.updatePatient(updated.id, 1, mapToBackend(updated));
  },

  async getFiles(patientId: string, params?: { fileName?: string; pageNo?: number; pageSize?: number }): Promise<any> {
    const res = await patientService.getFiles(patientId, {
      fileName: params?.fileName,
      page: params?.pageNo,
      size: params?.pageSize,
    });
    return {
      items: res.content || [],
      totalItems: res.totalElements || 0,
      totalPages: res.totalPages || 1,
      pageNo: res.number || 0,
      pageSize: res.size || 5,
    };
  },

  async uploadFile(patientId: string, file: any): Promise<void> {
    await patientService.uploadFile(patientId, {
      fileName: file.fileName,
      category: file.category,
      size: file.size,
      fileType: file.fileType,
      uploadedDate: file.uploadedDate || new Date().toISOString().split('T')[0],
      uploadId: file.uploadId
    });
  },

  async deleteFile(patientId: string, fileId: string | number): Promise<void> {
    await patientService.deleteFile(patientId, fileId);
  }
};
