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
  async getAdmins(params: { pageNo: number; pageSize: number; status?: string; search?: string }): Promise<{
    items: AdminUser[];
    totalItems: number;
    totalPages: number;
    pageNo: number;
    pageSize: number;
  }> {
    const backendParams: any = {
      pageNo: params.pageNo,
      pageSize: params.pageSize,
      user_role: 'ADMIN'
    };
    if (params.status && params.status !== 'ALL') {
      backendParams.status = params.status;
    }
    if (params.search) {
      if (params.search.includes('@')) {
        backendParams.user_email = params.search;
      } else {
        backendParams.user_name = params.search;
      }
    }

    const res = await userService.getUsers(backendParams);
    const items = res.data.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      mobile: u.mobile,
      avatarUrl: u.avatarUrl || 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?q=80&w=120&auto=format&fit=crop',
      isActive: u.isActive,
      gender: u.gender,
      dateOfBirth: u.dateOfBirth,
    }));

    return {
      items,
      totalItems: res.totalItems,
      totalPages: res.totalPages,
      pageNo: res.pageNo,
      pageSize: res.pageSize
    };
  },

  async saveAdmins(admins: AdminUser[]): Promise<string | undefined> {
    let link: string | undefined = undefined;
    for (const admin of admins) {
      if (admin.id.startsWith('temp-') || admin.id.startsWith('ADM-temp-')) {
        const res = await userService.createUser({
          name: admin.name,
          email: admin.email,
          mobile: admin.mobile,
          role: 'ADMIN',
          isActive: admin.isActive,
          gender: admin.gender,
          dateOfBirth: admin.dateOfBirth,
          avatarUrl: admin.avatarUrl,
        });
        link = res.setPasswordLink;
      } else {
        await userService.updateUser(admin.id, {
          name: admin.name,
          email: admin.email,
          mobile: admin.mobile,
          isActive: admin.isActive,
          gender: admin.gender,
          dateOfBirth: admin.dateOfBirth,
          avatarUrl: admin.avatarUrl,
        });
      }
    }
    return link;
  },

  async getDoctors(params: { pageNo: number; pageSize: number; status?: string; search?: string }): Promise<{
    items: DoctorUser[];
    totalItems: number;
    totalPages: number;
    pageNo: number;
    pageSize: number;
  }> {
    const backendParams: any = {
      pageNo: params.pageNo,
      pageSize: params.pageSize,
      user_role: 'DOCTOR'
    };
    if (params.status && params.status !== 'ALL') {
      backendParams.status = params.status;
    }
    if (params.search) {
      if (params.search.includes('@')) {
        backendParams.user_email = params.search;
      } else {
        backendParams.user_name = params.search;
      }
    }

    const res = await userService.getUsers(backendParams);

    const items = res.data.map((u) => {
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        mobile: u.mobile,
        specialization: 'General Physician',
        qualification: 'MBBS, MD',
        experience: '10 Years',
        fee: 100,
        followupFee: Number(u.followupFee || 60),
        workingHours: '09:00 AM - 05:00 PM',
        isActive: u.isActive,
        registrationNumber: 'REG-12345',
        totalConsultations: 0,
        joiningDate: '2024-01-01',
        gender: u.gender || 'Female',
        dateOfBirth: u.dateOfBirth || '',
        avatarUrl: u.avatarUrl || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=120&auto=format&fit=crop',
      };
    });

    return {
      items,
      totalItems: res.totalItems,
      totalPages: res.totalPages,
      pageNo: res.pageNo,
      pageSize: res.pageSize
    };
  },

  async saveDoctors(doctors: DoctorUser[]): Promise<string | undefined> {
    let link: string | undefined = undefined;
    for (const doc of doctors) {
      if (doc.id.startsWith('temp-') || doc.id.startsWith('DOC-temp-')) {
        const res = await userService.createUser({
          name: doc.name,
          email: doc.email,
          mobile: doc.mobile,
          role: 'DOCTOR',
          isActive: doc.isActive,
          gender: doc.gender,
          dateOfBirth: doc.dateOfBirth,
          followupFee: doc.followupFee ? doc.followupFee.toString() : undefined,
          specialization: doc.specialization,
          qualification: doc.qualification,
          experience: doc.experience,
          fee: doc.fee ? doc.fee.toString() : undefined,
          workingHours: doc.workingHours,
          registrationNumber: doc.registrationNumber,
          totalConsultations: doc.totalConsultations ? doc.totalConsultations.toString() : undefined,
          joiningDate: doc.joiningDate,
          avatarUrl: doc.avatarUrl,
        });
        link = res.setPasswordLink;
      } else {
        await userService.updateUser(doc.id, {
          name: doc.name,
          email: doc.email,
          mobile: doc.mobile,
          isActive: doc.isActive,
          gender: doc.gender,
          dateOfBirth: doc.dateOfBirth,
          followupFee: doc.followupFee ? doc.followupFee.toString() : undefined,
          specialization: doc.specialization,
          qualification: doc.qualification,
          experience: doc.experience,
          fee: doc.fee ? doc.fee.toString() : undefined,
          workingHours: doc.workingHours,
          registrationNumber: doc.registrationNumber,
          totalConsultations: doc.totalConsultations ? doc.totalConsultations.toString() : undefined,
          joiningDate: doc.joiningDate,
          avatarUrl: doc.avatarUrl,
        });
      }
    }
    return link;
  },

  async getStaff(params: { pageNo: number; pageSize: number; status?: string; search?: string }): Promise<{
    items: StaffUser[];
    totalItems: number;
    totalPages: number;
    pageNo: number;
    pageSize: number;
  }> {
    const backendParams: any = {
      pageNo: params.pageNo,
      pageSize: params.pageSize,
      user_role: 'STAFF'
    };
    if (params.status && params.status !== 'ALL') {
      backendParams.status = params.status;
    }
    if (params.search) {
      if (params.search.includes('@')) {
        backendParams.user_email = params.search;
      } else {
        backendParams.user_name = params.search;
      }
    }

    const res = await userService.getUsers(backendParams);
    const items = res.data.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      mobile: u.mobile,
      avatarUrl: u.avatarUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=120&auto=format&fit=crop',
      isActive: u.isActive,
      gender: u.gender,
      dateOfBirth: u.dateOfBirth,
    }));

    return {
      items,
      totalItems: res.totalItems,
      totalPages: res.totalPages,
      pageNo: res.pageNo,
      pageSize: res.pageSize
    };
  },

  async saveStaff(staff: StaffUser[]): Promise<string | undefined> {
    let link: string | undefined = undefined;
    for (const s of staff) {
      if (s.id.startsWith('temp-') || s.id.startsWith('STF-temp-')) {
        const res = await userService.createUser({
          name: s.name,
          email: s.email,
          mobile: s.mobile,
          role: 'STAFF',
          isActive: s.isActive,
          gender: s.gender,
          dateOfBirth: s.dateOfBirth,
          avatarUrl: s.avatarUrl,
        });
        link = res.setPasswordLink;
      } else {
        await userService.updateUser(s.id, {
          name: s.name,
          email: s.email,
          mobile: s.mobile,
          isActive: s.isActive,
          gender: s.gender,
          dateOfBirth: s.dateOfBirth,
          avatarUrl: s.avatarUrl,
        });
      }
    }
    return link;
  },

  async getPermissions(): Promise<ModulePermission[]> {
    try {
      const serverPerms = await userService.getPermissions();
      if (serverPerms && serverPerms.length > 0) {
        localStorage.setItem('healthflow_permissions', JSON.stringify(serverPerms));
        return serverPerms;
      }
    } catch (e) {
      console.warn("Failed to load permissions from server, falling back to cache", e);
    }

    const item = localStorage.getItem('healthflow_permissions');
    if (!item) return INITIAL_PERMISSIONS;
    try {
      return JSON.parse(item);
    } catch {
      return INITIAL_PERMISSIONS;
    }
  },

  async savePermissions(permissions: ModulePermission[]): Promise<void> {
    try {
      await userService.savePermissions(permissions);
    } catch (e) {
      console.error("Failed to save permissions to server", e);
    }
    localStorage.setItem('healthflow_permissions', JSON.stringify(permissions));
  },
};
