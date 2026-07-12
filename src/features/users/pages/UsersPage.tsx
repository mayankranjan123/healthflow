import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  ShieldCheck, 
  Users, 
  Stethoscope, 
  UserSquare2, 
  Shield, 
  CheckCircle2, 
  Calendar, 
  Activity, 
  Briefcase, 
  DollarSign, 
  Clock, 
  Mail, 
  Phone, 
  FileText 
} from 'lucide-react';
import { mockUsersApi } from '../utils/mockUsersApi';
import { AdminUser, DoctorUser, StaffUser, ModulePermission } from '../types';

// Tab Components
import { AdminTab } from '../components/AdminTab';
import { DoctorTab } from '../components/DoctorTab';
import { StaffTab } from '../components/StaffTab';
import { RolesTab } from '../components/RolesTab';

// Form Components
import { AdminForm } from '../components/AdminForm';
import { DoctorForm } from '../components/DoctorForm';
import { StaffForm } from '../components/StaffForm';

// UI components
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';

interface UsersPageProps {
  hideHeader?: boolean;
}

type ActiveTab = 'admin' | 'doctor' | 'staff' | 'roles';

export const UsersPage: React.FC<UsersPageProps> = ({ hideHeader = false }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('admin');

  // Core States
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [doctors, setDoctors] = useState<DoctorUser[]>([]);
  const [staffList, setStaffList] = useState<StaffUser[]>([]);
  const [permissions, setPermissions] = useState<ModulePermission[]>([]);

  // Modal States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any>(null);
  const [viewingRecord, setViewingRecord] = useState<any>(null);

  // Derived Modal Type State (prevents cross-tab viewing crashes during transitions or background renders)
  const viewingRecordType = viewingRecord?.id ? (
    viewingRecord.id.startsWith('DOC-') ? 'doctor' :
    viewingRecord.id.startsWith('STF-') ? 'staff' : 'admin'
  ) : null;

  const closeFormModal = () => {
    setIsFormOpen(false);
    setTimeout(() => {
      setEditingRecord(null);
    }, 400);
  };

  const closeViewModal = () => {
    setIsViewOpen(false);
    setTimeout(() => {
      setViewingRecord(null);
    }, 400);
  };

  // Load from API
  useEffect(() => {
    mockUsersApi.getAdmins().then(setAdmins).catch(err => console.error(err));
    mockUsersApi.getDoctors().then(setDoctors).catch(err => console.error(err));
    mockUsersApi.getStaff().then(setStaffList).catch(err => console.error(err));
    mockUsersApi.getPermissions().then(setPermissions).catch(err => console.error(err));
  }, []);

  // Sync to Storage on list changes
  const saveAdminsToStore = (newAdmins: AdminUser[]) => {
    setAdmins(newAdmins);
    mockUsersApi.saveAdmins(newAdmins).then(() => {
      mockUsersApi.getAdmins().then(setAdmins);
    }).catch(err => console.error(err));
  };

  const saveDoctorsToStore = (newDoctors: DoctorUser[]) => {
    setDoctors(newDoctors);
    mockUsersApi.saveDoctors(newDoctors).then(() => {
      mockUsersApi.getDoctors().then(setDoctors);
    }).catch(err => console.error(err));
  };

  const saveStaffToStore = (newStaff: StaffUser[]) => {
    setStaffList(newStaff);
    mockUsersApi.saveStaff(newStaff).then(() => {
      mockUsersApi.getStaff().then(setStaffList);
    }).catch(err => console.error(err));
  };

  const savePermissionsToStore = (newPerms: ModulePermission[]) => {
    setPermissions(newPerms);
    mockUsersApi.savePermissions(newPerms).then(() => {
      mockUsersApi.getPermissions().then(setPermissions);
    }).catch(err => console.error(err));
  };

  // Status Toggles
  const handleToggleAdminStatus = (id: string) => {
    const updated = admins.map(a => a.id === id ? { ...a, isActive: !a.isActive } : a);
    saveAdminsToStore(updated);
  };

  const handleToggleDoctorStatus = (id: string) => {
    const updated = doctors.map(d => d.id === id ? { ...d, isActive: !d.isActive } : d);
    saveDoctorsToStore(updated);
  };

  const handleToggleStaffStatus = (id: string) => {
    const updated = staffList.map(s => s.id === id ? { ...s, isActive: !s.isActive } : s);
    saveStaffToStore(updated);
  };

  // Form Handlers (Add/Edit)
  const handleAddClick = () => {
    setEditingRecord(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (record: any) => {
    setEditingRecord(record);
    setIsFormOpen(true);
  };

  const handleViewClick = (record: any) => {
    setViewingRecord(record);
    setIsViewOpen(true);
  };

  const handleSaveAdmin = (data: Omit<AdminUser, 'id'> & { id?: string }) => {
    if (data.id && !data.id.startsWith('temp-')) {
      // Edit mode
      const updated = admins.map(a => a.id === data.id ? { ...a, ...data } : a);
      saveAdminsToStore(updated as AdminUser[]);
    } else {
      // Create mode
      const newId = `temp-${Date.now()}`;
      const newAdmin: AdminUser = {
        id: newId,
        name: data.name,
        email: data.email,
        mobile: data.mobile,
        avatarUrl: data.avatarUrl,
        isActive: data.isActive,
        gender: data.gender,
        dateOfBirth: data.dateOfBirth,
      };
      saveAdminsToStore([newAdmin, ...admins]);
    }
    closeFormModal();
  };

  const handleSaveDoctor = (data: Omit<DoctorUser, 'id'> & { id?: string }) => {
    if (data.id && !data.id.startsWith('temp-')) {
      // Edit mode
      const updated = doctors.map(d => d.id === data.id ? { ...d, ...data } : d);
      saveDoctorsToStore(updated as DoctorUser[]);
    } else {
      // Create mode
      const newId = `temp-${Date.now()}`;
      const newDoctor: DoctorUser = {
        id: newId,
        name: data.name,
        email: data.email,
        mobile: data.mobile,
        specialization: data.specialization,
        qualification: data.qualification,
        experience: data.experience,
        fee: data.fee,
        workingHours: data.workingHours,
        isActive: data.isActive,
        registrationNumber: data.registrationNumber,
        totalConsultations: data.totalConsultations || 0,
        joiningDate: data.joiningDate || new Date().toISOString().split('T')[0],
        avatarUrl: data.avatarUrl,
        gender: data.gender,
        dateOfBirth: data.dateOfBirth,
      };
      saveDoctorsToStore([newDoctor, ...doctors]);
    }
    closeFormModal();
  };

  const handleSaveStaff = (data: Omit<StaffUser, 'id'> & { id?: string }) => {
    if (data.id && !data.id.startsWith('temp-')) {
      // Edit mode
      const updated = staffList.map(s => s.id === data.id ? { ...s, ...data } : s);
      saveStaffToStore(updated as StaffUser[]);
    } else {
      // Create mode
      const newId = `temp-${Date.now()}`;
      const newStaff: StaffUser = {
        id: newId,
        name: data.name,
        email: data.email,
        mobile: data.mobile,
        avatarUrl: data.avatarUrl,
        isActive: data.isActive,
        gender: data.gender,
        dateOfBirth: data.dateOfBirth,
      };
      saveStaffToStore([newStaff, ...staffList]);
    }
    closeFormModal();
  };

  // Dynamic titles and subtitles to match Stitch screenshots perfectly
  const getHeaderDetails = () => {
    switch (activeTab) {
      case 'admin':
        return {
          category: 'USER MANAGEMENT',
          title: 'Users',
          subtitle: 'Manage admins, doctors, staff and access permissions',
        };
      case 'doctor':
        return {
          category: 'DOCTOR MANAGEMENT',
          title: 'Doctors',
          subtitle: 'Manage doctor profiles, specialization and availability across all departments.',
        };
      case 'staff':
        return {
          category: 'STAFF MANAGEMENT',
          title: 'Clinical Staff',
          subtitle: 'Manage clinical receptionist, nurse, and operational personnel accounts.',
        };
      case 'roles':
        return {
          category: 'USER MANAGEMENT',
          title: 'Role Permissions',
          subtitle: 'Configure module access for each role to maintain data security and operational focus.',
        };
    }
  };

  const header = getHeaderDetails();

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Dynamic Module Header */}
      {!hideHeader && (
        <div>
          <span className="text-[10px] font-bold text-blue-600 tracking-widest uppercase block mb-1">
            {header.category}
          </span>
          <h2 className="text-2xl font-display font-bold text-slate-900">{header.title}</h2>
          <p className="text-sm text-slate-500 font-medium leading-relaxed">{header.subtitle}</p>
        </div>
      )}

      {/* Tabs Menu */}
      <div className="border-b border-slate-200">
        <div className="flex gap-8">
          {(['admin', 'doctor', 'staff', 'roles'] as ActiveTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
                pb-4 text-sm font-bold border-b-2 transition-all cursor-pointer capitalize
                ${activeTab === tab 
                  ? 'border-blue-600 text-blue-600' 
                  : 'border-transparent text-slate-400 hover:text-slate-600'
                }
              `}
            >
              {tab === 'roles' ? 'Roles' : tab}
            </button>
          ))}
        </div>
      </div>

      {/* Active Tab View */}
      <div>
        {activeTab === 'admin' && (
          <AdminTab
            admins={admins}
            onToggleStatus={handleToggleAdminStatus}
            onEdit={handleEditClick}
            onAdd={handleAddClick}
            onView={handleViewClick}
          />
        )}
        {activeTab === 'doctor' && (
          <DoctorTab
            doctors={doctors}
            onToggleStatus={handleToggleDoctorStatus}
            onEdit={handleEditClick}
            onAdd={handleAddClick}
            onView={handleViewClick}
          />
        )}
        {activeTab === 'staff' && (
          <StaffTab
            staffList={staffList}
            onToggleStatus={handleToggleStaffStatus}
            onEdit={handleEditClick}
            onAdd={handleAddClick}
            onView={handleViewClick}
          />
        )}
        {activeTab === 'roles' && (
          <RolesTab
            permissions={permissions}
            onSave={savePermissionsToStore}
          />
        )}
      </div>

      {/* ADD/EDIT MODAL */}
      <Modal
        isOpen={isFormOpen}
        onClose={closeFormModal}
        title={`${editingRecord ? 'Edit' : 'Add'} ${
          activeTab === 'admin' ? 'Administrator' : activeTab === 'doctor' ? 'Doctor Profile' : 'Staff Member'
        }`}
      >
        {activeTab === 'admin' && (
          <AdminForm
            admin={editingRecord}
            onSave={handleSaveAdmin}
            onCancel={closeFormModal}
          />
        )}
        {activeTab === 'doctor' && (
          <DoctorForm
            doctor={editingRecord}
            onSave={handleSaveDoctor}
            onCancel={closeFormModal}
          />
        )}
        {activeTab === 'staff' && (
          <StaffForm
            staff={editingRecord}
            onSave={handleSaveStaff}
            onCancel={closeFormModal}
          />
        )}
      </Modal>

      {/* VIEW MODAL */}
      <Modal
        isOpen={isViewOpen}
        onClose={closeViewModal}
        title={`${
          viewingRecordType === 'admin' ? 'Admin' : viewingRecordType === 'doctor' ? 'Doctor' : viewingRecordType === 'staff' ? 'Staff' : 'User'
        } Details`}
      >
        {viewingRecord && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-slate-100 border border-slate-200">
                {viewingRecord.avatarUrl ? (
                  <img src={viewingRecord.avatarUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-bold text-slate-500 uppercase text-lg">
                    {viewingRecord.name ? viewingRecord.name.replace('Dr. ', '').split(' ').map((n: any) => n[0]).join('') : 'U'}
                  </div>
                )}
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-lg">{viewingRecord.name}</h4>
                <p className="text-xs text-slate-400 font-bold font-mono">{viewingRecord.id}</p>
                <span className={`inline-flex items-center gap-1.5 mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  viewingRecord.isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-slate-100 text-slate-500 border border-slate-200'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${viewingRecord.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                  {viewingRecord.isActive ? 'Active Authorization' : 'Inactive'}
                </span>
              </div>
            </div>

            {/* Doctor Extended Fields */}
            {viewingRecordType === 'doctor' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 text-sm">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Specialization</span>
                  <div className="font-semibold text-slate-700 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-blue-600" />
                    <span>{viewingRecord.specialization}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Qualification</span>
                  <div className="font-semibold text-slate-700 flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-blue-600" />
                    <span>{viewingRecord.qualification}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Experience</span>
                  <div className="font-semibold text-slate-700">{viewingRecord.experience} in medicine</div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Consultation Fee</span>
                  <div className="font-bold text-blue-600 flex items-center gap-1">
                    <DollarSign className="w-4 h-4 text-blue-600" />
                    <span>${typeof viewingRecord.fee === 'number' ? viewingRecord.fee.toFixed(2) : '0.00'}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Follow-up Fee</span>
                  <div className="font-bold text-blue-600 flex items-center gap-1">
                    <DollarSign className="w-4 h-4 text-blue-600" />
                    <span>${typeof viewingRecord.followupFee === 'number' ? viewingRecord.followupFee.toFixed(2) : (Number(viewingRecord.followupFee || 60).toFixed(2))}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Gender</span>
                  <div className="font-semibold text-slate-700">{viewingRecord.gender || 'Not specified'}</div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Date of Birth</span>
                  <div className="font-semibold text-slate-700">{viewingRecord.dateOfBirth || 'Not specified'}</div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Total Completed Consultations</span>
                  <div className="font-semibold text-slate-700 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-blue-600" />
                    <span>{viewingRecord.totalConsultations?.toLocaleString() ?? 0}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Working Hours</span>
                  <div className="font-semibold text-slate-700 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span>{viewingRecord.workingHours}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Registration Number</span>
                  <div className="font-semibold text-slate-700 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span className="font-mono">{viewingRecord.registrationNumber}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Joining Date</span>
                  <div className="font-semibold text-slate-700">{viewingRecord.joiningDate}</div>
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Contact Coordinates</span>
                  <div className="space-y-1.5 mt-1 font-medium text-slate-600">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-slate-400" />
                      <span>{viewingRecord.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-slate-400" />
                      <span>{viewingRecord.mobile}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // Simple Contact Fields for Admin / Staff
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 text-sm">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Email Address</span>
                  <div className="font-semibold text-slate-700 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-blue-600" />
                    <span>{viewingRecord.email}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Mobile Contact</span>
                  <div className="font-semibold text-slate-700 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-blue-600" />
                    <span>{viewingRecord.mobile}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Gender</span>
                  <div className="font-semibold text-slate-700">{viewingRecord.gender || 'Not specified'}</div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Date of Birth</span>
                  <div className="font-semibold text-slate-700">{viewingRecord.dateOfBirth || 'Not specified'}</div>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <Button onClick={closeViewModal}>Close Details</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
