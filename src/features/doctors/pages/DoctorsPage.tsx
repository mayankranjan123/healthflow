import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  ArrowLeft,
  Mail,
  Phone,
  Clock,
  Calendar,
  DollarSign,
  Award,
  Globe,
  User,
  Heart,
  CheckCircle,
  XCircle,
  Trash2,
  Lock,
  Menu,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Briefcase,
  UserPlus,
  Monitor
} from 'lucide-react';
import { DoctorProfileExtended, DoctorCalendarAppointment } from '../types';
import { mockDoctorsApi } from '../utils/mockDoctorsApi';
import { doctorService } from '../../../lib/apiClient';
import { DoctorFilters } from '../components/DoctorFilters';
import { WeeklyCalendar } from '../components/WeeklyCalendar';
import { Badge } from '../../../components/ui/Badge';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Drawer } from '../../../components/ui/Drawer';

export const DoctorsPage: React.FC = () => {
  // State lists
  const [doctors, setDoctors] = useState<DoctorProfileExtended[]>([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('healthflow_user');
    if (saved) {
      try {
        setCurrentUser(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const [appointments, setAppointments] = useState<DoctorCalendarAppointment[]>([]);

  // Navigation state (Null means list view, string means detail profile view)
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);

  const [profileTab, setProfileTab] = useState<'overview' | 'appointments'>('overview');
  const [mobileApptFilter, setMobileApptFilter] = useState<'ALL' | 'CONFIRMED' | 'DONE' | 'CANCELLED'>('ALL');
  const [selectedViewAppointment, setSelectedViewAppointment] = useState<DoctorCalendarAppointment | null>(null);

  // Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Add Doctor Form Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [doctorForm, setDoctorForm] = useState({
    name: '',
    email: '',
    mobile: '',
    specialization: 'Cardiologist',
    qualification: '',
    experience: '',
    fee: '100',
    followupFee: '60',
    workingHours: '09:00 AM - 05:00 PM',
    isActive: 'true',
    registrationNumber: '',
    gender: 'Female',
    dateOfBirth: '',
    languages: 'English, Hindi',
    primarySpecialty: '',
    secondarySpecialty: '',
    registrationAgency: '',
    affiliation: '',
    avatarUrl: ''
  });

  const [specializations, setSpecializations] = useState<string[]>([
    'Cardiologist',
    'Neurologist',
    'Pediatrician',
    'Dermatologist',
    'Orthopedic',
    'General Practitioner'
  ]);
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(false);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch unique specializations once on mount
  useEffect(() => {
    doctorService.getDoctors(1000000000, { pageNo: 0, pageSize: 1000 })
      .then((res) => {
        const specs = Array.from(new Set((res.data || []).map((d: any) => d.specialization))).filter(Boolean);
        if (specs.length > 0) {
          setSpecializations(specs as string[]);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  // Search Debounce hook
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Load paginated/filtered doctor list from API
  useEffect(() => {
    setIsLoadingDoctors(true);
    mockDoctorsApi.getDoctors({
      pageNo: currentPage - 1,
      pageSize: rowsPerPage,
      searchPrefix: debouncedSearchTerm,
      specialization: selectedSpecialization === 'All' ? 'ALL' : selectedSpecialization,
      status: selectedStatus === 'All' ? 'ALL' : selectedStatus
    })
      .then((res) => {
        setDoctors(res.items);
        setTotalElements(res.totalItems);
        setTotalPages(res.totalPages);
        setIsLoadingDoctors(false);
      })
      .catch((err) => {
        console.error(err);
        setIsLoadingDoctors(false);
      });
  }, [currentPage, rowsPerPage, debouncedSearchTerm, selectedSpecialization, selectedStatus]);

  // Load appointments for active selected doctor only when appointments tab is selected
  useEffect(() => {
    if (selectedDoctorId && profileTab === 'appointments') {
      mockDoctorsApi.getAppointmentsForDoctor(selectedDoctorId)
        .then(setAppointments)
        .catch(err => console.error(err));
    }
  }, [selectedDoctorId, profileTab]);

  // Refresh Doctors list
  const refreshDoctorsList = () => {
    mockDoctorsApi.getDoctors({
      pageNo: currentPage - 1,
      pageSize: rowsPerPage,
      searchPrefix: debouncedSearchTerm,
      specialization: selectedSpecialization === 'All' ? 'ALL' : selectedSpecialization,
      status: selectedStatus === 'All' ? 'ALL' : selectedStatus
    })
      .then((res) => {
        setDoctors(res.items);
        setTotalElements(res.totalItems);
        setTotalPages(res.totalPages);
      })
      .catch(err => console.error(err));
  };

  // Save changes back to localStorage
  const handleSaveDoctorsList = (updated: DoctorProfileExtended[]) => {
    setDoctors(updated);
    mockDoctorsApi.saveDoctors(updated).then(() => {
      refreshDoctorsList();
    });
  };

  const handleSaveAppointmentsList = (updated: DoctorCalendarAppointment[]) => {
    setAppointments(updated);
    mockDoctorsApi.saveAppointments(updated).then(() => {
      if (selectedDoctorId) {
        mockDoctorsApi.getAppointmentsForDoctor(selectedDoctorId).then(setAppointments);
      }
    });
  };

  // Pagination calculations
  const totalRows = totalElements;
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, totalRows);
  const paginatedDoctors = doctors;

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedSpecialization('All');
    setSelectedStatus('All');
    setCurrentPage(1);
  };

  // Create doctor
  const handleAddDoctorSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newDocId = `DOC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newDoc: DoctorProfileExtended = {
      id: newDocId,
      name: doctorForm.name.startsWith('Dr. ') ? doctorForm.name : `Dr. ${doctorForm.name}`,
      email: doctorForm.email,
      mobile: doctorForm.mobile,
      specialization: doctorForm.specialization,
      qualification: doctorForm.qualification || 'MBBS, MD',
      experience: doctorForm.experience.includes('yrs') || doctorForm.experience.includes('Years')
        ? doctorForm.experience
        : `${doctorForm.experience} yrs`,
      fee: parseFloat(doctorForm.fee) || 100,
      followupFee: parseFloat(doctorForm.followupFee) || 50,
      workingHours: doctorForm.workingHours || '09:00 AM - 05:00 PM',
      isActive: doctorForm.isActive === 'true',
      registrationNumber: doctorForm.registrationNumber || `REG-${Math.floor(10000 + Math.random() * 90000)}`,
      totalConsultations: 0,
      joiningDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      avatarUrl: doctorForm.avatarUrl || 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?q=80&w=250&auto=format&fit=crop',
      gender: doctorForm.gender,
      dateOfBirth: doctorForm.dateOfBirth || '15 Aug 1988',
      languages: doctorForm.languages.split(',').map(s => s.trim()).filter(Boolean),
      primarySpecialty: doctorForm.primarySpecialty || doctorForm.specialization,
      secondarySpecialty: doctorForm.secondarySpecialty || undefined,
      registrationAgency: doctorForm.registrationAgency || 'Medical Council',
      affiliation: doctorForm.affiliation || 'Downtown General Clinic'
    };

    const updated = [newDoc, ...doctors];
    handleSaveDoctorsList(updated);
    setIsAddModalOpen(false);

    // Reset form
    setDoctorForm({
      name: '',
      email: '',
      mobile: '',
      specialization: 'Cardiologist',
      qualification: '',
      experience: '',
      fee: '100',
      followupFee: '60',
      workingHours: '09:00 AM - 05:00 PM',
      isActive: 'true',
      registrationNumber: '',
      gender: 'Female',
      dateOfBirth: '',
      languages: 'English, Hindi',
      primarySpecialty: '',
      secondarySpecialty: '',
      registrationAgency: '',
      affiliation: '',
      avatarUrl: ''
    });
  };

  // Add calendar appointment for active doctor
  const handleAddAppointment = (newApp: Omit<DoctorCalendarAppointment, 'id'>) => {
    const updatedApps = [
      {
        id: `APP-${Math.floor(1000 + Math.random() * 9000)}`,
        doctorId: selectedDoctorId || undefined,
        ...newApp,
      },
      ...appointments,
    ];
    handleSaveAppointmentsList(updatedApps);
  };

  // Find active selected doctor
  const activeDoctor = doctors.find((d) => d.id === selectedDoctorId);

  // Appointments specifically for active doctor
  const activeDoctorAppointments = appointments.filter(a => a.doctorId === selectedDoctorId);

  // Helper functions for mobile appointments redesign
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(p => p[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarBg = (name: string) => {
    const sum = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const colors = [
      'bg-blue-100 text-blue-700',
      'bg-teal-100 text-teal-700',
      'bg-indigo-100 text-indigo-700',
      'bg-rose-100 text-rose-700',
      'bg-amber-100 text-amber-700',
      'bg-purple-100 text-purple-700'
    ];
    return colors[sum % colors.length];
  };

  const formatAppDate = (dateStr: string) => {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
      const year = parts[0];
      const monthIndex = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      if (monthIndex >= 0 && monthIndex < 12) {
        return `${months[monthIndex]} ${day}, ${year}`;
      }
    }
    return dateStr;
  };

  return (
    <div className={`space-y-6 ${isMobile ? 'pb-24' : ''}`}>
      {/* Mobile Header */}
      {isMobile && (
        <div className="flex items-center justify-between bg-white px-6 py-4 border-b border-slate-200 sticky top-0 z-30 shadow-sm h-18">
          <div className="flex items-center gap-2">
            {selectedDoctorId === null ? (
              <button
                onClick={() => navigate('/more')}
                className="text-slate-600 hover:text-slate-900 p-1 rounded-full hover:bg-slate-100 cursor-pointer"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
            ) : (
              <button
                onClick={() => setSelectedDoctorId(null)}
                className="text-slate-600 hover:text-slate-900 p-1 rounded-full hover:bg-slate-100 cursor-pointer"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}
            <h2 className="text-lg font-bold text-[#094093] font-display ml-1">
              {selectedDoctorId === null ? 'Doctors' : 'Doctor Profile'}
            </h2>
          </div>
          <div>
            <img
              src={currentUser?.avatarUrl || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=120&auto=format&fit=crop"}
              alt="Avatar"
              className="w-9 h-9 rounded-full object-cover border border-slate-200 cursor-pointer shadow-xs"
              onClick={() => navigate('/profile')}
            />
          </div>
        </div>
      )}

      <div className={isMobile ? 'px-6 space-y-6' : 'space-y-6'}>
        {/* 1. LIST VIEW */}
        {!selectedDoctorId && (
          <div className="space-y-6 animate-fade-in-up">
            {isMobile ? (
              <div className="space-y-5 text-left pb-24">
                {/* Redundant page title hidden on mobile view */}

              {/* Search Bar */}
              <div className="relative w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Name, ID or Email"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-brand-primary focus:bg-white focus:ring-1 focus:ring-brand-primary transition-all text-slate-700 font-medium"
                />
              </div>

              {/* Custom Mobile Filter Dropdowns */}
              <div className="grid grid-cols-2 gap-3.5">
                {/* Specializations Dropdown */}
                <div className="relative">
                  <select
                    value={selectedSpecialization}
                    onChange={(e) => setSelectedSpecialization(e.target.value)}
                    className="w-full pl-3.5 pr-8 py-2.5 bg-blue-650 hover:bg-blue-750 text-white rounded-xl text-xs font-bold outline-none cursor-pointer shadow-3xs transition-colors appearance-none text-left"
                  >
                    <option value="All">All Specializations</option>
                    {specializations.map((spec) => (
                      <option key={spec} value={spec}>{spec}</option>
                    ))}
                  </select>
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                  </div>
                </div>

                {/* Status Dropdown */}
                <div className="relative">
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full pl-3.5 pr-8 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-705 rounded-xl text-xs font-bold outline-none cursor-pointer transition-colors appearance-none text-left border border-slate-200"
                  >
                    <option value="All">All</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                  </div>
                </div>
              </div>

              {/* Mobile Doctor Cards List */}
              <div className="space-y-4">
                {paginatedDoctors.length === 0 ? (
                  <div className="py-12 bg-white border border-slate-150 rounded-2xl text-center text-slate-400 font-semibold text-xs">
                    No doctor profiles match your query.
                  </div>
                ) : (
                  paginatedDoctors.map((doc) => (
                    <div
                      key={doc.id}
                      className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col gap-4 text-left transition-all relative overflow-hidden"
                    >
                      {/* Doctor details row */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <img
                            referrerPolicy="no-referrer"
                            src={doc.avatarUrl || 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?q=80&w=120&auto=format&fit=crop'}
                            alt={doc.name}
                            className={`w-14 h-14 rounded-full object-cover border border-slate-150 shrink-0 ${!doc.isActive ? 'opacity-65 filter grayscale' : ''}`}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${doc.name}`;
                            }}
                          />
                          <div className="min-w-0">
                            <h4 className="font-bold text-slate-800 text-sm leading-tight">
                              {doc.name}
                            </h4>
                            <p className="text-[10px] font-extrabold text-blue-600 uppercase tracking-widest mt-1.5 leading-none">
                              {doc.specialization}
                            </p>
                            <div className="flex items-center gap-3 text-[10px] text-slate-400 font-bold mt-2.5 leading-none">
                              <div className="flex items-center gap-1">
                                <GraduationCap className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <span>{doc.qualification}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <span>{doc.experience}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div className="shrink-0">
                          {doc.isActive ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-extrabold tracking-wide uppercase bg-[#E6FBF5] text-[#059669]">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] shrink-0" />
                              <span>ACTIVE</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-extrabold tracking-wide uppercase bg-slate-100 text-slate-500">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
                              <span>ON LEAVE</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Divider */}
                      <div className="h-px bg-slate-100 -mx-5" />

                      {/* Fees Grid */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1 text-left">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block leading-none">Consultation Fee</span>
                          <span className="text-sm font-extrabold text-blue-600">₹{doc.fee.toFixed(2)}</span>
                        </div>
                        <div className="space-y-1 text-left">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block leading-none">Followup Fee</span>
                          <span className="text-sm font-bold text-slate-750">₹{doc.followupFee.toFixed(2)}</span>
                        </div>
                      </div>

                      {/* Divider */}
                      <div className="h-px bg-slate-100 -mx-5" />

                      {/* Actions */}
                      <div className="flex items-center gap-3">
                        {doc.isActive ? (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedDoctorId(doc.id);
                                setProfileTab('overview');
                              }}
                              className="flex-1 py-3 text-xs font-bold text-blue-600 border border-blue-200 rounded-xl hover:bg-blue-50 active:scale-[0.99] transition-all text-center cursor-pointer bg-white"
                            >
                              View Details
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedDoctorId(doc.id);
                                setProfileTab('appointments');
                              }}
                              className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-750 rounded-xl transition-all cursor-pointer shrink-0 active:scale-95"
                              title="Appointments Calendar"
                            >
                              <Calendar className="w-4.5 h-4.5" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              disabled
                              type="button"
                              className="flex-1 py-3 text-xs font-bold text-slate-400 border border-slate-200 rounded-xl text-center bg-white"
                            >
                              Profile Unavailable
                            </button>
                            <button
                              disabled
                              type="button"
                              className="p-3 bg-slate-50 text-slate-300 rounded-xl shrink-0"
                            >
                              <Calendar className="w-4.5 h-4.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Mobile Load More Pagination Controls */}
              {totalRows > paginatedDoctors.length && (
                <div className="pt-2 flex flex-col items-center gap-3">
                  <span className="text-xs text-slate-450 font-bold">
                    Showing {paginatedDoctors.length} of {totalRows} doctors
                  </span>
                  <button
                    type="button"
                    onClick={() => setRowsPerPage((prev) => prev + 5)}
                    className="w-full bg-white hover:bg-slate-50 text-slate-700 font-bold py-3 px-4 border border-slate-200 rounded-xl text-xs active:scale-[0.99] transition-all cursor-pointer shadow-3xs"
                  >
                    Load More
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-display font-bold text-slate-900">Doctors</h1>
                  <p className="text-sm text-slate-500">
                    Manage doctor profiles, specialization and availability across all departments.
                  </p>
                </div>
              </div>

              {/* Filtering Panel */}
              <DoctorFilters
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                selectedSpecialization={selectedSpecialization}
                onSpecializationChange={setSelectedSpecialization}
                selectedStatus={selectedStatus}
                onStatusChange={setSelectedStatus}
                onReset={handleResetFilters}
                specializations={specializations}
              />

              {/* Table Container */}
              <div className="bg-white border border-slate-150 rounded-xl shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table id="doctors-table" className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-150 bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider">
                        <th className="py-3 px-4">Doctor Details</th>
                        <th className="py-3 px-4">Specialization</th>
                        <th className="py-3 px-4">Qualification</th>
                        <th className="py-3 px-4">Exp.</th>
                        <th className="py-3 px-4 text-right">Consultation Fee</th>
                        <th className="py-3 px-4 text-right">Total Completed Consultations</th>
                        <th className="py-3 px-4 text-right">Followup Fee</th>
                        <th className="py-3 px-4">Working Hours</th>
                        <th className="py-3 px-4 text-center">Status</th>
                        <th className="py-3 px-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                      {paginatedDoctors.length === 0 ? (
                        <tr>
                          <td colSpan={10} className="py-12 text-center text-slate-400 font-medium">
                            No doctor profiles match your query.
                          </td>
                        </tr>
                      ) : (
                        paginatedDoctors.map((doc) => (
                          <tr key={doc.id} className="hover:bg-slate-50/50 transition-colors">
                            {/* 1. Doctor Details with Image */}
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <img
                                  referrerPolicy="no-referrer"
                                  src={doc.avatarUrl || 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?q=80&w=120&auto=format&fit=crop'}
                                  alt={doc.name}
                                  className="w-10 h-10 rounded-xl object-cover border border-slate-100 shrink-0"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${doc.name}`;
                                  }}
                                />
                                <div>
                                  <div className="font-bold text-slate-800">{doc.name}</div>
                                  <div className="text-xs text-slate-400 font-medium">{doc.email}</div>
                                </div>
                              </div>
                            </td>

                            {/* 2. Specialization */}
                            <td className="py-3 px-4 font-semibold text-slate-600">
                              {doc.specialization}
                            </td>

                            {/* 3. Qualification */}
                            <td className="py-3 px-4 text-slate-500 font-medium">
                              {doc.qualification}
                            </td>

                            {/* 4. Experience */}
                            <td className="py-3 px-4 text-slate-500 font-medium">
                              {doc.experience}
                            </td>

                            {/* 5. Consultation Fee */}
                            <td className="py-3 px-4 text-right font-extrabold text-blue-600">
                              ₹{doc.fee.toFixed(2)}
                            </td>

                            {/* 6. Total Completed Consultations */}
                            <td className="py-3 px-4 text-right font-bold text-slate-700">
                              {doc.totalConsultations.toLocaleString()}
                            </td>

                            {/* 7. Followup Fee */}
                            <td className="py-3 px-4 text-right font-bold text-blue-600">
                              ₹{doc.followupFee.toFixed(2)}
                            </td>

                            {/* 8. Working Hours */}
                            <td className="py-3 px-4 text-slate-500 font-medium">
                              {doc.workingHours}
                            </td>

                            {/* 9. Status */}
                            <td className="py-3 px-4 text-center">
                              <span
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-extrabold tracking-wide uppercase ${doc.isActive
                                  ? 'bg-green-50 text-green-700 border border-green-100'
                                  : 'bg-slate-50 text-slate-400 border border-slate-100'
                                  }`}
                              >
                                <span className={`w-1.5 h-1.5 rounded-full ${doc.isActive ? 'bg-green-500' : 'bg-slate-300'}`} />
                                {doc.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </td>

                            {/* 10. View Button */}
                            <td className="py-3 px-4 text-center">
                              <button
                                id={`view-doctor-btn-${doc.id}`}
                                onClick={() => {
                                  setSelectedDoctorId(doc.id);
                                  setProfileTab('overview');
                                }}
                                className="px-3.5 py-1.5 text-xs font-bold text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-all shadow-xs"
                              >
                                View
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls Footer */}
                {totalRows > 0 && (
                  <div className="py-3.5 px-5 bg-slate-50 border-t border-slate-150 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3 text-xs text-slate-500 font-semibold">
                      <span className="shrink-0">Rows per page:</span>
                      <select
                        id="rows-per-page"
                        value={rowsPerPage}
                        onChange={(e) => {
                          setRowsPerPage(parseInt(e.target.value, 10));
                          setCurrentPage(1);
                        }}
                        className="bg-white border border-slate-200 px-2.5 py-1.5 rounded-md text-slate-700 font-bold outline-none cursor-pointer focus:border-blue-500"
                      >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                      </select>
                      <span className="ml-2 font-medium text-slate-400">
                        Showing {startIndex + 1}-{endIndex} of {totalRows} doctors
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 self-center">
                      <button
                        id="pagination-prev"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        className="p-1.5 border border-slate-200 rounded-lg bg-white text-slate-500 hover:text-blue-600 disabled:opacity-40 disabled:hover:text-slate-500 transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>

                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                        <button
                          id={`pagination-page-${pageNum}`}
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${currentPage === pageNum
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                        >
                          {pageNum}
                        </button>
                      ))}

                      <button
                        id="pagination-next"
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        className="p-1.5 border border-slate-200 rounded-lg bg-white text-slate-500 hover:text-blue-600 disabled:opacity-40 disabled:hover:text-slate-500 transition-colors"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* 2. DOCTOR PROFILE DETAIL VIEW */}
      {selectedDoctorId && activeDoctor && (
        <div className="space-y-6 animate-fade-in-up text-left">
          {/* Back button (Stitch screenshot style) */}
          {!isMobile && (
            <button
              id="back-to-doctors"
              onClick={() => setSelectedDoctorId(null)}
              className="flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-850 transition-colors"
            >
              <ArrowLeft className="w-4.5 h-4.5" />
              <span>Back to Doctors</span>
            </button>
          )}

          {isMobile ? (
            <div className="space-y-5 pb-24">
              {/* Mobile Hero Box */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col gap-4 text-left">
                <div className="flex items-center gap-4">
                  <img
                    referrerPolicy="no-referrer"
                    src={activeDoctor.avatarUrl || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=250&auto=format&fit=crop'}
                    alt={activeDoctor.name}
                    className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shrink-0 shadow-3xs"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${activeDoctor.name}`;
                    }}
                  />
                  <div>
                    <h1 className="text-lg font-display font-extrabold text-slate-800 leading-tight">
                      {activeDoctor.name}
                    </h1>
                    <p className="text-xs text-slate-500 font-bold mt-1.5">
                      {activeDoctor.specialization}
                    </p>
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mt-1 font-mono">
                      ID: {activeDoctor.id}
                    </p>
                  </div>
                </div>

                <div className="h-px bg-slate-100" />

                {/* Mobile Info Badges */}
                <div className="grid grid-cols-3 gap-2 text-center bg-slate-50/50 p-3 rounded-xl border border-slate-200/60">
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Followup</span>
                    <span className="text-xs font-bold text-slate-700 block mt-1">₹{activeDoctor.followupFee}</span>
                  </div>
                  <div className="w-px h-6 bg-slate-200 self-center mx-auto" />
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Consultation</span>
                    <span className="text-xs font-extrabold text-blue-600 block mt-1">₹{activeDoctor.fee}</span>
                  </div>
                </div>
              </div>

              {/* Sub-Tab switcher */}
              <div className="border-b border-slate-200 flex gap-6">
                <button
                  id="profile-overview-tab"
                  onClick={() => setProfileTab('overview')}
                  className={`pb-3 text-sm font-bold transition-all relative ${profileTab === 'overview' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  Overview
                  {profileTab === 'overview' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.75 bg-blue-600 rounded-full" />
                  )}
                </button>
                <button
                  id="profile-appointments-tab"
                  onClick={() => setProfileTab('appointments')}
                  className={`pb-3 text-sm font-bold transition-all relative ${profileTab === 'appointments' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  Appointments
                  {profileTab === 'appointments' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.75 bg-blue-600 rounded-full" />
                  )}
                </button>
              </div>

              {/* Details sections */}
              {profileTab === 'overview' && (
                <div className="space-y-4">
                  {/* Basic Information */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
                      <User className="w-4.5 h-4.5 text-blue-500" />
                      <h2 className="text-sm font-display font-bold text-slate-800">Basic Information</h2>
                    </div>
                    <div className="space-y-3.5 text-xs">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Gender</span>
                          <span className="font-bold text-slate-700">{activeDoctor.gender || 'Female'}</span>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Date of Birth</span>
                          <span className="font-bold text-slate-700">{activeDoctor.dateOfBirth || '14 May 1985'}</span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Languages</span>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {(activeDoctor.languages || ['English', 'Hindi']).map((lang) => (
                            <span key={lang} className="bg-slate-100 px-2 py-0.5 rounded font-bold text-slate-600 text-[10px]">
                              {lang}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Professional Details */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
                      <Award className="w-4.5 h-4.5 text-blue-500" />
                      <h2 className="text-sm font-display font-bold text-slate-800">Professional Details</h2>
                    </div>
                    <div className="space-y-3.5 text-xs">
                      <div className="space-y-1">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Primary Specialty</span>
                        <span className="font-bold text-slate-700">{activeDoctor.primarySpecialty || activeDoctor.specialization}</span>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Secondary Specialty</span>
                        <span className="font-bold text-slate-700">{activeDoctor.secondarySpecialty || 'Interventional Cardiology'}</span>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Registration Agency</span>
                        <span className="font-bold text-slate-700">{activeDoctor.registrationAgency || 'Medical Council of Canada'}</span>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Affiliation</span>
                        <span className="font-bold text-slate-700">{activeDoctor.affiliation || 'City General Heart Institute'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Schedule */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
                      <Clock className="w-4.5 h-4.5 text-blue-500" />
                      <h2 className="text-sm font-display font-bold text-slate-800">Schedule</h2>
                    </div>
                    <div className="text-xs">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Working Hours</span>
                      <div className="font-bold text-slate-700 flex items-center gap-2 mt-2 bg-slate-50 border border-slate-200 p-3 rounded-xl w-fit">
                        <Clock className="w-4 h-4 text-slate-400" />
                        <span>{activeDoctor.workingHours}</span>
                      </div>
                    </div>
                  </div>

                  {/* Credentials */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
                      <CheckCircle className="w-4.5 h-4.5 text-blue-500" />
                      <h2 className="text-sm font-display font-bold text-slate-800">Credentials</h2>
                    </div>
                    <div className="space-y-3.5 text-xs">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Qualification</span>
                          <span className="font-bold text-slate-700">{activeDoctor.qualification}</span>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Experience</span>
                          <span className="font-bold text-slate-700">{activeDoctor.experience}</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Joining Date</span>
                          <span className="font-bold text-slate-700">{activeDoctor.joiningDate}</span>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block font-mono">License Number</span>
                          <span className="font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded font-mono text-[10px] block w-fit mt-0.5">
                            {activeDoctor.registrationNumber}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Contact */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
                      <Mail className="w-4.5 h-4.5 text-blue-500" />
                      <h2 className="text-sm font-display font-bold text-slate-800">Contact Details</h2>
                    </div>
                    <div className="space-y-3.5 text-xs">
                      <div className="space-y-1">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Email Address</span>
                        <a href={`mailto:${activeDoctor.email}`} className="font-bold text-blue-600 hover:underline flex items-center gap-2 mt-1">
                          <Mail className="w-4 h-4 text-slate-400" />
                          <span>{activeDoctor.email}</span>
                        </a>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Phone Number</span>
                        <a href={`tel:${activeDoctor.mobile}`} className="font-bold text-slate-700 hover:underline flex items-center gap-2 mt-1">
                          <Phone className="w-4 h-4 text-slate-400" />
                          <span>{activeDoctor.mobile}</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {profileTab === 'appointments' && (
                <div className="space-y-4 text-left">
                  {/* Horizontal scrollable status filter tabs */}
                  <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar -mx-4 px-4">
                    {[
                      { id: 'ALL', label: 'All Statuses' },
                      { id: 'CONFIRMED', label: 'Scheduled' },
                      { id: 'DONE', label: 'Completed' },
                      { id: 'CANCELLED', label: 'Cancelled' }
                    ].map((tab) => {
                      const count = tab.id === 'ALL'
                        ? activeDoctorAppointments.length
                        : activeDoctorAppointments.filter(a => {
                          if (tab.id === 'CONFIRMED') return ['CONFIRMED', 'UPCOMING', 'LIVE'].includes(a.status);
                          return a.status === tab.id;
                        }).length;

                      const isTabActive = mobileApptFilter === tab.id;
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setMobileApptFilter(tab.id as any)}
                          className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border cursor-pointer ${isTabActive
                              ? 'bg-blue-600 text-white border-blue-600 shadow-3xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border-slate-100'
                            }`}
                        >
                          {tab.label} ({count})
                        </button>
                      );
                    })}
                  </div>

                  {/* Appointments list */}
                  <div className="space-y-4">
                    {activeDoctorAppointments
                      .filter(a => {
                        if (mobileApptFilter === 'ALL') return true;
                        if (mobileApptFilter === 'CONFIRMED') return ['CONFIRMED', 'UPCOMING', 'LIVE'].includes(a.status);
                        return a.status === mobileApptFilter;
                      })
                      .length === 0 ? (
                      <div className="py-12 bg-white border border-slate-200 rounded-2xl text-center text-slate-400 font-semibold text-xs">
                        No appointments found for this status.
                      </div>
                    ) : (
                      activeDoctorAppointments
                        .filter(a => {
                          if (mobileApptFilter === 'ALL') return true;
                          if (mobileApptFilter === 'CONFIRMED') return ['CONFIRMED', 'UPCOMING', 'LIVE'].includes(a.status);
                          return a.status === mobileApptFilter;
                        })
                        .map((appt) => {
                          // map status code to display label & badge style
                          let statusLabel = 'Scheduled';
                          let badgeStyle = 'bg-blue-50 text-blue-700 border-blue-100';
                          let dotStyle = 'bg-blue-500';
                          let leftBorder = 'border-l-blue-500';

                          if (appt.status === 'DONE') {
                            statusLabel = 'Completed';
                            badgeStyle = 'bg-green-50 text-green-700 border-green-100';
                            dotStyle = 'bg-green-500';
                            leftBorder = 'border-l-emerald-500';
                          } else if (appt.status === 'CANCELLED') {
                            statusLabel = 'Cancelled';
                            badgeStyle = 'bg-red-50 text-red-750 border-red-100';
                            dotStyle = 'bg-red-500';
                            leftBorder = 'border-l-rose-500';
                          }

                          const initials = getInitials(appt.patientName);
                          const avatarBg = getAvatarBg(appt.patientName);

                          return (
                            <div
                              key={appt.id}
                              className={`bg-white border border-slate-200 border-l-4 ${leftBorder} rounded-2xl p-5 shadow-3xs flex flex-col gap-4 text-left relative overflow-hidden`}
                            >
                              {/* Top Row: Time & Date + Status Badge */}
                              <div className="flex items-start justify-between">
                                <div>
                                  <h4 className="font-display font-extrabold text-slate-800 text-sm leading-tight">
                                    {appt.startTime}
                                  </h4>
                                  <p className="text-[10px] font-bold text-slate-450 uppercase tracking-wider mt-1.5 leading-none">
                                    {formatAppDate(appt.date)}
                                  </p>
                                </div>

                                {/* Status Badge */}
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-extrabold tracking-wide uppercase border ${badgeStyle}`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${dotStyle}`} />
                                  {statusLabel}
                                </span>
                              </div>

                              {/* Divider */}
                              <div className="h-px bg-slate-100 -mx-5" />

                              {/* Patient info row */}
                              <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${avatarBg}`}>
                                  {initials}
                                </div>
                                <div>
                                  <h5 className="font-bold text-slate-700 text-xs leading-tight">
                                    {appt.patientName}
                                  </h5>
                                  <p className="text-[10px] font-semibold text-slate-400 mt-1.5">
                                    {activeDoctor.name}
                                  </p>
                                </div>
                              </div>

                              {/* Divider */}
                              <div className="h-px bg-slate-100 -mx-5" />

                              {/* Footer: Appointment Reason/Type + View Details link */}
                              <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                                <div className="flex items-center gap-2">
                                  <Monitor className="w-4 h-4 text-slate-400 shrink-0" />
                                  <span>{appt.reason || 'In-person Visit'}</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setSelectedViewAppointment(appt)}
                                  className="text-blue-600 hover:text-blue-800 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                                >
                                  <span>View Details</span>
                                  <span className="text-[10px]">&gt;</span>
                                </button>
                              </div>
                            </div>
                          );
                        })
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Banner Hero Box */}
              <div className="bg-white border border-slate-150 rounded-xl p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
                <div className="flex items-center gap-4">
                  <img
                    referrerPolicy="no-referrer"
                    src={activeDoctor.avatarUrl || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=250&auto=format&fit=crop'}
                    alt={activeDoctor.name}
                    className="w-18 h-18 rounded-xl object-cover border border-slate-200 shrink-0 shadow-xs"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${activeDoctor.name}`;
                    }}
                  />
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h1 className="text-xl md:text-2xl font-display font-bold text-slate-900">{activeDoctor.name}</h1>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase ${activeDoctor.isActive
                          ? 'bg-green-50 text-green-700 border border-green-100'
                          : 'bg-slate-50 text-slate-400 border border-slate-100'
                          }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${activeDoctor.isActive ? 'bg-green-500' : 'bg-slate-300'}`} />
                        {activeDoctor.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 font-medium">
                      {activeDoctor.specialization} • {activeDoctor.affiliation || 'Department'}
                    </p>
                    <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest font-mono">
                      ID: {activeDoctor.id}
                    </div>
                  </div>
                </div>

                {/* Quick Actions / Metrics */}
                <div className="flex items-center gap-6 bg-slate-50 px-5 py-3 rounded-xl border border-slate-150 self-stretch md:self-auto justify-around">
                  <div className="text-center">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Followup Fee</div>
                    <div className="text-xl font-extrabold text-slate-800 mt-1">
                      ₹{activeDoctor.followupFee}
                    </div>
                  </div>
                  <div className="w-px h-8 bg-slate-200" />
                  <div className="text-center">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Consultation Fee</div>
                    <div className="text-xl font-extrabold text-blue-600 mt-1">
                      ₹{activeDoctor.fee}
                    </div>
                  </div>
                  <div className="w-px h-8 bg-slate-200" />
                  <div className="text-center">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Completed Consultations</div>
                    <div className="text-xl font-extrabold text-slate-800 mt-1">
                      {activeDoctor.totalConsultations.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Sub-Tab Navigation Switcher */}
              <div className="border-b border-slate-200 flex gap-6">
                <button
                  id="profile-overview-tab"
                  onClick={() => setProfileTab('overview')}
                  className={`pb-3 text-sm font-bold transition-all relative ${profileTab === 'overview'
                    ? 'text-blue-600'
                    : 'text-slate-400 hover:text-slate-600'
                    }`}
                >
                  Overview
                  {profileTab === 'overview' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.75 bg-blue-600 rounded-full" />
                  )}
                </button>
                <button
                  id="profile-appointments-tab"
                  onClick={() => setProfileTab('appointments')}
                  className={`pb-3 text-sm font-bold transition-all relative ${profileTab === 'appointments'
                    ? 'text-blue-600'
                    : 'text-slate-400 hover:text-slate-600'
                    }`}
                >
                  Appointments
                  {profileTab === 'appointments' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.75 bg-blue-600 rounded-full" />
                  )}
                </button>
              </div>

              {/* Tab Contents */}
              {profileTab === 'overview' && (
                <div className="space-y-6">
                  {/* Row 1: Basic Info & Professional Details */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* 1. Basic Information */}
                    <div className="bg-white border border-slate-150 rounded-xl p-6 shadow-xs space-y-5">
                      <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                        <User className="w-5 h-5 text-blue-500" />
                        <h2 className="text-base font-display font-bold text-slate-800">Basic Information</h2>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Full Name</span>
                          <span className="font-bold text-slate-700">{activeDoctor.name.replace('Dr. ', '')}</span>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Gender</span>
                          <span className="font-bold text-slate-700">{activeDoctor.gender || 'Female'}</span>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Date of Birth</span>
                          <span className="font-bold text-slate-700">{activeDoctor.dateOfBirth || '14 May 1985'}</span>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Languages</span>
                          <div className="flex flex-wrap gap-1.5 mt-0.5">
                            {(activeDoctor.languages || ['English', 'Hindi']).map((lang) => (
                              <span key={lang} className="text-xs bg-slate-100 px-2 py-0.5 rounded font-bold text-slate-600">
                                {lang}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 2. Professional Details */}
                    <div className="bg-white border border-slate-150 rounded-xl p-6 shadow-xs space-y-5">
                      <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                        <Award className="w-5 h-5 text-blue-500" />
                        <h2 className="text-base font-display font-bold text-slate-800">Professional Details</h2>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Primary Specialty</span>
                          <span className="font-bold text-slate-700">{activeDoctor.primarySpecialty || activeDoctor.specialization}</span>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Secondary Specialty</span>
                          <span className="font-bold text-slate-700">{activeDoctor.secondarySpecialty || 'Interventional Cardiology'}</span>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Registration Agency</span>
                          <span className="font-bold text-slate-700">{activeDoctor.registrationAgency || 'Medical Council of Canada'}</span>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Affiliation</span>
                          <span className="font-bold text-slate-700">{activeDoctor.affiliation || 'City General Heart Institute'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Row 2: Practice Schedule */}
                  <div className="bg-white border border-slate-150 rounded-xl p-6 shadow-xs space-y-5">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                      <Clock className="w-5 h-5 text-blue-500" />
                      <h2 className="text-base font-display font-bold text-slate-800">Practice Schedule & Details</h2>
                    </div>
                    <div className="text-sm">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Working Hours</span>
                      <div className="font-bold text-slate-700 flex items-center gap-2 mt-1.5 bg-slate-50 border border-slate-150 p-3.5 rounded-lg w-fit">
                        <Clock className="w-4 h-4 text-slate-400" />
                        <span>{activeDoctor.workingHours}</span>
                      </div>
                    </div>
                  </div>

                  {/* Row 3: Professional Credentials */}
                  <div className="bg-white border border-slate-150 rounded-xl p-6 shadow-xs space-y-5">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                      <CheckCircle className="w-5 h-5 text-blue-500" />
                      <h2 className="text-base font-display font-bold text-slate-800">Professional Credentials</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-4 text-sm">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Qualification</span>
                        <span className="font-bold text-slate-700">{activeDoctor.qualification}</span>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Joining Date</span>
                        <span className="font-bold text-slate-700">{activeDoctor.joiningDate}</span>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Experience</span>
                        <span className="font-bold text-slate-700">{activeDoctor.experience}</span>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-mono">Registration Number</span>
                        <span className="font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded w-fit block font-mono text-xs">
                          {activeDoctor.registrationNumber}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block text-blue-500">Consultation Fees</span>
                        <span className="font-extrabold text-blue-600 text-lg">₹{activeDoctor.fee}</span>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Total Completed Consultations</span>
                        <span className="font-extrabold text-slate-700 text-lg">{activeDoctor.totalConsultations.toLocaleString()}</span>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Followup Fees</span>
                        <span className="font-extrabold text-slate-700">₹{activeDoctor.followupFee}</span>
                      </div>
                    </div>
                  </div>

                  {/* Row 4: Contact Details */}
                  <div className="bg-white border border-slate-150 rounded-xl p-6 shadow-xs space-y-5">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                      <Mail className="w-5 h-5 text-blue-500" />
                      <h2 className="text-base font-display font-bold text-slate-800">Contact Details</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Email Address</span>
                        <a
                          href={`mailto:${activeDoctor.email}`}
                          className="font-bold text-blue-600 hover:underline flex items-center gap-2 mt-1"
                        >
                          <Mail className="w-4 h-4 text-slate-400" />
                          <span>{activeDoctor.email}</span>
                        </a>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Phone Number</span>
                        <a
                          href={`tel:${activeDoctor.mobile}`}
                          className="font-bold text-slate-700 hover:underline flex items-center gap-2 mt-1"
                        >
                          <Phone className="w-4 h-4 text-slate-400" />
                          <span>{activeDoctor.mobile}</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {profileTab === 'appointments' && (
                <div className="space-y-6">
                  <WeeklyCalendar
                    appointments={activeDoctorAppointments}
                    onAddAppointment={handleAddAppointment}
                  />
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Floating Action Button (FAB) for mobile view
      {isMobile && currentUser?.role === 'ADMIN' && (
        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="fixed bottom-24 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-all z-40 cursor-pointer"
        >
          <UserPlus className="w-6 h-6" />
        </button>
      )} */}

      {/* ADD DOCTOR MODAL FORM */}
      {isMobile ? (
        <Drawer
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Add New Doctor Profile"
          hideHeader={true}
        >
          <div className="flex flex-col h-full -m-6 bg-slate-50/50">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4.5 bg-white border-b border-slate-100 shrink-0 relative">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-700 hover:bg-slate-100 p-1.5 rounded-full cursor-pointer transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h3 className="font-display font-extrabold text-slate-800 text-base absolute left-1/2 -translate-x-1/2">
                Add Doctor
              </h3>
              <div className="w-8 h-8" />
            </div>

            {/* Scrollable form body */}
            <form onSubmit={handleAddDoctorSubmit} className="flex-1 flex flex-col justify-between overflow-hidden">
              <div className="flex-1 p-6 overflow-y-auto space-y-5 text-left">
                <div className="grid grid-cols-1 gap-4">
                  <Input
                    id="doc-name-m"
                    label="Doctor Name"
                    placeholder="e.g. Aisha Mehta"
                    value={doctorForm.name}
                    onChange={(e) => setDoctorForm({ ...doctorForm, name: e.target.value })}
                    required
                  />
                  <Input
                    id="doc-email-m"
                    label="Contact Email"
                    type="email"
                    placeholder="e.g. aisha.m@healthflow.com"
                    value={doctorForm.email}
                    onChange={(e) => setDoctorForm({ ...doctorForm, email: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <Input
                    id="doc-mobile-m"
                    label="Contact Mobile"
                    placeholder="e.g. +91 99999 99999"
                    value={doctorForm.mobile}
                    onChange={(e) => setDoctorForm({ ...doctorForm, mobile: e.target.value })}
                    required
                  />
                  <Select
                    id="doc-specialization-m"
                    label="Primary Specialization"
                    value={doctorForm.specialization}
                    onChange={(e) => setDoctorForm({ ...doctorForm, specialization: e.target.value })}
                    options={[
                      { value: 'Cardiologist', label: 'Cardiologist' },
                      { value: 'General Physician', label: 'General Physician' },
                      { value: 'Dermatologist', label: 'Dermatologist' },
                      { value: 'Pediatrician', label: 'Pediatrician' },
                      { value: 'Neurologist', label: 'Neurologist' },
                      { value: 'Orthopedic Surgeon', label: 'Orthopedic Surgeon' },
                    ]}
                  />
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <Input
                    id="doc-qualification-m"
                    label="Qualifications"
                    placeholder="e.g. MBBS, MD, DM"
                    value={doctorForm.qualification}
                    onChange={(e) => setDoctorForm({ ...doctorForm, qualification: e.target.value })}
                    required
                  />
                  <Input
                    id="doc-experience-m"
                    label="Experience (Years)"
                    placeholder="e.g. 12"
                    value={doctorForm.experience}
                    onChange={(e) => setDoctorForm({ ...doctorForm, experience: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <Input
                    id="doc-fee-m"
                    label="Consultation Fee (₹)"
                    type="number"
                    placeholder="120"
                    value={doctorForm.fee}
                    onChange={(e) => setDoctorForm({ ...doctorForm, fee: e.target.value })}
                    required
                  />
                  <Input
                    id="doc-followup-m"
                    label="Followup Fee (₹)"
                    type="number"
                    placeholder="80"
                    value={doctorForm.followupFee}
                    onChange={(e) => setDoctorForm({ ...doctorForm, followupFee: e.target.value })}
                    required
                  />
                  <Input
                    id="doc-hours-m"
                    label="Working Hours"
                    placeholder="09:00 AM - 05:00 PM"
                    value={doctorForm.workingHours}
                    onChange={(e) => setDoctorForm({ ...doctorForm, workingHours: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <Select
                    id="doc-gender-m"
                    label="Gender"
                    value={doctorForm.gender}
                    onChange={(e) => setDoctorForm({ ...doctorForm, gender: e.target.value })}
                    options={[
                      { value: 'Female', label: 'Female' },
                      { value: 'Male', label: 'Male' },
                      { value: 'Other', label: 'Other' },
                    ]}
                  />
                  <Input
                    id="doc-dob-m"
                    label="Date of Birth"
                    placeholder="e.g. 14 May 1985"
                    value={doctorForm.dateOfBirth}
                    onChange={(e) => setDoctorForm({ ...doctorForm, dateOfBirth: e.target.value })}
                    required
                  />
                  <Select
                    id="doc-active-m"
                    label="Roster Status"
                    value={doctorForm.isActive}
                    onChange={(e) => setDoctorForm({ ...doctorForm, isActive: e.target.value })}
                    options={[
                      { value: 'true', label: 'Active Duty' },
                      { value: 'false', label: 'Inactive / Leave' },
                    ]}
                  />
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <Input
                    id="doc-reg-m"
                    label="MCI Registration License"
                    placeholder="e.g. REG-87421"
                    value={doctorForm.registrationNumber}
                    onChange={(e) => setDoctorForm({ ...doctorForm, registrationNumber: e.target.value })}
                    required
                  />
                  <Input
                    id="doc-languages-m"
                    label="Languages"
                    placeholder="English, Hindi"
                    value={doctorForm.languages}
                    onChange={(e) => setDoctorForm({ ...doctorForm, languages: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <Input
                    id="doc-secondary-spec-m"
                    label="Secondary Specialty"
                    placeholder="e.g. Interventional Cardiology"
                    value={doctorForm.secondarySpecialty}
                    onChange={(e) => setDoctorForm({ ...doctorForm, secondarySpecialty: e.target.value })}
                  />
                  <Input
                    id="doc-agency-m"
                    label="Registration Agency"
                    placeholder="e.g. Medical Council of Canada"
                    value={doctorForm.registrationAgency}
                    onChange={(e) => setDoctorForm({ ...doctorForm, registrationAgency: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <Input
                    id="doc-affiliation-m"
                    label="Hospital Affiliation"
                    placeholder="e.g. City General Heart Institute"
                    value={doctorForm.affiliation}
                    onChange={(e) => setDoctorForm({ ...doctorForm, affiliation: e.target.value })}
                  />
                  <Input
                    id="doc-avatar-m"
                    label="Avatar URL (Optional)"
                    placeholder="https://images.unsplash.com/..."
                    value={doctorForm.avatarUrl}
                    onChange={(e) => setDoctorForm({ ...doctorForm, avatarUrl: e.target.value })}
                  />
                </div>
              </div>

              {/* Pinned bottom action button */}
              <div className="p-5 bg-white border-t border-slate-100 shrink-0">
                <button
                  type="submit"
                  className="w-full bg-[#0a305e] hover:bg-[#08274d] text-white font-semibold py-3.5 rounded-xl text-center cursor-pointer shadow-sm text-sm active:scale-[0.99] transition-all"
                >
                  Register Doctor
                </button>
              </div>
            </form>
          </div>
        </Drawer>
      ) : (
        <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add New Doctor Profile">
          <form onSubmit={handleAddDoctorSubmit} className="space-y-4 max-h-[80vh] overflow-y-auto pr-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                id="doc-name"
                label="Doctor Name (Prefix automatically added)"
                placeholder="e.g. Aisha Mehta"
                value={doctorForm.name}
                onChange={(e) => setDoctorForm({ ...doctorForm, name: e.target.value })}
                required
              />
              <Input
                id="doc-email"
                label="Contact Email"
                type="email"
                placeholder="e.g. aisha.m@healthflow.com"
                value={doctorForm.email}
                onChange={(e) => setDoctorForm({ ...doctorForm, email: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                id="doc-mobile"
                label="Contact Mobile"
                placeholder="e.g. +91 99999 99999"
                value={doctorForm.mobile}
                onChange={(e) => setDoctorForm({ ...doctorForm, mobile: e.target.value })}
                required
              />
              <Select
                id="doc-specialization"
                label="Primary Specialization"
                value={doctorForm.specialization}
                onChange={(e) => setDoctorForm({ ...doctorForm, specialization: e.target.value })}
                options={[
                  { value: 'Cardiologist', label: 'Cardiologist' },
                  { value: 'General Physician', label: 'General Physician' },
                  { value: 'Dermatologist', label: 'Dermatologist' },
                  { value: 'Pediatrician', label: 'Pediatrician' },
                  { value: 'Neurologist', label: 'Neurologist' },
                  { value: 'Orthopedic Surgeon', label: 'Orthopedic Surgeon' },
                ]}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                id="doc-qualification"
                label="Qualifications"
                placeholder="e.g. MBBS, MD, DM"
                value={doctorForm.qualification}
                onChange={(e) => setDoctorForm({ ...doctorForm, qualification: e.target.value })}
                required
              />
              <Input
                id="doc-experience"
                label="Experience (Years)"
                placeholder="e.g. 12"
                value={doctorForm.experience}
                onChange={(e) => setDoctorForm({ ...doctorForm, experience: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                id="doc-fee"
                label="Consultation Fee (₹)"
                type="number"
                placeholder="120"
                value={doctorForm.fee}
                onChange={(e) => setDoctorForm({ ...doctorForm, fee: e.target.value })}
                required
              />
              <Input
                id="doc-followup"
                label="Followup Fee (₹)"
                type="number"
                placeholder="80"
                value={doctorForm.followupFee}
                onChange={(e) => setDoctorForm({ ...doctorForm, followupFee: e.target.value })}
                required
              />
              <Input
                id="doc-hours"
                label="Working Hours"
                placeholder="09:00 AM - 05:00 PM"
                value={doctorForm.workingHours}
                onChange={(e) => setDoctorForm({ ...doctorForm, workingHours: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Select
                id="doc-gender"
                label="Gender"
                value={doctorForm.gender}
                onChange={(e) => setDoctorForm({ ...doctorForm, gender: e.target.value })}
                options={[
                  { value: 'Female', label: 'Female' },
                  { value: 'Male', label: 'Male' },
                  { value: 'Other', label: 'Other' },
                ]}
              />
              <Input
                id="doc-dob"
                label="Date of Birth"
                placeholder="e.g. 14 May 1985"
                value={doctorForm.dateOfBirth}
                onChange={(e) => setDoctorForm({ ...doctorForm, dateOfBirth: e.target.value })}
                required
              />
              <Select
                id="doc-active"
                label="Roster Status"
                value={doctorForm.isActive}
                onChange={(e) => setDoctorForm({ ...doctorForm, isActive: e.target.value })}
                options={[
                  { value: 'true', label: 'Active Duty' },
                  { value: 'false', label: 'Inactive / Leave' },
                ]}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                id="doc-reg"
                label="MCI Registration Number / License"
                placeholder="e.g. REG-87421"
                value={doctorForm.registrationNumber}
                onChange={(e) => setDoctorForm({ ...doctorForm, registrationNumber: e.target.value })}
                required
              />
              <Input
                id="doc-languages"
                label="Languages (comma separated)"
                placeholder="English, Hindi, Spanish"
                value={doctorForm.languages}
                onChange={(e) => setDoctorForm({ ...doctorForm, languages: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                id="doc-secondary-spec"
                label="Secondary Specialty"
                placeholder="e.g. Interventional Cardiology"
                value={doctorForm.secondarySpecialty}
                onChange={(e) => setDoctorForm({ ...doctorForm, secondarySpecialty: e.target.value })}
              />
              <Input
                id="doc-agency"
                label="Registration Agency"
                placeholder="e.g. Medical Council of Canada"
                value={doctorForm.registrationAgency}
                onChange={(e) => setDoctorForm({ ...doctorForm, registrationAgency: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                id="doc-affiliation"
                label="Hospital/Clinic Affiliation"
                placeholder="e.g. City General Heart Institute"
                value={doctorForm.affiliation}
                onChange={(e) => setDoctorForm({ ...doctorForm, affiliation: e.target.value })}
              />
              <Input
                id="doc-avatar"
                label="Avatar Image URL (Optional)"
                placeholder="https://images.unsplash.com/photo-..."
                value={doctorForm.avatarUrl}
                onChange={(e) => setDoctorForm({ ...doctorForm, avatarUrl: e.target.value })}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Confirm Registration
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Redesigned Mobile-Optimised Appointment Details Modal Overlay */}
      {selectedViewAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in text-left">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-xl animate-scale-in">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4.5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <h3 className="font-display font-extrabold text-slate-800 text-base">
                  Appointment Details
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedViewAppointment(null)}
                className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-5 space-y-5">
              {/* Banner/Status Box */}
              <div className="bg-slate-50 border border-slate-150 rounded-xl p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                  <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{selectedViewAppointment.date}</span>
                  <span className="w-1 h-1 rounded-full bg-slate-350" />
                  <span>{selectedViewAppointment.startTime}</span>
                </div>

                {/* Status Badge */}
                {selectedViewAppointment.status === 'DONE' ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-extrabold tracking-wide uppercase bg-green-50 text-[#059669] border border-green-150">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                    <span>COMPLETED</span>
                  </span>
                ) : selectedViewAppointment.status === 'CANCELLED' ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-extrabold tracking-wide uppercase bg-red-50 text-red-700 border border-red-150">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    <span>CANCELLED</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-extrabold tracking-wide uppercase bg-blue-50 text-blue-700 border border-blue-150">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    <span>CONFIRMED</span>
                  </span>
                )}
              </div>

              {/* Patient Name */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block leading-none">Patient Name</span>
                <h4 className="text-base font-extrabold text-slate-800 leading-tight">
                  {selectedViewAppointment.patientName}
                </h4>
                <p className="text-[10px] font-semibold text-slate-500">
                  Appointment Code: {selectedViewAppointment.id}
                </p>
              </div>

              {/* Reason for Visit */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block leading-none">Reason for Visit</span>
                <div className="bg-blue-50/40 border border-blue-100 border-l-4 border-l-blue-600 rounded-xl p-4 text-xs font-semibold text-slate-700 leading-relaxed">
                  {selectedViewAppointment.reason || 'Routine Checkup / Followup consultation'}
                </div>
              </div>

              {/* Notes (if any) */}
              {selectedViewAppointment.notes && (
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block leading-none">Doctor Notes</span>
                  <p className="text-xs text-slate-655 bg-slate-50 p-3 rounded-lg border border-slate-150 leading-relaxed font-medium">
                    {selectedViewAppointment.notes}
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-slate-50 px-5 py-4 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedViewAppointment(null)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold px-6 py-2.5 rounded-xl text-xs shadow-3xs cursor-pointer active:scale-95 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};
