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
import { DoctorResponseDto, doctorService } from '../../../lib/apiClient';
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
import { Drawer } from '../../../components/ui/Drawer';
import { Button } from '../../../components/ui/Button';

interface UsersPageProps {
  hideHeader?: boolean;
}

type ActiveTab = 'admin' | 'doctor' | 'staff' | 'roles';

export const UsersPage: React.FC<UsersPageProps> = ({ hideHeader = false }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('admin');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Core States
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [doctors, setDoctors] = useState<DoctorUser[]>([]);
  const [staffList, setStaffList] = useState<StaffUser[]>([]);
  const [permissions, setPermissions] = useState<ModulePermission[]>([]);
  const [createdUserLink, setCreatedUserLink] = useState<string | null>(null);
  const [createdUserEmail, setCreatedUserEmail] = useState<string | null>(null);

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

  const [isLoadingAdmins, setIsLoadingAdmins] = useState(false);
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(false);
  const [isLoadingStaff, setIsLoadingStaff] = useState(false);
  const [isLoadingPermissions, setIsLoadingPermissions] = useState(false);

  // Admin Pagination/Filter States
  const [adminPage, setAdminPage] = useState(1);
  const [adminSearch, setAdminSearch] = useState('');
  const [adminStatus, setAdminStatus] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [adminTotalItems, setAdminTotalItems] = useState(0);
  const [adminTotalPages, setAdminTotalPages] = useState(1);

  // Doctor Pagination/Filter States
  const [doctorPage, setDoctorPage] = useState(1);
  const [doctorSearch, setDoctorSearch] = useState('');
  const [doctorStatus, setDoctorStatus] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [doctorTotalItems, setDoctorTotalItems] = useState(0);
  const [doctorTotalPages, setDoctorTotalPages] = useState(1);

  // Staff Pagination/Filter States
  const [staffPage, setStaffPage] = useState(1);
  const [staffSearch, setStaffSearch] = useState('');
  const [staffStatus, setStaffStatus] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [staffTotalItems, setStaffTotalItems] = useState(0);
  const [staffTotalPages, setStaffTotalPages] = useState(1);

  // Search Debounces
  const [debouncedAdminSearch, setDebouncedAdminSearch] = useState('');
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedAdminSearch(adminSearch);
      setAdminPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [adminSearch]);

  const [debouncedDoctorSearch, setDebouncedDoctorSearch] = useState('');
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedDoctorSearch(doctorSearch);
      setDoctorPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [doctorSearch]);

  const [debouncedStaffSearch, setDebouncedStaffSearch] = useState('');
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedStaffSearch(staffSearch);
      setStaffPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [staffSearch]);

  // Loader Refresh Helpers
  const refreshAdminsList = () => {
    mockUsersApi.getAdmins({
      pageNo: adminPage - 1,
      pageSize: 5,
      status: adminStatus,
      search: debouncedAdminSearch
    })
      .then((res) => {
        setAdmins(res.items);
        setAdminTotalItems(res.totalItems);
        setAdminTotalPages(res.totalPages);
      })
      .catch(err => console.error(err));
  };

  const refreshDoctorsList = () => {
    mockUsersApi.getDoctors({
      pageNo: doctorPage - 1,
      pageSize: 5,
      status: doctorStatus,
      search: debouncedDoctorSearch
    })
      .then((res) => {
        setDoctors(res.items);
        setDoctorTotalItems(res.totalItems);
        setDoctorTotalPages(res.totalPages);
      })
      .catch(err => console.error(err));
  };

  const refreshStaffList = () => {
    mockUsersApi.getStaff({
      pageNo: staffPage - 1,
      pageSize: 5,
      status: staffStatus,
      search: debouncedStaffSearch
    })
      .then((res) => {
        setStaffList(res.items);
        setStaffTotalItems(res.totalItems);
        setStaffTotalPages(res.totalPages);
      })
      .catch(err => console.error(err));
  };

  // Load Admin list on activeTab changes or state dependencies changes
  useEffect(() => {
    if (activeTab === 'admin') {
      setIsLoadingAdmins(true);
      mockUsersApi.getAdmins({
        pageNo: adminPage - 1,
        pageSize: 5,
        status: adminStatus,
        search: debouncedAdminSearch
      })
        .then((res) => {
          setAdmins(res.items);
          setAdminTotalItems(res.totalItems);
          setAdminTotalPages(res.totalPages);
          setIsLoadingAdmins(false);
        })
        .catch(err => {
          console.error(err);
          setIsLoadingAdmins(false);
        });
    }
  }, [activeTab, adminPage, adminStatus, debouncedAdminSearch]);

  // Load Doctor list on activeTab changes or state dependencies changes
  useEffect(() => {
    if (activeTab === 'doctor') {
      setIsLoadingDoctors(true);
      mockUsersApi.getDoctors({
        pageNo: doctorPage - 1,
        pageSize: 5,
        status: doctorStatus,
        search: debouncedDoctorSearch
      })
        .then((res) => {
          setDoctors(res.items);
          setDoctorTotalItems(res.totalItems);
          setDoctorTotalPages(res.totalPages);
          setIsLoadingDoctors(false);
        })
        .catch(err => {
          console.error(err);
          setIsLoadingDoctors(false);
        });
    }
  }, [activeTab, doctorPage, doctorStatus, debouncedDoctorSearch]);

  // Load Staff list on activeTab changes or state dependencies changes
  useEffect(() => {
    if (activeTab === 'staff') {
      setIsLoadingStaff(true);
      mockUsersApi.getStaff({
        pageNo: staffPage - 1,
        pageSize: 5,
        status: staffStatus,
        search: debouncedStaffSearch
      })
        .then((res) => {
          setStaffList(res.items);
          setStaffTotalItems(res.totalItems);
          setStaffTotalPages(res.totalPages);
          setIsLoadingStaff(false);
        })
        .catch(err => {
          console.error(err);
          setIsLoadingStaff(false);
        });
    }
  }, [activeTab, staffPage, staffStatus, debouncedStaffSearch]);

  // Load Permissions when activeTab is 'roles' (and not already loaded)
  useEffect(() => {
    if (activeTab === 'roles' && permissions.length === 0 && !isLoadingPermissions) {
      setIsLoadingPermissions(true);
      mockUsersApi.getPermissions()
        .then((data) => {
          setPermissions(data);
          setIsLoadingPermissions(false);
        })
        .catch(err => {
          console.error(err);
          setIsLoadingPermissions(false);
        });
    }
  }, [activeTab, permissions.length, isLoadingPermissions]);

  // Sync to Storage on list changes
  const saveAdminsToStore = (newAdmins: AdminUser[]) => {
    mockUsersApi.saveAdmins(newAdmins).then(() => {
      refreshAdminsList();
    }).catch(err => console.error(err));
  };

  const saveDoctorsToStore = (newDoctors: DoctorUser[]) => {
    mockUsersApi.saveDoctors(newDoctors).then(() => {
      refreshDoctorsList();
    }).catch(err => console.error(err));
  };

  const saveStaffToStore = (newStaff: StaffUser[]) => {
    mockUsersApi.saveStaff(newStaff).then(() => {
      refreshStaffList();
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
    if (activeTab === 'doctor') {
      setIsViewOpen(true);
      setViewingRecord({
        ...record,
        isLoadingDetails: true
      });
      doctorService.getDoctorByEmail(record.email)
        .then((details) => {
          setViewingRecord({
            ...record,
            specialization: details.specialization || record.specialization || 'General Physician',
            qualification: details.qualification || record.qualification || 'MBBS, MD',
            experience: details.experience || record.experience || '10 Years',
            fee: Number(details.fee || record.fee || 100),
            followupFee: Number(details.followupFee || record.followupFee || 60),
            workingHours: details.workingHours || record.workingHours || '09:00 AM - 05:00 PM',
            registrationNumber: details.registrationNumber || record.registrationNumber || 'REG-12345',
            totalConsultations: details.completedConsultations ?? details.totalCompletedConsultations ?? record.totalConsultations ?? 0,
            isLoadingDetails: false
          });
        })
        .catch((err) => {
          console.error(err);
          setViewingRecord({
            ...record,
            isLoadingDetails: false
          });
        });
    } else {
      setViewingRecord(record);
      setIsViewOpen(true);
    }
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
      setAdmins([newAdmin, ...admins]);
      mockUsersApi.saveAdmins([newAdmin, ...admins]).then((link) => {
        refreshAdminsList();
        if (link) {
          setCreatedUserLink(link);
          setCreatedUserEmail(data.email);
        }
      }).catch(err => console.error(err));
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
      setDoctors([newDoctor, ...doctors]);
      mockUsersApi.saveDoctors([newDoctor, ...doctors]).then((link) => {
        refreshDoctorsList();
        if (link) {
          setCreatedUserLink(link);
          setCreatedUserEmail(data.email);
        }
      }).catch(err => console.error(err));
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
      setStaffList([newStaff, ...staffList]);
      mockUsersApi.saveStaff([newStaff, ...staffList]).then((link) => {
        refreshStaffList();
        if (link) {
          setCreatedUserLink(link);
          setCreatedUserEmail(data.email);
        }
      }).catch(err => console.error(err));
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
      {isMobile ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3 text-left">
            <div>
              <h2 className="text-xl font-display font-extrabold text-slate-900 tracking-tight">Users & Roles</h2>
              {/* <p className="text-xs text-slate-500 font-semibold leading-normal mt-1">Manage clinical access and roles.</p> */}
            </div>
            {activeTab !== 'roles' && (
              <button
                type="button"
                onClick={handleAddClick}
                className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-3xs flex items-center gap-1.5 shrink-0 cursor-pointer transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>
                  {activeTab === 'admin' ? 'Add New Admin' : activeTab === 'doctor' ? 'Add New Doctor' : 'Add New Staff'}
                </span>
              </button>
            )}
          </div>

          {/* Pill Picker Tabs */}
          <div className="bg-slate-100 p-1 rounded-2xl flex gap-1 w-full mt-4">
            {(['admin', 'doctor', 'staff', 'roles'] as ActiveTab[]).map((tab) => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-2 text-center text-xs font-bold rounded-xl transition-all capitalize cursor-pointer ${isActive
                      ? 'bg-white text-blue-600 shadow-2xs font-extrabold'
                      : 'text-slate-550 hover:text-slate-700'
                    }`}
                >
                  {tab === 'roles' ? 'Roles' : tab}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <>
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
        </>
      )}

      {/* Active Tab View */}
      <div>
        {activeTab === 'admin' && (
          isLoadingAdmins ? (
            <div className="flex flex-col justify-center items-center py-20 bg-white rounded-xl border border-slate-200">
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-slate-500 font-semibold mt-4 text-sm">Loading Administrators...</span>
            </div>
          ) : (
            <AdminTab
              admins={admins}
              totalItems={adminTotalItems}
              totalPages={adminTotalPages}
              currentPage={adminPage}
              searchTerm={adminSearch}
              setSearchTerm={setAdminSearch}
              statusFilter={adminStatus}
              setStatusFilter={setAdminStatus}
              onPageChange={setAdminPage}
              onToggleStatus={handleToggleAdminStatus}
              onEdit={handleEditClick}
              onAdd={handleAddClick}
              onView={handleViewClick}
              isMobile={isMobile}
            />
          )
        )}
        {activeTab === 'doctor' && (
          isLoadingDoctors ? (
            <div className="flex flex-col justify-center items-center py-20 bg-white rounded-xl border border-slate-200">
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-slate-500 font-semibold mt-4 text-sm">Loading Doctor Profiles...</span>
            </div>
          ) : (
            <DoctorTab
              doctors={doctors}
              totalItems={doctorTotalItems}
              totalPages={doctorTotalPages}
              currentPage={doctorPage}
              searchTerm={doctorSearch}
              setSearchTerm={setDoctorSearch}
              statusFilter={doctorStatus}
              setStatusFilter={setDoctorStatus}
              onPageChange={setDoctorPage}
              onToggleStatus={handleToggleDoctorStatus}
              onEdit={handleEditClick}
              onAdd={handleAddClick}
              onView={handleViewClick}
              isMobile={isMobile}
            />
          )
        )}
        {activeTab === 'staff' && (
          isLoadingStaff ? (
            <div className="flex flex-col justify-center items-center py-20 bg-white rounded-xl border border-slate-200">
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-slate-500 font-semibold mt-4 text-sm">Loading Staff List...</span>
            </div>
          ) : (
            <StaffTab
              staffList={staffList}
              totalItems={staffTotalItems}
              totalPages={staffTotalPages}
              currentPage={staffPage}
              searchTerm={staffSearch}
              setSearchTerm={setStaffSearch}
              statusFilter={staffStatus}
              setStatusFilter={setStaffStatus}
              onPageChange={setStaffPage}
              onToggleStatus={handleToggleStaffStatus}
              onEdit={handleEditClick}
              onAdd={handleAddClick}
              onView={handleViewClick}
              isMobile={isMobile}
            />
          )
        )}
        {activeTab === 'roles' && (
          isLoadingPermissions ? (
            <div className="flex flex-col justify-center items-center py-20 bg-white rounded-xl border border-slate-200">
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-slate-500 font-semibold mt-4 text-sm">Loading Module Permissions...</span>
            </div>
          ) : (
            <RolesTab
              permissions={permissions}
              onSave={savePermissionsToStore}
              isMobile={isMobile}
            />
          )
        )}
      </div>

      {/* ADD/EDIT FORM */}
      {isMobile ? (
        <Drawer
          isOpen={isFormOpen}
          onClose={closeFormModal}
          title={`${editingRecord ? 'Edit' : 'Add'} ${
            activeTab === 'admin' ? 'Administrator' : activeTab === 'doctor' ? 'Doctor' : 'Staff Member'
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
        </Drawer>
      ) : (
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
      )}

      {/* VIEW MODAL */}
      <Modal
        isOpen={isViewOpen}
        onClose={closeViewModal}
        title={`${viewingRecordType === 'admin' ? 'Admin' : viewingRecordType === 'doctor' ? 'Doctor' : viewingRecordType === 'staff' ? 'Staff' : 'User'
          } Details`}
      >
        {viewingRecord && (
          viewingRecord.isLoadingDetails ? (
            <div className="flex flex-col justify-center items-center py-20">
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-slate-500 font-semibold mt-4 text-sm">Loading Doctor details...</span>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Header profile section - Centered */}
              <div className="flex flex-col items-center pb-4 border-b border-slate-100">
                <div className="w-28 h-28 rounded-full overflow-hidden bg-slate-50 border-4 border-slate-100 shadow-sm relative">
                  {viewingRecord.avatarUrl ? (
                    <img src={viewingRecord.avatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-extrabold text-slate-400 uppercase text-2xl font-display">
                      {viewingRecord.name ? viewingRecord.name.replace('Dr. ', '').split(' ').map((n: any) => n[0]).join('') : 'U'}
                    </div>
                  )}
                  <span className={`absolute bottom-1 right-1 w-4.5 h-4.5 rounded-full border-2 border-white ${viewingRecord.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                </div>
                <h4 className="font-display font-extrabold text-slate-800 text-xl tracking-tight text-center mt-4">
                  {viewingRecord.name}
                </h4>
                <p className="text-xs text-slate-455 font-bold font-mono tracking-wider text-center mt-1.5 uppercase bg-slate-50 border border-slate-100 px-2 py-0.5 rounded">
                  {viewingRecord.id}
                </p>
                <div className="flex justify-center mt-3">
                  <span className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${viewingRecord.isActive ? 'bg-teal-50 text-teal-700 border border-teal-150' : 'bg-slate-155 text-slate-500 border border-slate-200'
                    }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${viewingRecord.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                    {viewingRecord.isActive ? 'Active Authorization' : 'Inactive'}
                  </span>
                </div>
              </div>

              {/* Contact coordinates list - styled row blocks */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-150 pb-1.5">
                  <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Contact Information</span>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3.5 bg-slate-50/50 p-3 rounded-2xl border border-slate-100">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0 border border-blue-100">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block">Email Address</span>
                      <span className="text-sm font-semibold text-slate-750">{viewingRecord.email}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3.5 bg-slate-50/50 p-3 rounded-2xl border border-slate-100">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0 border border-blue-100">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-455 uppercase tracking-wider block">Mobile Contact</span>
                      <span className="text-sm font-semibold text-slate-755">{viewingRecord.mobile}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tab/Details Layout based on role */}
              {viewingRecordType === 'doctor' ? (
                <div className="space-y-6">
                  {/* Section 1: Clinical Profile */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-150 pb-1.5">
                      <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Clinical Profile</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-slate-50/50 p-3 rounded-2xl border border-slate-100">
                        <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block">Specialization</span>
                        <span className="text-sm font-semibold text-slate-755 mt-1 block flex items-center gap-1.5 truncate">
                          <Activity className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                          {viewingRecord.specialization}
                        </span>
                      </div>
                      <div className="bg-slate-50/50 p-3 rounded-2xl border border-slate-100">
                        <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block">Qualification</span>
                        <span className="text-sm font-semibold text-slate-755 mt-1 block flex items-center gap-1.5 truncate">
                          <Briefcase className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                          {viewingRecord.qualification}
                        </span>
                      </div>
                      <div className="bg-slate-50/50 p-3 rounded-2xl border border-slate-100 col-span-2">
                        <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block">Medical Registration No</span>
                        <span className="text-sm font-semibold text-slate-755 mt-1 block font-mono">
                          {viewingRecord.registrationNumber}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Clinical Metrics & Fees */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-150 pb-1.5">
                      <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Financials & Consultations</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2.5">
                      <div className="bg-slate-50/50 p-3 rounded-2xl border border-slate-100 text-center flex flex-col justify-between">
                        <span className="text-[9px] font-bold text-slate-450 uppercase tracking-wider block leading-tight">OPD Fee</span>
                        <span className="text-sm font-extrabold text-blue-600 mt-1.5 block font-mono">
                          ₹{viewingRecord.fee?.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="bg-slate-50/50 p-3 rounded-2xl border border-slate-100 text-center flex flex-col justify-between">
                        <span className="text-[9px] font-bold text-slate-450 uppercase tracking-wider block leading-tight">Follow-up</span>
                        <span className="text-sm font-extrabold text-blue-600 mt-1.5 block font-mono">
                          ₹{(viewingRecord.followupFee || 60)?.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="bg-slate-50/50 p-3 rounded-2xl border border-slate-100 text-center flex flex-col justify-between">
                        <span className="text-[9px] font-bold text-slate-455 uppercase tracking-wider block leading-tight">Consults</span>
                        <span className="text-sm font-extrabold text-emerald-600 mt-1.5 block font-mono">
                          {viewingRecord.totalConsultations ?? 0}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Section 3: Logistics & Bio */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-150 pb-1.5">
                      <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Logistics & Biography</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-slate-50/50 p-3 rounded-2xl border border-slate-100">
                        <span className="text-[10px] font-bold text-slate-455 uppercase tracking-wider block">Experience</span>
                        <span className="text-sm font-semibold text-slate-755 mt-1 block">
                          {viewingRecord.experience}
                        </span>
                      </div>
                      <div className="bg-slate-50/50 p-3 rounded-2xl border border-slate-100">
                        <span className="text-[10px] font-bold text-slate-455 uppercase tracking-wider block">Joining Date</span>
                        <span className="text-sm font-semibold text-slate-755 mt-1 block">
                          {viewingRecord.joiningDate}
                        </span>
                      </div>
                      <div className="bg-slate-50/50 p-3 rounded-2xl border border-slate-100 col-span-2">
                        <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block">Working Hours</span>
                        <span className="text-sm font-semibold text-slate-755 mt-1 block flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          {viewingRecord.workingHours}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Simple Contact Fields for Admin / Staff */
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-150 pb-1.5">
                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Regional & Identity</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50/50 p-3.5 rounded-2xl border border-slate-100 text-center">
                      <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block">Gender</span>
                      <span className={`text-sm font-semibold block mt-1 ${viewingRecord.gender ? 'text-slate-750' : 'text-slate-400 italic'}`}>
                        {viewingRecord.gender || 'Not specified'}
                      </span>
                    </div>
                    <div className="bg-slate-50/50 p-3.5 rounded-2xl border border-slate-100 text-center">
                      <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block">Date of Birth</span>
                      <span className={`text-sm font-semibold block mt-1 ${viewingRecord.dateOfBirth ? 'text-slate-755' : 'text-slate-400 italic'}`}>
                        {viewingRecord.dateOfBirth || 'Not specified'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Full width Close details button */}
              <div className="flex pt-4 border-t border-slate-100 mt-6 w-full">
                <Button onClick={closeViewModal} className="w-full py-3 bg-brand-primary text-white rounded-xl font-bold text-sm justify-center shadow-sm">
                  Close Details
                </Button>
              </div>
            </div>
          )
        )}
      </Modal>

      {/* Onboarding setPassword link notification modal */}
      <Modal
        isOpen={createdUserLink !== null}
        onClose={() => {
          setCreatedUserLink(null);
          setCreatedUserEmail(null);
        }}
        title="User Invitation & Password Setup"
      >
        <div className="space-y-4 py-2 text-slate-700 text-sm">
          <p className="font-semibold text-slate-800">
            A registration email invitation was successfully processed for <strong className="text-blue-600">{createdUserEmail}</strong>.
          </p>
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Simulated Invitation Email Link</span>
            <p className="text-xs text-slate-500 leading-relaxed">
              For local testing and validation, copy or click on the onboarding link below to configure this user's password:
            </p>
            <a
              href={createdUserLink || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="block font-mono text-xs text-blue-600 hover:text-blue-700 hover:underline break-all font-semibold bg-white p-2.5 rounded-lg border border-slate-100 shadow-sm"
            >
              {createdUserLink}
            </a>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              onClick={() => {
                setCreatedUserLink(null);
                setCreatedUserEmail(null);
              }}
              className="px-5"
            >
              Done
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
