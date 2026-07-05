import { AdminUser, DoctorUser, StaffUser, ModulePermission } from '../types';
import { userService, doctorService } from '../../../lib/apiClient';

const INITIAL_PERMISSIONS: ModulePermission[] = [
  {
    module: 'patients',
    label: 'Patients Management',
    description: 'Manage patient records and medical history',
    ADMIN: true,
    DOCTOR: true,
    STAFF: true,
  },
  {
    module: 'appointments',
    label: 'Appointments Management',
    description: 'Schedule, cancel, and modify visits',
    ADMIN: true,
    DOCTOR: true,
    STAFF: true,
  },
  {
    module: 'doctors',
    label: 'Doctor Management',
    description: 'Manage medical staff profiles and rosters',
    ADMIN: true,
    DOCTOR: false,
    STAFF: false,
  },
  {
    module: 'billing',
    label: 'Billing',
    description: 'Process payments, invoices, and claims',
    ADMIN: true,
    DOCTOR: false,
    STAFF: true,
  },
  {
    module: 'reports',
    label: 'Report',
    description: 'Generate analytics and export clinic data',
    ADMIN: true,
    DOCTOR: false,
    STAFF: false,
  },
  {
    module: 'settings',
    label: 'Settings',
    description: 'Configure system-wide clinical parameters',
    ADMIN: true,
    DOCTOR: false,
    STAFF: false,
  },
];

export const mockUsersApi = {
  async getAdmins(): Promise<AdminUser[]> {
    const list = await userService.getUsers();
    return list
      .filter((u) => u.role === 'ADMIN')
      .map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        mobile: u.mobile,
        avatarUrl: u.avatarUrl || 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?q=80&w=120&auto=format&fit=crop',
        isActive: u.isActive,
      }));
  },

  async saveAdmins(admins: AdminUser[]): Promise<void> {
    for (const admin of admins) {
      if (admin.id.startsWith('temp-') || admin.id.startsWith('ADM-temp-')) {
        await userService.createUser({
          name: admin.name,
          email: admin.email,
          mobile: admin.mobile,
          role: 'ADMIN',
          isActive: admin.isActive,
        });
      } else {
        await userService.updateUser(admin.id, {
          name: admin.name,
          email: admin.email,
          mobile: admin.mobile,
          isActive: admin.isActive,
        });
      }
    }
  },

  async getDoctors(): Promise<DoctorUser[]> {
    const users = await userService.getUsers();
    const docUsers = users.filter((u) => u.role === 'DOCTOR');
    const docs = await doctorService.getDoctors(1);

    return docUsers.map((u) => {
      const details = docs.find((d) => d.email.toLowerCase() === u.email.toLowerCase());
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        mobile: u.mobile,
        specialization: details?.specialization || 'General Physician',
        qualification: details?.qualification || 'MBBS, MD',
        experience: details?.experience || '10 Years',
        fee: Number(details?.fee || 100),
        workingHours: details?.workingHours || '09:00 AM - 05:00 PM',
        isActive: u.isActive,
        registrationNumber: details?.registrationNumber || 'REG-12345',
        totalConsultations: details?.completedConsultations ?? details?.totalCompletedConsultations ?? 0,
        joiningDate: '2024-01-01',
        avatarUrl: u.avatarUrl || details?.avatarUrl || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=120&auto=format&fit=crop',
      };
    });
  },

  async saveDoctors(doctors: DoctorUser[]): Promise<void> {
    for (const doc of doctors) {
      if (doc.id.startsWith('temp-') || doc.id.startsWith('DOC-temp-')) {
        await userService.createUser({
          name: doc.name,
          email: doc.email,
          mobile: doc.mobile,
          role: 'DOCTOR',
          isActive: doc.isActive,
        });
      } else {
        await userService.updateUser(doc.id, {
          name: doc.name,
          email: doc.email,
          mobile: doc.mobile,
          isActive: doc.isActive,
        });
      }
    }
  },

  async getStaff(): Promise<StaffUser[]> {
    const list = await userService.getUsers();
    return list
      .filter((u) => u.role === 'STAFF')
      .map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        mobile: u.mobile,
        avatarUrl: u.avatarUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=120&auto=format&fit=crop',
        isActive: u.isActive,
      }));
  },

  async saveStaff(staff: StaffUser[]): Promise<void> {
    for (const s of staff) {
      if (s.id.startsWith('temp-') || s.id.startsWith('STF-temp-')) {
        await userService.createUser({
          name: s.name,
          email: s.email,
          mobile: s.mobile,
          role: 'STAFF',
          isActive: s.isActive,
        });
      } else {
        await userService.updateUser(s.id, {
          name: s.name,
          email: s.email,
          mobile: s.mobile,
          isActive: s.isActive,
        });
      }
    }
  },

  async getPermissions(): Promise<ModulePermission[]> {
    const item = localStorage.getItem('healthflow_permissions');
    if (!item) return INITIAL_PERMISSIONS;
    try {
      return JSON.parse(item);
    } catch {
      return INITIAL_PERMISSIONS;
    }
  },

  async savePermissions(permissions: ModulePermission[]): Promise<void> {
    localStorage.setItem('healthflow_permissions', JSON.stringify(permissions));
  },
};
