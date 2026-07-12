import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Eye,
  Filter,
  UserPlus,
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  User,
  Heart,
  CheckCircle,
  Clock,
  FileText,
  Trash2,
  X,
  UploadCloud,
  ChevronLeft,
  ChevronRight,
  Download,
  Activity,
  AlertCircle,
  AlertTriangle,
  Bookmark,
  Award,
  SearchCode,
  FileSpreadsheet,
  Printer
} from 'lucide-react';
import { Card, CardHeader, CardBody, CardFooter } from '../../../components/ui/Card';
import { DataTable } from '../../../components/ui/DataTable';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Modal } from '../../../components/ui/Modal';
import { Drawer } from '../../../components/ui/Drawer';
import { Badge } from '../../../components/ui/Badge';
import { Pagination } from '../../../components/ui/Pagination';

import { 
  PatientProfileExtended, 
  PatientAttachment, 
  PatientAppointment, 
  PatientPrescription, 
  PatientMedicine 
} from '../types';
import { mockPatientsApi } from '../utils/mockPatientsApi';
import { mockDoctorsApi } from '../../doctors/utils/mockDoctorsApi';
import { mockSettingsApi } from '../../settings/utils/mockSettingsApi';

export const PatientsPage: React.FC = () => {
  // Load data from persistent APIs
  const [patients, setPatients] = useState<PatientProfileExtended[]>([]);
  const [doctorsList, setDoctorsList] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const cached = localStorage.getItem('healthflow_user');
    if (cached) {
      try {
        setCurrentUser(JSON.parse(cached));
      } catch (e) {}
    }
  }, []);

  // Page View state
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');
  const [selectedPatient, setSelectedPatient] = useState<PatientProfileExtended | null>(null);
  const [profileTab, setProfileTab] = useState<'profile' | 'appointments' | 'prescriptions' | 'files'>('profile');

  // Search & Filters state for primary directory
  const [searchTerm, setSearchTerm] = useState('');
  const [genderFilter, setGenderFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(5);

  // Modal open controllers
  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false);
  const [isCreatePrescriptionOpen, setIsCreatePrescriptionOpen] = useState(false);
  const [isViewAppointmentOpen, setIsViewAppointmentOpen] = useState(false);
  const [isFileUploadOpen, setIsFileUploadOpen] = useState(false);
  const [isPrescriptionPreviewOpen, setIsPrescriptionPreviewOpen] = useState(false);

  // Selected details targets
  const [selectedAppointment, setSelectedAppointment] = useState<PatientAppointment | null>(null);
  const [previewPrescription, setPreviewPrescription] = useState<PatientPrescription | null>(null);

  // Sub-modules Search and Filtering
  // Prescriptions Filters
  const [prescFromDate, setPrescFromDate] = useState('');
  const [prescToDate, setPrescToDate] = useState('');
  const [prescDoctorId, setPrescDoctorId] = useState('All');

  // Files Filters
  const [fileSearch, setFileSearch] = useState('');
  const [fileCategoryFilter, setFileCategoryFilter] = useState('All');
  const [fileCurrentPage, setFileCurrentPage] = useState(1);
  const [fileRowsPerPage] = useState(5);

  // --- FORM STATES ---
  // Register New Patient Form
  const [newPatient, setNewPatient] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: 'MALE' as 'MALE' | 'FEMALE' | 'OTHER',
    phone: '',
    email: '',
    address: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    allergies: '',
    existingDiseases: '',
    clinicalNotes: '',
    bloodGroup: 'O+',
    purpose: '',
    avatarUrl: ''
  });

  // Attachments during registering patient
  const [tempAttachments, setTempAttachments] = useState<{
    fileName: string;
    category: 'Lab Report' | 'Other' | 'X-ray' | 'Prescription' | 'Scan';
    size: string;
    fileType: string;
  }[]>([]);

  // Create New Prescription Drawer Form
  const [newPrescription, setNewPrescription] = useState({
    doctorId: '',
    issueDate: new Date().toISOString().split('T')[0],
    diagnosis: '',
    symptoms: '',
    clinicalNotes: '',
    testsRecommended: '',
    advice: '',
    nextVisitDate: ''
  });

  // Prescription medicine creator
  const [medicinesList, setMedicinesList] = useState<PatientMedicine[]>([]);
  const [newMedicine, setNewMedicine] = useState({
    medicineName: '',
    dosage: '',
    frequency: '',
    duration: '',
    instructions: ''
  });

  // Single File Upload Modal Form
  const [newUploadedFile, setNewUploadedFile] = useState({
    fileName: '',
    category: 'Lab Report' as 'Lab Report' | 'Other' | 'X-ray' | 'Prescription' | 'Scan',
    sizeBytes: 0,
    fileType: 'PDF'
  });
  const [fileError, setFileError] = useState<string | null>(null);

  // Prescription Settings State
  const [prescriptionSettings, setPrescriptionSettings] = useState<any>(null);
  const [clinicSettings, setClinicSettings] = useState<any>(null);

  // Initialize data
  useEffect(() => {
    mockPatientsApi.getPatients().then(setPatients);
    mockDoctorsApi.getDoctors().then(setDoctorsList);
    mockSettingsApi.getSettings().then((settings) => {
      if (settings) {
        if (settings.prescription) {
          setPrescriptionSettings(settings.prescription);
          setNewPrescription(prev => ({
            ...prev,
            advice: settings.prescription.defaultFooterNote || ''
          }));
        }
        if (settings.clinic) {
          setClinicSettings(settings.clinic);
        }
      }
    });
  }, []);

  // Update selected patient profile from source to stay in sync
  useEffect(() => {
    if (selectedPatient) {
      mockPatientsApi.getPatientById(selectedPatient.id).then(fresh => {
        if (fresh) {
          setSelectedPatient(fresh);
        }
      });
    }
  }, [patients]);

  // --- HANDLERS ---

  // Register New Patient Submit
  const handleRegisterPatientSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const randomIDNum = Math.floor(1000 + Math.random() * 9000);
    const pID = `PT-${randomIDNum}`;

    // Map initial temporary attachments
    const attachmentsMapped: PatientAttachment[] = tempAttachments.map((att, index) => ({
      id: `ATT-NEW-${Date.now()}-${index}`,
      fileName: att.fileName,
      uploadedDate: new Date().toISOString().split('T')[0],
      category: att.category,
      size: att.size,
      fileType: att.fileType
    }));

    // Generate simulated appointments based on initial purpose
    const initialAppointments: PatientAppointment[] = [];
    if (newPatient.purpose) {
      initialAppointments.push({
        id: `APP-NEW-${Date.now()}`,
        appointmentDate: `${new Date().toISOString().split('T')[0]} 09:30 AM`,
        status: 'SCHEDULED',
        doctorId: doctorsList[0]?.id || 'DOC-002',
        doctorName: doctorsList[0]?.name || 'Dr. Rohit Sharma',
        doctorAvatarUrl: doctorsList[0]?.avatarUrl,
        reason: newPatient.purpose
      });
    }

    const patientToAdd: PatientProfileExtended = {
      id: pID,
      patientNumber: pID,
      firstName: newPatient.firstName,
      lastName: newPatient.lastName,
      dateOfBirth: newPatient.dateOfBirth,
      gender: newPatient.gender,
      phone: newPatient.phone,
      email: newPatient.email,
      address: newPatient.address || 'Not Provided',
      emergencyContactName: newPatient.emergencyContactName || 'Not Provided',
      emergencyContactPhone: newPatient.emergencyContactPhone || 'Not Provided',
      allergies: newPatient.allergies || 'None',
      existingDiseases: newPatient.existingDiseases || 'None',
      clinicalNotes: newPatient.clinicalNotes || '',
      bloodGroup: newPatient.bloodGroup,
      purpose: newPatient.purpose || 'General Consultation',
      avatarUrl: newPatient.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${newPatient.firstName}%20${newPatient.lastName}`,
      lastVisit: 'None',
      nextVisit: initialAppointments.length > 0 ? initialAppointments[0].appointmentDate.split(' ')[0] : 'None',
      attachments: attachmentsMapped,
      appointments: initialAppointments,
      prescriptions: []
    };

    mockPatientsApi.addPatient(patientToAdd).then(() => {
      mockPatientsApi.getPatients().then(setPatients);
    });
    
    // Reset Form
    setNewPatient({
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      gender: 'MALE',
      phone: '',
      email: '',
      address: '',
      emergencyContactName: '',
      emergencyContactPhone: '',
      allergies: '',
      existingDiseases: '',
      clinicalNotes: '',
      bloodGroup: 'O+',
      purpose: '',
      avatarUrl: ''
    });
    setTempAttachments([]);
    setIsAddPatientOpen(false);
  };

  // Upload file during patient registration
  const handleAddTempAttachment = (category: 'Lab Report' | 'Other' | 'X-ray' | 'Prescription' | 'Scan') => {
    const fileNamesMap = {
      'Lab Report': ['Lab_BloodReport_Complete.pdf', 'ThyroidPanel_Test.pdf', 'Urinalysis_Output.pdf'],
      'Other': ['ConsentForm_Signed.pdf', 'PreviousClinicRecord.pdf'],
      'X-ray': ['Chest_Xray_PAView.png', 'LeftKnee_Xray.png'],
      'Prescription': ['External_Prescription.pdf', 'GP_ReferenceLetter.pdf'],
      'Scan': ['Abdominal_USG_Report.pdf', 'Brain_MRI_Scan.pdf']
    };

    const list = fileNamesMap[category];
    const chosenName = list[Math.floor(Math.random() * list.length)];
    const size = `${(0.5 + Math.random() * 8.5).toFixed(1)} MB`;
    const ext = chosenName.split('.').pop()?.toUpperCase() || 'PDF';

    setTempAttachments([
      ...tempAttachments,
      {
        fileName: chosenName,
        category,
        size,
        fileType: ext
      }
    ]);
  };

  // Remove file from temp list
  const handleRemoveTempAttachment = (idx: number) => {
    setTempAttachments(tempAttachments.filter((_, i) => i !== idx));
  };

  // Add Medicine to Creation Drawer
  const handleAddMedicine = () => {
    if (!newMedicine.medicineName || !newMedicine.dosage || !newMedicine.frequency || !newMedicine.duration) {
      alert('Please fill out all mandatory medicine fields.');
      return;
    }

    const medItem: PatientMedicine = {
      id: `MED-NEW-${Date.now()}-${Math.random()}`,
      medicineName: newMedicine.medicineName,
      dosage: newMedicine.dosage,
      frequency: newMedicine.frequency,
      duration: newMedicine.duration,
      instructions: newMedicine.instructions || 'Take as directed'
    };

    setMedicinesList([...medicinesList, medItem]);
    setNewMedicine({
      medicineName: '',
      dosage: '',
      frequency: '',
      duration: '',
      instructions: ''
    });
  };

  // Delete Medicine from Creation list
  const handleDeleteMedicine = (id: string) => {
    setMedicinesList(medicinesList.filter((m) => m.id !== id));
  };

  // Submit New Prescription
  const handleCreatePrescriptionSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPatient) return;
    if (!newPrescription.doctorId) {
      alert('Please select a prescribing doctor.');
      return;
    }
    if (prescriptionSettings?.showDiagnosis !== false && !newPrescription.diagnosis) {
      alert('Please provide a diagnosis.');
      return;
    }
    if (medicinesList.length === 0) {
      alert('Please add at least one medicine to the prescription.');
      return;
    }

    const selectedDoc = doctorsList.find((d) => d.id === newPrescription.doctorId);
    const docName = selectedDoc ? selectedDoc.name : 'Dr. Rohit Sharma';
    const docSpec = selectedDoc ? selectedDoc.specialization : 'General Medicine';
    const docAvatar = selectedDoc ? selectedDoc.avatarUrl : '';

    const prefix = prescriptionSettings?.prefix || 'RX';
    const startingNumber = prescriptionSettings?.startingNumber || 1001;
    const allPrescriptions = patients.flatMap(p => p.prescriptions || []);
    const maxNum = allPrescriptions.reduce((max, pr) => {
      const regex = new RegExp(`${prefix}-(\\d+)`);
      const match = pr.id.match(regex);
      if (match) {
        const val = parseInt(match[1]);
        return val > max ? val : max;
      }
      return max;
    }, startingNumber - 1);
    const newPrescId = `${prefix}-${maxNum + 1}`;

    const newPrsc: PatientPrescription = {
      id: newPrescId,
      patientId: selectedPatient.id,
      patientName: `${selectedPatient.firstName} ${selectedPatient.lastName}`,
      patientNumber: selectedPatient.patientNumber,
      doctorId: newPrescription.doctorId,
      doctorName: docName,
      doctorSpecialization: docSpec,
      doctorAvatarUrl: docAvatar,
      issueDate: newPrescription.issueDate,
      diagnosis: newPrescription.diagnosis,
      symptoms: newPrescription.symptoms,
      clinicalNotes: newPrescription.clinicalNotes,
      medicines: medicinesList,
      testsRecommended: newPrescription.testsRecommended || 'None',
      advice: newPrescription.advice || 'None',
      nextVisitDate: newPrescription.nextVisitDate || 'None'
    };

    const updatedPatient: PatientProfileExtended = {
      ...selectedPatient,
      prescriptions: [newPrsc, ...selectedPatient.prescriptions]
    };

    // If next visit date is set, also add an upcoming appointment or update fields
    if (newPrescription.nextVisitDate && newPrescription.nextVisitDate !== 'None') {
      updatedPatient.nextVisit = newPrescription.nextVisitDate;
      updatedPatient.appointments = [
        {
          id: `APP-AUTO-${Date.now()}`,
          appointmentDate: `${newPrescription.nextVisitDate} 10:00 AM`,
          status: 'SCHEDULED',
          doctorId: newPrsc.doctorId,
          doctorName: newPrsc.doctorName,
          doctorAvatarUrl: newPrsc.doctorAvatarUrl,
          reason: `Follow-up: ${newPrsc.diagnosis}`
        },
        ...selectedPatient.appointments
      ];
    }

    mockPatientsApi.updatePatient(updatedPatient).then(() => {
      mockPatientsApi.getPatients().then(setPatients);
    });
    
    // Close & Clean
    setIsCreatePrescriptionOpen(false);
    setMedicinesList([]);
    setNewPrescription({
      doctorId: '',
      issueDate: new Date().toISOString().split('T')[0],
      diagnosis: '',
      symptoms: '',
      clinicalNotes: '',
      testsRecommended: '',
      advice: '',
      nextVisitDate: ''
    });
  };

  // Upload file on files tab
  const handleFileUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;
    if (!newUploadedFile.fileName) {
      setFileError('Please select a file to upload.');
      return;
    }

    // Limit validation (Max 10MB)
    const MAX_BYTES = 10 * 1024 * 1024; // 10 MB
    if (newUploadedFile.sizeBytes > MAX_BYTES) {
      setFileError('File size exceeds the maximum limit of 10 MB.');
      return;
    }

    const newFile: PatientAttachment = {
      id: `ATT-UPLOAD-${Date.now()}`,
      fileName: newUploadedFile.fileName,
      uploadedDate: new Date().toISOString().split('T')[0],
      category: newUploadedFile.category,
      size: `${(newUploadedFile.sizeBytes / (1024 * 1024)).toFixed(2)} MB`,
      fileType: newUploadedFile.fileType
    };

    const updatedPatient: PatientProfileExtended = {
      ...selectedPatient,
      attachments: [newFile, ...selectedPatient.attachments]
    };

    mockPatientsApi.updatePatient(updatedPatient).then(() => {
      mockPatientsApi.getPatients().then(setPatients);
    });

    // Reset Upload State
    setNewUploadedFile({
      fileName: '',
      category: 'Lab Report',
      sizeBytes: 0,
      fileType: 'PDF'
    });
    setFileError(null);
    setIsFileUploadOpen(false);
  };

  // Drag-and-drop / manual click helper simulation
  const simulateFileChoose = (category: 'Lab Report' | 'Other' | 'X-ray' | 'Prescription' | 'Scan') => {
    const list = {
      'Lab Report': ['Urinalysis_Report_2023.pdf', 'Complete_Blood_Count.pdf', 'Cholesterol_Lipid_Panel.pdf'],
      'Other': ['Vitals_LogSheet.xlsx', 'PreviousMedicalHistorySummary.docx'],
      'X-ray': ['Chest_Radiograph_Standard.jpeg', 'Spine_Xray_Lumbar.png'],
      'Prescription': ['Discharge_Summary_Signed.pdf', 'Pharmacy_BillReceipt.pdf'],
      'Scan': ['Abdominal_Ultrasound_HighRes.jpeg', 'Ankle_CTScan_Composite.png']
    }[category];

    const chosenName = list[Math.floor(Math.random() * list.length)];
    // Random file size up to 12MB to test limit validation occasionally
    const sizeBytes = Math.random() < 0.85 
      ? Math.floor(1000000 + Math.random() * 8000000) // 1MB to 9MB
      : Math.floor(10500000 + Math.random() * 3000000); // 10.5MB to 13.5MB (causes validation failure)

    const fileType = chosenName.split('.').pop()?.toUpperCase() || 'PDF';

    setNewUploadedFile({
      fileName: chosenName,
      category,
      sizeBytes,
      fileType
    });
    setFileError(null);
  };

  // Delete Attachment
  const handleDeleteAttachment = (fileId: string) => {
    if (!selectedPatient) return;
    if (confirm('Are you sure you want to delete this file permanently?')) {
      const updatedPatient: PatientProfileExtended = {
        ...selectedPatient,
        attachments: selectedPatient.attachments.filter((f) => f.id !== fileId)
      };
      mockPatientsApi.updatePatient(updatedPatient).then(() => {
        mockPatientsApi.getPatients().then(setPatients);
      });
    }
  };

  // View Patient Details
  const handleViewDetails = (patient: PatientProfileExtended) => {
    setSelectedPatient(patient);
    setProfileTab('profile');
    setViewMode('detail');
  };

  // --- FILTERS & SEARCH PROCESSORS ---

  // Main Patient Directory search filter
  const filteredPatients = patients.filter((p) => {
    const nameMatch = `${p.firstName} ${p.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
    const idMatch = p.patientNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const mobileMatch = p.phone.includes(searchTerm);
    const searchMatch = nameMatch || idMatch || mobileMatch;

    const genderMatch = genderFilter === 'All' || p.gender === genderFilter;

    return searchMatch && genderMatch;
  });

  // Main Pagination
  const mainTotalRows = filteredPatients.length;
  const mainStartIndex = (currentPage - 1) * rowsPerPage;
  const mainEndIndex = Math.min(mainStartIndex + rowsPerPage, mainTotalRows);
  const mainPaginatedPatients = filteredPatients.slice(mainStartIndex, mainEndIndex);
  const mainTotalPages = Math.ceil(mainTotalRows / rowsPerPage) || 1;

  // Selected Patient Prescriptions filters
  const getFilteredPrescriptions = () => {
    if (!selectedPatient) return [];
    return selectedPatient.prescriptions.filter((prsc) => {
      // Date bounds
      if (prescFromDate && new Date(prsc.issueDate) < new Date(prescFromDate)) return false;
      if (prescToDate && new Date(prsc.issueDate) > new Date(prescToDate)) return false;
      // Doctor match
      if (prescDoctorId !== 'All' && prsc.doctorId !== prescDoctorId) return false;
      return true;
    });
  };

  // Selected Patient Files search & pagination filters
  const getFilteredFiles = () => {
    if (!selectedPatient) return [];
    return selectedPatient.attachments.filter((f) => {
      const matchSearch = f.fileName.toLowerCase().includes(fileSearch.toLowerCase());
      const matchCat = fileCategoryFilter === 'All' || f.category === fileCategoryFilter;
      return matchSearch && matchCat;
    });
  };

  const currentFiles = getFilteredFiles();
  const fileTotalRows = currentFiles.length;
  const fileStartIndex = (fileCurrentPage - 1) * fileRowsPerPage;
  const fileEndIndex = Math.min(fileStartIndex + fileRowsPerPage, fileTotalRows);
  const filePaginated = currentFiles.slice(fileStartIndex, fileEndIndex);
  const fileTotalPages = Math.ceil(fileTotalRows / fileRowsPerPage) || 1;

  // --- RENDERING VIEWS ---

  // Column definitions for the Patients List Directory DataTable
  const directoryColumns = [
    {
      key: 'patientNumber',
      header: 'Patient ID',
      render: (row: PatientProfileExtended) => (
        <span className="font-mono text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded">
          {row.patientNumber}
        </span>
      )
    },
    {
      key: 'firstName',
      header: 'Patient Details',
      render: (row: PatientProfileExtended) => (
        <div className="flex items-center gap-3">
          <img
            src={row.avatarUrl}
            alt={row.firstName}
            referrerPolicy="no-referrer"
            className="w-10 h-10 rounded-full border border-slate-200 object-cover bg-slate-50"
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${row.firstName}%20${row.lastName}`;
            }}
          />
          <div className="flex flex-col">
            <span className="font-bold text-slate-800 text-sm hover:text-brand-primary transition-colors">
              {row.firstName} {row.lastName}
            </span>
            <span className="text-xs text-slate-400 font-medium font-mono">DOB: {row.dateOfBirth}</span>
          </div>
        </div>
      )
    },
    {
      key: 'gender',
      header: 'Gender',
      render: (row: PatientProfileExtended) => (
        <Badge variant={row.gender === 'MALE' ? 'info' : row.gender === 'FEMALE' ? 'warning' : 'neutral'}>
          {row.gender}
        </Badge>
      )
    },
    {
      key: 'phone',
      header: 'Mobile',
      render: (row: PatientProfileExtended) => (
        <span className="text-slate-600 font-medium text-xs font-mono">{row.phone}</span>
      )
    },
    {
      key: 'lastVisit',
      header: 'Last Visit',
      render: (row: PatientProfileExtended) => (
        <div className="flex flex-col">
          <span className={`text-xs font-semibold ${row.lastVisit === 'None' ? 'text-slate-400 font-normal' : 'text-slate-700'}`}>
            {row.lastVisit}
          </span>
          {row.lastVisit !== 'None' && <span className="text-[10px] text-slate-400">Completed Appointment</span>}
        </div>
      )
    },
    {
      key: 'nextVisit',
      header: 'Next Visit',
      render: (row: PatientProfileExtended) => (
        <div className="flex flex-col">
          <span className={`text-xs font-semibold ${row.nextVisit === 'None' ? 'text-slate-400 font-normal' : 'text-blue-600'}`}>
            {row.nextVisit}
          </span>
          {row.nextVisit !== 'None' && (
            <span className="inline-flex items-center gap-1 text-[10px] text-blue-500 font-medium">
              <Clock className="w-2.5 h-2.5" /> Scheduled
            </span>
          )}
        </div>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row: PatientProfileExtended) => (
        <Button
          id={`view-details-${row.id}`}
          size="sm"
          variant="outline"
          onClick={(e) => {
            e.stopPropagation();
            handleViewDetails(row);
          }}
          className="gap-1.5 hover:bg-slate-50 border-slate-200"
        >
          <Eye className="w-3.5 h-3.5 text-slate-500" />
          <span>View Profile</span>
        </Button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* 1. DIRECTORY VIEW (LIST MODE) */}
      {viewMode === 'list' && (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-display font-bold text-slate-900 tracking-tight">Patient Directory</h2>
              <p className="text-sm text-slate-500 font-medium">Manage and review medical histories, prescriptions, and files</p>
            </div>
            <Button id="add-patient-btn" onClick={() => setIsAddPatientOpen(true)} className="shadow-sm">
              <Plus className="w-4 h-4" />
              <span>Add Patient</span>
            </Button>
          </div>

          {/* Search and Filters */}
          <Card>
            <CardBody className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="search-patient-input"
                  type="text"
                  placeholder="Search by name, patient ID, or mobile number..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-brand-primary focus:bg-white focus:ring-1 focus:ring-brand-primary transition-all text-slate-700 font-medium"
                />
              </div>
              <div className="flex gap-3 w-full md:w-auto">
                <Select
                  id="filter-gender-select"
                  options={[
                    { value: 'All', label: 'All Genders' },
                    { value: 'MALE', label: 'Male' },
                    { value: 'FEMALE', label: 'Female' },
                    { value: 'OTHER', label: 'Other' }
                  ]}
                  value={genderFilter}
                  onChange={(e) => {
                    setGenderFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="min-w-[150px]"
                />
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm('');
                    setGenderFilter('All');
                    setCurrentPage(1);
                  }}
                  className="gap-2 shrink-0 border-slate-200 text-slate-500 hover:text-slate-800"
                >
                  Clear Filters
                </Button>
              </div>
            </CardBody>
          </Card>

          {/* Patients List Table */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200">
            <DataTable
              columns={directoryColumns}
              data={mainPaginatedPatients}
              emptyMessage="No patients found matching your search filters. Try another search or register a new patient."
              onRowClick={(row) => handleViewDetails(row)}
            />
            {mainTotalRows > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={mainTotalPages}
                onPageChange={setCurrentPage}
                totalItems={mainTotalRows}
                itemsPerPage={rowsPerPage}
                itemNameSingular="patient"
                itemNamePlural="patients"
              />
            )}
          </div>
        </div>
      )}

      {/* 2. PATIENT PROFILE VIEW (DETAIL MODE) */}
      {viewMode === 'detail' && selectedPatient && (
        <div className="space-y-6">
          {/* Breadcrumbs / Back navigation */}
          <div className="flex items-center gap-3">
            <Button
              id="back-to-list-btn"
              variant="outline"
              size="sm"
              onClick={() => {
                setViewMode('list');
                setSelectedPatient(null);
              }}
              className="gap-1.5 border-slate-200 py-1.5 text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Directory</span>
            </Button>
            <div className="h-4 w-px bg-slate-200" />
            <span className="text-xs text-slate-400 font-bold font-mono bg-slate-100 px-2 py-0.5 rounded">
              {selectedPatient.patientNumber}
            </span>
          </div>

          {/* Quick Stats Header Summary Banner */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <img
                src={selectedPatient.avatarUrl}
                alt={selectedPatient.firstName}
                referrerPolicy="no-referrer"
                className="w-20 h-20 rounded-full border border-slate-200 object-cover bg-slate-50"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${selectedPatient.firstName}%20${selectedPatient.lastName}`;
                }}
              />
              <div className="space-y-1">
                <h3 className="text-xl font-display font-bold text-slate-900 tracking-tight">
                  {selectedPatient.firstName} {selectedPatient.lastName}
                </h3>
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 font-semibold">
                  <Badge variant={selectedPatient.gender === 'MALE' ? 'info' : selectedPatient.gender === 'FEMALE' ? 'warning' : 'neutral'}>
                    {selectedPatient.gender}
                  </Badge>
                  <span>•</span>
                  <span>
                    {new Date().getFullYear() - new Date(selectedPatient.dateOfBirth).getFullYear()} Years Old
                  </span>
                  <span>•</span>
                  <span>Blood Group: <strong className="text-slate-800">{selectedPatient.bloodGroup}</strong></span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 pt-1.5 text-xs text-slate-600">
                  <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-slate-400" /> {selectedPatient.phone}</span>
                  <span className="hidden sm:inline text-slate-300">|</span>
                  <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-slate-400" /> {selectedPatient.email || 'No email registered'}</span>
                </div>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 border-t lg:border-t-0 lg:border-l border-slate-100 pt-4 lg:pt-0 lg:pl-6 shrink-0">
              <div className="p-3 bg-slate-50 rounded-xl space-y-0.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Consults</span>
                <p className="text-base font-bold text-slate-800">{selectedPatient.appointments.filter(a => a.status === 'COMPLETED').length}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-xl space-y-0.5">
                <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wider">Active Files</span>
                <p className="text-base font-bold text-blue-700">{selectedPatient.attachments.length} Documents</p>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl space-y-0.5 col-span-2 sm:col-span-1">
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Allergies</span>
                <p className="text-xs font-bold text-rose-700 truncate max-w-[120px]">{selectedPatient.allergies || 'None'}</p>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-slate-200 gap-6">
            {(['profile', 'appointments', 'prescriptions', 'files'] as const).map((tab) => (
              <button
                key={tab}
                id={`tab-${tab}`}
                onClick={() => setProfileTab(tab)}
                className={`
                  pb-3.5 text-sm font-semibold relative capitalize tracking-wide transition-all cursor-pointer
                  ${profileTab === tab ? 'text-brand-primary' : 'text-slate-400 hover:text-slate-700'}
                `}
              >
                {tab}
                {profileTab === tab && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-primary rounded-full animate-fade-in" />
                )}
              </button>
            ))}
          </div>

          {/* TAB CONTENTS */}

          {/* 1. Profile Tab Content */}
          {profileTab === 'profile' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Personal Metadata */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <h4 className="font-display font-bold text-slate-800 text-sm flex items-center gap-2">
                      <User className="w-4 h-4 text-slate-400" />
                      <span>Registration Details</span>
                    </h4>
                  </CardHeader>
                  <CardBody className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">First Name</span>
                      <p className="text-sm font-semibold text-slate-800">{selectedPatient.firstName}</p>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Last Name</span>
                      <p className="text-sm font-semibold text-slate-800">{selectedPatient.lastName}</p>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Date Of Birth</span>
                      <p className="text-sm font-semibold text-slate-800">{selectedPatient.dateOfBirth}</p>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Gender</span>
                      <p className="text-sm font-semibold text-slate-800">{selectedPatient.gender}</p>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Mobile Number</span>
                      <p className="text-sm font-semibold text-slate-800">{selectedPatient.phone}</p>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Email Address</span>
                      <p className="text-sm font-semibold text-slate-800">{selectedPatient.email || 'N/A'}</p>
                    </div>
                    <div className="space-y-0.5 sm:col-span-2 pt-2 border-t border-slate-50">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Home Residential Address</span>
                      <p className="text-xs font-semibold text-slate-700 leading-normal">{selectedPatient.address}</p>
                    </div>
                  </CardBody>
                </Card>

                {/* Emergency Contact */}
                <Card className="border-rose-100">
                  <CardHeader className="bg-rose-50/20 border-rose-50">
                    <h4 className="font-display font-bold text-slate-800 text-sm flex items-center gap-2">
                      <Heart className="w-4 h-4 text-rose-500" />
                      <span>Emergency Contact Details</span>
                    </h4>
                  </CardHeader>
                  <CardBody className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Contact Person Name</span>
                      <p className="text-sm font-bold text-slate-800">{selectedPatient.emergencyContactName}</p>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Emergency Contact Phone</span>
                      <p className="text-sm font-mono font-semibold text-rose-700 bg-rose-50/50 px-2 py-0.5 rounded w-fit">{selectedPatient.emergencyContactPhone}</p>
                    </div>
                  </CardBody>
                </Card>
              </div>

              {/* Right Column: Medical Vulnerabilities & Clinical Logs */}
              <div className="space-y-6">
                {/* Clinical Notes Card */}
                <Card>
                  <CardHeader>
                    <h4 className="font-display font-bold text-slate-800 text-sm flex items-center gap-2">
                      <Activity className="w-4 h-4 text-brand-primary" />
                      <span>Initial Visit Purpose & Notes</span>
                    </h4>
                  </CardHeader>
                  <CardBody className="p-5 space-y-4">
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-1">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Purpose</span>
                      <p className="text-xs font-bold text-slate-700 leading-normal">{selectedPatient.purpose}</p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Primary Clinical Log</span>
                      <p className="text-xs text-slate-600 leading-relaxed font-semibold italic border-l-2 border-brand-primary pl-3 bg-blue-50/20 py-2.5 rounded-r">
                        "{selectedPatient.clinicalNotes || 'No notes compiled for this patient yet.'}"
                      </p>
                    </div>
                  </CardBody>
                </Card>

                {/* Medical Risks Summary */}
                <Card className="border-amber-100">
                  <CardHeader className="bg-amber-50/20 border-amber-50">
                    <h4 className="font-display font-bold text-slate-800 text-sm flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                      <span>Allergies & Diseases</span>
                    </h4>
                  </CardHeader>
                  <CardBody className="p-5 space-y-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Drug / Food Allergies</span>
                      {selectedPatient.allergies && selectedPatient.allergies.toLowerCase() !== 'none' ? (
                        <div className="bg-rose-50 border border-rose-100 text-rose-700 px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                          <span>{selectedPatient.allergies}</span>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-500 font-medium">No allergies logged.</p>
                      )}
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Chronic Diseases</span>
                      {selectedPatient.existingDiseases && selectedPatient.existingDiseases.toLowerCase() !== 'none' ? (
                        <div className="bg-amber-50 border border-amber-100 text-amber-700 px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                          <span>{selectedPatient.existingDiseases}</span>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-500 font-medium">No chronic medical conditions logged.</p>
                      )}
                    </div>
                  </CardBody>
                </Card>
              </div>
            </div>
          )}

          {/* 2. Appointments Tab Content */}
          {profileTab === 'appointments' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h4 className="font-display font-bold text-slate-800 text-sm">Consultation History & Timelines</h4>
                <div className="flex gap-1.5 text-xs text-slate-400 font-medium">
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Completed</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Upcoming</span>
                </div>
              </div>

              {selectedPatient.appointments.length === 0 ? (
                <div className="bg-white p-12 text-center rounded-xl border border-slate-200">
                  <p className="text-slate-500 font-medium">No appointments on record for this patient.</p>
                </div>
              ) : (
                <div className="relative border-l border-slate-200 ml-4 pl-6 space-y-6">
                  {selectedPatient.appointments.map((app) => {
                    const isUpcoming = app.status === 'SCHEDULED';
                    return (
                      <div key={app.id} className="relative">
                        {/* Dot */}
                        <span className={`
                          absolute -left-[31px] top-1.5 w-4 h-4 rounded-full border-2 border-white shadow-sm flex items-center justify-center
                          ${isUpcoming ? 'bg-blue-500 ring-4 ring-blue-50' : 'bg-emerald-500 ring-4 ring-emerald-50'}
                        `} />

                        {/* Card */}
                        <Card className="hover:border-slate-300 transition-all max-w-2xl">
                          <CardBody className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-slate-400 font-bold font-mono">
                                  {app.appointmentDate}
                                </span>
                                <Badge variant={isUpcoming ? 'info' : 'success'}>
                                  {app.status === 'SCHEDULED' ? 'Scheduled' : 'Completed'}
                                </Badge>
                              </div>
                              <h5 className="font-bold text-slate-800 text-sm">{app.reason}</h5>
                              
                              <div className="flex items-center gap-2">
                                <img
                                  src={app.doctorAvatarUrl || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=250&auto=format&fit=crop'}
                                  alt={app.doctorName}
                                  referrerPolicy="no-referrer"
                                  className="w-6 h-6 rounded-full border border-slate-200 object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${app.doctorName}`;
                                  }}
                                />
                                <span className="text-xs font-semibold text-slate-600">{app.doctorName}</span>
                              </div>
                            </div>

                            <Button
                              id={`view-appointment-btn-${app.id}`}
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedAppointment(app);
                                setIsViewAppointmentOpen(true);
                              }}
                              className="shrink-0 border-slate-200 text-slate-600 hover:text-slate-900"
                            >
                              View Details
                            </Button>
                          </CardBody>
                        </Card>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* 3. Prescriptions Tab Content */}
          {profileTab === 'prescriptions' && (
            <div className="space-y-6">
              {/* Filter Panel & Actions */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
                {/* Inputs Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1">
                  <Input
                    label="From Date"
                    type="date"
                    value={prescFromDate}
                    onChange={(e) => setPrescFromDate(e.target.value)}
                  />
                  <Input
                    label="To Date"
                    type="date"
                    value={prescToDate}
                    onChange={(e) => setPrescToDate(e.target.value)}
                  />
                  <Select
                    label="Prescribed By"
                    value={prescDoctorId}
                    onChange={(e) => setPrescDoctorId(e.target.value)}
                    options={[
                      { value: 'All', label: 'All Doctors' },
                      ...doctorsList.map(doc => ({ value: doc.id, label: doc.name }))
                    ]}
                  />
                </div>
                
                {/* Create Button */}
                {currentUser?.role !== 'STAFF' && (
                  <div className="flex items-end pt-5 md:pt-0 shrink-0">
                    <Button
                      id="create-prescription-btn"
                      onClick={() => {
                        let defaultDocId = doctorsList[0]?.id || '';
                        if (currentUser?.role === 'DOCTOR') {
                          const matchedDoc = doctorsList.find(d => d.email?.toLowerCase() === currentUser.email?.toLowerCase());
                          if (matchedDoc) {
                            defaultDocId = matchedDoc.id;
                          }
                        }
                        setNewPrescription({
                          ...newPrescription,
                          doctorId: defaultDocId
                        });
                        setIsCreatePrescriptionOpen(true);
                      }}
                      className="w-full md:w-auto shadow-sm"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Create Prescription</span>
                    </Button>
                  </div>
                )}
              </div>

              {/* List of Prescriptions */}
              {getFilteredPrescriptions().length === 0 ? (
                <div className="bg-slate-50/50 rounded-xl p-12 text-center border border-dashed border-slate-200">
                  <p className="text-slate-500 font-medium">No prescriptions found matching the filters or yet recorded.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {getFilteredPrescriptions().map((prsc) => (
                    <Card key={prsc.id} className="hover:border-brand-primary transition-all duration-200">
                      <CardBody className="p-5 flex flex-col justify-between h-full space-y-4">
                        <div className="space-y-2">
                          <div className="flex justify-between items-start">
                            <span className="font-mono text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                              {prsc.id}
                            </span>
                            <span className="text-xs text-slate-400 font-semibold font-mono">
                              Issued: {prsc.issueDate}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <img
                              src={prsc.doctorAvatarUrl || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=250&auto=format&fit=crop'}
                              alt={prsc.doctorName}
                              referrerPolicy="no-referrer"
                              className="w-10 h-10 rounded-full border border-slate-200 object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${prsc.doctorName}`;
                              }}
                            />
                            <div>
                              <p className="font-bold text-slate-800 text-sm">{prsc.doctorName}</p>
                              <p className="text-[11px] text-slate-400 font-medium">{prsc.doctorSpecialization}</p>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-slate-50">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Diagnosis Summary</span>
                            <p className="text-xs font-bold text-slate-700 truncate">{prsc.diagnosis}</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-50 gap-4">
                          <span className="text-xs text-brand-primary font-bold bg-blue-50/50 px-2.5 py-1 rounded">
                            {prsc.medicines.length} Medicine{prsc.medicines.length === 1 ? '' : 's'} prescribed
                          </span>
                          <Button
                            id={`view-prescription-btn-${prsc.id}`}
                            size="sm"
                            variant="primary"
                            onClick={() => {
                              setPreviewPrescription(prsc);
                              setIsPrescriptionPreviewOpen(true);
                            }}
                            className="gap-1 px-3"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>View / Print</span>
                          </Button>
                        </div>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 4. Files Tab Content */}
          {profileTab === 'files' && (
            <div className="space-y-6">
              {/* File Search and Category select */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    id="search-file-input"
                    type="text"
                    placeholder="Search documents by name..."
                    value={fileSearch}
                    onChange={(e) => {
                      setFileSearch(e.target.value);
                      setFileCurrentPage(1);
                    }}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-brand-primary focus:bg-white focus:ring-1 focus:ring-brand-primary transition-all text-slate-700 font-medium"
                  />
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                  <Select
                    id="filter-file-category"
                    options={[
                      { value: 'All', label: 'All Categories' },
                      { value: 'Lab Report', label: 'Lab Report' },
                      { value: 'X-ray', label: 'X-ray' },
                      { value: 'Scan', label: 'Scan' },
                      { value: 'Prescription', label: 'Prescription' },
                      { value: 'Other', label: 'Other' }
                    ]}
                    value={fileCategoryFilter}
                    onChange={(e) => {
                      setFileCategoryFilter(e.target.value);
                      setFileCurrentPage(1);
                    }}
                    className="min-w-[160px]"
                  />
                  <Button id="upload-file-btn" onClick={() => setIsFileUploadOpen(true)} className="gap-2 shrink-0">
                    <UploadCloud className="w-4 h-4" />
                    <span>Upload File</span>
                  </Button>
                </div>
              </div>

              {/* Files Table list */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">File Name</th>
                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Category</th>
                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">Date Uploaded</th>
                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Size & Type</th>
                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 text-sm">
                    {filePaginated.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-slate-500 font-medium">
                          No files found matching the search filters. Try uploading a new attachment.
                        </td>
                      </tr>
                    ) : (
                      filePaginated.map((file) => (
                        <tr key={file.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                              <span className="font-semibold text-slate-800">{file.fileName}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant={
                              file.category === 'Lab Report' ? 'info' :
                              file.category === 'X-ray' ? 'danger' :
                              file.category === 'Scan' ? 'warning' :
                              file.category === 'Prescription' ? 'success' : 'neutral'
                            }>
                              {file.category}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-xs text-slate-500 font-medium font-mono">{file.uploadedDate}</td>
                          <td className="px-6 py-4">
                            <span className="text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded font-mono">
                              {file.size} ({file.fileType})
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-1.5">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  alert(`Mock download for file ${file.fileName} initiated successfully.`);
                                }}
                                className="p-1.5 border-slate-200 text-slate-500 hover:text-slate-800"
                                title="Download"
                              >
                                <Download className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteAttachment(file.id)}
                                className="p-1.5 border-slate-200 text-rose-500 hover:bg-rose-50 hover:border-rose-200"
                                title="Delete"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>

                {fileTotalRows > 0 && (
                  <Pagination
                    currentPage={fileCurrentPage}
                    totalPages={fileTotalPages}
                    onPageChange={setFileCurrentPage}
                    totalItems={fileTotalRows}
                    itemsPerPage={fileRowsPerPage}
                    itemNameSingular="document"
                    itemNamePlural="documents"
                  />
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* --- MODAL DIALOGS --- */}

      {/* A. REGISTER NEW PATIENT MODAL */}
      <Modal isOpen={isAddPatientOpen} onClose={() => setIsAddPatientOpen(false)} title="Register New Patient">
        <form onSubmit={handleRegisterPatientSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="First Name"
              value={newPatient.firstName}
              onChange={(e) => setNewPatient({ ...newPatient, firstName: e.target.value })}
              required
            />
            <Input
              label="Last Name"
              value={newPatient.lastName}
              onChange={(e) => setNewPatient({ ...newPatient, lastName: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Date Of Birth"
              type="date"
              value={newPatient.dateOfBirth}
              onChange={(e) => setNewPatient({ ...newPatient, dateOfBirth: e.target.value })}
              required
            />
            <Select
              label="Gender"
              value={newPatient.gender}
              onChange={(e) => setNewPatient({ ...newPatient, gender: e.target.value as any })}
              options={[
                { value: 'MALE', label: 'Male' },
                { value: 'FEMALE', label: 'Female' },
                { value: 'OTHER', label: 'Other' }
              ]}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Mobile Phone"
              value={newPatient.phone}
              onChange={(e) => setNewPatient({ ...newPatient, phone: e.target.value })}
              required
              placeholder="+91 XXXXX XXXXX"
            />
            <Input
              label="Email Address"
              type="email"
              value={newPatient.email}
              onChange={(e) => setNewPatient({ ...newPatient, email: e.target.value })}
              placeholder="patient@example.com"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Blood Group"
              value={newPatient.bloodGroup}
              onChange={(e) => setNewPatient({ ...newPatient, bloodGroup: e.target.value })}
              options={[
                { value: 'A+', label: 'A+' },
                { value: 'A-', label: 'A-' },
                { value: 'B+', label: 'B+' },
                { value: 'B-', label: 'B-' },
                { value: 'AB+', label: 'AB+' },
                { value: 'AB-', label: 'AB-' },
                { value: 'O+', label: 'O+' },
                { value: 'O-', label: 'O-' }
              ]}
            />
            <Input
              label="Initial Visit Purpose"
              value={newPatient.purpose}
              onChange={(e) => setNewPatient({ ...newPatient, purpose: e.target.value })}
              placeholder="e.g. Back pain evaluation"
            />
          </div>

          <Input
            label="Full Residential Address"
            value={newPatient.address}
            onChange={(e) => setNewPatient({ ...newPatient, address: e.target.value })}
            placeholder="House/Plot no, Sector, City, Country"
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Emergency Contact Name"
              value={newPatient.emergencyContactName}
              onChange={(e) => setNewPatient({ ...newPatient, emergencyContactName: e.target.value })}
              placeholder="Spouse / Parent Name"
            />
            <Input
              label="Emergency Contact Phone"
              value={newPatient.emergencyContactPhone}
              onChange={(e) => setNewPatient({ ...newPatient, emergencyContactPhone: e.target.value })}
              placeholder="+91 XXXXX XXXXX"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Known Allergies"
              value={newPatient.allergies}
              onChange={(e) => setNewPatient({ ...newPatient, allergies: e.target.value })}
              placeholder="e.g. Peanuts, Sulfa"
            />
            <Input
              label="Existing Diseases"
              value={newPatient.existingDiseases}
              onChange={(e) => setNewPatient({ ...newPatient, existingDiseases: e.target.value })}
              placeholder="e.g. Asthma, Thyroid"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Clinical Intake Logs</label>
            <textarea
              value={newPatient.clinicalNotes}
              onChange={(e) => setNewPatient({ ...newPatient, clinicalNotes: e.target.value })}
              className="w-full min-h-[70px] p-3 text-sm rounded-lg border border-slate-200 outline-none focus:border-brand-primary"
              placeholder="General clinical observations, initial diagnostics..."
            />
          </div>

          {/* Attachments Section in Add Patient Form */}
          <div className="border-t border-slate-100 pt-3 space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Add Initial Attachments</label>
              <span className="text-[10px] text-slate-400 font-medium">Max 10MB per file</span>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {(['Lab Report', 'X-ray', 'Scan', 'Prescription', 'Other'] as const).map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => handleAddTempAttachment(cat)}
                  className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs flex items-center gap-1 transition-colors border border-slate-200/50"
                >
                  <Plus className="w-3 h-3" />
                  <span>{cat}</span>
                </button>
              ))}
            </div>

            {tempAttachments.length > 0 && (
              <div className="bg-slate-50 rounded-lg p-2 max-h-[120px] overflow-y-auto space-y-1.5 border border-slate-100">
                {tempAttachments.map((file, i) => (
                  <div key={i} className="flex justify-between items-center text-xs bg-white px-2 py-1.5 rounded border border-slate-200/60">
                    <div className="flex items-center gap-1.5 truncate">
                      <FileText className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-semibold text-slate-700 truncate">{file.fileName}</span>
                      <span className="text-[10px] text-slate-400">({file.category})</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-1 rounded">{file.size}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTempAttachment(i)}
                        className="text-rose-500 hover:text-rose-700 font-bold cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsAddPatientOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              <UserPlus className="w-4 h-4" />
              <span>Register Patient</span>
            </Button>
          </div>
        </form>
      </Modal>

      {/* B. VIEW APPOINTMENT DETAILS POPUP */}
      <Modal
        isOpen={isViewAppointmentOpen}
        onClose={() => setIsViewAppointmentOpen(false)}
        title="Consultation Details"
      >
        {selectedAppointment && (
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide font-mono">Date & Time</span>
                <p className="text-sm font-bold text-slate-700">{selectedAppointment.appointmentDate}</p>
              </div>
              <Badge variant={selectedAppointment.status === 'SCHEDULED' ? 'info' : 'success'}>
                {selectedAppointment.status}
              </Badge>
            </div>

            {/* Doctor Info Card */}
            <div className="border border-slate-200 rounded-lg p-3.5 flex items-center gap-3">
              <img
                src={selectedAppointment.doctorAvatarUrl || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=250&auto=format&fit=crop'}
                alt={selectedAppointment.doctorName}
                referrerPolicy="no-referrer"
                className="w-12 h-12 rounded-full border border-slate-200 object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${selectedAppointment.doctorName}`;
                }}
              />
              <div className="space-y-0.5">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Presiding Clinician</span>
                <h5 className="font-bold text-slate-800 text-sm leading-tight">{selectedAppointment.doctorName}</h5>
                <p className="text-[10px] text-slate-400 font-semibold font-mono">ID: {selectedAppointment.doctorId}</p>
              </div>
            </div>

            {/* Reason block */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Appointment Reason / Diagnosis</span>
              <p className="text-xs text-slate-600 bg-slate-50 border border-slate-150 p-3 rounded-lg leading-relaxed font-semibold italic">
                "{selectedAppointment.reason}"
              </p>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <Button onClick={() => setIsViewAppointmentOpen(false)} className="px-4">
                Dismiss Details
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* C. CREATE NEW PRESCRIPTION DRAWER / SCREEN */}
      <Drawer
        isOpen={isCreatePrescriptionOpen}
        onClose={() => setIsCreatePrescriptionOpen(false)}
        title="Compose New Patient Prescription"
      >
        <form onSubmit={handleCreatePrescriptionSubmit} className="space-y-5">
          {/* Prescribing Doctor Selector */}
          {currentUser?.role === 'DOCTOR' ? (
            <div className="space-y-1.5 text-left">
              <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Prescribing Doctor</span>
              <div className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-700">
                {doctorsList.find(d => d.email?.toLowerCase() === currentUser.email?.toLowerCase())?.name || (currentUser.firstName + " " + currentUser.lastName)}
              </div>
            </div>
          ) : (
            <Select
              label="Prescribed By (Doctor) *"
              value={newPrescription.doctorId}
              onChange={(e) => setNewPrescription({ ...newPrescription, doctorId: e.target.value })}
              options={doctorsList.map((d) => ({ value: d.id, label: `${d.name} (${d.specialization})` }))}
              required
            />
          )}

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Issue Date *"
              type="date"
              value={newPrescription.issueDate}
              onChange={(e) => setNewPrescription({ ...newPrescription, issueDate: e.target.value })}
              required
            />
            <Input
              label="Next Visit Date"
              type="date"
              value={newPrescription.nextVisitDate}
              onChange={(e) => setNewPrescription({ ...newPrescription, nextVisitDate: e.target.value })}
            />
          </div>

          {prescriptionSettings?.showDiagnosis !== false && (
            <Input
              label="Diagnosis / Findings *"
              value={newPrescription.diagnosis}
              onChange={(e) => setNewPrescription({ ...newPrescription, diagnosis: e.target.value })}
              required
              placeholder="e.g. Stage 1 Essential Hypertension"
            />
          )}

          <div className="grid grid-cols-2 gap-4 text-left">
            {prescriptionSettings?.showPatientHistory !== false && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Symptoms</label>
                <textarea
                  value={newPrescription.symptoms}
                  onChange={(e) => setNewPrescription({ ...newPrescription, symptoms: e.target.value })}
                  className="w-full min-h-[60px] p-2.5 text-xs rounded-lg border border-slate-200 outline-none focus:border-brand-primary"
                  placeholder="Morning headaches, blood pressure 140/90..."
                />
              </div>
            )}
            {prescriptionSettings?.showVitals !== false && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Clinical Notes</label>
                <textarea
                  value={newPrescription.clinicalNotes}
                  onChange={(e) => setNewPrescription({ ...newPrescription, clinicalNotes: e.target.value })}
                  className="w-full min-h-[60px] p-2.5 text-xs rounded-lg border border-slate-200 outline-none focus:border-brand-primary"
                  placeholder="Rhythm evaluation normal. Low sodium advice..."
                />
              </div>
            )}
          </div>

          {/* MEDICINES FORM TABLE INTERFACE */}
          <div className="border-t border-slate-200 pt-4 space-y-3">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block text-left">
              Medicines Table * (At least one required)
            </label>

            {/* Quick Medicine Add Form */}
            <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-3 space-y-3">
              <div className="grid grid-cols-2 gap-2 text-left">
                <Input
                  label="Medicine Name"
                  value={newMedicine.medicineName}
                  onChange={(e) => setNewMedicine({ ...newMedicine, medicineName: e.target.value })}
                  placeholder="Amlodipine / Paracetamol"
                />
                {prescriptionSettings?.showDosageInstructions !== false ? (
                  <Input
                    label="Dosage"
                    value={newMedicine.dosage}
                    onChange={(e) => setNewMedicine({ ...newMedicine, dosage: e.target.value })}
                    placeholder="500 mg / 1 Puff"
                  />
                ) : (
                  <div />
                )}
              </div>
              <div className="grid grid-cols-3 gap-2 text-left">
                <Input
                  label="Frequency"
                  value={newMedicine.frequency}
                  onChange={(e) => setNewMedicine({ ...newMedicine, frequency: e.target.value })}
                  placeholder="Once daily"
                />
                {prescriptionSettings?.showDuration !== false ? (
                  <Input
                    label="Duration"
                    value={newMedicine.duration}
                    onChange={(e) => setNewMedicine({ ...newMedicine, duration: e.target.value })}
                    placeholder="7 Days"
                  />
                ) : (
                  <div />
                )}
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider invisible">Add</span>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddMedicine}
                    className="w-full h-[38px] text-xs font-bold border-brand-primary text-brand-primary hover:bg-blue-50 shrink-0"
                  >
                    Add Med
                  </Button>
                </div>
              </div>
              <Input
                label="Instructions"
                value={newMedicine.instructions}
                onChange={(e) => setNewMedicine({ ...newMedicine, instructions: e.target.value })}
                placeholder="After food / Empty stomach / bedtime"
              />
            </div>

            {/* Added Medicines Table list */}
            {medicinesList.length === 0 ? (
              <p className="text-xs text-rose-600 font-bold italic bg-rose-50/50 p-2.5 rounded border border-rose-100 text-center">
                Please add at least one medicine using the controller above.
              </p>
            ) : (
              <div className="bg-white border border-slate-200 rounded-lg overflow-hidden max-h-[160px] overflow-y-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="p-2 font-semibold text-slate-500">Name</th>
                      <th className="p-2 font-semibold text-slate-500">Dosage</th>
                      <th className="p-2 font-semibold text-slate-500">Frequency / Duration</th>
                      <th className="p-2 font-semibold text-slate-500 text-right">Delete</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {medicinesList.map((med) => (
                      <tr key={med.id} className="hover:bg-slate-50/50">
                        <td className="p-2">
                          <p className="font-bold text-slate-800">{med.medicineName}</p>
                          <p className="text-[10px] text-slate-400">{med.instructions}</p>
                        </td>
                        <td className="p-2 font-semibold text-slate-700">{med.dosage}</td>
                        <td className="p-2 text-slate-600 font-medium">
                          {med.frequency} • {med.duration}
                        </td>
                        <td className="p-2 text-right">
                          <button
                            type="button"
                            onClick={() => handleDeleteMedicine(med.id)}
                            className="text-rose-500 hover:text-rose-700 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="border-t border-slate-200 pt-4 space-y-3">
            <Input
              label="Tests Recommended"
              value={newPrescription.testsRecommended}
              onChange={(e) => setNewPrescription({ ...newPrescription, testsRecommended: e.target.value })}
              placeholder="e.g. Lipid Profile, Complete Blood Count, ECG"
            />
            <Input
              label="General Advice / Diet"
              value={newPrescription.advice}
              onChange={(e) => setNewPrescription({ ...newPrescription, advice: e.target.value })}
              placeholder="e.g. Limit salt. Drink plenty of water."
            />
          </div>

          <div className="flex gap-3 pt-4 border-t border-slate-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCreatePrescriptionOpen(false)}
              className="w-full"
            >
              Cancel
            </Button>
            <Button type="submit" className="w-full">
              Save Prescription
            </Button>
          </div>
        </form>
      </Drawer>

      {/* D. PRESCRIPTION PREVIEW MODAL (A4 PRINTABLE STYLE) */}
      <Modal
        isOpen={isPrescriptionPreviewOpen}
        onClose={() => setIsPrescriptionPreviewOpen(false)}
        title="Prescription Document Preview"
      >
        {previewPrescription && selectedPatient && (
          <div className="space-y-6">
            {/* Print Header Action */}
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <span className="text-xs text-slate-500 font-medium font-sans">
                A4 Clinical Layout. Press Print to generate physical copy.
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  window.print();
                }}
                className="gap-1 px-3"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Document</span>
              </Button>
            </div>

            {/* A4 sheet simulation */}
            {(() => {
              const pSettings = prescriptionSettings;
              const showLogo = pSettings ? pSettings.showClinicLogo : true;
              const headerLayout = pSettings?.headerLayout || 'CENTERED_PROFESSIONAL';
              
              const clinicName = clinicSettings?.name || 'HealthFlow';
              const clinicAddress = clinicSettings?.addressLine 
                ? `${clinicSettings.addressLine}, ${clinicSettings.city}, ${clinicSettings.state} - ${clinicSettings.pincode}` 
                : 'Sector 17, Main Road, Chandigarh, India';
              const clinicPhone = clinicSettings?.phone || '+91 172 555 1200';
              const clinicEmail = clinicSettings?.email || 'support@healthflow.com';

              const showDocQuals = pSettings ? pSettings.showDoctorQualifications : true;
              const showDocDept = pSettings ? pSettings.showDoctorDepartment : true;
              const showVitals = pSettings ? pSettings.showVitals : true;
              const showHistory = pSettings ? pSettings.showPatientHistory : true;
              const showDiagnosis = pSettings ? pSettings.showDiagnosis : true;
              const showDuration = pSettings ? pSettings.showDuration : true;
              const showDosage = pSettings ? pSettings.showDosageInstructions : true;

              return (
                <div id="printable-area" className="bg-white border border-slate-300 p-6 rounded-lg shadow-inner text-slate-800 space-y-6 min-h-[500px]">
                  {/* Header */}
                  <div className={`flex ${
                    headerLayout === 'CENTERED_PROFESSIONAL' 
                      ? 'flex-col items-center text-center gap-2 border-b-2 border-brand-primary pb-4' 
                      : headerLayout === 'MODERN_MINIMAL' 
                        ? 'flex-row justify-between items-center border-b border-slate-200 pb-3' 
                        : 'flex-row justify-between items-start border-b-2 border-brand-primary pb-4'
                  }`}>
                    <div className={`space-y-1 flex flex-col ${headerLayout === 'CENTERED_PROFESSIONAL' ? 'items-center' : 'items-start'}`}>
                      <div className="flex items-center gap-1.5">
                        {showLogo && <Activity className="w-6 h-6 text-brand-primary shrink-0" />}
                        <h1 className="text-xl font-display font-bold text-brand-primary tracking-wider uppercase">{clinicName}</h1>
                      </div>
                      <p className="text-xs font-bold text-slate-500 leading-normal">
                        Premier Healthcare and Multi-Specialty Clinic<br />
                        {clinicAddress}<br />
                        Phone: {clinicPhone} | {clinicEmail}
                      </p>
                    </div>
                    <div className={`text-right space-y-1 bg-slate-50 p-2 rounded border border-slate-200 ${
                      headerLayout === 'CENTERED_PROFESSIONAL' ? 'mt-2 w-full flex justify-between items-center text-left' : ''
                    }`}>
                      <div>
                        <p className="text-xs font-mono font-bold text-slate-400 uppercase">Prescription Sheet</p>
                        <p className="text-sm font-bold text-slate-800">{previewPrescription.id}</p>
                      </div>
                      <p className="text-xs text-slate-500 font-medium">Date: {previewPrescription.issueDate}</p>
                    </div>
                  </div>

                  {/* Patient & Doctor metadata */}
                  <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-3.5 rounded-lg border border-slate-100">
                    <div className="space-y-1 text-left">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Patient Information</p>
                      <p className="text-sm font-bold text-slate-800">
                        {selectedPatient.firstName} {selectedPatient.lastName}
                      </p>
                      <p className="text-slate-600 font-medium">
                        ID: {selectedPatient.patientNumber} | Age: {new Date().getFullYear() - new Date(selectedPatient.dateOfBirth).getFullYear()} Yrs | Gender: {selectedPatient.gender}
                      </p>
                      <p className="text-slate-500">Phone: {selectedPatient.phone}</p>
                    </div>
                    <div className="space-y-1 text-right">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Prescribed By</p>
                      <p className="text-sm font-bold text-slate-800">{previewPrescription.doctorName}</p>
                      {showDocQuals && <p className="text-slate-600 font-bold">{previewPrescription.doctorSpecialization}</p>}
                      {showDocDept && <p className="text-slate-500 font-semibold font-mono">Department: Outpatient Services</p>}
                      <p className="text-slate-400 font-medium font-mono text-[10px]">Reg No: REG-{previewPrescription.id.split('-')[1] || '87421'}</p>
                    </div>
                  </div>

                  {/* Diagnosis / Symptoms */}
                  {(showDiagnosis || showHistory) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs border-b border-slate-100 pb-4 text-left">
                      {showDiagnosis && (
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Diagnosis Findings</p>
                          <p className="font-bold text-slate-800 text-sm leading-normal">{previewPrescription.diagnosis}</p>
                        </div>
                      )}
                      {showHistory && previewPrescription.symptoms && (
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Symptoms Observed</p>
                          <p className="text-slate-600 italic leading-relaxed font-semibold">"{previewPrescription.symptoms}"</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Rx Medicines List */}
                  <div className="space-y-3 text-left">
                    <div className="flex items-center gap-1.5 text-brand-primary">
                      <span className="font-display font-black text-xl italic leading-none">Rx</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pt-1">Prescribed Medicines</span>
                    </div>

                    <div className="border border-slate-200 rounded-lg overflow-hidden">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead className="bg-slate-50 border-b border-slate-200">
                          <tr>
                            <th className="p-3 font-bold text-slate-600">Medicine & Instructions</th>
                            {showDosage && <th className="p-3 font-bold text-slate-600">Dosage</th>}
                            <th className="p-3 font-bold text-slate-600">Frequency</th>
                            {showDuration && <th className="p-3 font-bold text-slate-600 text-right">Duration</th>}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {previewPrescription.medicines.map((med, index) => (
                            <tr key={med.id || index}>
                              <td className="p-3">
                                <p className="font-bold text-slate-800">{med.medicineName}</p>
                                <p className="text-[10px] text-slate-500 font-medium italic">{med.instructions}</p>
                              </td>
                              {showDosage && <td className="p-3 font-semibold text-slate-700">{med.dosage}</td>}
                              <td className="p-3 text-slate-600 font-semibold">{med.frequency}</td>
                              {showDuration && <td className="p-3 text-slate-700 font-bold text-right">{med.duration}</td>}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Additional parameters */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2 text-left">
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Recommended Diagnostic Tests</p>
                      <p className="font-semibold text-slate-700 leading-normal">{previewPrescription.testsRecommended || 'None'}</p>
                    </div>
                    {showVitals && (
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Clinical Intake Logs / Vitals</p>
                        <p className="font-semibold text-slate-700 leading-normal">{previewPrescription.clinicalNotes || 'None'}</p>
                      </div>
                    )}
                  </div>

                  {/* Footer details */}
                  <div className="flex justify-between items-end pt-12 border-t border-slate-100 text-xs text-left">
                    <div>
                      <p className="font-semibold text-slate-500">
                        Next Scheduled Consultation Visit: <strong className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{previewPrescription.nextVisitDate || 'As Needed'}</strong>
                      </p>
                    </div>
                    <div className="text-right space-y-3 shrink-0">
                      <div className="w-36 h-px bg-slate-300 mx-auto" />
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Clinician Signature</p>
                    </div>
                  </div>
                </div>
              );
            })()}

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <Button onClick={() => setIsPrescriptionPreviewOpen(false)} className="px-5">
                Close Preview
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* E. UPLOAD NEW FILE ATTACHMENT MODAL */}
      <Modal isOpen={isFileUploadOpen} onClose={() => setIsFileUploadOpen(false)} title="Upload Patient Attachment">
        <form onSubmit={handleFileUploadSubmit} className="space-y-4">
          <Select
            label="Document Category *"
            value={newUploadedFile.category}
            onChange={(e) => {
              setNewUploadedFile({ ...newUploadedFile, category: e.target.value as any });
              setFileError(null);
            }}
            options={[
              { value: 'Lab Report', label: 'Lab Report' },
              { value: 'X-ray', label: 'X-ray' },
              { value: 'Scan', label: 'Scan' },
              { value: 'Prescription', label: 'Prescription' },
              { value: 'Other', label: 'Other' }
            ]}
          />

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block">
              File Attachment *
            </label>
            
            {/* Simulation drag and drop area */}
            <div 
              onClick={() => simulateFileChoose(newUploadedFile.category)}
              className="border-2 border-dashed border-slate-200 hover:border-brand-primary bg-slate-50 hover:bg-blue-50/20 rounded-xl p-8 text-center cursor-pointer transition-all duration-150 space-y-2 group"
            >
              <UploadCloud className="w-8 h-8 text-slate-400 group-hover:text-brand-primary mx-auto transition-colors" />
              <div>
                <p className="text-xs font-bold text-slate-700">Click to simulated choose a file</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Supports PDF, PNG, JPG, XLSX (Max 10 MB per file)</p>
              </div>
            </div>
          </div>

          {newUploadedFile.fileName && (
            <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-3 flex justify-between items-center text-xs">
              <div className="flex items-center gap-2 truncate">
                <FileText className="w-4 h-4 text-brand-primary" />
                <span className="font-bold text-slate-800 truncate">{newUploadedFile.fileName}</span>
              </div>
              <span className={`font-mono font-bold text-[10px] px-2 py-0.5 rounded ${
                newUploadedFile.sizeBytes > 10 * 1024 * 1024 ? 'text-rose-700 bg-rose-50' : 'text-slate-600 bg-slate-100'
              }`}>
                {(newUploadedFile.sizeBytes / (1024 * 1024)).toFixed(2)} MB
              </span>
            </div>
          )}

          {fileError && (
            <p className="text-xs font-semibold text-rose-600 flex items-center gap-1.5 bg-rose-50 p-2.5 rounded border border-rose-100">
              <AlertCircle className="w-4 h-4" />
              <span>{fileError}</span>
            </p>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsFileUploadOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!newUploadedFile.fileName || !!fileError}>
              Submit Document
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
