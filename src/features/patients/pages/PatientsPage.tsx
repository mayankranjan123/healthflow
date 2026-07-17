import React, { useState, useEffect, useCallback } from 'react';
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
  Printer,
  Check,
  Briefcase,
  Bell,
  MoreVertical,
  MessageSquare,
  MapPin,
  SlidersHorizontal,
  Pill,
  Info,
  FlaskConical,
  Syringe
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
import { mockPrescriptionsApi } from '../utils/mockPrescriptionsApi';
import { mockAppointmentsApi } from '../../appointments/utils/mockAppointmentsApi';

const formatDob = (dateStr: string): string => {
  if (!dateStr) return 'N/A';
  try {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = d.getDate();
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
  } catch (e) {
    return dateStr;
  }
};

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
      } catch (e) { }
    }
  }, []);

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Page View state
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');
  const [selectedPatient, setSelectedPatient] = useState<PatientProfileExtended | null>(null);
  const [profileTab, setProfileTab] = useState<'profile' | 'appointments' | 'prescriptions' | 'files'>('profile');

  // Search & Filters state for primary directory
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [genderFilter, setGenderFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [tempGenderFilter, setTempGenderFilter] = useState('All');

  useEffect(() => {
    setTempGenderFilter(genderFilter);
  }, [genderFilter]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Modal open controllers
  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false);
  const [isCreatePrescriptionOpen, setIsCreatePrescriptionOpen] = useState(false);
  const [isViewAppointmentOpen, setIsViewAppointmentOpen] = useState(false);
  const [isFileUploadOpen, setIsFileUploadOpen] = useState(false);
  const [isPrescriptionPreviewOpen, setIsPrescriptionPreviewOpen] = useState(false);

  // Selected details targets
  const [selectedAppointment, setSelectedAppointment] = useState<PatientAppointment | null>(null);
  const [previewPrescription, setPreviewPrescription] = useState<PatientPrescription | null>(null);
  const [loadedPrescriptions, setLoadedPrescriptions] = useState<PatientPrescription[]>([]);
  const [isLoadingPrescriptions, setIsLoadingPrescriptions] = useState(false);

  // Patient Appointments State (backend loaded)
  const [patientAppointments, setPatientAppointments] = useState<any[]>([]);
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(false);

  // Patient Files State (backend loaded)
  const [patientFiles, setPatientFiles] = useState<any[]>([]);
  const [fileTotalRows, setFileTotalRows] = useState(0);
  const [fileTotalPages, setFileTotalPages] = useState(1);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [debouncedFileSearch, setDebouncedFileSearch] = useState('');

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
  const [showUploadBanner, setShowUploadBanner] = useState(true);
  const [mobileFileCategory, setMobileFileCategory] = useState('All');

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
  const [newUploadedFile, setNewUploadedFile] = useState<{
    fileName: string;
    category: 'Lab Report' | 'Other' | 'X-ray' | 'Prescription' | 'Scan';
    sizeBytes: number;
    fileType: string;
    uploadId?: string;
  }>({
    fileName: '',
    category: 'Lab Report',
    sizeBytes: 0,
    fileType: 'PDF'
  });
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isUploadingFile, setIsUploadingFile] = useState(false);

  // Prescription Settings State
  const [prescriptionSettings, setPrescriptionSettings] = useState<any>(null);
  const [clinicSettings, setClinicSettings] = useState<any>(null);

  // Search debouncing handler
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Files Search debouncing handler
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedFileSearch(fileSearch);
      setFileCurrentPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [fileSearch]);

  // Load patients list dynamically
  const loadPatientsList = useCallback(() => {
    setIsLoading(true);
    let patientIdParam: string | undefined = undefined;
    let patientMobileParam: string | undefined = undefined;
    let patientNameParam: string | undefined = undefined;

    const trimmed = debouncedSearch.trim();
    if (trimmed) {
      if (trimmed.toUpperCase().startsWith('PT-') || /^\d+$/.test(trimmed)) {
        if (/^\d{7,15}$/.test(trimmed)) {
          patientMobileParam = trimmed;
        } else {
          patientIdParam = trimmed;
        }
      } else {
        patientNameParam = trimmed;
      }
    }

    mockPatientsApi.getPatients({
      pageNo: currentPage - 1,
      pageSize: rowsPerPage,
      patientId: patientIdParam,
      patientMobile: patientMobileParam,
      patientName: patientNameParam,
      gender: genderFilter,
    })
      .then((res: any) => {
        setPatients(res.items || []);
        setTotalItems(res.totalItems || 0);
        setTotalPages(res.totalPages || 1);
      })
      .catch((err) => {
        console.error("Failed to load patients list: ", err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [debouncedSearch, genderFilter, currentPage, rowsPerPage]);

  useEffect(() => {
    loadPatientsList();
  }, [loadPatientsList]);

  // Load patient files dynamically
  const loadPatientFiles = useCallback(() => {
    if (!selectedPatient) return;
    setIsLoadingFiles(true);
    mockPatientsApi.getFiles(selectedPatient.id, {
      fileName: debouncedFileSearch,
      pageNo: fileCurrentPage - 1,
      pageSize: fileRowsPerPage,
    })
      .then((res: any) => {
        setPatientFiles(res.items || []);
        setFileTotalRows(res.totalItems || 0);
        setFileTotalPages(res.totalPages || 1);
      })
      .catch((err) => {
        console.error("Failed to load patient files: ", err);
      })
      .finally(() => {
        setIsLoadingFiles(false);
      });
  }, [selectedPatient?.id, debouncedFileSearch, fileCurrentPage, fileRowsPerPage]);

  useEffect(() => {
    if (selectedPatient && profileTab === 'files') {
      loadPatientFiles();
    }
  }, [profileTab, selectedPatient?.id, loadPatientFiles]);

  // Load patient appointments dynamically
  useEffect(() => {
    if (selectedPatient && profileTab === 'appointments') {
      setIsLoadingAppointments(true);
      mockAppointmentsApi.getAppointments({
        patientId: selectedPatient.id,
        pageSize: 100, // Load all completed/upcoming appointments for this patient
      })
        .then((res: any) => {
          setPatientAppointments(res.items || []);
        })
        .catch((err) => {
          console.error("Failed to load patient appointments: ", err);
        })
        .finally(() => {
          setIsLoadingAppointments(false);
        });
    }
  }, [profileTab, selectedPatient?.id]);

  // Initialize data
  useEffect(() => {
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

  // Load doctors list only when in detail view mode (to optimize API calls)
  useEffect(() => {
    if (viewMode === 'detail') {
      mockDoctorsApi.getDoctors().then(setDoctorsList);
    }
  }, [viewMode]);

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

  // Load prescriptions from API when tab is prescriptions or patient changes
  useEffect(() => {
    if (selectedPatient && profileTab === 'prescriptions') {
      setIsLoadingPrescriptions(true);
      mockPrescriptionsApi.getPrescriptions(selectedPatient.id)
        .then((data) => {
          setLoadedPrescriptions(data);
        })
        .catch((err) => {
          console.error("Failed to load prescriptions from backend: ", err);
        })
        .finally(() => {
          setIsLoadingPrescriptions(false);
        });
    }
  }, [profileTab, selectedPatient?.id]);

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

    mockPatientsApi.addPatient(patientToAdd).then((createdPatient) => {
      const uploadPromises = attachmentsMapped.map(att =>
        mockPatientsApi.uploadFile(createdPatient.id, att)
      );
      Promise.all(uploadPromises).then(() => {
        loadPatientsList();
      });
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
      nextVisitDate: newPrescription.nextVisitDate || 'None',
      headerLayout: prescriptionSettings?.headerLayout || 'CENTERED_PROFESSIONAL'
    };

    const updatedPatient: PatientProfileExtended = {
      ...selectedPatient,
      prescriptions: [newPrsc, ...(selectedPatient.prescriptions || [])]
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
        ...(selectedPatient.appointments || [])
      ];
    }

    mockPrescriptionsApi.createPrescription(newPrsc).then(() => {
      // Reload prescriptions from backend
      mockPrescriptionsApi.getPrescriptions(selectedPatient.id).then(setLoadedPrescriptions);

      // Update general patient profile (like next visit / appointments)
      mockPatientsApi.updatePatient(updatedPatient).then(() => {
        mockPatientsApi.getPatients().then(setPatients);
      });
    }).catch(err => {
      console.error("Failed to save prescription: ", err);
      alert("Failed to save prescription. Please try again.");
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
  const handleRealFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size limit (< 2MB)
    const limitBytes = 2 * 1024 * 1024;
    if (file.size >= limitBytes) {
      setFileError("File size must be less than 2MB.");
      return;
    }

    // Validate type (PDF, PNG, JPG/JPEG)
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    const isValidExt = ext === 'pdf' || ext === 'png' || ext === 'jpg' || ext === 'jpeg';
    if (!isValidExt) {
      setFileError("Only PDF, PNG, and JPG files are allowed.");
      return;
    }

    setFileError(null);
    setIsUploadingFile(true);

    try {
      const formDataUpload = new FormData();
      formDataUpload.append("file", file);

      const tokenCached = localStorage.getItem('healthflow_user');
      let headers: HeadersInit = {};
      if (tokenCached) {
        const parsed = JSON.parse(tokenCached);
        if (parsed && parsed.token) {
          headers["Authorization"] = `Bearer ${parsed.token}`;
        }
      }

      const response = await fetch("/api/v1/uploads", {
        method: "POST",
        headers: headers,
        body: formDataUpload
      });

      const result = await response.json();
      if (response.ok && result.success) {
        setNewUploadedFile({
          fileName: file.name,
          category: newUploadedFile.category,
          sizeBytes: file.size,
          fileType: ext.toUpperCase(),
          uploadId: result.data.uploadId
        });
      } else {
        setFileError(result.message || "Failed to upload file to storage.");
      }
    } catch (err: any) {
      setFileError("Upload error: " + err.message);
    } finally {
      setIsUploadingFile(false);
    }
  };

  const handleFileUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;
    if (!newUploadedFile.fileName) {
      setFileError('Please select a file to upload.');
      return;
    }

    const newFile: PatientAttachment = {
      id: `ATT-UPLOAD-${Date.now()}`,
      fileName: newUploadedFile.fileName,
      uploadedDate: new Date().toISOString().split('T')[0],
      category: newUploadedFile.category,
      size: `${(newUploadedFile.sizeBytes / (1024 * 1024)).toFixed(2)} MB`,
      fileType: newUploadedFile.fileType,
      uploadId: newUploadedFile.uploadId
    };

    mockPatientsApi.uploadFile(selectedPatient.id, newFile).then(() => {
      loadPatientFiles();
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
  const handleDeleteAttachment = (fileId: string | number) => {
    if (!selectedPatient) return;
    if (confirm('Are you sure you want to delete this file permanently?')) {
      mockPatientsApi.deleteFile(selectedPatient.id, fileId).then(() => {
        loadPatientFiles();
      });
    }
  };

  // Download Prescription PDF
  const handleDownloadPrescriptionPdf = () => {
    if (!previewPrescription || !selectedPatient) return;
    const element = document.getElementById('printable-area');
    if (!element) return;

    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.width = '800px';
    iframe.style.height = '1130px';
    iframe.style.left = '-10000px';
    iframe.style.top = '-10000px';
    document.body.appendChild(iframe);

    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) {
      document.body.removeChild(iframe);
      return;
    }

    const filename = `prescription-${previewPrescription.id}.pdf`;

    // Write content to iframe - loading both scripts inside the iframe context
    doc.open();
    doc.write(`
      <html>
        <head>
          <title>Prescription</title>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">
          <script src="https://cdn.tailwindcss.com"></script>
          <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
          <script>
            tailwind.config = {
              theme: {
                extend: {
                  colors: {
                    'brand-primary': '#005ae2',
                    'brand-secondary': '#0ea5e9',
                    'brand-dark': '#0f172a',
                    'brand-muted': '#64748b',
                    slate: {
                      150: '#f1f5f9',
                      250: '#cbd5e1',
                      350: '#94a3b8',
                      450: '#64748b',
                      505: '#475569',
                      707: '#1e293b',
                      750: '#334155'
                    }
                  },
                  fontFamily: {
                    sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
                    display: ["Space Grotesk", "sans-serif"]
                  }
                }
              }
            }
          </script>
          <style>
            body { background: white; margin: 0; padding: 0; font-family: "Inter", sans-serif; }
            #printable-area { border: none !important; box-shadow: none !important; border-radius: 0px !important; padding: 0 !important; }
          </style>
        </head>
        <body>
          <div id="printable-area">${element.innerHTML}</div>
        </body>
      </html>
    `);
    doc.close();

    const runDownload = () => {
      const iframeWindow = iframe.contentWindow as any;
      const iframeElement = doc.getElementById('printable-area');

      if (iframeWindow && iframeWindow.html2pdf && iframeElement) {
        const opt = {
          margin: 0.4,
          filename: filename,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, logging: false },
          jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
        };

        iframeWindow.html2pdf().from(iframeElement).set(opt).output('blob').then((pdfBlob: Blob) => {
          const blobUrl = URL.createObjectURL(pdfBlob);
          const link = document.createElement('a');
          link.href = blobUrl;
          link.download = filename;
          document.body.appendChild(link);
          link.click();

          // Cleanup resources
          document.body.removeChild(link);
          URL.revokeObjectURL(blobUrl);
          document.body.removeChild(iframe);
        }).catch((err: any) => {
          console.error("PDF generation failed: ", err);
          document.body.removeChild(iframe);
        });
      } else {
        document.body.removeChild(iframe);
      }
    };

    // Check script load completion inside the iframe context
    const checkAndRun = () => {
      const iframeWindow = iframe.contentWindow as any;
      if (iframeWindow && iframeWindow.html2pdf && iframeWindow.tailwind) {
        runDownload();
      } else {
        let elapsed = 0;
        const interval = setInterval(() => {
          elapsed += 100;
          if (iframeWindow && iframeWindow.html2pdf && iframeWindow.tailwind) {
            clearInterval(interval);
            runDownload();
          } else if (elapsed >= 3000) {
            clearInterval(interval);
            alert("Failed to render layout styles. Please print the prescription instead.");
            document.body.removeChild(iframe);
          }
        }, 100);
      }
    };

    checkAndRun();
  };

  // View Patient Details
  const handleViewDetails = (patient: PatientProfileExtended) => {
    setSelectedPatient(patient);
    setProfileTab('profile');
    setViewMode('detail');
  };

  // --- FILTERS & SEARCH PROCESSORS ---

  // Main Pagination
  const mainTotalRows = totalItems;
  const mainPaginatedPatients = patients;
  const mainTotalPages = totalPages;

  // Selected Patient Prescriptions filters
  const getFilteredPrescriptions = () => {
    if (!selectedPatient) return [];
    return (loadedPrescriptions || []).filter((prsc) => {
      // Date bounds
      if (prescFromDate && new Date(prsc.issueDate) < new Date(prescFromDate)) return false;
      if (prescToDate && new Date(prsc.issueDate) > new Date(prescToDate)) return false;
      // Doctor match
      if (prescDoctorId !== 'All' && prsc.doctorId !== prescDoctorId) return false;
      return true;
    });
  };

  // Selected Patient Files server-side pagination mapping
  const filePaginated = patientFiles;

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
        isMobile ? (
          <div className="space-y-4 pb-20 animate-fade-in-up">
            {/* Mobile Header */}
            <div className="flex flex-col gap-3">
              <h2 className="text-2xl font-display font-bold text-slate-900 tracking-tight">Patient Directory</h2>
              <Button
                id="add-patient-btn"
                onClick={() => setIsAddPatientOpen(true)}
                className="w-full shadow-sm py-3 bg-brand-primary text-white font-semibold text-sm rounded-xl flex items-center justify-center gap-2 cursor-pointer h-11 animate-fade-in"
              >
                <Plus className="w-4.5 h-4.5" />
                <span>Add Patient</span>
              </Button>
            </div>

            {/* Metrics Cards: Side-by-side 2-column grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-3xs flex flex-col justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none">Total Patients</span>
                <p className="text-2xl font-extrabold text-brand-primary leading-none mt-2 font-display">{totalItems}</p>
              </div>
              <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-3xs flex flex-col justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none">Active Today</span>
                <p className="text-2xl font-extrabold text-teal-600 leading-none mt-2 font-display">42</p>
              </div>
            </div>

            {/* Search Input and Filter Slider */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  id="search-patient-input"
                  type="text"
                  placeholder="Search by name, ID, or phone"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-10 pr-3 h-11 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all text-slate-700 font-medium shadow-3xs"
                />
              </div>
              <button
                onClick={() => setIsMobileFilterOpen(true)}
                className={`w-11 h-11 rounded-xl border flex items-center justify-center transition-all bg-white shadow-3xs cursor-pointer ${genderFilter !== 'All'
                  ? 'border-brand-primary text-brand-primary bg-blue-50/30'
                  : 'border-slate-200 text-slate-500 hover:text-slate-750'
                  }`}
              >
                <SlidersHorizontal className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Active filters badge */}
            {genderFilter !== 'All' && (
              <div className="flex items-center gap-1.5 pt-0.5 animate-fade-in">
                <Badge variant="info" className="flex items-center gap-1">
                  <span>Gender: {genderFilter === 'MALE' ? 'Male' : genderFilter === 'FEMALE' ? 'Female' : 'Other'}</span>
                  <button onClick={() => {
                    setGenderFilter('All');
                    setCurrentPage(1);
                  }} className="hover:text-blue-900 font-bold ml-1 text-xs">×</button>
                </Badge>
                <button
                  onClick={() => {
                    setGenderFilter('All');
                    setCurrentPage(1);
                  }}
                  className="text-xs text-slate-500 hover:text-brand-primary font-bold px-2 py-0.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Clear Filters
                </button>
              </div>
            )}

            {/* Patient cards list */}
            <div className="space-y-3.5 pt-1">
              {isLoading && patients.length === 0 ? (
                <div className="py-12 bg-white border border-slate-200 rounded-2xl flex flex-col justify-center items-center gap-3 shadow-3xs animate-fade-in">
                  <div className="w-8 h-8 border-3 border-brand-primary border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm text-slate-400 font-medium">Loading Patients...</span>
                </div>
              ) : patients.length === 0 ? (
                <div className="py-12 bg-white border border-slate-200 rounded-2xl text-center text-slate-400 font-medium text-sm shadow-3xs animate-fade-in">
                  No patients found matching your search.
                </div>
              ) : (
                <div className="space-y-3">
                  {patients.map((pat) => (
                    <div
                      key={pat.id}
                      onClick={() => handleViewDetails(pat)}
                      className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between shadow-3xs hover:shadow-2xs transition-all active:scale-[0.995] cursor-pointer animate-fade-in-up"
                    >
                      <div className="flex items-center gap-3.5 min-w-0 flex-1">
                        <img
                          src={pat.avatarUrl}
                          alt={pat.firstName}
                          referrerPolicy="no-referrer"
                          className="w-12 h-12 rounded-full border border-slate-150 object-cover bg-slate-50 shrink-0"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${pat.firstName}%20${pat.lastName}`;
                          }}
                        />
                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-bold text-slate-800 text-sm leading-snug truncate max-w-[150px]">
                              {pat.firstName} {pat.lastName}
                            </h4>
                            <span className={`px-2 py-0.5 text-[9px] font-extrabold rounded-full uppercase tracking-wider ${pat.gender === 'MALE' ? 'bg-blue-50 text-blue-700' :
                              pat.gender === 'FEMALE' ? 'bg-rose-50 text-rose-700' :
                                'bg-slate-100 text-slate-700'
                              }`}>
                              {pat.gender}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 font-bold font-mono tracking-wide leading-none">
                            {pat.patientNumber} • <span className="font-semibold text-slate-500 font-sans">DOB: {pat.dateOfBirth}</span>
                          </p>
                          <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium pt-0.5">
                            <Phone className="w-3.2 h-3.2 text-slate-400 shrink-0" />
                            <span className="font-mono">{pat.phone}</span>
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-350 shrink-0 ml-2" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Load More Pagination */}
            {totalItems > patients.length && !isLoading && (
              <div className="flex flex-col items-center gap-3 pt-4">
                <span className="text-xs text-slate-500 font-semibold">
                  Showing {patients.length} of {totalItems} patients
                </span>
                <Button
                  variant="outline"
                  onClick={() => setRowsPerPage((prev) => prev + 5)}
                  className="w-fit px-8 py-2.5 border-slate-200 text-slate-600 hover:text-slate-900 rounded-xl shadow-3xs text-xs font-bold font-display"
                >
                  Load More
                </Button>
              </div>
            )}
            {totalItems <= patients.length && totalItems > 0 && (
              <div className="text-center pt-4">
                <span className="text-xs text-slate-400 font-semibold animate-fade-in">
                  Showing all {totalItems} patients
                </span>
              </div>
            )}
          </div>
        ) : (
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
        )
      )}

      {/* 2. PATIENT PROFILE VIEW (DETAIL MODE) */}
      {viewMode === 'detail' && selectedPatient && (
        <div className="space-y-6">
          {/* Header Split */}
          {isMobile ? (
            <div className="flex justify-between items-center bg-white -mx-6 -mt-6 p-4.5 px-6 border-b border-slate-100 sticky top-0 z-30">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setViewMode('list');
                    setSelectedPatient(null);
                  }}
                  className="text-slate-700 hover:bg-slate-100 p-1.5 rounded-full cursor-pointer transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h2 className="text-lg font-bold text-slate-800">Patient Profile</h2>
              </div>
              <div className="flex items-center gap-2">
                <button className="relative p-2 text-slate-500 hover:bg-slate-50 rounded-full cursor-pointer">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-rose-500 rounded-full border border-white" />
                </button>
                <button className="p-2 text-slate-500 hover:bg-slate-50 rounded-full cursor-pointer">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
            </div>
          ) : (
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
          )}

          {/* Stats Summary / Avatar Banner Split */}
          {isMobile ? (
            <div className="bg-white border border-slate-250/60 rounded-2xl p-5 shadow-xs flex items-center gap-4.5 mt-2">
              <div className="relative shrink-0">
                <img
                  src={selectedPatient.avatarUrl}
                  alt={selectedPatient.firstName}
                  referrerPolicy="no-referrer"
                  className="w-16 h-16 rounded-full object-cover border border-slate-100 shadow-sm"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${selectedPatient.firstName}%20${selectedPatient.lastName}`;
                  }}
                />
                <div className="absolute -bottom-0.5 -right-0.5 bg-emerald-500 text-white rounded-full p-0.5 border-2 border-white flex items-center justify-center w-5.5 h-5.5 shadow-2xs">
                  <Check className="w-3 h-3 text-white stroke-[3px]" />
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="font-extrabold text-slate-800 text-lg leading-snug">
                  {selectedPatient.firstName} {selectedPatient.lastName}
                </h3>
                <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold">
                  <span className="bg-slate-100 text-slate-650 px-2 py-0.5 rounded-md font-bold">
                    {new Date().getFullYear() - new Date(selectedPatient.dateOfBirth).getFullYear()} Yrs
                  </span>
                  <span>•</span>
                  <span>ID: #{selectedPatient.patientNumber || selectedPatient.id}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-blue-50 text-blue-755 border border-blue-100/50 px-2.5 py-0.8 rounded-full text-[10px] font-bold w-fit mt-1">
                  <Briefcase className="w-3.5 h-3.5 shrink-0" />
                  <span>OPD Patient</span>
                </div>
              </div>
            </div>
          ) : (
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
          )}

          {/* Tab Navigation */}
          {isMobile ? (
            <div className="flex border-b border-slate-200 gap-6 overflow-x-auto no-scrollbar -mx-6 px-6 pb-0.5">
              {(['profile', 'appointments', 'prescriptions', 'files'] as const).map((tab) => {
                const isActive = profileTab === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => setProfileTab(tab)}
                    className={`pb-3 text-sm font-bold relative capitalize tracking-wide transition-all cursor-pointer whitespace-nowrap ${isActive ? 'text-brand-primary font-extrabold' : 'text-slate-400 hover:text-slate-700'
                      }`}
                  >
                    {tab}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-primary rounded-full animate-fade-in" />
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
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
          )}

          {/* TAB CONTENTS */}

          {/* 1. Profile Tab Content */}
          {profileTab === 'profile' && (
            isMobile ? (
              <div className="space-y-4.5 animate-fade-in-up">
                {/* Registration Details */}
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                  <div className="flex justify-between items-center bg-slate-50/50 px-5 py-4 border-b border-slate-100">
                    <h4 className="font-bold text-slate-750 text-xs uppercase tracking-wider flex items-center gap-2">
                      <FileText className="w-4 h-4 text-slate-400" />
                      <span>Registration Details</span>
                    </h4>
                    <span className="text-xs font-bold text-brand-primary cursor-pointer select-none">Edit</span>
                  </div>
                  <div className="p-5 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Date of Birth</span>
                        <p className="text-sm font-semibold text-slate-800">{formatDob(selectedPatient.dateOfBirth)}</p>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Gender</span>
                        <p className="text-sm font-semibold text-slate-800 capitalize">{selectedPatient.gender.toLowerCase()}</p>
                      </div>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Email Address</span>
                      <p className="text-sm font-semibold text-slate-855 select-all break-all">{selectedPatient.email || 'N/A'}</p>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-slate-50/80">
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Phone Number</span>
                        <p className="text-sm font-bold text-slate-800 font-mono">{selectedPatient.phone}</p>
                      </div>
                      <div className="flex gap-2.5">
                        <a
                          href={`tel:${selectedPatient.phone}`}
                          className="w-9 h-9 rounded-full bg-teal-50 border border-teal-100/80 flex items-center justify-center text-teal-650 hover:bg-teal-100 transition-colors shadow-3xs"
                        >
                          <Phone className="w-4.5 h-4.5" />
                        </a>
                        <a
                          href={`sms:${selectedPatient.phone}`}
                          className="w-9 h-9 rounded-full bg-blue-50 border border-blue-100/85 flex items-center justify-center text-brand-primary hover:bg-blue-100 transition-colors shadow-3xs"
                        >
                          <MessageSquare className="w-4.5 h-4.5" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Clinical Overview */}
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                  <div className="bg-slate-50/50 px-5 py-4 border-b border-slate-100">
                    <h4 className="font-bold text-slate-750 text-xs uppercase tracking-wider flex items-center gap-2">
                      <Activity className="w-4 h-4 text-slate-400" />
                      <span>Clinical Overview</span>
                    </h4>
                  </div>
                  <div className="p-5 space-y-4">
                    {/* Blood Group */}
                    <div className="bg-white border border-rose-100/60 rounded-xl p-3.5 flex items-center justify-between shadow-3xs">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-rose-50 flex items-center justify-center text-rose-500">
                          <Heart className="w-5 h-5 shrink-0 fill-rose-50/50 text-rose-500" />
                        </div>
                        <span className="text-sm font-semibold text-slate-700">Blood Group</span>
                      </div>
                      <span className="text-lg font-black text-rose-605 leading-none mr-1">{selectedPatient.bloodGroup || 'B+'}</span>
                    </div>

                    {/* Known Allergies */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Known Allergies</span>
                      <div className="flex flex-wrap gap-2">
                        {selectedPatient.allergies && selectedPatient.allergies.toLowerCase() !== 'none' ? (
                          selectedPatient.allergies.split(',').map((allergy, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold text-rose-700 bg-rose-50 border border-rose-150 shadow-3xs animate-scale-in"
                            >
                              <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                              <span>{allergy.trim()}</span>
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-500 font-semibold bg-slate-50 border border-slate-150 px-3 py-1.5 rounded-lg">
                            No allergies logged
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Emergency Contact */}
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                  <div className="flex justify-between items-center bg-slate-50/50 px-5 py-4 border-b border-slate-100">
                    <h4 className="font-bold text-slate-750 text-xs uppercase tracking-wider flex items-center gap-2">
                      <User className="w-4 h-4 text-slate-400" />
                      <span>Emergency Contact</span>
                    </h4>
                    <button className="text-slate-400 hover:text-slate-650 cursor-pointer p-0.5">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="p-5 flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-500 font-bold shrink-0">
                      <User className="w-5 h-5 text-slate-400" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">{selectedPatient.emergencyContactName}</h4>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">Spouse • <span className="font-semibold text-slate-700 font-mono">{selectedPatient.emergencyContactPhone}</span></p>
                    </div>
                  </div>
                </div>

                {/* Address Card */}
                <div className="relative rounded-2xl overflow-hidden border border-slate-200/80 shadow-xs h-[180px] bg-slate-100 flex flex-col justify-end p-4.5">
                  <img
                    src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=400&auto=format&fit=crop"
                    alt="Map background"
                    className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none opacity-85"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent pointer-events-none" />

                  <div className="relative z-10 flex justify-between items-end text-white w-full">
                    <div className="pr-4">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300 leading-none">Current Address</span>
                      <p className="text-sm font-bold text-white mt-1 select-all line-clamp-2 leading-snug">{selectedPatient.address}</p>
                    </div>
                    <a
                      href={`https://maps.google.com/?q=${encodeURIComponent(selectedPatient.address)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-brand-primary shadow-md hover:bg-slate-50 transition-all cursor-pointer shrink-0"
                    >
                      <MapPin className="w-4.5 h-4.5 text-brand-primary" />
                    </a>
                  </div>
                </div>
              </div>
            ) : (
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

                {/* Right Column: Medical Summary & Notes */}
                <div className="space-y-6">
                  {/* Notes Card */}
                  <Card>
                    <CardHeader>
                      <h4 className="font-display font-bold text-slate-800 text-sm flex items-center gap-2">
                        <Activity className="w-4 h-4 text-brand-primary" />
                        <span>Initial Visit Purpose & Notes</span>
                      </h4>
                    </CardHeader>
                    <CardBody className="p-5 space-y-4">
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Purpose of Registration</span>
                        <p className="text-sm font-semibold text-slate-800">{selectedPatient.purpose || 'General Checkup'}</p>
                      </div>
                      <div className="space-y-0.5 pt-2 border-t border-slate-50">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Clinical Notes</span>
                        <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/50 p-3 rounded-lg border border-slate-100">{selectedPatient.clinicalNotes || 'No notes logged.'}</p>
                      </div>
                    </CardBody>
                  </Card>

                  {/* Medical Summary */}
                  <Card>
                    <CardHeader>
                      <h4 className="font-display font-bold text-slate-800 text-sm flex items-center gap-2">
                        <Heart className="w-4 h-4 text-rose-500" />
                        <span>Medical Summary</span>
                      </h4>
                    </CardHeader>
                    <CardBody className="p-5 space-y-4">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Known Allergies</span>
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
            )
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

              {patientAppointments.length === 0 ? (
                <div className="bg-white p-12 text-center rounded-xl border border-slate-200">
                  <p className="text-slate-500 font-medium">No appointments on record for this patient.</p>
                </div>
              ) : (
                <div className="relative border-l border-slate-200 ml-4 pl-6 space-y-6">
                  {patientAppointments.map((app) => {
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
            isMobile ? (
              <div className="space-y-4 animate-fade-in-up pb-28 relative">
                {/* List of Medicines inside all Prescriptions */}
                {(() => {
                  const filteredPrescriptions = getFilteredPrescriptions();
                  const flattenedMedicines = filteredPrescriptions.flatMap((prsc) =>
                    prsc.medicines.map((med, idx) => ({
                      ...med,
                      prescription: prsc,
                      iconIndex: idx % 3
                    }))
                  );

                  if (flattenedMedicines.length === 0) {
                    return (
                      <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-3xs text-slate-400 font-medium text-sm">
                        No prescribed medicines found.
                      </div>
                    );
                  }

                  // Find latest advice text
                  const latestAdvicePresc = filteredPrescriptions.find(p => p.advice && p.advice !== 'None');
                  const adviceText = latestAdvicePresc?.advice || "Please ensure patient avoids alcohol while on Metformin. Next review scheduled for December.";

                  return (
                    <div className="space-y-4">
                      {flattenedMedicines.map((med, mIdx) => {
                        // Dynamic icon selection
                        let iconEl = <Pill className="w-5 h-5 text-blue-600" />;
                        let bgClass = "bg-blue-50/80";
                        if (med.iconIndex === 1) {
                          iconEl = <FlaskConical className="w-5 h-5 text-teal-600" />;
                          bgClass = "bg-teal-50/80";
                        } else if (med.iconIndex === 2) {
                          iconEl = <Syringe className="w-5 h-5 text-rose-600" />;
                          bgClass = "bg-rose-50/80";
                        }

                        // Determine if course duration has completed (mock logic for demo)
                        const isCourseCompleted = med.duration && (
                          med.duration.toLowerCase().includes('day') ||
                          med.duration.toLowerCase().includes('week')
                        ) && mIdx % 3 === 2; // determinate mockup match

                        return (
                          <div
                            key={`${med.id}-${mIdx}`}
                            className="bg-white border border-slate-200 rounded-2xl p-4.5 shadow-3xs space-y-4"
                          >
                            {/* Top Info Row */}
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-center gap-3.5 min-w-0 flex-1">
                                <div className={`w-11 h-11 ${bgClass} rounded-xl flex items-center justify-center shrink-0`}>
                                  {iconEl}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <h4 className="font-bold text-slate-800 text-sm leading-tight truncate">{med.prescription.id}</h4>
                                  {/* <p className="text-[11px] text-slate-400 font-bold mt-0.5 leading-none">
                                    {med.dosage} • {med.frequency} {med.duration ? `(${med.duration})` : ''}
                                  </p> */}
                                </div>
                              </div>
                              <button
                                onClick={() => {
                                  setPreviewPrescription(med.prescription);
                                  setIsPrescriptionPreviewOpen(true);
                                }}
                                className="text-brand-primary text-xs font-bold flex items-center gap-1 shrink-0 hover:text-blue-750 transition-colors cursor-pointer py-1"
                              >
                                <Download className="w-3.5 h-3.5" />
                                <span>Download</span>
                              </button>
                            </div>

                            {/* Divider line */}
                            <div className="border-t border-slate-100/80" />

                            {/* Middle Details Grid */}
                            <div className="grid grid-cols-2 gap-4 text-left">
                              <div className="space-y-0.5">
                                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest block leading-none">Issued</span>
                                <span className="text-[11px] text-slate-600 font-bold font-mono tracking-tight block">
                                  {med.prescription.issueDate}
                                </span>
                              </div>
                              <div className="space-y-0.5">
                                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest block leading-none">Prescribed By</span>
                                <span className="text-[11px] text-slate-600 font-bold block truncate">
                                  {med.prescription.doctorName}
                                </span>
                              </div>
                            </div>

                            {/* Completed Course Badge */}
                            {isCourseCompleted && (
                              <div className="pt-1">
                                <span className="inline-block px-2.5 py-0.5 text-[8px] font-extrabold text-slate-500 bg-slate-100 rounded-full uppercase tracking-wider">
                                  Course Completed
                                </span>
                              </div>
                            )}
                          </div>
                        );
                      })}

                      {/* Pharmacist Note Card */}
                      <div className="bg-blue-50/20 border border-blue-100 rounded-2xl p-4 flex gap-3 text-left shadow-3xs mt-2">
                        <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                          <span className="font-display font-extrabold text-blue-800 text-xs tracking-wide block uppercase">Pharmacist Note</span>
                          <p className="text-xs text-slate-600 font-semibold leading-relaxed">
                            "{adviceText}"
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* FAB (Floating Action Button) for composing prescription */}
                {currentUser?.role !== 'STAFF' && (
                  <button
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
                    className="fixed bottom-22 right-6 w-14 h-14 bg-brand-primary hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform z-40 cursor-pointer"
                  >
                    <Plus className="w-6 h-6" />
                  </button>
                )}
              </div>
            ) : (
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
            )
          )}

          {/* 4. Files Tab Content */}
          {profileTab === 'files' && (
            isMobile ? (
              <div className="space-y-4 animate-fade-in-up pb-10">
                {/* Upload Banner */}
                {showUploadBanner}

                {/* Inline Search and Upload button */}
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                      id="search-file-input"
                      type="text"
                      placeholder="Search..."
                      value={fileSearch}
                      onChange={(e) => {
                        setFileSearch(e.target.value);
                        setFileCurrentPage(1);
                      }}
                      className="w-full pl-10 pr-3 h-11 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all text-slate-700 font-medium shadow-3xs"
                    />
                  </div>
                  <Button
                    id="upload-file-btn"
                    onClick={() => setIsFileUploadOpen(true)}
                    className="h-11 px-5 bg-brand-primary text-white rounded-xl font-semibold flex items-center gap-2 cursor-pointer shadow-3xs text-xs"
                  >
                    <UploadCloud className="w-4 h-4" />
                    <span>Upload</span>
                  </Button>
                </div>

                {/* Horizontally Scrollable Tabs */}
                {(() => {
                  const allFilesCount = fileTotalRows || patientFiles.length;
                  return (
                    <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
                      {[
                        { key: 'All', label: `All Files (${allFilesCount})` },
                        { key: 'Reports', label: 'Reports' },
                        { key: 'Imaging', label: 'Imaging' },
                        { key: 'Labs', label: 'Labs' }
                      ].map((tab) => {
                        const isActive = mobileFileCategory === tab.key;
                        return (
                          <button
                            key={tab.key}
                            onClick={() => {
                              setMobileFileCategory(tab.key);
                              setFileCurrentPage(1);
                            }}
                            className={`px-4.5 py-2 rounded-full font-bold text-xs whitespace-nowrap transition-all shadow-3xs cursor-pointer ${isActive
                              ? 'bg-[#0b6466] text-white'
                              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                              }`}
                          >
                            {tab.label}
                          </button>
                        );
                      })}
                    </div>
                  );
                })()}

                {/* List of Files */}
                {(() => {
                  const matchedFiles = patientFiles.filter((file) => {
                    if (mobileFileCategory === 'Reports') {
                      return file.category === 'Prescription' || file.category === 'Other';
                    }
                    if (mobileFileCategory === 'Imaging') {
                      return file.category === 'X-ray' || file.category === 'Scan';
                    }
                    if (mobileFileCategory === 'Labs') {
                      return file.category === 'Lab Report';
                    }
                    return true; // 'All'
                  });

                  if (matchedFiles.length === 0) {
                    return (
                      <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-3xs text-slate-400 font-medium text-sm">
                        No files found matching the category.
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-3">
                      {matchedFiles.map((file) => {
                        // Dynamic icon selection
                        let iconEl = <FileText className="w-5 h-5 text-blue-600" />;
                        let bgClass = "bg-blue-50/80";

                        if (file.category === 'X-ray') {
                          iconEl = <Eye className="w-5 h-5 text-emerald-600" />;
                          bgClass = "bg-emerald-50/80";
                        } else if (file.category === 'Scan') {
                          iconEl = <FlaskConical className="w-5 h-5 text-slate-650" />;
                          bgClass = "bg-slate-100/80";
                        } else if (file.category === 'Lab Report') {
                          iconEl = <FileText className="w-5 h-5 text-rose-600" />;
                          bgClass = "bg-rose-50/80";
                        }

                        return (
                          <div
                            key={file.id}
                            className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between shadow-3xs gap-3"
                          >
                            <div className="flex items-center gap-3.5 min-w-0 flex-1">
                              <div className={`w-11 h-11 ${bgClass} rounded-xl flex items-center justify-center shrink-0`}>
                                {iconEl}
                              </div>
                              <div className="min-w-0 flex-1">
                                <h4 className="font-bold text-slate-800 text-sm leading-tight truncate">
                                  {file.fileName}
                                </h4>
                                <p className="text-[11px] text-slate-450 font-bold mt-1">
                                  {file.uploadedDate} • {file.size}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                if (file.uploadId) {
                                  window.open(`/api/v1/uploads/${file.uploadId}`, '_blank');
                                } else {
                                  alert(`Mock download for file ${file.fileName} initiated successfully.`);
                                }
                              }}
                              className="w-10 h-10 border border-slate-200 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-800 active:scale-95 transition-all shadow-3xs cursor-pointer shrink-0"
                            >
                              <Download className="w-4 h-4 text-blue-600" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}

                {/* HIPAA box */}
                <div className="bg-slate-100 border border-slate-200/80 rounded-2xl p-4.5 flex gap-3 text-left shadow-3xs">
                  <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <span className="font-display font-extrabold text-slate-800 text-xs tracking-wide block uppercase">Secure & HIPAA Compliant</span>
                    <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
                      All medical documents are encrypted with AES-256 standards. Access is restricted to authorized clinical staff only.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
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
                                    if (file.uploadId) {
                                      window.open(`/api/v1/uploads/${file.uploadId}`, '_blank');
                                    } else {
                                      alert(`Mock download for file ${file.fileName} initiated successfully.`);
                                    }
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
            )
          )}
        </div>
      )}

      {/* --- MODAL DIALOGS --- */}

      {/* A. REGISTER NEW PATIENT MODAL / DRAWER */}
      {isMobile ? (
        <Drawer
          isOpen={isAddPatientOpen}
          onClose={() => setIsAddPatientOpen(false)}
          title="Add New Patient"
          hideHeader={true}
        >
          <div className="flex flex-col h-full -m-6 bg-slate-50/50">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4.5 bg-white border-b border-slate-100 shrink-0 relative">
              <button
                type="button"
                onClick={() => setIsAddPatientOpen(false)}
                className="text-slate-700 hover:bg-slate-100 p-1.5 rounded-full cursor-pointer transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h3 className="font-display font-extrabold text-slate-800 text-base absolute left-1/2 -translate-x-1/2">
                Add New Patient
              </h3>
              <div className="w-8 h-8" />
            </div>

            {/* Scrollable form body */}
            <form onSubmit={handleRegisterPatientSubmit} className="flex-1 flex flex-col justify-between overflow-hidden">
              <div className="flex-1 p-6 overflow-y-auto space-y-5">
                <div className="grid grid-cols-1 gap-4">
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

                <div className="grid grid-cols-1 gap-4">
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

                <div className="grid grid-cols-1 gap-4">
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

                <div className="grid grid-cols-1 gap-4">
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
                    placeholder="e.g. Back pain eval"
                  />
                </div>

                <Input
                  label="Full Residential Address"
                  value={newPatient.address}
                  onChange={(e) => setNewPatient({ ...newPatient, address: e.target.value })}
                  placeholder="House/Plot no, Sector, City, Country"
                />

                <div className="grid grid-cols-1 gap-4">
                  <Input
                    label="Emergency Contact Name"
                    value={newPatient.emergencyContactName}
                    onChange={(e) => setNewPatient({ ...newPatient, emergencyContactName: e.target.value })}
                    placeholder="Spouse / Parent Name"
                  />
                  <Input
                    label="Emergency Phone"
                    value={newPatient.emergencyContactPhone}
                    onChange={(e) => setNewPatient({ ...newPatient, emergencyContactPhone: e.target.value })}
                    placeholder="+91 XXXXX XXXXX"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <Input
                    label="Known Allergies"
                    value={newPatient.allergies}
                    onChange={(e) => setNewPatient({ ...newPatient, allergies: e.target.value })}
                    placeholder="e.g. Peanuts, Sulfas"
                  />
                  <Input
                    label="Existing Diseases"
                    value={newPatient.existingDiseases}
                    onChange={(e) => setNewPatient({ ...newPatient, existingDiseases: e.target.value })}
                    placeholder="e.g. Asthma, Thyroid"
                  />
                </div>

                <div className="flex flex-col gap-1.5 pb-6">
                  <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Clinical Intake Logs</label>
                  <textarea
                    value={newPatient.clinicalNotes}
                    onChange={(e) => setNewPatient({ ...newPatient, clinicalNotes: e.target.value })}
                    className="w-full min-h-[90px] p-3 text-sm rounded-lg border border-slate-200 outline-none focus:border-brand-primary"
                    placeholder="General clinical observations, initial diagnostics..."
                  />
                </div>
              </div>

              {/* Pinned bottom action button */}
              <div className="p-5 bg-white border-t border-slate-100 shrink-0">
                <button
                  type="submit"
                  className="w-full bg-[#0a305e] hover:bg-[#08274d] text-white font-semibold py-3.5 rounded-xl text-center cursor-pointer shadow-sm text-sm active:scale-[0.99] transition-all"
                >
                  Register Patient
                </button>
              </div>
            </form>
          </div>
        </Drawer>
      ) : (
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
      )}

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
        hideHeader={isMobile}
      >
        {isMobile ? (
          <div className="flex flex-col h-full -m-6 bg-slate-50/50">
            {/* Custom Mobile Header */}
            <div className="flex items-center justify-between px-6 py-4.5 bg-white border-b border-slate-100 shrink-0 relative">
              <button
                type="button"
                onClick={() => setIsCreatePrescriptionOpen(false)}
                className="text-slate-700 hover:bg-slate-100 p-1.5 rounded-full cursor-pointer transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h3 className="font-display font-extrabold text-slate-800 text-base absolute left-1/2 -translate-x-1/2">
                Compose Prescription
              </h3>
              <button
                type="button"
                onClick={handleCreatePrescriptionSubmit}
                className="text-blue-600 hover:text-blue-800 font-extrabold text-xs tracking-wider cursor-pointer active:scale-95 transition-all"
              >
                SAVE
              </button>
            </div>

            {/* Scrollable form body */}
            <form onSubmit={handleCreatePrescriptionSubmit} className="flex-1 flex flex-col justify-between overflow-hidden">
              <div className="flex-1 p-6 overflow-y-auto space-y-5">
                {/* Patient Header Box */}
                {selectedPatient && (
                  <div className="bg-slate-100/50 border border-slate-200/60 rounded-2xl p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                      <User className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 text-left">
                      <h4 className="font-bold text-slate-800 text-sm leading-tight">
                        {selectedPatient.firstName} {selectedPatient.lastName}
                      </h4>
                      <p className="text-[11px] text-slate-450 font-semibold mt-1">
                        #{selectedPatient.patientNumber}  •  {(() => {
                          if (!selectedPatient.dateOfBirth) return '';
                          const birthDate = new Date(selectedPatient.dateOfBirth);
                          const today = new Date();
                          let age = today.getFullYear() - birthDate.getFullYear();
                          const m = today.getMonth() - birthDate.getMonth();
                          if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                            age--;
                          }
                          return age;
                        })()} yrs
                      </p>
                    </div>
                  </div>
                )}

                {/* Prescribed By Selector */}
                {currentUser?.role === 'DOCTOR' ? (
                  <div className="space-y-1.5 text-left">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Prescribed By (Doctor)</span>
                    <div className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700">
                      {doctorsList.find(d => d.email?.toLowerCase() === currentUser.email?.toLowerCase())?.name || (currentUser.firstName + " " + currentUser.lastName)}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1.5 text-left">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Prescribed By (Doctor)</span>
                    <Select
                      value={newPrescription.doctorId}
                      onChange={(e) => setNewPrescription({ ...newPrescription, doctorId: e.target.value })}
                      options={doctorsList.map((d) => ({ value: d.id, label: `${d.name} (${d.specialization})` }))}
                      required
                    />
                  </div>
                )}

                {/* Issue Date & Next Visit */}
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Issue Date *"
                    type="date"
                    value={newPrescription.issueDate}
                    onChange={(e) => setNewPrescription({ ...newPrescription, issueDate: e.target.value })}
                    required
                  />
                  <Input
                    label="Next Visit"
                    type="date"
                    value={newPrescription.nextVisitDate}
                    onChange={(e) => setNewPrescription({ ...newPrescription, nextVisitDate: e.target.value })}
                  />
                </div>

                {/* Diagnosis */}
                <div className="space-y-1.5 text-left">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Diagnosis / Findings *</span>
                  <textarea
                    value={newPrescription.diagnosis}
                    onChange={(e) => setNewPrescription({ ...newPrescription, diagnosis: e.target.value })}
                    className="w-full min-h-[80px] p-3 text-sm rounded-xl border border-slate-200 outline-none focus:border-brand-primary font-medium text-slate-700 bg-white"
                    placeholder="e.g. Hypertension, suspected Type 2 Diabetes symptoms..."
                    required
                  />
                </div>

                {/* Medications section */}
                <div className="space-y-3 pt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block leading-none">Medications</span>
                    <span className="text-[9px] font-extrabold text-slate-400 uppercase block leading-none">At least one required</span>
                  </div>

                  {/* Medicines List */}
                  {medicinesList.length > 0 && (
                    <div className="space-y-3">
                      {medicinesList.map((med) => (
                        <div
                          key={med.id}
                          className="bg-white border border-slate-200 rounded-2xl p-4.5 flex items-center justify-between shadow-3xs text-left"
                        >
                          <div className="space-y-1">
                            <h5 className="font-bold text-blue-600 text-sm leading-tight">{med.medicineName}</h5>
                            <p className="text-[11px] text-slate-500 font-bold mt-0.5 leading-none">
                              {med.dosage} &nbsp; {med.frequency}
                            </p>
                            {med.instructions && (
                              <p className="text-[10px] text-slate-400 font-medium italic mt-1 leading-tight">
                                {med.instructions}
                              </p>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDeleteMedicine(med.id)}
                            className="text-rose-500 hover:text-rose-700 p-2 shrink-0 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Dashed placeholder card */}
                  <div className="bg-slate-50/50 border border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                      <Pill className="w-5 h-5" />
                    </div>
                    <span className="text-xs text-slate-400 font-bold">No other medications added yet.</span>
                    <button
                      type="button"
                      onClick={() => {
                        const el = document.getElementById('new-entry-form-container');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="px-4 py-2 bg-brand-primary text-white font-bold text-xs rounded-xl shadow-3xs cursor-pointer active:scale-95 transition-all mt-1"
                    >
                      + ADD MEDICATION
                    </button>
                  </div>

                  {/* New Entry box */}
                  <div id="new-entry-form-container" className="bg-slate-100/50 border border-slate-200/80 rounded-2xl p-4.5 space-y-4 text-left">
                    <div className="flex items-center gap-2 text-blue-700">
                      <Plus className="w-4 h-4 text-blue-600 shrink-0" />
                      <span className="font-display font-extrabold text-xs tracking-wide uppercase">New Entry</span>
                    </div>

                    <div className="space-y-3">
                      <Input
                        label="Medicine Name"
                        value={newMedicine.medicineName}
                        onChange={(e) => setNewMedicine({ ...newMedicine, medicineName: e.target.value })}
                        placeholder="Medicine Name"
                      />

                      {/* Dosage, Freq, Duration Grid */}
                      <div className="grid grid-cols-2 gap-3">
                        <Input
                          label="Dosage"
                          value={newMedicine.dosage}
                          onChange={(e) => setNewMedicine({ ...newMedicine, dosage: e.target.value })}
                          placeholder="Dosage (e.g. 500mg)"
                        />
                        <Input
                          label="Frequency"
                          value={newMedicine.frequency}
                          onChange={(e) => setNewMedicine({ ...newMedicine, frequency: e.target.value })}
                          placeholder="Freq (e.g. 2x Daily)"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3 items-end">
                        <Input
                          label="Duration"
                          value={newMedicine.duration}
                          onChange={(e) => setNewMedicine({ ...newMedicine, duration: e.target.value })}
                          placeholder="Duration (e.g. 7 Days)"
                        />
                        <button
                          type="button"
                          onClick={handleAddMedicine}
                          className="h-10 bg-[#0b6466] hover:bg-teal-700 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-3xs text-xs"
                        >
                          <Plus className="w-4 h-4" />
                          <span>ADD TO LIST</span>
                        </button>
                      </div>

                      <Input
                        label="Instructions (Optional)"
                        value={newMedicine.instructions}
                        onChange={(e) => setNewMedicine({ ...newMedicine, instructions: e.target.value })}
                        placeholder="Instructions (Optional)"
                      />
                    </div>
                  </div>
                </div>

                {/* Tests Recommended */}
                <div className="space-y-1.5 text-left">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Tests Recommended</span>
                  <textarea
                    value={newPrescription.testsRecommended}
                    onChange={(e) => setNewPrescription({ ...newPrescription, testsRecommended: e.target.value })}
                    className="w-full min-h-[70px] p-3 text-sm rounded-xl border border-slate-200 outline-none focus:border-brand-primary font-medium text-slate-700 bg-white"
                    placeholder="e.g. Lipid Profile, Complete Blood Count..."
                  />
                </div>

                {/* General Advice */}
                <div className="space-y-1.5 text-left">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">General Advice / Diet</span>
                  <textarea
                    value={newPrescription.advice}
                    onChange={(e) => setNewPrescription({ ...newPrescription, advice: e.target.value })}
                    className="w-full min-h-[70px] p-3 text-sm rounded-xl border border-slate-200 outline-none focus:border-brand-primary font-medium text-slate-700 bg-white"
                    placeholder="e.g. Low sodium diet, 30 min light walking..."
                  />
                </div>
              </div>

              {/* Bottom Sticky buttons */}
              <div className="p-5 bg-white border-t border-slate-100 shrink-0 grid grid-cols-2 gap-3.5">
                <button
                  type="button"
                  onClick={() => setIsCreatePrescriptionOpen(false)}
                  className="w-full py-3.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-center cursor-pointer text-xs"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="w-full py-3.5 bg-[#0a305e] hover:bg-[#08274d] text-white font-bold rounded-xl text-center cursor-pointer shadow-sm text-xs"
                >
                  SAVE PRESCRIPTION
                </button>
              </div>
            </form>
          </div>
        ) : (
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
        )}
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

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleDownloadPrescriptionPdf}
                  className="gap-1 px-3 border-brand-primary text-brand-primary hover:bg-blue-50"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </Button>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => {
                    window.print();
                  }}
                  className="gap-1 px-3"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Document</span>
                </Button>
              </div>
            </div>

            {/* A4 sheet simulation */}
            {(() => {
              const pSettings = prescriptionSettings;
              const showLogo = pSettings ? pSettings.showClinicLogo : true;
              const headerLayout = previewPrescription.headerLayout || pSettings?.headerLayout || 'CENTERED_PROFESSIONAL';

              const clinicName = clinicSettings?.name || 'HealthFlow';
              const clinicAddress = clinicSettings?.addressLine
                ? `${clinicSettings.addressLine.split(',')[0]}, ${clinicSettings.city}`
                : 'Whitefield, Bengaluru';
              const clinicPhone = clinicSettings?.phone || '+91 991155305';

              const showDocQuals = pSettings ? pSettings.showDoctorQualifications : true;
              const showDocDept = pSettings ? pSettings.showDoctorDepartment : true;
              const showVitals = pSettings ? pSettings.showVitals : true;
              const showHistory = pSettings ? pSettings.showPatientHistory : true;
              const showDiagnosis = pSettings ? pSettings.showDiagnosis : true;
              const showDuration = pSettings ? pSettings.showDuration : true;
              const showDosage = pSettings ? pSettings.showDosageInstructions : true;

              // Extract vitals if present in clinicalNotes or symptoms
              const getVitalVal = (type: string, fallback: string) => {
                const combined = `${previewPrescription.clinicalNotes || ''} ${previewPrescription.symptoms || ''}`;
                if (!combined) return fallback;
                const regexes = {
                  bp: /(?:bp|blood pressure)[:\s]+([\d./\s]+mmHg|[\d./]+)/i,
                  pulse: /(?:pulse|hr)[:\s]+([\d\s]+bpm|\d+)/i,
                  weight: /(?:wt|weight)[:\s]+([\d\s]+kg|\d+)/i,
                  temp: /(?:temp|temperature)[:\s]+([\d.\s]+°F|[\d.]+)/i
                };
                const match = combined.match(regexes[type as 'bp' | 'pulse' | 'weight' | 'temp']);
                if (match) {
                  let val = match[1].trim();
                  if (type === 'bp' && !val.toLowerCase().includes('mm')) val = `${val} mmHg`;
                  if (type === 'pulse' && !val.toLowerCase().includes('bp')) val = `${val} bpm`;
                  if (type === 'weight' && !val.toLowerCase().includes('kg')) val = `${val} kg`;
                  if (type === 'temp' && !val.toLowerCase().includes('°')) val = `${val} °F`;
                  return val;
                }
                return fallback;
              };

              const bpVal = getVitalVal('bp', '122/80 mmHg');
              const pulseVal = getVitalVal('pulse', '74 bpm');
              const weightVal = getVitalVal('weight', '68 kg');
              const tempVal = getVitalVal('temp', '98.4 °F');

              // Find doctor details
              const matchedDoc = doctorsList.find(d => d.id === previewPrescription.doctorId || d.name === previewPrescription.doctorName);
              const doctorQualifications = matchedDoc?.qualification || 'MD, DM (Cardiology)';
              const doctorSpecialization = matchedDoc?.specialization || previewPrescription.doctorSpecialization;

              return (
                <div id="printable-area" className="bg-white border border-slate-350 p-8 rounded-lg shadow-inner text-slate-800 space-y-5 min-h-[500px] text-[10px] select-none leading-relaxed">

                  {/* Header style */}
                  <div className={`
                    pb-4 border-b border-indigo-100 flex flex-col
                    ${headerLayout === 'CENTERED_PROFESSIONAL' ? 'text-center items-center' : 'text-left items-start'}
                  `}>
                    {showLogo && (
                      <div className="w-8 h-8 rounded bg-blue-50 border border-blue-100 flex items-center justify-center text-sm text-blue-600 mb-2 font-extrabold">
                        ✚
                      </div>
                    )}
                    <h5 className="font-extrabold text-slate-900 text-sm tracking-tight">{clinicName}</h5>
                    <p className="text-[9px] text-slate-400 font-semibold leading-none mt-1">{clinicAddress}</p>
                    <p className="text-[9px] text-slate-400 font-semibold leading-none mt-1">{clinicPhone}</p>
                  </div>

                  {/* Patient core info row */}
                  <div className="grid grid-cols-2 gap-4 border-b border-slate-100 pb-3 text-[9px] font-semibold">
                    <div className="text-left space-y-0.5">
                      <span className="text-slate-400 font-bold block text-[7.5px] uppercase tracking-wider">Patient Care Sheet</span>
                      <span className="font-extrabold text-slate-800 text-sm">
                        {selectedPatient.firstName} {selectedPatient.lastName} ({new Date().getFullYear() - new Date(selectedPatient.dateOfBirth).getFullYear()} Yrs / {selectedPatient.gender === 'MALE' ? 'M' : selectedPatient.gender === 'FEMALE' ? 'F' : 'O'})
                      </span>
                      <span className="block text-slate-400 font-mono text-[8px]">
                        ID: {selectedPatient.patientNumber} | Rx: {previewPrescription.id}
                      </span>
                    </div>
                    <div className="text-right space-y-0.5">
                      <span className="text-slate-400 font-bold block text-[7.5px] uppercase tracking-wider">Prescribing Clinician</span>
                      <span className="font-extrabold text-slate-800 text-sm">{previewPrescription.doctorName}</span>
                      {showDocQuals && <span className="block text-slate-400 font-bold text-[8px]">{doctorQualifications}</span>}
                      {showDocDept && <span className="block text-slate-450 text-[8px] font-semibold mt-0.5">{doctorSpecialization}</span>}
                    </div>
                  </div>

                  {/* Vitals row if checked */}
                  {showVitals && (
                    <div className="grid grid-cols-4 gap-2 bg-slate-50 border border-slate-100 p-2 rounded text-[9px] text-center font-bold my-2">
                      <div>
                        <span className="text-slate-400 block text-[7px] uppercase tracking-wider">BP</span>
                        <span className="text-slate-700 font-mono">{bpVal}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[7px] uppercase tracking-wider">PULSE</span>
                        <span className="text-slate-700 font-mono">{pulseVal}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[7px] uppercase tracking-wider">WEIGHT</span>
                        <span className="text-slate-700 font-mono">{weightVal}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[7px] uppercase tracking-wider">TEMP</span>
                        <span className="text-slate-700 font-mono">{tempVal}</span>
                      </div>
                    </div>
                  )}

                  {/* Clinical History & Diagnosis */}
                  {(showHistory || showDiagnosis) && (
                    <div className="space-y-1 text-[9px] leading-normal text-left">
                      {showHistory && (
                        <div className="font-semibold text-slate-500">
                          <strong className="text-slate-800 font-bold">Allergies / History:</strong> {selectedPatient.allergies && selectedPatient.allergies !== 'None' ? selectedPatient.allergies : 'None'}, {selectedPatient.existingDiseases && selectedPatient.existingDiseases !== 'None' ? selectedPatient.existingDiseases : 'None'}.
                        </div>
                      )}
                      {showDiagnosis && (
                        <div className="font-semibold text-slate-500">
                          <strong className="text-slate-800 font-bold">Primary Diagnosis:</strong> {previewPrescription.diagnosis}.
                        </div>
                      )}
                    </div>
                  )}

                  {/* Large Clinical Rx marker */}
                  <div className="pt-2 text-left">
                    <span className="text-2xl font-black text-slate-900 leading-none">℞</span>

                    {/* Drug lists */}
                    <div className="space-y-4 pt-2.5 pl-3">
                      {previewPrescription.medicines.map((med, index) => (
                        <div key={med.id || index} className="space-y-0.5">
                          <div className="flex justify-between font-extrabold text-[10px] text-slate-800">
                            <span>{index + 1}. {med.medicineName}</span>
                            {showDuration && <span className="text-slate-400 font-mono font-bold text-[8.5px]">{med.duration} Course</span>}
                          </div>
                          {showDosage && (
                            <p className="text-[9px] text-slate-400 font-semibold">
                              Dosage: {med.dosage} ({med.frequency}) {med.instructions ? `• ${med.instructions}` : ''}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Default footnote & Signature area */}
                  <div className="pt-16 flex items-end justify-between text-[8px] text-slate-400 font-semibold border-t border-slate-100 mt-auto">
                    <div className="max-w-[200px] leading-relaxed text-left space-y-1">
                      {pSettings?.defaultFooterNote && (
                        <p className="italic font-bold text-slate-500">
                          "{previewPrescription.advice && previewPrescription.advice !== 'None' ? previewPrescription.advice : pSettings.defaultFooterNote}"
                        </p>
                      )}
                      <span className="block mt-1 font-mono text-[7px] text-slate-400">Prescription issued electronically by HealthFlow</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-24 border-t border-slate-350 mt-4" />
                      <span className="uppercase font-bold text-[7px] tracking-wider block mt-1.5 text-slate-500">
                        {previewPrescription.doctorName}
                      </span>
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

            {/* Real file chooser drag and drop area */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-200 hover:border-brand-primary bg-slate-50 hover:bg-blue-50/20 rounded-xl p-8 text-center cursor-pointer transition-all duration-150 space-y-2 group"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleRealFileChange}
                accept=".pdf,image/png,image/jpeg"
                className="hidden"
              />
              <UploadCloud className="w-8 h-8 text-slate-400 group-hover:text-brand-primary mx-auto transition-colors" />
              <div>
                <p className="text-xs font-bold text-slate-700">Click to choose a file</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Supports PDF, PNG, JPG (Max 2 MB)</p>
              </div>
            </div>
          </div>

          {isUploadingFile && (
            <p className="text-blue-650 text-xs font-bold text-center animate-pulse">
              Uploading patient attachment...
            </p>
          )}

          {newUploadedFile.fileName && (
            <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-3 flex justify-between items-center text-xs">
              <div className="flex items-center gap-2 truncate">
                <FileText className="w-4 h-4 text-brand-primary" />
                <span className="font-bold text-slate-800 truncate">{newUploadedFile.fileName}</span>
              </div>
              <span className={`font-mono font-bold text-[10px] px-2 py-0.5 rounded ${newUploadedFile.sizeBytes > 2 * 1024 * 1024 ? 'text-rose-700 bg-rose-50' : 'text-slate-600 bg-slate-100'
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
            <Button type="submit" disabled={!newUploadedFile.fileName || !!fileError || isUploadingFile}>
              Submit Document
            </Button>
          </div>
        </form>
      </Modal>

      {/* Mobile Advanced Filters Drawer */}
      {isMobile && (
        <Drawer
          isOpen={isMobileFilterOpen}
          onClose={() => setIsMobileFilterOpen(false)}
          title="Filter Patients"
        >
          <div className="flex flex-col h-full justify-between pb-8">
            <div className="space-y-6">
              {/* Gender Filter */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Gender</label>
                <select
                  value={tempGenderFilter}
                  onChange={(e) => setTempGenderFilter(e.target.value)}
                  className="w-full px-3.5 h-11 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary text-slate-700 font-medium cursor-pointer"
                >
                  <option value="All">All Genders</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>

            {/* Drawer actions */}
            <div className="flex gap-3.5 pt-6 border-t border-slate-200/60 mt-10">
              <button
                onClick={() => {
                  setTempGenderFilter('All');
                  setGenderFilter('All');
                  setCurrentPage(1);
                  setIsMobileFilterOpen(false);
                }}
                className="flex-1 py-3 border border-slate-200 rounded-xl font-bold text-slate-600 bg-white hover:bg-slate-50 active:scale-[0.99] transition-all cursor-pointer text-center text-sm"
              >
                Reset
              </button>
              <button
                onClick={() => {
                  setGenderFilter(tempGenderFilter);
                  setCurrentPage(1);
                  setIsMobileFilterOpen(false);
                }}
                className="flex-1 py-3 bg-brand-primary text-white rounded-xl font-bold hover:bg-blue-700 active:scale-[0.99] transition-all cursor-pointer text-center text-sm"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </Drawer>
      )}
    </div>
  );
};
