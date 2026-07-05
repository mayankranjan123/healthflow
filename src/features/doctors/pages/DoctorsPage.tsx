import React, { useState, useEffect } from 'react';
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
  ChevronRight
} from 'lucide-react';
import { DoctorProfileExtended, DoctorCalendarAppointment } from '../types';
import { mockDoctorsApi } from '../utils/mockDoctorsApi';
import { DoctorFilters } from '../components/DoctorFilters';
import { WeeklyCalendar } from '../components/WeeklyCalendar';
import { Badge } from '../../../components/ui/Badge';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';

export const DoctorsPage: React.FC = () => {
  // State lists
  const [doctors, setDoctors] = useState<DoctorProfileExtended[]>([]);
  const [appointments, setAppointments] = useState<DoctorCalendarAppointment[]>([]);

  // Navigation state (Null means list view, string means detail profile view)
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);

  // Profile sub-tab: 'overview' | 'appointments'
  const [profileTab, setProfileTab] = useState<'overview' | 'appointments'>('overview');

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

  // Load from API
  useEffect(() => {
    mockDoctorsApi.getDoctors().then(setDoctors);
    mockDoctorsApi.getAppointments().then(setAppointments);
  }, []);

  // Save changes back to localStorage
  const handleSaveDoctorsList = (updated: DoctorProfileExtended[]) => {
    setDoctors(updated);
    mockDoctorsApi.saveDoctors(updated).then(() => {
      mockDoctorsApi.getDoctors().then(setDoctors);
    });
  };

  const handleSaveAppointmentsList = (updated: DoctorCalendarAppointment[]) => {
    setAppointments(updated);
    mockDoctorsApi.saveAppointments(updated).then(() => {
      mockDoctorsApi.getAppointments().then(setAppointments);
    });
  };

  // Get list of unique specializations
  const specializations = Array.from(
    new Set(doctors.map((d) => d.specialization))
  ).filter(Boolean);

  // Filter logic
  const filteredDoctors = doctors.filter((doc) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      doc.name.toLowerCase().includes(searchLower) ||
      doc.id.toLowerCase().includes(searchLower) ||
      doc.email.toLowerCase().includes(searchLower);

    const matchesSpecialization =
      selectedSpecialization === 'All' || doc.specialization === selectedSpecialization;

    const matchesStatus =
      selectedStatus === 'All' ||
      (selectedStatus === 'Active' && doc.isActive) ||
      (selectedStatus === 'Inactive' && !doc.isActive);

    return matchesSearch && matchesSpecialization && matchesStatus;
  });

  // Pagination calculations
  const totalRows = filteredDoctors.length;
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, totalRows);
  const paginatedDoctors = filteredDoctors.slice(startIndex, endIndex);
  const totalPages = Math.ceil(totalRows / rowsPerPage) || 1;

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

  return (
    <div className="space-y-6">
      {/* 1. LIST VIEW */}
      {!selectedDoctorId && (
        <div className="space-y-6 animate-fade-in-up">
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-display font-bold text-slate-900">Doctors</h1>
              <p className="text-sm text-slate-500">
                Manage doctor profiles, specialization and availability across all departments.
              </p>
            </div>
            <Button id="add-doctor-btn" onClick={() => setIsAddModalOpen(true)} className="shadow-xs shrink-0">
              <Plus className="w-4.5 h-4.5" />
              <span>Add Doctor</span>
            </Button>
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
                          ${doc.fee.toFixed(2)}
                        </td>

                        {/* 6. Total Completed Consultations */}
                        <td className="py-3 px-4 text-right font-bold text-slate-700">
                          {doc.totalConsultations.toLocaleString()}
                        </td>

                        {/* 7. Followup Fee */}
                        <td className="py-3 px-4 text-right font-bold text-blue-600">
                          ${doc.followupFee ? doc.followupFee.toFixed(2) : (doc.fee * 0.6).toFixed(2)}
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

            {/* Pagination Controls Footer (Matches Image 3 perfectly) */}
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
        </div>
      )}

      {/* 2. DOCTOR PROFILE DETAIL VIEW */}
      {selectedDoctorId && activeDoctor && (
        <div className="space-y-6 animate-fade-in-up">
          {/* Back button (Stitch screenshot style) */}
          <button
            id="back-to-doctors"
            onClick={() => setSelectedDoctorId(null)}
            className="flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
          >
            <ArrowLeft className="w-4.5 h-4.5" />
            <span>Back to Doctors</span>
          </button>

          {/* Banner Hero Box */}
          <div className="bg-white border border-slate-150 rounded-xl p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <img
                referrerPolicy="no-referrer"
                src={activeDoctor.avatarUrl || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=250&auto=format&fit=crop'}
                alt={activeDoctor.name}
                className="w-18 h-18 rounded-xl object-cover border border-slate-200 shrink-0 shadow-xs"
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
                  ${activeDoctor.followupFee}
                </div>
              </div>
              <div className="w-px h-8 bg-slate-200" />
              <div className="text-center">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Consultation Fee</div>
                <div className="text-xl font-extrabold text-blue-600 mt-1">
                  ${activeDoctor.fee}
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
            <div className="space-y-6 animate-fade-in">
              {/* Row 1: Basic Info & Professional Details */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 1. Basic Information (Image 2 style) */}
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

                {/* 2. Professional Details (Image 2 style) */}
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

              {/* Row 2: Practice Schedule (Image 2 style) */}
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

              {/* Row 3: Professional Credentials (Image 2 style) */}
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
                    <span className="font-extrabold text-blue-600 text-lg">${activeDoctor.fee}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Total Completed Consultations</span>
                    <span className="font-extrabold text-slate-700 text-lg">{activeDoctor.totalConsultations.toLocaleString()}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Followup Fees</span>
                    <span className="font-extrabold text-slate-700">${activeDoctor.followupFee}</span>
                  </div>
                </div>
              </div>

              {/* Row 4: Contact Details (Image 2 style) */}
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
            <div className="animate-fade-in space-y-6">
              <WeeklyCalendar
                appointments={activeDoctorAppointments}
                onAddAppointment={handleAddAppointment}
              />
            </div>
          )}
        </div>
      )}

      {/* ADD DOCTOR MODAL FORM */}
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
              placeholder="e.g. +1 (555) 0123-4567"
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
              label="Consultation Fee ($)"
              type="number"
              placeholder="120"
              value={doctorForm.fee}
              onChange={(e) => setDoctorForm({ ...doctorForm, fee: e.target.value })}
              required
            />
            <Input
              id="doc-followup"
              label="Followup Fee ($)"
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
    </div>
  );
};
