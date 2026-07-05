import { DoctorProfileExtended, DoctorCalendarAppointment } from '../types';
import { doctorService, appointmentService } from '../../../lib/apiClient';

function mapDoctorToFrontend(d: any): DoctorProfileExtended {
  return {
    id: d.id.toString(),
    name: d.name,
    email: d.email,
    mobile: d.mobile,
    specialization: d.specialization,
    qualification: d.qualification || 'MBBS, MD',
    experience: d.experience || '10 Years',
    fee: Number(d.fee || 100),
    followupFee: Number(d.followupFee || 60),
    workingHours: d.workingHours || '09:00 AM - 05:00 PM',
    isActive: d.isActive ?? d.active ?? true,
    registrationNumber: d.registrationNumber || 'REG-12345',
    totalConsultations: Number(d.completedConsultations ?? 0),
    joiningDate: '2024-01-01',
    avatarUrl: d.avatarUrl || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=250&auto=format&fit=crop',
    gender: d.gender || 'Female',
    dateOfBirth: '1985-05-14',
    languages: Array.isArray(d.languages) ? d.languages : (d.languages || 'English, Hindi').split(',').map((s: string) => s.trim()),
    primarySpecialty: d.specialization || 'Cardiology',
    secondarySpecialty: 'General Practice',
    registrationAgency: 'Medical Council',
    affiliation: 'City General Clinic'
  };
}

export const mockDoctorsApi = {
  async getDoctors(): Promise<DoctorProfileExtended[]> {
    const list = await doctorService.getDoctors(1);
    return list.map(mapDoctorToFrontend);
  },

  async saveDoctors(doctors: DoctorProfileExtended[]): Promise<void> {
    const current = await this.getDoctors();
    for (const d of doctors) {
      const match = current.find(c => c.id === d.id);
      if (!match) {
        await doctorService.createDoctor(1, {
          name: d.name,
          email: d.email,
          mobile: d.mobile,
          specialization: d.specialization,
          isActive: d.isActive,
          registrationNumber: d.registrationNumber
        });
      } else {
        await doctorService.updateDoctor(Number(d.id), 1, {
          name: d.name,
          email: d.email,
          mobile: d.mobile,
          specialization: d.specialization,
          isActive: d.isActive,
          registrationNumber: d.registrationNumber
        });
      }
    }
  },

  async getAppointments(): Promise<DoctorCalendarAppointment[]> {
    const list = await appointmentService.getAppointments(1, { size: 1000 });
    return (list.content || []).map((appt: any) => {
      const dt = new Date(appt.appointmentDateTime);
      const dateStr = dt.toISOString().split('T')[0];
      
      const pad = (n: number) => String(n).padStart(2, '0');
      const timeStr = `${pad(dt.getHours())}:${pad(dt.getMinutes())}`;

      let status: 'DONE' | 'CANCELLED' | 'LIVE' | 'CONFIRMED' | 'UPCOMING' = 'CONFIRMED';
      if (appt.status === 'COMPLETED') status = 'DONE';
      else if (appt.status === 'CANCELLED') status = 'CANCELLED';

      return {
        id: appt.id.toString(),
        patientName: appt.patientName,
        patientNumber: appt.appointmentCode,
        date: dateStr,
        startTime: timeStr,
        endTime: timeStr,
        status,
        reason: appt.appointmentReason
      };
    });
  },

  async saveAppointments(appointments: DoctorCalendarAppointment[]): Promise<void> {
    localStorage.setItem('healthflow_doctor_appointments', JSON.stringify(appointments));
  }
};
