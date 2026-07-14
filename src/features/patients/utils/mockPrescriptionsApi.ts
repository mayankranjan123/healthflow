import { prescriptionService, PrescriptionRequestDto, PrescriptionResponseDto } from '../../../lib/apiClient';
import { PatientPrescription, PatientMedicine } from '../types';

function mapItemToFrontend(med: any, index: number): PatientMedicine {
  return {
    id: med.id ? med.id.toString() : index.toString(),
    medicineName: med.medicineName || '',
    dosage: med.dosage || '',
    frequency: med.frequency || '',
    duration: med.duration || '',
    instructions: med.instructions || ''
  };
}

function mapToFrontend(p: PrescriptionResponseDto): PatientPrescription {
  return {
    id: p.prescriptionCode || p.id.toString(),
    patientId: p.patientId.toString(),
    patientName: p.patientName || '',
    patientNumber: '',
    doctorId: p.doctorId.toString(),
    doctorName: p.doctorName || '',
    doctorSpecialization: p.doctorSpecialization || '',
    doctorAvatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(p.doctorName || 'Doctor')}`,
    issueDate: p.prescriptionDate || '',
    diagnosis: p.diagnosis || '',
    symptoms: p.symptoms || '',
    clinicalNotes: p.clinicalNotes || '',
    medicines: (p.medicines || []).map((med, idx) => mapItemToFrontend(med, idx)),
    testsRecommended: p.testsRecommended || '',
    advice: p.advice || '',
    nextVisitDate: p.nextVisitDate || '',
    headerLayout: p.headerLayout as any || 'CENTERED_PROFESSIONAL'
  };
}

function mapItemToBackend(med: PatientMedicine, index: number) {
  return {
    medicineName: med.medicineName,
    dosage: med.dosage,
    frequency: med.frequency,
    duration: med.duration,
    instructions: med.instructions || undefined,
    sequenceNo: index + 1
  };
}

export const mockPrescriptionsApi = {
  async getPrescriptions(patientId: string): Promise<PatientPrescription[]> {
    const data = await prescriptionService.getPrescriptions(1000000000, { patientId: Number(patientId) });
    return (data.content || []).map(mapToFrontend);
  },

  async createPrescription(p: Omit<PatientPrescription, 'id'>): Promise<PatientPrescription> {
    const requestPayload: PrescriptionRequestDto = {
      patientId: parseInt(p.patientId),
      doctorId: parseInt(p.doctorId),
      prescriptionDate: p.issueDate,
      diagnosis: p.diagnosis,
      symptoms: p.symptoms,
      clinicalNotes: p.clinicalNotes || '',
      testsRecommended: p.testsRecommended || undefined,
      advice: p.advice || undefined,
      nextVisitDate: (p.nextVisitDate && p.nextVisitDate !== 'None' && p.nextVisitDate !== '') ? p.nextVisitDate : undefined,
      status: 'ACTIVE',
      headerLayout: p.headerLayout || 'CENTERED_PROFESSIONAL',
      medicines: p.medicines.map((med, idx) => mapItemToBackend(med, idx))
    };

    const created = await prescriptionService.createPrescription(1000000000, requestPayload);
    return mapToFrontend(created);
  }
};
