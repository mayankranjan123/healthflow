import { AdminUser, DoctorUser, StaffUser, ModulePermission } from '../types';

const INITIAL_ADMINS: AdminUser[] = [
  {
    id: 'ADM-001',
    name: 'Dr. Robert Sterling',
    email: 'r.sterling@healthflow.com',
    mobile: '+1 (555) 012-3456',
    avatarUrl: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?q=80&w=120&auto=format&fit=crop',
    isActive: true,
  },
  {
    id: 'ADM-002',
    name: 'Elena Rodriguez',
    email: 'e.rodriguez@healthflow.com',
    mobile: '+1 (555) 019-8877',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=120&auto=format&fit=crop',
    isActive: true,
  },
  {
    id: 'ADM-003',
    name: 'Jameson Cooper',
    email: 'j.cooper@healthflow.com',
    mobile: '+1 (555) 044-5566',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=120&auto=format&fit=crop',
    isActive: true,
  },
  {
    id: 'ADM-004',
    name: 'Maria Thompson',
    email: 'm.thompson@healthflow.com',
    mobile: '+1 (555) 023-9900',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=120&auto=format&fit=crop',
    isActive: false,
  },
];

const INITIAL_DOCTORS: DoctorUser[] = [
  {
    id: 'DOC-001',
    name: 'Dr. Aisha Mehta',
    email: 'aisha.m@healthflow.com',
    mobile: '+1 (555) 099-1122',
    specialization: 'Cardiologist',
    qualification: 'MBBS, MD, DM',
    experience: '12 yrs',
    fee: 120,
    workingHours: '09:00 AM - 04:00 PM',
    isActive: true,
    registrationNumber: 'REG-87421',
    totalConsultations: 1450,
    joiningDate: '2023-01-15',
    avatarUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=120&auto=format&fit=crop',
  },
  {
    id: 'DOC-002',
    name: 'Dr. Rohit Sharma',
    email: 'rohit.s@healthflow.com',
    mobile: '+1 (555) 088-3344',
    specialization: 'General Physician',
    qualification: 'MBBS, MD',
    experience: '8 yrs',
    fee: 60,
    workingHours: '10:00 AM - 06:00 PM',
    isActive: true,
    registrationNumber: 'REG-56982',
    totalConsultations: 2100,
    joiningDate: '2024-03-10',
    avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=120&auto=format&fit=crop',
  },
  {
    id: 'DOC-003',
    name: 'Dr. Kavya Nair',
    email: 'kavya.n@healthflow.com',
    mobile: '+1 (555) 077-5566',
    specialization: 'Dermatologist',
    qualification: 'MBBS, MD (Derm.)',
    experience: '6 yrs',
    fee: 80,
    workingHours: '02:00 PM - 08:00 PM',
    isActive: false,
    registrationNumber: 'REG-31459',
    totalConsultations: 820,
    joiningDate: '2024-06-20',
    avatarUrl: 'https://images.unsplash.com/photo-1594824813573-246434de83fb?q=80&w=120&auto=format&fit=crop',
  },
  {
    id: 'DOC-004',
    name: 'Dr. Samuel Wright',
    email: 'sam.wright@healthflow.com',
    mobile: '+1 (555) 066-7788',
    specialization: 'Pediatrician',
    qualification: 'MBBS, MD, DCH',
    experience: '15 yrs',
    fee: 100,
    workingHours: '08:00 AM - 02:00 PM',
    isActive: true,
    registrationNumber: 'REG-10452',
    totalConsultations: 3400,
    joiningDate: '2022-09-01',
    avatarUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=120&auto=format&fit=crop',
  },
];

const INITIAL_STAFF: StaffUser[] = [
  {
    id: 'STF-001',
    name: 'Sarah Jenkins',
    email: 's.jenkins@healthflow.com',
    mobile: '+1 (555) 089-2244',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=120&auto=format&fit=crop',
    isActive: true,
  },
  {
    id: 'STF-002',
    name: 'David Miller',
    email: 'd.miller@healthflow.com',
    mobile: '+1 (555) 033-7711',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=120&auto=format&fit=crop',
    isActive: true,
  },
  {
    id: 'STF-003',
    name: 'Priya Patel',
    email: 'p.patel@healthflow.com',
    mobile: '+1 (555) 044-2288',
    avatarUrl: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?q=80&w=120&auto=format&fit=crop',
    isActive: true,
  },
  {
    id: 'STF-004',
    name: 'James Wilson',
    email: 'j.wilson@healthflow.com',
    mobile: '+1 (555) 077-3322',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=120&auto=format&fit=crop',
    isActive: false,
  },
];

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

// Helper to load/save from localStorage
function getStored<T>(key: string, defaultValue: T): T {
  const item = localStorage.getItem(key);
  if (!item) {
    localStorage.setItem(key, JSON.stringify(defaultValue));
    return defaultValue;
  }
  try {
    return JSON.parse(item);
  } catch {
    return defaultValue;
  }
}

function setStored<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

export const mockUsersApi = {
  getAdmins: (): AdminUser[] => {
    return getStored<AdminUser[]>('healthflow_admins', INITIAL_ADMINS);
  },
  saveAdmins: (admins: AdminUser[]) => {
    setStored('healthflow_admins', admins);
  },
  getDoctors: (): DoctorUser[] => {
    return getStored<DoctorUser[]>('healthflow_doctors', INITIAL_DOCTORS);
  },
  saveDoctors: (doctors: DoctorUser[]) => {
    setStored('healthflow_doctors', doctors);
  },
  getStaff: (): StaffUser[] => {
    return getStored<StaffUser[]>('healthflow_staff', INITIAL_STAFF);
  },
  saveStaff: (staff: StaffUser[]) => {
    setStored('healthflow_staff', staff);
  },
  getPermissions: (): ModulePermission[] => {
    return getStored<ModulePermission[]>('healthflow_permissions', INITIAL_PERMISSIONS);
  },
  savePermissions: (permissions: ModulePermission[]) => {
    setStored('healthflow_permissions', permissions);
  },
};
